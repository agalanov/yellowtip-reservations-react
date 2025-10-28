import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { LoginRequest, LoginResponse } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Login endpoint
router.post('/login', [
  body('loginId').notEmpty().withMessage('Login ID is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const { loginId, password }: LoginRequest = req.body;

    // Find user by login ID
    const user = await prisma.account.findUnique({
      where: { loginId },
      select: {
        id: true,
        loginId: true,
        password: true,
        firstName: true,
        lastName: true,
        status: true,
        lastLogin: true,
        lastLoginFrom: true,
      },
    });

    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      throw createError('Account is locked', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        loginId: user.loginId 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Update last login
    await prisma.account.update({
      where: { id: user.id },
      data: {
        lastLogin: Math.floor(Date.now() / 1000),
        lastLoginFrom: req.ip || 'unknown',
      },
    });

    const response: LoginResponse = {
      token,
      user: {
        id: user.id,
        loginId: user.loginId,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        status: user.status,
      },
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // by removing the token from storage
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Verify token endpoint
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw createError('No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.account.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        loginId: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw createError('Invalid token', 401);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          loginId: user.loginId,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          status: user.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
