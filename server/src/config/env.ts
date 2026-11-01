
import 'dotenv/config';

// Define the port used by the Express server.
export const PORT = Number(process.env.PORT || 4000);

// Define the frontend URL allowed to access the backend.
export const CLIENT_URL =
  process.env.CLIENT_URL || 'http://localhost:5173';

// Define the secret used to sign and verify JWT tokens.
export const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-before-deployment';

// Google OAuth credentials
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// Public backend URL used for Google's callback
export const SERVER_URL =
  process.env.SERVER_URL || 'http://localhost:4000';
