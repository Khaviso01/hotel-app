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
// Helper function to sign a JWT token with a 7-day expiration
function token(user: { id: string; role: string }) {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

// POST: Register a new user account and return an authentication token
authRouter.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if the email address is already taken
    if (await db.user.findUnique({ where: { email: data.email.toLowerCase() } })) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash the password securely and create the user record
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(data.password, 12),
      },
    });

    res.status(201).json({
      token: token({ id: user.id, role: user.role }),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    next(e);
  }
});

// POST: Authenticate user credentials and return an authentication token
authRouter.post('/login', async (req, res, next) => {
  try {
    const data = z
      .object({
        email: z.string().email(),
        password: z.string(),
      })
      .parse(req.body);

    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    // Validate user existence and verify password hash
    if (!user?.passwordHash || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      token: token({ id: user.id, role: user.role }),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    next(e);
  }
});