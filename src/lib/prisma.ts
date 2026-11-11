// src/lib/prisma.ts
// Prisma client singleton for connection pooling in Next.js App Router

import { PrismaClient } from '@prisma/client';

declare global {
  // Avoid multiple Prisma client instances in Next.js dev hot-reload cycles
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

const prisma =
  globalThis.__prismaClient ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV === 'development') {
  globalThis.__prismaClient = prisma;
}

export { prisma };

