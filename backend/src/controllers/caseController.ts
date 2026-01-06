import { Request, Response } from 'express';
import { cases } from '../models/mockData';

export const getAllCases = (req: Request, res: Response) => {
  res.json(cases);
};

export const getCaseById = (req: Request, res: Response) => {
  const { id } = req.params;
  const caseItem = cases.find(c => c.id === id);

  if (!caseItem) {
    return res.status(404).json({ error: 'Case not found' });
  }

  res.json(caseItem);
};

export const createCase = (req: Request, res: Response) => {
  const newCase = {
    id: `CASE-${String(cases.length + 1).padStart(3, '0')}`,
    ...req.body,
    evidenceCount: 0,
    createdAt: new Date(),
    lastUpdated: new Date()
  };

  cases.push(newCase);
  res.status(201).json(newCase);
};

export const updateCase = (req: Request, res: Response) => {
  const { id } = req.params;
  const caseIndex = cases.findIndex(c => c.id === id);

  if (caseIndex === -1) {
    return res.status(404).json({ error: 'Case not found' });
  }

  cases[caseIndex] = {
    ...cases[caseIndex],
    ...req.body,
    lastUpdated: new Date()
  };

  res.json(cases[caseIndex]);
};
