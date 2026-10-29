
import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { db, save } from '../services/database.js';
import { requireAuth } from '../middleware/auth.js';
import { handle } from '../controllers/helpers.js';

// Initialize the Express router for managing hotel reviews.
const router = Router();

// GET: Retrieve all hotel reviews.
router.get(
  '/',
  (_req, res) => {
    // Return the complete list of reviews stored in the database.
    res.json(db.reviews);
  }
);

// POST: Create a new hotel review.
router.post(
  '/',
  requireAuth,
  handle((req, res) => {
    // Validate the submitted review information.
    const v = z.object({
      branchId: z.string(),
      rating: z.number().min(1).max(5),
      text: z.string().min(5)
    }).parse(req.body);

    // Create a new review with a unique ID and the authenticated user's ID.
    const review = {
      id: crypto.randomUUID(),
      userId: req.auth!.sub,
      ...v
    };

    // Add the new review to the database.
    db.reviews.push(review);

    // Save the updated reviews.
    save();

    // Return the newly created review.
    res.status(201).json(review);
  })
);

// Export the reviews router for use in the main Express application.
export default router;
