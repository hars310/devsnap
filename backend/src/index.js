import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { snapshotRoutes } from './routes/snapshots.js';
import { diffRoutes } from './routes/diff.js';
import { authRoutes } from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// Security & parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' })); // snapshots can be large

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/snapshots', snapshotRoutes);
app.use('/api/diff', diffRoutes);

// Health check — used by Railway
app.get('/health', (_, res) => res.json({ ok: true }));

// Global error handler — catches unhandled async errors
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`devsnap backend running on port ${PORT}`);
});