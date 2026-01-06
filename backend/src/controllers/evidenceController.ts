import { Request, Response } from 'express';
import { rawEvidence, filteredArtifacts } from '../models/mockData';

export const getRawEvidence = (req: Request, res: Response) => {
  const { caseId } = req.query;

  if (caseId) {
    const evidence = rawEvidence.filter(e => e.caseId === caseId);
    return res.json(evidence);
  }

  res.json(rawEvidence);
};

export const getFilteredArtifacts = (req: Request, res: Response) => {
  const { caseId, threshold } = req.query;
  let artifacts = [...filteredArtifacts];

  if (caseId) {
    artifacts = artifacts.filter(a => a.caseId === caseId);
  }

  if (threshold) {
    const thresholdValue = parseFloat(threshold as string);
    artifacts = artifacts.filter(a => a.confidenceScore >= thresholdValue);
  }

  res.json(artifacts);
};

export const markAsFalsePositive = (req: Request, res: Response) => {
  const { id } = req.params;
  const artifact = filteredArtifacts.find(a => a.id === id);

  if (!artifact) {
    return res.status(404).json({ error: 'Artifact not found' });
  }

  artifact.isFalsePositive = !artifact.isFalsePositive;
  res.json(artifact);
};

export const excludeFromStory = (req: Request, res: Response) => {
  const { id } = req.params;
  const artifact = filteredArtifacts.find(a => a.id === id);

  if (!artifact) {
    return res.status(404).json({ error: 'Artifact not found' });
  }

  artifact.excludedFromStory = !artifact.excludedFromStory;
  res.json(artifact);
};
