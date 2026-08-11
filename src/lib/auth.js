import bcrypt from 'bcrypt';

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}
