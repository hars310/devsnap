import { PrismaClient } from '@prisma/client';

// Singleton pattern — reuse connection across hot reloads
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}