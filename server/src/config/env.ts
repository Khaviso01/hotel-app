
import 'dotenv/config';

// Define the port used by the Express server.
export const PORT = Number(process.env.PORT || 4000);

// Define the frontend URL allowed to access the backend.
export const CLIENT_URL =
  process.env.CLIENT_URL || 'http://localhost:5173';

// Define the secret used to sign and verify JWT tokens.
export const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-before-deployment';
