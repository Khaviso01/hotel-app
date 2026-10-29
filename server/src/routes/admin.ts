
import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import type { Room } from '../models/types.js';
import { roomImages } from '../services/seed.js';
import { db, save } from '../services/database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { handle, publicUser } from '../controllers/helpers.js';

// Initialize the Express router for admin operations.
const router = Router();

// All routes below require authentication and admin authorization.

// GET: Retrieve dashboard statistics, including bookings, revenue, and occupancy.
router.get(
  '/stats',
  requireAuth,
  requireAdmin,
  (_req, res) => {
    res.json({
      bookings: db.bookings.length,
      revenue: db.bookings
        .filter(b => b.status === 'confirmed')
        .reduce((s, b) => s + b.total, 0),
      branches: db.branches.length,
      rooms: db.rooms.length,
      users: db.users.length,
      occupancy: db.rooms.length
        ? Math.round(
            db.bookings.filter(b => b.status === 'confirmed').length /
            db.rooms.length * 100
          )
        : 0
    });
  }
);

// GET: Retrieve all registered users without exposing sensitive information.
router.get(
  '/users',
  requireAuth,
  requireAdmin,
  (_req, res) => {
    res.json(db.users.map(publicUser));
  }
);

// POST: Create a new hotel room.
router.post(
  '/rooms',
  requireAuth,
  requireAdmin,
  handle((req, res) => {
    // Validate the submitted room information.
    const v = z.object({
      branchId: z.string(),
      name: z.string().min(2),
      type: z.string().min(2),
      capacity: z.number().int().positive(),
      price: z.number().positive(),
      available: z.boolean(),
      image: z.string().optional(),
      description: z.string().optional()
    }).parse(req.body);

    // Ensure the selected hotel branch exists.
    if (!db.branches.some(b => b.id === v.branchId))
      throw Error('Unknown branch.');

    // Create the room with a unique ID and default optional values.
    const room: Room = {
      id: crypto.randomUUID(),
      ...v,
      image: v.image || roomImages[0],
      description: v.description || ''
    };

    // Save the new room and return its details.
    db.rooms.push(room);
    save();

    res.status(201).json(room);
  })
);

// PATCH: Update an existing hotel's room information.
router.patch(
  '/rooms/:id',
  requireAuth,
  requireAdmin,
  handle((req, res) => {
    // Find the room using its ID.
    const r = db.rooms.find(r => r.id === req.params.id);

    if (!r)
      throw Error('Room not found.');

    // Validate only the fields provided for updating.
    const v = z.object({
      branchId: z.string().optional(),
      name: z.string().min(2).optional(),
      type: z.string().min(2).optional(),
      capacity: z.number().int().positive().optional(),
      price: z.number().positive().optional(),
      available: z.boolean().optional(),
      image: z.string().optional(),
      description: z.string().optional()
    }).parse(req.body);

    // Apply changes and save the updated room.
    Object.assign(r, v);
    save();

    res.json(r);
  })
);

// DELETE: Remove a room if it has no active bookings.
router.delete(
  '/rooms/:id',
  requireAuth,
  requireAdmin,
  handle((req, res) => {
    // Prevent deletion when the room has bookings that are not cancelled.
    if (
      db.bookings.some(
        b => b.roomId === req.params.id && b.status !== 'cancelled'
      )
    )
      throw Error('Cancel active bookings before deleting this room.');

    // Remove the room and save the changes.
    db.rooms = db.rooms.filter(r => r.id !== req.params.id);
    save();

    res.json({ ok: true });
  })
);

// POST: Add a new hotel branch.
router.post(
  '/branches',
  requireAuth,
  requireAdmin,
  handle((req, res) => {
    // Validate the new branch information.
    const v = z.object({
      name: z.string(),
      city: z.string(),
      address: z.string(),
      description: z.string(),
      image: z.string(),
      rating: z.number().min(0).max(5),
      amenities: z.array(z.string())
    }).parse(req.body);

    // Generate a unique branch ID.
    const b = {
      id: crypto.randomUUID(),
      ...v
    };

    // Store the branch and return the created record.
    db.branches.push(b);
    save();

    res.status(201).json(b);
  })
);

// PATCH: Update an existing hotel branch.
router.patch(
  '/branches/:id',
  requireAuth,
  requireAdmin,
  handle((req, res) => {
    // Find the branch using its ID.
    const b = db.branches.find(b => b.id === req.params.id);

    if (!b)
      throw Error('Branch not found.');

    // Apply the submitted changes to the branch.
    Object.assign(b, req.body);
    save();

    res.json(b);
  })
);

// POST: Send notifications to a specific user or all guest users.
router.post(
  '/notifications',
  requireAuth,
  requireAdmin,
  handle((req, res) => {
    // Validate the notification details.
    const v = z.object({
      title: z.string(),
      message: z.string(),
      userId: z.string().optional()
    }).parse(req.body);

    // Determine whether to notify one user or all guests.
    const targets = v.userId
      ? [v.userId]
      : db.users
          .filter(u => u.role === 'guest')
          .map(u => u.id);

    // Create a notification record for each selected user.
    targets.forEach(userId =>
      db.notices.push({
        id: crypto.randomUUID(),
        userId,
        title: v.title,
        message: v.message,
        read: false,
        createdAt: new Date().toISOString()
      })
    );

    // Save notifications and return the number of recipients.
    save();

    res.json({ sent: targets.length });
  })
);

// Export the admin router for use in the main Express application.
export default router;
