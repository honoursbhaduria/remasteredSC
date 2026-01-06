import express from 'express';
import {
  getAttackStory,
  getEvidenceFiles,
  getChainOfCustody,
  getSystemStats,
  getNotes,
  addNote,
  getDecisionLog,
  addDecision
} from '../controllers/dataController';

const router = express.Router();

router.get('/story/:caseId', getAttackStory);
router.get('/files', getEvidenceFiles);
router.get('/chain-of-custody', getChainOfCustody);
router.get('/system-stats', getSystemStats);
router.get('/notes', getNotes);
router.post('/notes', addNote);
router.get('/decisions', getDecisionLog);
router.post('/decisions', addDecision);

export default router;
