"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.login = void 0;
const mockData_1 = require("../models/mockData");
const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = mockData_1.users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        success: true,
        user: userWithoutPassword,
        token: `demo-token-${user.id}` // Mock token
    });
};
exports.login = login;
const logout = (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
const getCurrentUser = (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = mockData_1.users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
};
exports.getCurrentUser = getCurrentUser;
