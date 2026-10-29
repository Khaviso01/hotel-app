import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import type { User } from '../models/types.js';

// Generate a signed JWT authentication token valid for 7 days.
export const token = (u: User) =>
  jwt.sign({ sub: u.id, role: u.role }, JWT_SECRET, { expiresIn: '7d' });

// Extended Express Request type containing the parsed JWT auth payload.
export type AuthRequest = Request & { auth?: { sub: string; role: 'guest' | 'admin' } };

// Middleware to verify JWT Bearer token from authorization headers.
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const raw = req.headers.authorization?.replace(/^Bearer /, '');
    if (!raw) throw Error();
    req.auth = jwt.verify(raw, JWT_SECRET) as AuthRequest['auth'];
    next();
  } catch {
    res.status(401).json({ error: 'Please sign in first.' });
  }
}

// Middleware to restrict route access strictly to users with the administrator role.
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.auth?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  next();
}