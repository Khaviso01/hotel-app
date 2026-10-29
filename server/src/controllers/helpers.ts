import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import type { User } from '../models/types.js';

// Catch errors thrown within route controllers and return structured JSON responses.
export const handle = (fn: (req: AuthRequest, res: Response) => void) => (req: AuthRequest, res: Response) => {
  try {
    fn(req, res);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid request' });
  }
};

// Strip sensitive fields like passwordHash and return public user profile data.
export const publicUser = (u: User) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
});