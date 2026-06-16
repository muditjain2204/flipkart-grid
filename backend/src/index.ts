import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './config/logger';
import { errorHandler } from './middleware/error-handler';
import routes from './routes';

const app = express();

// ─── Middleware ───────────────────────────────────────────

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
  });
  next();
});

// ─── Routes ──────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'smartflow-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ─── Server Startup ──────────────────────────────────────

const PORT = env.PORT;

async function start() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    app.listen(PORT, () => {
      logger.info(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   🚦 SmartFlow AI Backend                    ║
  ║                                              ║
  ║   Server:    http://localhost:${PORT}            ║
  ║   API:       http://localhost:${PORT}/api/v1     ║
  ║   Health:    http://localhost:${PORT}/health      ║
  ║   Env:       ${env.NODE_ENV}                       ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

start();

export default app;
