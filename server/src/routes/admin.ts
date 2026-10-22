import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { auth, admin, type AuthRequest } from '../middleware/auth.js';

// Initialize admin router and protect all routes with authentication and admin role checks
export const adminRouter = Router();
adminRouter.use(auth, admin);

// Validation schema for creating and updating rooms
const roomSchema = z.object({
  branchId: z.string(),
  name: z.string().min(2),
  type: z.string().min(2),
  description: z.string().default(''),
  capacity: z.number().int().min(1),
  price: z.number().int().min(1),
  available: z.boolean(),
  image: z.string().url(),
});

// Validation schema for creating and updating branches
const branchSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(2),
  description: z.string(),
  image: z.string().url(),
});