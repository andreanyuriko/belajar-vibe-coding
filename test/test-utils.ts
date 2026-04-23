import { db } from '../src/db';
import { users, sessions } from '../src/db/schema';
import { sql } from 'drizzle-orm';

export const clearDatabase = async () => {
  // Disable foreign key checks to allow truncation in any order
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);
  await db.execute(sql`TRUNCATE TABLE sessions;`);
  await db.execute(sql`TRUNCATE TABLE users;`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);
};
