/**
 * @file prisma.ts
 * @description Instantiates and exports a single global Prisma Client instance.
 * In development mode, the client is saved to the globalThis object to prevent
 * hot-reloading from creating multiple connection pools to the SQLite/database server.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Global database client instance utilized for execution of database queries.
 */
export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

