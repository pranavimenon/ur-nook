import { PrismaClient } from '@prisma/client';

// Reuse a single PrismaClient across hot-reloads in development, so
// `next dev` re-compiling this module doesn't open a new connection pool
// every time a file changes.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
