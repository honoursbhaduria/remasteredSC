import express from 'express';
import {
  analyzeEvent,
  classifyEvent,
  generateStory,
  checkIPReputation,
  checkFileHash,
  checkDomain,
  batchAnalyzeEvents,
  getMLHealth,
} from '../controllers/mlController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All ML routes require authentication
router.use(authenticate);

// Event analysis
router.post('/analyze', analyzeEvent);
router.post('/classify', classifyEvent);
router.post('/batch-analyze', batchAnalyzeEvents);

// Story generation
router.post('/generate-story', generateStory);

// Threat intelligence
router.get('/threat-intel/ip/:ip', checkIPReputation);
router.get('/threat-intel/hash/:hash', checkFileHash);
router.get('/threat-intel/domain/:domain', checkDomain);

// Health check
router.get('/health', getMLHealth);

export default router;
