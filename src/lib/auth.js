import bcrypt from 'bcrypt';

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
