"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUpload = exports.validateFileIntegrity = exports.calculateFileHash = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config/config"));
// Ensure upload directory exists
if (!fs_1.default.existsSync(config_1.default.upload.path)) {
    fs_1.default.mkdirSync(config_1.default.upload.path, { recursive: true });
}
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config_1.default.upload.path);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${crypto_1.default.randomBytes(6).toString('hex')}`;
        const ext = path_1.default.extname(file.originalname);
        const basename = path_1.default.basename(file.originalname, ext);
        const sanitizedBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
        cb(null, `${sanitizedBasename}-${uniqueSuffix}${ext}`);
    },
});
// File filter
const fileFilter = (req, file, cb) => {
    // Check file extension
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const allowedExts = config_1.default.upload.allowedTypes.map(t => `.${t}`);
    if (allowedExts.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type not allowed. Allowed types: ${config_1.default.upload.allowedTypes.join(', ')}`), false);
    }
};
// Create multer instance
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: config_1.default.upload.maxSize,
    },
    fileFilter: fileFilter,
});
// Helper function to calculate file hash
const calculateFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto_1.default.createHash(config_1.default.encryption.algorithm);
        const stream = fs_1.default.createReadStream(filePath);
        stream.on('data', (data) => {
            hash.update(data);
        });
        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
};
exports.calculateFileHash = calculateFileHash;
// Helper function to validate file integrity
const validateFileIntegrity = async (filePath, expectedHash) => {
    const actualHash = await (0, exports.calculateFileHash)(filePath);
    return actualHash === expectedHash;
};
exports.validateFileIntegrity = validateFileIntegrity;
// Middleware to calculate hash after upload
const processUpload = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    try {
        const hash = await (0, exports.calculateFileHash)(req.file.path);
        req.file.hash = hash;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.processUpload = processUpload;
