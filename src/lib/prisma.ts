import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prevent multiple instances of Prisma Client in development mode due to hot reloading.
// We store the reference on the globalThis object which persists across module reloads.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let db: PrismaClient;

// Configure connection pool and instantiate Prisma Client
if (process.env.NODE_ENV === "production") {
  // In production, we instantiate a new Prisma client instance directly
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool); // Use PrismaPg driver adapter for PostgreSQL
  db = new PrismaClient({ adapter });
} else {
  // In development, check if a global instance already exists; otherwise create one
  if (!globalForPrisma.prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  // Reuse the globally stored client instance
  db = globalForPrisma.prisma;
}

export { db };

