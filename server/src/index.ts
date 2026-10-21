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


// 1. Environment Variables
// Ensuring that all required environment variables are set and valid