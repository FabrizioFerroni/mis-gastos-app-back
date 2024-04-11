import { compare, hash } from 'bcrypt';

export async function validatePassword(
  plaintextPassword: string,
  userPassword: string,
) {
  return await compare(plaintextPassword, userPassword);
}

export async function hashPassword(plaintextPassword: string) {
  return await hash(plaintextPassword, 10);
}
