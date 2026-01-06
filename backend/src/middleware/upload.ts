import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import config from '../config/config';
import { Request } from 'express';

// Ensure upload directory exists
if (!fs.existsSync(config.upload.path)) {
  fs.mkdirSync(config.upload.path, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    cb(null, config.upload.path);
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${sanitizedBasename}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = config.upload.allowedTypes.map(t => `.${t}`);
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${config.upload.allowedTypes.join(', ')}`), false);
  }
};

// Create multer instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxSize,
  },
  fileFilter: fileFilter,
});

// Helper function to calculate file hash
export const calculateFileHash = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(config.encryption.algorithm);
    const stream = fs.createReadStream(filePath);

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

// Helper function to validate file integrity
export const validateFileIntegrity = async (
  filePath: string,
  expectedHash: string
): Promise<boolean> => {
  const actualHash = await calculateFileHash(filePath);
  return actualHash === expectedHash;
};

// Middleware to calculate hash after upload
export const processUpload = async (req: Request, res: any, next: Function) => {
  if (!req.file) {
    return next();
  }

  try {
    const hash = await calculateFileHash(req.file.path);
    (req.file as any).hash = hash;
    next();
  } catch (error) {
    next(error);
  }
};
