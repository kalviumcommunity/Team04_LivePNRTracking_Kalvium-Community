import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development mode due to hot reloading.
// We store the reference on the globalThis object which persists across module reloads.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
