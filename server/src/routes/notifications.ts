
import { Router } from 'express';
import { db, save } from '../services/database.js';
import { requireAuth } from '../middleware/auth.js';
import { handle } from '../controllers/helpers.js';

// Initialize the Express router for managing user notifications.
const router = Router();

// GET: Retrieve all notifications belonging to the authenticated user.
router.get(
  '/',
  requireAuth,
  handle((req, res) => {
    // Filter notifications by the current user's ID.
    // Reverse the results to display the most recently stored notifications first.
    res.json(
      db.notices
        .filter(n => n.userId === req.auth!.sub)
        .reverse()
    );
  })
);

// PATCH: Mark a specific notification as read.
router.patch(
  '/:id/read',
  requireAuth,
  handle((req, res) => {
    // Find the notification using its ID and the authenticated user's ID.
    const n = db.notices.find(
      n =>
        n.id === req.params.id &&
        n.userId === req.auth!.sub
    );

    // Return an error if the notification does not exist or belongs to another user.
    if (!n)
      throw Error('Notification not found.');

    // Update the notification's read status.
    n.read = true;

    // Save the updated notification.
    save();

    // Return the updated notification.
    res.json(n);
  })
);

// Export the notifications router for use in the main Express application.
export default router;
