import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { auth, type AuthRequest } from '../middleware/auth.js';

export const publicRouter = Router();

// GET: Retrieve all branches, with optional case-insensitive city filtering and related rooms
publicRouter.get('/branches', async (req, res, next) => {
  try {
    const city = String(req.query.city || '');
    res.json(
      await db.branch.findMany({
        where: city ? { city: { contains: city, mode: 'insensitive' } } : {},
        include: { rooms: true },
      })
    );
  } catch (e) {
    next(e);
  }
});

// GET: Retrieve a specific branch by ID including rooms and user reviews
publicRouter.get('/branches/:id', async (req, res, next) => {
  try {
    const item = await db.branch.findUnique({
      where: { id: req.params.id },
      include: {
        rooms: true,
        reviews: { include: { user: { select: { name: true } } } },
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.json(item);
  } catch (e) {
    next(e);
  }
});

// GET: Retrieve all rooms, with optional branch ID filtering and branch details
publicRouter.get('/rooms', async (req, res, next) => {
  try {
    res.json(
      await db.room.findMany({
        where: req.query.branchId ? { branchId: String(req.query.branchId) } : {},
        include: { branch: true },
      })
    );
  } catch (e) {
    next(e);
  }
});

// POST: Submit a new review for a branch (requires authentication)
publicRouter.post('/reviews', auth, async (req: AuthRequest, res, next) => {
  try {
    const v = z
      .object({
        branchId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(3),
      })
      .parse(req.body);

    res.status(201).json(
      await db.review.create({
        data: { ...v, userId: req.user!.id },
      })
    );
  } catch (e) {
    next(e);
  }
});