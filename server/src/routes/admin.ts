import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { auth, admin, type AuthRequest } from '../middleware/auth.js';

// Initialize admin router and protect all routes with authentication and admin role checks
export const adminRouter = Router();
adminRouter.use(auth, admin);