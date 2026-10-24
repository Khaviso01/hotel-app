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

// GET: Retrieve all favourite branches for the authenticated user
publicRouter.get('/favourites', auth, async (req: AuthRequest, res, next) => {
  try {
    res.json(
      await db.favourite.findMany({
        where: { userId: req.user!.id },
        include: { branch: { include: { rooms: true } } },
      })
    );
  } catch (e) {
    next(e);
  }
});

// POST: Add a branch to the authenticated user's favourites (upsert)
publicRouter.post('/favourites/:branchId', auth, async (req: AuthRequest, res, next) => {
  try {
    res.status(201).json(
      await db.favourite.upsert({
        where: {
          userId_branchId: {
            userId: req.user!.id,
            branchId: req.params.branchId,
          },
        },
        create: { userId: req.user!.id, branchId: req.params.branchId },
        update: {},
      })
    );
  } catch (e) {
    next(e);
  }
});

// DELETE: Remove a branch from the authenticated user's favourites
publicRouter.delete('/favourites/:branchId', auth, async (req: AuthRequest, res, next) => {
  try {
    await db.favourite.deleteMany({
      where: { userId: req.user!.id, branchId: req.params.branchId },
    });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

// GET: Retrieve all in-app notifications for the authenticated user, ordered by newest first
publicRouter.get('/notifications', auth, async (req: AuthRequest, res, next) => {
  try {
    res.json(
      await db.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch (e) {
    next(e);
  }
});

// PATCH: Mark a specific notification as read for the authenticated user
publicRouter.patch('/notifications/:id/read', auth, async (req: AuthRequest, res, next) => {
  try {
    const result = await db.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});