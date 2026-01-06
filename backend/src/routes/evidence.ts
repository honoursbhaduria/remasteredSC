import express from 'express';
import { 
  getRawEvidence, 
  getFilteredArtifacts, 
  markAsFalsePositive, 
  excludeFromStory 
} from '../controllers/evidenceController';

const router = express.Router();

router.get('/raw', getRawEvidence);
router.get('/filtered', getFilteredArtifacts);
router.patch('/:id/false-positive', markAsFalsePositive);
router.patch('/:id/exclude-story', excludeFromStory);

export default router;
