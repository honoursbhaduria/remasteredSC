"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-auth-token'];
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
exports.authorize = authorize;
