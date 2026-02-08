import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Log queries in development
const prismaOptions = process.env.NODE_ENV === 'development'
  ? { log: ['query', 'error', 'warn'] as any[] }
  : {};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
