import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard statistics
router.get('/dashboard', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const today = Math.floor(Date.now() / 1000);
    const startOfDay = today - (today % 86400); // Start of today
    const endOfDay = startOfDay + 86400; // End of today

    // Get today's bookings
    const todayBookings = await prisma.booking.count({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        cancelled: false,
      },
    });

    // Get total active bookings
    const totalActiveBookings = await prisma.booking.count({
      where: {
        cancelled: false,
        date: {
          gte: today,
        },
      },
    });

    // Get total guests
    const totalGuests = await prisma.guest.count();

    // Get total therapists
    const totalTherapists = await prisma.therapist.count();

    // Get total rooms
    const totalRooms = await prisma.room.count({
      where: { deleted: false },
    });

    // Get total services
    const totalServices = await prisma.service.count({
      where: { deleted: false },
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: {
        cancelled: false,
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: {
            name: true,
          },
        },
        room: {
          select: {
            name: true,
          },
        },
        guest: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        therapist: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        todayBookings,
        totalActiveBookings,
        totalGuests,
        totalTherapists,
        totalRooms,
        totalServices,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get system configuration
router.get('/config', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const config = await prisma.configuration.findMany();

    const configObject = config.reduce((acc: Record<string, string>, item: { name: string; value: string }) => {
      acc[item.name] = item.value;
      return acc;
    }, {} as Record<string, string>);

    res.json({
      success: true,
      data: configObject,
    });
  } catch (error) {
    next(error);
  }
});

// Update system configuration
router.put('/config', [
  body('config').isObject().withMessage('Config must be an object'),
], authenticate, authorize('admin'), async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
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

    const { config } = req.body;

    // Update configuration
    for (const [key, value] of Object.entries(config)) {
      await prisma.configuration.upsert({
        where: { name: key },
        update: { value: String(value) },
        create: { name: key, value: String(value) },
      });
    }

    res.json({
      success: true,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    return next(error);
  }
});

// Get users
router.get('/users', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'loginId',
      sortOrder = 'asc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { loginId: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.account.count({ where });

    // Get users
    const users = await prisma.account.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
      select: {
        id: true,
        loginId: true,
        firstName: true,
        lastName: true,
        status: true,
        lastLogin: true,
        lastLoginFrom: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create user
router.post('/users', [
  body('loginId').notEmpty().withMessage('Login ID is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
  body('status').optional().isIn(['ACTIVE', 'LOCKED']).withMessage('Status must be ACTIVE or LOCKED'),
], authenticate, authorize('admin'), async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
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

    const { loginId, password, firstName, lastName, status = 'ACTIVE' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.account.findUnique({
      where: { loginId },
    });

    if (existingUser) {
      throw createError('User with this login ID already exists', 400);
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.account.create({
      data: {
        loginId,
        password: hashedPassword,
        firstName,
        lastName,
        status,
      },
      select: {
        id: true,
        loginId: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
});

// Update user
router.put('/users/:id', [
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
  body('status').optional().isIn(['ACTIVE', 'LOCKED']).withMessage('Status must be ACTIVE or LOCKED'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], authenticate, authorize('admin'), async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
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

    const { id } = req.params;
    const updateData = req.body;

    // Check if user exists
    const existingUser = await prisma.account.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUser) {
      throw createError('User not found', 404);
    }

    // Hash password if provided
    if (updateData.password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    // Update user
    const user = await prisma.account.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        loginId: true,
        firstName: true,
        lastName: true,
        status: true,
        lastLogin: true,
        lastLoginFrom: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete user
router.delete('/users/:id', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.account.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Don't allow deleting the current user
    if (user.id === req.user?.id) {
      throw createError('Cannot delete your own account', 400);
    }

    // Delete user
    await prisma.account.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
