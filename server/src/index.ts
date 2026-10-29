import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { CLIENT_URL, PORT } from './config/env.js';
import authRoutes from './routes/auth.js';
import branchRoutes from './routes/branches.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import favouriteRoutes from './routes/favourites.js';
import notificationRoutes from './routes/notifications.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';

// Create the API server and register middleware.
const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Keep endpoint paths unchanged so the frontend works without changes.
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

// Start listening after the routes have been registered.
app.listen(PORT, () => console.log(`The Retreat API: http://localhost:${PORT}`));
