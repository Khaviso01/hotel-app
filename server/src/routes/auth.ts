
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import type { User } from '../models/types.js';
import { db, save } from '../services/database.js';
import { requireAuth, token } from '../middleware/auth.js';
import { handle, publicUser } from '../controllers/helpers.js';

// Initialize the Express router for user authentication.
const router = Router();

// Define validation rules for user registration.
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

// POST: Register a new guest account.
router.post(
  '/register',
  handle((req, res) => {
    // Validate the submitted registration information.
    const v = registerSchema.parse(req.body);

    // Check whether the email address is already registered.
    if (db.users.some(u => u.email === v.email.toLowerCase()))
      throw Error('Email already registered.');

    // Create a new guest user with a unique ID and hashed password.
    const u: User = {
      id: crypto.randomUUID(),
      name: v.name,
      email: v.email.toLowerCase(),
      passwordHash: bcrypt.hashSync(v.password, 10),
      role: 'guest'
    };

    // Save the new user to the database.
    db.users.push(u);
    save();

    // Return the registered user's public information and authentication token.
    res.status(201).json({
      user: publicUser(u),
      token: token(u)
    });
  })
);

// POST: Authenticate an existing user.
router.post(
  '/login',
  handle((req, res) => {
    // Validate and extract the submitted login credentials.
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string()
    }).parse(req.body);

    // Find the user using their email address.
    const u = db.users.find(
      u => u.email === email.toLowerCase()
    );

    // Verify that the user exists and the password is correct.
    if (!u || !bcrypt.compareSync(password, u.passwordHash))
      throw Error('Invalid email or password.');

    // Return the authenticated user's public information and token.
    res.json({
      user: publicUser(u),
      token: token(u)
    });
  })
);

// GET: Retrieve the currently authenticated user's information.
router.get(
  '/me',
  requireAuth,
  handle((req, res) => {
    // Find the user associated with the authentication token.
    const u = db.users.find(
      u => u.id === req.auth!.sub
    );

    // Return an error if the user no longer exists.
    if (!u)
      throw Error('User not found.');

    // Return user information without exposing the password hash.
    res.json(publicUser(u));
  })
);

// Export the authentication router for use in the main Express application.
export default router;
