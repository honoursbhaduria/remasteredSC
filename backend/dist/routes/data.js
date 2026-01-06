"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dataController_1 = require("../controllers/dataController");
const router = express_1.default.Router();
router.get('/story/:caseId', dataController_1.getAttackStory);
router.get('/files', dataController_1.getEvidenceFiles);
router.get('/chain-of-custody', dataController_1.getChainOfCustody);
router.get('/system-stats', dataController_1.getSystemStats);
router.get('/notes', dataController_1.getNotes);
router.post('/notes', dataController_1.addNote);
router.get('/decisions', dataController_1.getDecisionLog);
router.post('/decisions', dataController_1.addDecision);
exports.default = router;
