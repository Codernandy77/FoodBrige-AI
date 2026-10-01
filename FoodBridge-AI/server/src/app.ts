import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import donationRoutes from './routes/donationRoutes';
import pickupRoutes from './routes/pickupRoutes';
import ngoRoutes from './routes/ngoRoutes';
import volunteerRoutes from './routes/volunteerRoutes';
import notificationRoutes from './routes/notificationRoutes';
import needReportRoutes from './routes/needReportRoutes';
import impactRoutes from './routes/impactRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

app.use(cors({
  origin: '*', // For development, allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main entry status route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'FoodBridge AI API', time: new Date() });
});

// Map routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/need-reports', needReportRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/admin', adminRoutes);

// General 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.url}` });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Error] Server uncaught error:', err);
  res.status(500).json({ error: 'Internal Server Error. Please contact support.' });
});

export default app;
