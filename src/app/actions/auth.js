'use server';

import { cookies } from 'next/headers';
import { encrypt, verifyPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';

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

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}
