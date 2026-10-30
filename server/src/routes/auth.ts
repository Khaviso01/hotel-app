
import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role, type User as PrismaUser } from '@prisma/client';

import { prisma } from '../services/prisma.js';
import {
  requireAuth,
  token,
  type AuthRequest
} from '../middleware/auth.js';

import { publicUser } from '../controllers/helpers.js';
import type { User } from '../models/types.js';

const router = Router();

// Convert Prisma's uppercase roles to the existing API format.
function toAppUser(user: PrismaUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash ?? '',
    role: user.role === Role.ADMIN ? 'admin' : 'guest'
  };
}

// Handle asynchronous database errors safely.
function asyncHandler(
  fn: (req: AuthRequest, res: Response) => Promise<void>
) {
  return (req: AuthRequest, res: Response) => {
    Promise.resolve()
      .then(() => fn(req, res))
      .catch((error: unknown) => {
        console.error('Authentication error:', error);

        if (res.headersSent) return;

        res.status(400).json({
          error: error instanceof Error
            ? error.message
            : 'Request failed.'
        });
      });
  };
}

// Validate registration details.
const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8)
});

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const values = registerSchema.parse(req.body);
  const email = values.email.toLowerCase();

  // Check whether the account already exists in PostgreSQL.
  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    res.status(409).json({
      error: 'Email already registered.'
    });
    return;
  }

  // Hash the password before storing the account.
  const passwordHash = await bcrypt.hash(values.password, 10);

  // Create the new guest account in PostgreSQL.
  const created = await prisma.user.create({
    data: {
      name: values.name,
      email,
      passwordHash,
      role: Role.GUEST
    }
  });

  const user = toAppUser(created);

  res.status(201).json({
    user: publicUser(user),
    token: token(user)
  });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const values = z.object({
    email: z.string().email(),
    password: z.string()
  }).parse(req.body);

  // Retrieve the account from PostgreSQL.
  const found = await prisma.user.findUnique({
    where: {
      email: values.email.toLowerCase()
    }
  });

  // OAuth-only accounts may not have a password.
  if (
    !found?.passwordHash ||
    !(await bcrypt.compare(values.password, found.passwordHash))
  ) {
    res.status(401).json({
      error: 'Invalid email or password.'
    });
    return;
  }

  const user = toAppUser(found);

  res.json({
    user: publicUser(user),
    token: token(user)
  });
}));

// GET /api/auth/me
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    // Find the authenticated account in PostgreSQL.
    const found = await prisma.user.findUnique({
      where: { id: req.auth!.sub }
    });

    if (!found) {
      res.status(404).json({
        error: 'User not found.'
      });
      return;
    }

    res.json(publicUser(toAppUser(found)));
  })
);

// PATCH /api/auth/me
router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const values = z.object({
      name: z.string().trim().min(2).optional(),
      email: z.string().trim().email().optional()
    }).refine(
      data => data.name !== undefined || data.email !== undefined,
      { message: 'Provide a name or email to update.' }
    ).parse(req.body);

    const email = values.email?.toLowerCase();

    // Prevent duplicate email addresses.
    if (email) {
      const existing = await prisma.user.findUnique({
        where: { email }
      });

      if (existing && existing.id !== req.auth!.sub) {
        res.status(409).json({
          error: 'Email already registered.'
        });
        return;
      }
    }

    // Update the authenticated user's profile.
    const updated = await prisma.user.update({
      where: { id: req.auth!.sub },
      data: {
        ...(values.name !== undefined && { name: values.name }),
        ...(email !== undefined && { email })
      }
    });

    res.json(publicUser(toAppUser(updated)));
  })
);

export default router;
