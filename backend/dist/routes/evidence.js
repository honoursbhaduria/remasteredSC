"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const evidenceController_1 = require("../controllers/evidenceController");
const router = express_1.default.Router();
router.get('/raw', evidenceController_1.getRawEvidence);
router.get('/filtered', evidenceController_1.getFilteredArtifacts);
router.patch('/:id/false-positive', evidenceController_1.markAsFalsePositive);
router.patch('/:id/exclude-story', evidenceController_1.excludeFromStory);
exports.default = router;
