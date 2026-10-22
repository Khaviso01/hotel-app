import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { auth, type AuthRequest } from '../middleware/auth.js';

// Initialize authentication router
export const authRouter = Router();

// Validation schema for user registration payload
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
