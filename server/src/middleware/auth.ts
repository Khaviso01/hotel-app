import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include the authenticated user payload
export type AuthRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};

// Authentication middleware to verify JWT from the Authorization header and attach the decoded user session to the request object
export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  // Extract Bearer token from request headers
  const token = req.headers.authorization?.replace(/^Bearer /, '');

  if (!token) {
    return res.status(401).json({ error: 'Please sign in' });
  }

  try {
    // Verify token validity and attach user payload
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired' });
  }
}