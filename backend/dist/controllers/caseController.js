"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCase = exports.createCase = exports.getCaseById = exports.getAllCases = void 0;
const mockData_1 = require("../models/mockData");
const getAllCases = (req, res) => {
    res.json(mockData_1.cases);
};
exports.getAllCases = getAllCases;
const getCaseById = (req, res) => {
    const { id } = req.params;
    const caseItem = mockData_1.cases.find(c => c.id === id);
    if (!caseItem) {
        return res.status(404).json({ error: 'Case not found' });
    }
    res.json(caseItem);
};
exports.getCaseById = getCaseById;
const createCase = (req, res) => {
    const newCase = {
        id: `CASE-${String(mockData_1.cases.length + 1).padStart(3, '0')}`,
        ...req.body,
        evidenceCount: 0,
        createdAt: new Date(),
        lastUpdated: new Date()
    };
    mockData_1.cases.push(newCase);
    res.status(201).json(newCase);
};
exports.createCase = createCase;
const updateCase = (req, res) => {
    const { id } = req.params;
    const caseIndex = mockData_1.cases.findIndex(c => c.id === id);
    if (caseIndex === -1) {
        return res.status(404).json({ error: 'Case not found' });
    }
    mockData_1.cases[caseIndex] = {
        ...mockData_1.cases[caseIndex],
        ...req.body,
        lastUpdated: new Date()
    };
    res.json(mockData_1.cases[caseIndex]);
};
exports.updateCase = updateCase;
