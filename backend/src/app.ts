import express from 'express';
import cors from 'cors';
import { errorHandler } from './utils/errorHandler';

// Import Routes
import healthRoutes from './routes/healthRoutes';
import patientRoutes from './routes/patientRoutes';
import gameRoutes from './routes/gameRoutes';
import performanceRoutes from './routes/performanceRoutes';
import reminderRoutes from './routes/reminderRoutes';
import memoryRoutes from './routes/memoryRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import caregiverRoutes from './routes/caregiverRoutes';
import alertRoutes from './routes/alertRoutes';
import voiceRoutes from './routes/voiceRoutes';

const app = express();

// Middlewares
const allowedOrigins = process.env.FRONTEND_URL
  ? [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ]
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root health check endpoint for proxy and monitor probes
app.use('/', healthRoutes);

// Bind Router Prefixes
app.use('/api', healthRoutes);
app.use('/api', patientRoutes);
app.use('/api', gameRoutes);
app.use('/api', performanceRoutes);
app.use('/api', reminderRoutes);
app.use('/api', memoryRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', caregiverRoutes);
app.use('/api', alertRoutes);
app.use('/api', voiceRoutes);

// Log requests
app.use((req, res, next) => {
  console.log(`[Second Brain] ${req.method} ${req.path}`);
  next();
});

// Central Error Handler
app.use(errorHandler);

// Serve static frontend dist in production
import path from 'path';
import fs from 'fs';

// Frontend dist is located at /app/dist.
// Backend runs from /app/backend, so move one directory up.
const distPath = path.resolve(process.cwd(), '..', 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export default app;