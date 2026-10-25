import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include the authenticated user payload
export type AuthRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};