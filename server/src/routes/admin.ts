import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { auth, admin, type AuthRequest } from '../middleware/auth.js';

// Initialize admin router and protect all routes with authentication and admin role checks
export const adminRouter = Router();
adminRouter.use(auth, admin);

// Validation schema for creating and updating rooms
const roomSchema = z.object({
  branchId: z.string(),
  name: z.string().min(2),
  type: z.string().min(2),
  description: z.string().default(''),
  capacity: z.number().int().min(1),
  price: z.number().int().min(1),
  available: z.boolean(),
  image: z.string().url(),
});

// Validation schema for creating and updating branches
const branchSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(2),
  description: z.string(),
  image: z.string().url(),
});

// GET: Retrieve overall dashboard statistics and total confirmed revenue
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [bookings, rooms, branches, users, revenue] = await Promise.all([
      db.booking.count(),
      db.room.count(),
      db.branch.count(),
      db.user.count(),
      db.booking.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { total: true },
      }),
    ]);
    res.json({
      bookings,
      rooms,
      branches,
      users,
      revenue: revenue._sum.total || 0,
    });
  } catch (e) {
    next(e);
  }
});

// GET: Retrieve all bookings with nested room, branch, and user details
adminRouter.get('/bookings', async (_req, res, next) => {
  try {
    res.json(
      await db.booking.findMany({
        include: {
          room: { include: { branch: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch (e) {
    next(e);
  }
});

// PATCH: Update booking status and send a notification to the user
adminRouter.patch('/bookings/:id', async (req, res, next) => {
  try {
    const data = z
      .object({
        status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']),
      })
      .parse(req.body);
    const booking = await db.booking.update({
      where: { id: req.params.id },
      data,
    });
    await db.notification.create({
      data: {
        userId: booking.userId,
        title: 'Booking updated',
        message: 'Your booking ' + booking.reference + ' is ' + data.status.toLowerCase(),
      },
    });
    res.json(booking);
  } catch (e) {
    next(e);
  }
});

// POST: Create a new room with validated request body
adminRouter.post('/rooms', async (req, res, next) => {
  try {
    res.status(201).json(
      await db.room.create({
        data: roomSchema.parse(req.body),
      })
    );
  } catch (e) {
    next(e);
  }
});

// PUT: Update an existing room by ID
adminRouter.put('/rooms/:id', async (req, res, next) => {
  try {
    res.json(
      await db.room.update({
        where: { id: req.params.id },
        data: roomSchema.parse(req.body),
      })
    );
  } catch (e) {
    next(e);
  }
});

// DELETE: Remove a room (prevents deletion if active, non-cancelled bookings exist)
adminRouter.delete('/rooms/:id', async (req, res, next) => {
  try {
    const count = await db.booking.count({
      where: { roomId: req.params.id, status: { not: 'CANCELLED' } },
    });
    if (count) return res.status(409).json({ error: 'Cancel or reassign active bookings first' });
    await db.room.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

// POST: Create a new branch with validated request body
adminRouter.post('/branches', async (req, res, next) => {
  try {
    res.status(201).json(
      await db.branch.create({
        data: branchSchema.parse(req.body),
      })
    );
  } catch (e) {
    next(e);
  }
});

// PUT: Update an existing branch by ID
adminRouter.put('/branches/:id', async (req, res, next) => {
  try {
    res.json(
      await db.branch.update({
        where: { id: req.params.id },
        data: branchSchema.parse(req.body),
      })
    );
  } catch (e) {
    next(e);
  }
});
