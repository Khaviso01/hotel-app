import 'dotenv/config'; // Load environment variables from a .env file into process.env
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';
import { bookingRouter } from './routes/bookings.js';
import { adminRouter } from './routes/admin.js';


// 1. Environment Variables - Ensuring that all required environment variables are set and valid
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set a strong JWT_SECRET in server/.env');
}

// Initialize Express application
const app = express();

// 2. Middleware - configuration Secure HTTP headers using Helmet
app.use(helmet());

// Enable Cross-Origin Resource Sharing (CORS) with allowed origin configuration
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// Parse incoming JSON request bodies (payload limit set to 100kb for safety)
app.use(express.json({ limit: '100kb' }));

// 3. ROUTES & RATE LIMITING - Rate limiter for authentication routes: max 40 requests per 15-minute window
app.use(
  '/api/auth',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 40 }),
  authRouter
);

// Mount core API endpoints
app.use('/api', publicRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint for monitoring services
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// 4. Error Handling - Centralized error handling middleware
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    // Handle Zod schema validation errors (e.g., bad request body/parameters)
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: error.issues.map((x) => x.message).join(', '),
      });
    }