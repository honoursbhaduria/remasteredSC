"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config/config"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure log directory exists
if (!fs_1.default.existsSync(config_1.default.logging.filePath)) {
    fs_1.default.mkdirSync(config_1.default.logging.filePath, { recursive: true });
}
// Create Winston logger
const logger = winston_1.default.createLogger({
    level: config_1.default.logging.level,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
    defaultMeta: { service: 'forensics-api' },
    transports: [
        // Write all logs with level 'error' and below to 'error.log'
        new winston_1.default.transports.File({
            filename: path_1.default.join(config_1.default.logging.filePath, 'error.log'),
            level: 'error',
            maxsize: config_1.default.logging.maxSize,
            maxFiles: config_1.default.logging.maxFiles,
        }),
        // Write all logs with level 'info' and below to 'combined.log'
        new winston_1.default.transports.File({
            filename: path_1.default.join(config_1.default.logging.filePath, 'combined.log'),
            maxsize: config_1.default.logging.maxSize,
            maxFiles: config_1.default.logging.maxFiles,
        }),
    ],
});
// If not in production, log to console as well
if (config_1.default.nodeEnv !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        };
        if (res.statusCode >= 400) {
            logger.warn('Request completed with error', logData);
        }
        else if (config_1.default.verboseLogging) {
            logger.info('Request completed', logData);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
exports.default = logger;
