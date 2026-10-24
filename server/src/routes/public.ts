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
