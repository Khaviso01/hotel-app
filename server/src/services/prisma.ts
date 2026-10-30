import { PrismaClient } from '@prisma/client';

// Create a reusable PostgreSQL database connection.
export const prisma = new PrismaClient();