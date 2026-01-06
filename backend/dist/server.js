"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = __importDefault(require("./config/config"));
const logger_1 = __importStar(require("./middleware/logger"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const cases_1 = __importDefault(require("./routes/cases"));
const evidence_1 = __importDefault(require("./routes/evidence"));
const data_1 = __importDefault(require("./routes/data"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: config_1.default.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Compression middleware
app.use((0, compression_1.default)());
// HTTP request logging
if (config_1.default.nodeEnv !== 'test') {
    app.use((0, morgan_1.default)('combined', {
        stream: {
            write: (message) => logger_1.default.info(message.trim())
        }
    }));
}
// Custom request logger
app.use(logger_1.requestLogger);
// Rate limiting (if enabled)
if (config_1.default.rateLimit.enabled) {
    app.use('/api/', rateLimiter_1.apiLimiter);
    logger_1.default.info('Rate limiting enabled');
}
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config_1.default.nodeEnv,
        version: config_1.default.apiVersion,
        uptime: process.uptime(),
    });
});
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'AI-Assisted Log Investigation Framework API',
        version: config_1.default.apiVersion,
        environment: config_1.default.nodeEnv,
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
app.use('/api/auth', auth_1.default);
app.use('/api/cases', cases_1.default);
app.use('/api/evidence', evidence_1.default);
app.use('/api/data', data_1.default);
// 404 handler
app.use(errorHandler_1.notFound);
// Global error handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
const server = app.listen(config_1.default.port, config_1.default.host, () => {
    logger_1.default.info('╔════════════════════════════════════════════════════════════════╗');
    logger_1.default.info('║  AI-Assisted Log Investigation Framework - Backend API        ║');
    logger_1.default.info('╚════════════════════════════════════════════════════════════════╝');
    logger_1.default.info(`🚀 Server started in ${config_1.default.nodeEnv} mode`);
    logger_1.default.info(`📡 Listening on http://${config_1.default.host}:${config_1.default.port}`);
    logger_1.default.info(`🔒 CORS enabled for: ${config_1.default.corsOrigin}`);
    logger_1.default.info(`📊 API Version: ${config_1.default.apiVersion}`);
    // Log feature flags
    logger_1.default.info('✨ Feature Flags:', {
        aiAnalysis: config_1.default.featureFlags.aiAnalysis,
        autoClassification: config_1.default.featureFlags.autoClassification,
        notifications: config_1.default.featureFlags.notifications,
        cloudStorage: config_1.default.featureFlags.cloudStorage,
        threatIntelligence: config_1.default.featureFlags.threatIntelligence,
    });
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
});
exports.default = app;
