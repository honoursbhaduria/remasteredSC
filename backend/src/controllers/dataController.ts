import { Request, Response } from 'express';
import { attackStories, evidenceFiles, chainOfCustody, systemStats, notes, decisionLog } from '../models/mockData';

export const getAttackStory = (req: Request, res: Response) => {
  const { caseId } = req.params;
  const story = attackStories.find(s => s.caseId === caseId);

  if (!story) {
    return res.status(404).json({ error: 'Story not found for this case' });
  }

  res.json(story);
};

export const getEvidenceFiles = (req: Request, res: Response) => {
  const { caseId } = req.query;

  if (caseId) {
    const files = evidenceFiles.filter(f => f.caseId === caseId);
    return res.json(files);
  }

  res.json(evidenceFiles);
};

export const getChainOfCustody = (req: Request, res: Response) => {
  const { evidenceId } = req.query;

  if (evidenceId) {
    const entries = chainOfCustody.filter(c => c.evidenceId === evidenceId);
    return res.json(entries);
  }

  res.json(chainOfCustody);
};

export const getSystemStats = (req: Request, res: Response) => {
  res.json(systemStats);
};

export const getNotes = (req: Request, res: Response) => {
  const { caseId } = req.query;

  if (caseId) {
    const caseNotes = notes.filter(n => n.caseId === caseId);
    return res.json(caseNotes);
  }

  res.json(notes);
};

export const addNote = (req: Request, res: Response) => {
  const newNote = {
    id: `NOTE-${notes.length + 1}`,
    ...req.body,
    timestamp: new Date()
  };

  notes.push(newNote);
  res.status(201).json(newNote);
};

export const getDecisionLog = (req: Request, res: Response) => {
  const { caseId } = req.query;

  if (caseId) {
    const caseDecisions = decisionLog.filter(d => d.caseId === caseId);
    return res.json(caseDecisions);
  }

  res.json(decisionLog);
};

export const addDecision = (req: Request, res: Response) => {
  const newDecision = {
    id: `DEC-${decisionLog.length + 1}`,
    ...req.body,
    timestamp: new Date()
  };

  decisionLog.push(newDecision);
  res.status(201).json(newDecision);
};
