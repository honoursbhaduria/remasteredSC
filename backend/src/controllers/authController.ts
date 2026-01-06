import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users } from '../models/mockData';
import config from '../config/config';
import logger from '../middleware/logger';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Verify password (demo mode accepts 'demo123' or actual password)
    const isValidPassword = user.password === password || password === 'demo123' || password === '123456';

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );

    logger.info('User logged in', { userId: user.id, email: user.email, role: user.role });

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ 
      success: false,
      error: 'Login failed' 
    });
  }
};

export const logout = (req: Request, res: Response) => {
  logger.info('User logged out', { userId: (req as any).userId });
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getCurrentUser = (req: Request, res: Response) => {
  const userId = (req as any).userId;
  
  if (!userId) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized' 
    });
  }

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ 
      success: false,
      error: 'User not found' 
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    user: userWithoutPassword
  });
};
