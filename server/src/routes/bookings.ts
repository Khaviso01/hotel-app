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

// GET: Retrieve a specific booking by ID for the authenticated user
bookingRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const item = await db.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include,
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(item);
  } catch (e) {
    next(e);
  }
});

// POST: Create a new room booking with date validation, availability checks, and overlap prevention
bookingRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const v = schema.parse(req.body);
    const start = new Date(v.checkIn);
    const end = new Date(v.checkOut);

    / Validate that dates are valid timestamp numbers, check-out follows check-in, and dates are in the future
    if (
      !Number.isFinite(+start) ||
      !Number.isFinite(+end) ||
      end <= start ||
      start < new Date(new Date().toDateString())
    ) {
      return res.status(400).json({ error: 'Choose valid future dates' });
    }

    // Verify room existence, active availability flag, and guest capacity limits
    const room = await db.room.findUnique({ where: { id: v.roomId } });
    if (!room?.available || v.guests > room.capacity) {
      return res.status(400).json({ error: 'Room unavailable or capacity exceeded' });
    }

    // Check for existing overlapping bookings for this room that are not cancelled
    const overlap = await db.booking.count({
      where: {
        roomId: room.id,
        status: { not: 'CANCELLED' },
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
    });

    if (overlap) {
      return res.status(409).json({ error: 'Room already booked for these dates' });
    }

    // Calculate total price based on duration in nights, room nightly rate, and standard service fees
    const nights = Math.round((+end - +start) / 86400000);
    const total = nights * room.price + 150;

     // Create the booking record with a unique generated reference code
    const booking = await db.booking.create({
      data: {
        reference: 'TR-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        userId: req.user!.id,
        roomId: room.id,
        checkIn: start,
        checkOut: end,
        guests: v.guests,
        total,
      },
      include,
    });