
import { Router } from 'express';
import { prisma } from '../services/prisma.js';

// Initialize the Express router for hotel branches.
const router = Router();

// GET: Retrieve all hotel branches from PostgreSQL.
router.get('/', async (_req, res) => {
  try {
    // Fetch all branches using Prisma.
    const branches = await prisma.branch.findMany();

    // Return the complete list of hotel branches.
    res.json(branches);
  } catch (error) {
    console.error('Failed to fetch branches:', error);

    res.status(500).json({
      error: 'Failed to retrieve hotel branches.'
    });
  }
});

// GET: Retrieve a specific hotel branch by its ID.
router.get('/:id', async (req, res) => {
  try {
    // Find the branch using its existing ID.
    const branch = await prisma.branch.findUnique({
      where: {
        id: String(req.params.id)
      }
    });

    // Return 404 if the branch does not exist.
    if (!branch) {
      res.status(404).json({
        error: 'Branch not found.'
      });
      return;
    }

    // Return the selected branch's information.
    res.json(branch);
  } catch (error) {
    console.error('Failed to fetch branch:', error);

    res.status(500).json({
      error: 'Failed to retrieve hotel branch.'
    });
  }
});

// Export the router for use in the main Express application.
export default router;
