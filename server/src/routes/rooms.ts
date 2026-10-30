
import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../services/prisma.js';

// Initialize the Express router for managing hotel rooms.
const router = Router();

// GET: Retrieve all hotel rooms with optional filtering.
router.get('/', async (req, res) => {
  try {
    // Define the filters that Prisma will apply in PostgreSQL.
    const where: Prisma.RoomWhereInput = {};

    // Filter rooms by hotel branch.
    if (typeof req.query.branchId === 'string') {
      where.branchId = req.query.branchId;
    }

    // Filter rooms based on the requested guest count.
    if (req.query.guests !== undefined) {
      const guests = Number(req.query.guests);

      // Reject invalid guest counts.
      if (!Number.isInteger(guests) || guests < 1) {
        res.status(400).json({
          error: 'Guests must be a positive whole number.'
        });
        return;
      }

      where.capacity = {
        gte: guests
      };
    }

    // Retrieve matching rooms from PostgreSQL.
    const rooms = await prisma.room.findMany({
      where
    });

    // Return the filtered list of rooms.
    res.json(rooms);
  } catch (error) {
    console.error('Failed to fetch rooms:', error);

    res.status(500).json({
      error: 'Failed to retrieve hotel rooms.'
    });
  }
});

// GET: Retrieve a specific hotel room using its ID.
router.get('/:id', async (req, res) => {
  try {
    // Find the room by its existing ID.
    const room = await prisma.room.findUnique({
      where: {
        id: String(req.params.id)
      }
    });

    // Return 404 if the room does not exist.
    if (!room) {
      res.status(404).json({
        error: 'Room not found.'
      });
      return;
    }

    // Return the selected room's information.
    res.json(room);
  } catch (error) {
    console.error('Failed to fetch room:', error);

    res.status(500).json({
      error: 'Failed to retrieve hotel room.'
    });
  }
});

// Export the rooms router for use in the main Express application.
export default router;
