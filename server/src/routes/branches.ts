
import { Router } from 'express';
import { db } from '../services/database.js';
import { handle } from '../controllers/helpers.js';

// Initialize the Express router for managing hotel branches.
const router = Router();

// GET: Retrieve all available hotel branches.
router.get(
  '/',
  (_req, res) => {
    // Return the complete list of hotel branches.
    res.json(db.branches);
  }
);

// GET: Retrieve a specific hotel branch using its ID.
router.get(
  '/:id',
  handle((req, res) => {
    // Find the branch that matches the provided ID.
    const b = db.branches.find(
      b => b.id === req.params.id
    );

    // Return an error if the requested branch does not exist.
    if (!b)
      throw Error('Branch not found.');

    // Return the selected branch's information.
    res.json(b);
  })
);

// Export the branch router for registration in the main Express application.
export default router;
