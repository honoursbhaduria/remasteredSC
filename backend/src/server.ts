import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './config/config';
import logger, { requestLogger } from './middleware/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import caseRoutes from './routes/cases';
import evidenceRoutes from './routes/evidence';
import dataRoutes from './routes/data';
import mlRoutes from './routes/ml';

const app: Application = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-user-id'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// HTTP request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
}

// Custom request logger
app.use(requestLogger);

// Rate limiting (if enabled)
if (config.rateLimit.enabled) {
  app.use('/api/', apiLimiter);
  logger.info('Rate limiting enabled');
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: config.apiVersion,
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'AI-Assisted Log Investigation Framework API',
    version: config.apiVersion,
    environment: config.nodeEnv,
    endpoints: {
      auth: '/api/auth',
      cases: '/api/cases',
      evidence: '/api/evidence',
      data: '/api/data',
      health: '/health',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/ml', mlRoutes);

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(config.port, config.host, () => {
  logger.info('╔════════════════════════════════════════════════════════════════╗');
  logger.info('║  AI-Assisted Log Investigation Framework - Backend API        ║');
  logger.info('╚════════════════════════════════════════════════════════════════╝');
  logger.info(`🚀 Server started in ${config.nodeEnv} mode`);
  logger.info(`📡 Listening on http://${config.host}:${config.port}`);
  logger.info(`🔒 CORS enabled for: ${config.corsOrigin}`);
  logger.info(`📊 API Version: ${config.apiVersion}`);
  
  // Log feature flags
  logger.info('✨ Feature Flags:', {
    aiAnalysis: config.featureFlags.aiAnalysis,
    autoClassification: config.featureFlags.autoClassification,
    notifications: config.featureFlags.notifications,
    cloudStorage: config.featureFlags.cloudStorage,
    threatIntelligence: config.featureFlags.threatIntelligence,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
