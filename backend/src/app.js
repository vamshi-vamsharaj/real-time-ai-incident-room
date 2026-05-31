import express from 'express';
import cors from 'cors';
import incidentRoutes from './features/incidents/incident.routes.js';
import errorHandler from './shared/middleware/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/incidents', incidentRoutes);

// Global error handler
app.use(errorHandler);

export default app;