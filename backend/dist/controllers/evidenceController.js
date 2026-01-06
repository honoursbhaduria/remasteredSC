"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excludeFromStory = exports.markAsFalsePositive = exports.getFilteredArtifacts = exports.getRawEvidence = void 0;
const mockData_1 = require("../models/mockData");
const getRawEvidence = (req, res) => {
    const { caseId } = req.query;
    if (caseId) {
        const evidence = mockData_1.rawEvidence.filter(e => e.caseId === caseId);
        return res.json(evidence);
    }
    res.json(mockData_1.rawEvidence);
};
exports.getRawEvidence = getRawEvidence;
const getFilteredArtifacts = (req, res) => {
    const { caseId, threshold } = req.query;
    let artifacts = [...mockData_1.filteredArtifacts];
    if (caseId) {
        artifacts = artifacts.filter(a => a.caseId === caseId);
    }
    if (threshold) {
        const thresholdValue = parseFloat(threshold);
        artifacts = artifacts.filter(a => a.confidenceScore >= thresholdValue);
    }
    res.json(artifacts);
};
exports.getFilteredArtifacts = getFilteredArtifacts;
const markAsFalsePositive = (req, res) => {
    const { id } = req.params;
    const artifact = mockData_1.filteredArtifacts.find(a => a.id === id);
    if (!artifact) {
        return res.status(404).json({ error: 'Artifact not found' });
    }
    artifact.isFalsePositive = !artifact.isFalsePositive;
    res.json(artifact);
};
exports.markAsFalsePositive = markAsFalsePositive;
const excludeFromStory = (req, res) => {
    const { id } = req.params;
    const artifact = mockData_1.filteredArtifacts.find(a => a.id === id);
    if (!artifact) {
        return res.status(404).json({ error: 'Artifact not found' });
    }
    artifact.excludedFromStory = !artifact.excludedFromStory;
    res.json(artifact);
};
exports.excludeFromStory = excludeFromStory;
