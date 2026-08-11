'use server';

import { cookies } from 'next/headers';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { encrypt } from '@/lib/session';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

export async function loginAction(prevState, formData) {
  const username = formData.get('username');
  const password = formData.get('password');

  if (!username || !password) {
    return { error: 'Username dan Password wajib diisi' };
  }

  const validUsername = process.env.ADMIN_USERNAME;
  const validPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (username !== validUsername) {
    return { error: 'Username atau Password salah' };
  }

  const isPasswordValid = await verifyPassword(password, validPasswordHash);

  if (!isPasswordValid) {
    return { error: 'Username atau Password salah' };
  }

  // Create the session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await encrypt({ user: { username }, expires });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  redirect('/admin/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}

export async function updateAdminCredentials(newUsername, newPassword) {
  try {
    const hash = await hashPassword(newPassword);
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (e) {
      envContent = '';
    }

    let lines = envContent.split('\n');
    let hasUsername = false;
    let hasPassword = false;

    lines = lines.map((line) => {
      if (line.trim().startsWith('ADMIN_USERNAME=')) {
        hasUsername = true;
        return `ADMIN_USERNAME=${newUsername}`;
      }
      if (line.trim().startsWith('ADMIN_PASSWORD_HASH=')) {
        hasPassword = true;
        return `ADMIN_PASSWORD_HASH=${hash}`;
      }
      return line;
    });

    if (!hasUsername) lines.push(`ADMIN_USERNAME=${newUsername}`);
    if (!hasPassword) lines.push(`ADMIN_PASSWORD_HASH=${hash}`);

    await fs.writeFile(envPath, lines.join('\n'), 'utf-8');

    // Update in-memory process.env
    process.env.ADMIN_USERNAME = newUsername;
    process.env.ADMIN_PASSWORD_HASH = hash;

    return { success: true };
  } catch (error) {
    console.error('Failed to update admin credentials:', error);
    return { error: 'Gagal memperbarui kredensial admin.' };
  }
}
