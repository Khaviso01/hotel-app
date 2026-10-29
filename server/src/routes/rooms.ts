
import { Router } from 'express';
import { db } from '../services/database.js';
import { handle } from '../controllers/helpers.js';

// Initialize the Express router for managing hotel rooms.
const router = Router();

// GET: Retrieve all hotel rooms with optional filtering.
router.get(
  '/',
  handle((req, res) => {
    // Retrieve the complete list of rooms from the database.
    let rooms = db.rooms;

    // Filter rooms by hotel branch if a branch ID is provided.
    if (req.query.branchId)
      rooms = rooms.filter(
        r => r.branchId === req.query.branchId
      );

    // Filter rooms based on the number of guests.
    // Only include rooms that can accommodate the requested guest count.
    if (req.query.guests)
      rooms = rooms.filter(
        r => r.capacity >= Number(req.query.guests)
      );

    // Return the filtered list of rooms.
    res.json(rooms);
  })
);

// GET: Retrieve a specific hotel room using its ID.
router.get(
  '/:id',
  handle((req, res) => {
    // Find the room that matches the provided ID.
    const room = db.rooms.find(
      r => r.id === req.params.id
    );

    // Return an error if the requested room does not exist.
    if (!room)
      throw Error('Room not found.');

    // Return the selected room's information.
    res.json(room);
  })
);

// Export the rooms router for use in the main Express application.
export default router;
