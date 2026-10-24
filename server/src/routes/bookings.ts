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

    // Validate that dates are valid timestamp numbers, check-out follows check-in, and dates are in the future
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

    // Create an in-app notification confirming receipt of the booking request
    await db.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Booking request received',
        message: 'Your booking ' + booking.reference + ' is awaiting confirmation.',
      },
    });

    res.status(201).json(booking);
  } catch (e) {
    next(e);
  }
});

// PATCH: Modify check-in and check-out dates for an existing pending booking
bookingRouter.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const v = z.object({ checkIn: z.string(), checkOut: z.string() }).parse(req.body);

    // Ensure the booking exists, belongs to the user, and is currently in pending status
    const existing = await db.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.id, status: 'PENDING' },
      include: { room: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Only pending bookings can be modified' });
    }

    const start = new Date(v.checkIn);
    const end = new Date(v.checkOut);

    // Validate modified date inputs
    if (
      !Number.isFinite(+start) ||
      !Number.isFinite(+end) ||
      end <= start ||
      start < new Date(new Date().toDateString())
    ) {
      return res.status(400).json({ error: 'Invalid dates' });
    }

    // Check for date conflicts with other active bookings for the same room
    const overlap = await db.booking.count({
      where: {
        roomId: existing.roomId,
        id: { not: existing.id },
        status: { not: 'CANCELLED' },
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
    });

    if (overlap) {
      return res.status(409).json({ error: 'Room unavailable' });
    }

    // Recalculate cost and update booking dates
    const updatedBooking = await db.booking.update({
      where: { id: existing.id },
      data: {
        checkIn: start,
        checkOut: end,
        total: Math.round((+end - +start) / 86400000) * existing.room.price + 150,
      },
      include,
    });

    res.json(updatedBooking);
  } catch (e) {
    next(e);
  }
});

// DELETE: Cancel an existing booking by updating its status to cancelled
bookingRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await db.booking.updateMany({
      where: { id: req.params.id, userId: req.user!.id, status: { not: 'CANCELLED' } },
      data: { status: 'CANCELLED' },
    });

    if (!result.count) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled' });
  } catch (e) {
    next(e);
  }
});