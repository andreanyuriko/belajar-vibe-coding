import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

export const registerUser = async (data: any) => {
  const { name, email, password } = data;

  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error('Email sudah terdaftar');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { success: true };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  // Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new Error('Email atau Password salah');
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Email atau Password salah');
  }

  // Generate token
  const token = randomUUID();

  // Create session
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
};
