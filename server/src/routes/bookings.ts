import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { auth, type AuthRequest } from '../middleware/auth.js';

export const bookingRouter = Router();

// Apply authentication middleware to all booking routes
bookingRouter.use(auth);

// Zod schema for validating incoming booking creation payloads
const schema = z.object({
  roomId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().int().min(1).max(12),
});

// Reusable Prisma relation include object for fetching room and branch details
const include = { room: { include: { branch: true } } };

// GET: Retrieve all bookings belonging to the currently authenticated user
bookingRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    res.json(
      await db.booking.findMany({
        where: { userId: req.user!.id },
        include,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch (e) {
    next(e);
  }
});