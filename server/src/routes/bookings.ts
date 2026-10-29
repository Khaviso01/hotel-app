
import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import type { Booking } from '../models/types.js';
import { db, save } from '../services/database.js';
import { requireAuth } from '../middleware/auth.js';
import { handle } from '../controllers/helpers.js';

// Initialize the Express router for managing hotel bookings.
const router = Router();

// Define validation rules for creating a new booking.
const bookingSchema = z.object({
  roomId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().int().min(1)
});

// POST: Create a new hotel room booking.
router.post(
  '/',
  requireAuth,
  handle((req, res) => {
    // Validate booking details and find the selected room.
    const v = bookingSchema.parse(req.body),
      room = db.rooms.find(r => r.id === v.roomId);

    // Ensure the selected room exists and is available.
    if (!room || !room.available)
      throw Error('Room unavailable.');

    // Calculate the number of nights between check-in and check-out.
    const nights = Math.round(
      (Date.parse(v.checkOut) - Date.parse(v.checkIn)) / 86400000
    );

    // Ensure the booking dates are valid.
    if (!Number.isFinite(nights) || nights < 1)
      throw Error('Check-out must be after check-in.');

    // Check that the number of guests does not exceed room capacity.
    if (v.guests > room.capacity)
      throw Error('Room capacity exceeded.');

    // Check for existing bookings that overlap with the selected dates.
    const overlap = db.bookings.some(
      b =>
        b.roomId === room.id &&
        b.status !== 'cancelled' &&
        v.checkIn < b.checkOut &&
        v.checkOut > b.checkIn
    );

    // Prevent double bookings for the same room and dates.
    if (overlap)
      throw Error('Room already booked for these dates.');

    // Create a booking with a unique reference number.
    // The total includes the room price per night and a R150 service fee.
    const b: Booking = {
      id: 'TR-' + Date.now().toString().slice(-9),
      userId: req.auth!.sub,
      roomId: room.id,
      checkIn: v.checkIn,
      checkOut: v.checkOut,
      guests: v.guests,
      total: room.price * nights + 150,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Add the new booking to the database.
    db.bookings.push(b);

    // Notify the guest that their booking is awaiting confirmation.
    db.notices.push({
      id: crypto.randomUUID(),
      userId: b.userId,
      title: 'Booking requested',
      message: `Reservation ${b.id} is pending confirmation.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    // Save the booking and notification.
    save();

    // Return the newly created booking.
    res.status(201).json(b);
  })
);

// GET: Retrieve bookings belonging to the authenticated user.
// Admins can retrieve all bookings, while guests can only view their own.
router.get(
  '/',
  requireAuth,
  handle((req, res) => {
    res.json(
      db.bookings
        .filter(
          b =>
            req.auth!.role === 'admin' ||
            b.userId === req.auth!.sub
        )
        .sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        )
    );
  })
);

// GET: Retrieve a specific booking using its booking ID.
router.get(
  '/:id',
  requireAuth,
  handle((req, res) => {
    // Find the booking and verify that the user has access to it.
    const b = db.bookings.find(
      b =>
        b.id === req.params.id &&
        (
          req.auth!.role === 'admin' ||
          b.userId === req.auth!.sub
        )
    );

    // Return an error if the booking does not exist or is inaccessible.
    if (!b)
      throw Error('Booking not found.');

    // Return the selected booking.
    res.json(b);
  })
);

// PATCH: Update the status of an existing booking.
router.patch(
  '/:id',
  requireAuth,
  handle((req, res) => {
    // Find the booking and verify that the user has access to it.
    const b = db.bookings.find(
      b =>
        b.id === req.params.id &&
        (
          req.auth!.role === 'admin' ||
          b.userId === req.auth!.sub
        )
    );

    // Ensure the requested booking exists.
    if (!b)
      throw Error('Booking not found.');

    // Validate the new booking status.
    const { status } = z.object({
      status: z.enum(['pending', 'confirmed', 'cancelled'])
    }).parse(req.body);

    // Only administrators can approve or change bookings to non-cancelled statuses.
    if (req.auth!.role !== 'admin' && status !== 'cancelled')
      throw Error('Only admins can approve bookings.');

    // Update the booking status.
    b.status = status;

    // Notify the guest about the booking status change.
    db.notices.push({
      id: crypto.randomUUID(),
      userId: b.userId,
      title: 'Booking updated',
      message: `${b.id} is now ${status}.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    // Save the updated booking and notification.
    save();

    // Return the updated booking.
    res.json(b);
  })
);

// Export the booking router for registration in the main Express application.
export default router;
