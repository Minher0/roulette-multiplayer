import { PrismaClient } from '@prisma/client';
import { Pool } from '@vercel/postgres';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use Vercel Postgres adapter if POSTGRES_URL is available (Vercel deployment)
  if (process.env.POSTGRES_URL || process.env.DATABASE_URL?.includes('postgres')) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
  
  // Fallback to standard Prisma client (local development with SQLite)
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
