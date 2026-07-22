import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let db: PrismaClient;

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || "";
  const isPostgres =
    connectionString.startsWith("postgresql://") ||
    connectionString.startsWith("postgres://");

  if (isPostgres) {
    try {
      const { PrismaPg } = require("@prisma/adapter-pg");
      const { Pool } = require("pg");
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter });
    } catch {
      return new PrismaClient();
    }
  }

  return new PrismaClient();
}

if (process.env.NODE_ENV === "production") {
  db = createClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  db = globalForPrisma.prisma;
}

export { db };


