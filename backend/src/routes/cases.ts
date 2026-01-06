import express from 'express';
import { getAllCases, getCaseById, createCase, updateCase } from '../controllers/caseController';

const router = express.Router();

router.get('/', getAllCases);
router.get('/:id', getCaseById);
router.post('/', createCase);
router.put('/:id', updateCase);

export default router;
