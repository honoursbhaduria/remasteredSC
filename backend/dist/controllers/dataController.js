"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDecision = exports.getDecisionLog = exports.addNote = exports.getNotes = exports.getSystemStats = exports.getChainOfCustody = exports.getEvidenceFiles = exports.getAttackStory = void 0;
const mockData_1 = require("../models/mockData");
const getAttackStory = (req, res) => {
    const { caseId } = req.params;
    const story = mockData_1.attackStories.find(s => s.caseId === caseId);
    if (!story) {
        return res.status(404).json({ error: 'Story not found for this case' });
    }
    res.json(story);
};
exports.getAttackStory = getAttackStory;
const getEvidenceFiles = (req, res) => {
    const { caseId } = req.query;
    if (caseId) {
        const files = mockData_1.evidenceFiles.filter(f => f.caseId === caseId);
        return res.json(files);
    }
    res.json(mockData_1.evidenceFiles);
};
exports.getEvidenceFiles = getEvidenceFiles;
const getChainOfCustody = (req, res) => {
    const { evidenceId } = req.query;
    if (evidenceId) {
        const entries = mockData_1.chainOfCustody.filter(c => c.evidenceId === evidenceId);
        return res.json(entries);
    }
    res.json(mockData_1.chainOfCustody);
};
exports.getChainOfCustody = getChainOfCustody;
const getSystemStats = (req, res) => {
    res.json(mockData_1.systemStats);
};
exports.getSystemStats = getSystemStats;
const getNotes = (req, res) => {
    const { caseId } = req.query;
    if (caseId) {
        const caseNotes = mockData_1.notes.filter(n => n.caseId === caseId);
        return res.json(caseNotes);
    }
    res.json(mockData_1.notes);
};
exports.getNotes = getNotes;
const addNote = (req, res) => {
    const newNote = {
        id: `NOTE-${mockData_1.notes.length + 1}`,
        ...req.body,
        timestamp: new Date()
    };
    mockData_1.notes.push(newNote);
    res.status(201).json(newNote);
};
exports.addNote = addNote;
const getDecisionLog = (req, res) => {
    const { caseId } = req.query;
    if (caseId) {
        const caseDecisions = mockData_1.decisionLog.filter(d => d.caseId === caseId);
        return res.json(caseDecisions);
    }
    res.json(mockData_1.decisionLog);
};
exports.getDecisionLog = getDecisionLog;
const addDecision = (req, res) => {
    const newDecision = {
        id: `DEC-${mockData_1.decisionLog.length + 1}`,
        ...req.body,
        timestamp: new Date()
    };
    mockData_1.decisionLog.push(newDecision);
    res.status(201).json(newDecision);
};
exports.addDecision = addDecision;
