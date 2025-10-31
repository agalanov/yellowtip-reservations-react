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

    const configObject = config.reduce((acc: Record<string, string>, item: { name: string; app: string | null; value: string | null }) => {
      acc[item.name] = item.value || '';
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

// ============ Categories Endpoints ============
// Get all categories
router.get('/categories', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const total = await prisma.serviceCategory.count({ where });

    const categories = await prisma.serviceCategory.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        color: {
          select: {
            id: true,
            name: true,
            hexCode: true,
            textColor: true,
          },
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: categories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get category by ID
router.get('/categories/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.serviceCategory.findUnique({
      where: { id: Number(id) },
      include: {
        color: true,
        services: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!category) {
      throw createError('Category not found', 404);
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
});

// Create category
router.post('/categories', [
  body('name').notEmpty().withMessage('Name is required'),
  body('parentId').optional().isInt().withMessage('Parent ID must be an integer'),
  body('status').optional().isBoolean().withMessage('Status must be a boolean'),
  body('colorId').optional().isInt().withMessage('Color ID must be an integer'),
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

    const { name, parentId = 0, status = false, colorId = 1 } = req.body;

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        parentId,
        status,
        colorId,
      },
      include: {
        color: true,
      },
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return next(error);
  }
});

// Update category
router.put('/categories/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('parentId').optional().isInt().withMessage('Parent ID must be an integer'),
  body('status').optional().isBoolean().withMessage('Status must be a boolean'),
  body('colorId').optional().isInt().withMessage('Color ID must be an integer'),
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

    const category = await prisma.serviceCategory.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        color: true,
      },
    });

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete category
router.delete('/categories/:id', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.serviceCategory.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============ Currency Endpoints ============
// Get all currencies
router.get('/currencies', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.currency.count({ where });

    const currencies = await prisma.currency.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: currencies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get currency by ID
router.get('/currencies/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const currency = await prisma.currency.findUnique({
      where: { id: Number(id) },
      include: {
        services: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!currency) {
      throw createError('Currency not found', 404);
    }

    res.json({
      success: true,
      data: currency,
    });
  } catch (error) {
    next(error);
  }
});

// Create currency
router.post('/currencies', [
  body('code').notEmpty().withMessage('Code is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('symbol').notEmpty().withMessage('Symbol is required'),
  body('isBase').optional().isBoolean().withMessage('isBase must be a boolean'),
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

    const { code, name, symbol, isBase = false } = req.body;

    const currency = await prisma.currency.create({
      data: {
        code,
        name,
        symbol,
        isBase,
      },
    });

    res.status(201).json({
      success: true,
      data: currency,
    });
  } catch (error) {
    return next(error);
  }
});

// Update currency
router.put('/currencies/:id', [
  body('code').optional().notEmpty().withMessage('Code cannot be empty'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('symbol').optional().notEmpty().withMessage('Symbol cannot be empty'),
  body('isBase').optional().isBoolean().withMessage('isBase must be a boolean'),
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

    const currency = await prisma.currency.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json({
      success: true,
      data: currency,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete currency
router.delete('/currencies/:id', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.currency.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Currency deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============ Colors Endpoints ============
// Get all colors (for category color selection)
router.get('/colors', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const colors = await prisma.colorTable.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: colors,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
