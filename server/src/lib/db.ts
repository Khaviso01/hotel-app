import { PrismaClient } from '@prisma/client';
// Reuse one Prisma client for all database requests.
export const db = new PrismaClient();