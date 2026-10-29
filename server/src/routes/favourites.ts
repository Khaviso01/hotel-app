
import { Router } from 'express';
import { db, save } from '../services/database.js';
import { requireAuth } from '../middleware/auth.js';
import { handle } from '../controllers/helpers.js';

// Initialize the Express router for managing user favourites.
const router = Router();

// GET: Retrieve all favourite hotel branches for the authenticated user.
router.get(
  '/',
  requireAuth,
  handle((req, res) => {
    // Filter branches to include only those saved by the current user.
    res.json(
      db.branches.filter(b =>
        db.favourites.some(
          f =>
            f.userId === req.auth!.sub &&
            f.branchId === b.id
        )
      )
    );
  })
);

// POST: Add a hotel branch to the authenticated user's favourites.
router.post(
  '/:branchId',
  requireAuth,
  handle((req, res) => {
    // Check whether the selected hotel branch exists.
    if (!db.branches.some(b => b.id === req.params.branchId))
      throw Error('Branch not found.');

    // Prevent adding the same branch to favourites more than once.
    if (
      !db.favourites.some(
        f =>
          f.userId === req.auth!.sub &&
          f.branchId === req.params.branchId
      )
    )
      db.favourites.push({
        userId: req.auth!.sub,
        branchId: String(req.params.branchId)
      });

    // Save the updated favourites to the database.
    save();

    // Return a successful response.
    res.json({ ok: true });
  })
);

// DELETE: Remove a hotel branch from the authenticated user's favourites.
router.delete(
  '/:branchId',
  requireAuth,
  handle((req, res) => {
    // Remove only the matching favourite belonging to the current user.
    db.favourites = db.favourites.filter(
      f =>
        !(
          f.userId === req.auth!.sub &&
          f.branchId === req.params.branchId
        )
    );

    // Save the updated favourites to the database.
    save();

    // Return a successful response.
    res.json({ ok: true });
  })
);

// Export the favourites router for use in the main Express application.
export default router;
