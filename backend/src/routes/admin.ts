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
    const { grouped } = req.query;
    const config = await prisma.configuration.findMany({
      orderBy: [
        { app: 'asc' },
        { name: 'asc' },
      ],
    });

    if (grouped === 'true') {
      // Group by app
      const groupedConfig: Record<string, Array<{ name: string; value: string | null; app: string | null }>> = {};
      
      config.forEach((item) => {
        const appKey = item.app || 'general';
        if (!groupedConfig[appKey]) {
          groupedConfig[appKey] = [];
        }
        groupedConfig[appKey].push({
          name: item.name,
          value: item.value,
          app: item.app,
        });
      });

      res.json({
        success: true,
        data: groupedConfig,
      });
    } else {
      // Return flat object (for backward compatibility)
      const configObject = config.reduce((acc: Record<string, string>, item: { name: string; app: string | null; value: string | null }) => {
        acc[item.name] = item.value || '';
        return acc;
      }, {} as Record<string, string>);

      res.json({
        success: true,
        data: configObject,
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get single configuration item
router.get('/config/:name', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name } = req.params;
    const config = await prisma.configuration.findUnique({
      where: { name },
    });

    if (!config) {
      throw createError('Configuration not found', 404);
    }

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
});

// Update system configuration (bulk)
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

// Create configuration item
router.post('/config', [
  body('name').notEmpty().withMessage('Name is required'),
  body('value').optional().isString().withMessage('Value must be a string'),
  body('app').optional().isString().withMessage('App must be a string'),
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

    const { name, value = '', app = null } = req.body;

    // Check if config already exists
    const existing = await prisma.configuration.findUnique({
      where: { name },
    });

    if (existing) {
      throw createError('Configuration with this name already exists', 400);
    }

    const config = await prisma.configuration.create({
      data: {
        name,
        value,
        app,
      },
    });

    res.status(201).json({
      success: true,
      data: config,
    });
  } catch (error) {
    return next(error);
  }
});

// Update single configuration item
router.put('/config/:name', [
  body('value').optional().isString().withMessage('Value must be a string'),
  body('app').optional().isString().withMessage('App must be a string'),
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

    const { name } = req.params;
    const { value, app } = req.body;

    const updateData: any = {};
    if (value !== undefined) updateData.value = String(value);
    if (app !== undefined) updateData.app = app || null;

    const config = await prisma.configuration.update({
      where: { name },
      data: updateData,
    });

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete configuration item
router.delete('/config/:name', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { name } = req.params;

    await prisma.configuration.delete({
      where: { name },
    });

    res.json({
      success: true,
      message: 'Configuration deleted successfully',
    });
  } catch (error) {
    next(error);
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
  body('roleIds').optional().isArray().withMessage('Role IDs must be an array'),
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

    const { loginId, password, firstName, lastName, status = 'ACTIVE', roleIds = [] } = req.body;

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

    // Create user with roles
    const user = await prisma.account.create({
      data: {
        loginId,
        password: hashedPassword,
        firstName,
        lastName,
        status,
        roles: {
          create: roleIds.map((roleId: number) => ({
            roleId,
          })),
        },
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
  body('roleIds').optional().isArray().withMessage('Role IDs must be an array'),
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
    const { roleIds, ...updateData } = req.body;

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

    // Update roles if provided
    if (Array.isArray(roleIds)) {
      // Delete existing roles
      await prisma.accountRole.deleteMany({
        where: { accountId: Number(id) },
      });

      // Create new roles
      if (roleIds.length > 0) {
        await prisma.accountRole.createMany({
          data: roleIds.map((roleId: number) => ({
            accountId: Number(id),
            roleId,
          })),
        });
      }
    }

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

// ============ Roles Endpoints ============
// Get all roles
router.get('/roles', authenticate, async (req: AuthRequest, res, next) => {
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

    const total = await prisma.role.count({ where });

    const roles = await prisma.role.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        _count: {
          select: {
            accounts: true,
            rights: true,
          },
        },
        rights: {
          include: {
            right: {
              select: {
                id: true,
                name: true,
                appName: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: roles,
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

// Get role by ID
router.get('/roles/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: {
        accounts: {
          include: {
            account: {
              select: {
                id: true,
                loginId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        rights: {
          include: {
            right: true,
          },
        },
      },
    });

    if (!role) {
      throw createError('Role not found', 404);
    }

    res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
});

// Create role
router.post('/roles', [
  body('name').notEmpty().withMessage('Name is required'),
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

    const { name, rightIds = [] } = req.body;

    // Check if role already exists
    const existingRole = await prisma.role.findFirst({
      where: { name },
    });

    if (existingRole) {
      throw createError('Role with this name already exists', 400);
    }

    // Create role with rights
    const role = await prisma.role.create({
      data: {
        name,
        rights: {
          create: rightIds.map((rightId: number) => ({
            rightId,
          })),
        },
      },
      include: {
        rights: {
          include: {
            right: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    return next(error);
  }
});

// Update role
router.put('/roles/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
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
    const { name, rightIds } = req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: Number(id) },
    });

    if (!existingRole) {
      throw createError('Role not found', 404);
    }

    // Update role
    const updateData: any = {};
    if (name) {
      updateData.name = name;
    }

    const role = await prisma.role.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        rights: {
          include: {
            right: true,
          },
        },
      },
    });

    // Update rights if provided
    if (Array.isArray(rightIds)) {
      // Delete existing rights
      await prisma.roleRight.deleteMany({
        where: { roleId: Number(id) },
      });

      // Create new rights
      if (rightIds.length > 0) {
        await prisma.roleRight.createMany({
          data: rightIds.map((rightId: number) => ({
            roleId: Number(id),
            rightId,
          })),
        });
      }

      // Fetch updated role with rights
      const updatedRole = await prisma.role.findUnique({
        where: { id: Number(id) },
        include: {
          rights: {
            include: {
              right: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        data: updatedRole,
      });
    }

    res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete role
router.delete('/roles/:id', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            accounts: true,
          },
        },
      },
    });

    if (!role) {
      throw createError('Role not found', 404);
    }

    // Check if role is assigned to any account
    if (role._count.accounts > 0) {
      throw createError('Cannot delete role that is assigned to accounts', 400);
    }

    await prisma.role.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============ Access Rights Endpoints ============
// Get all access rights
router.get('/rights', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      appName,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { appName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (appName) {
      where.appName = appName;
    }

    const total = await prisma.accessRight.count({ where });

    const rights = await prisma.accessRight.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: rights,
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

// Get access right by ID
router.get('/rights/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const right = await prisma.accessRight.findUnique({
      where: { id: Number(id) },
      include: {
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

    if (!right) {
      throw createError('Access right not found', 404);
    }

    res.json({
      success: true,
      data: right,
    });
  } catch (error) {
    next(error);
  }
});

// Create access right
router.post('/rights', [
  body('name').notEmpty().withMessage('Name is required'),
  body('appName').notEmpty().withMessage('App name is required'),
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

    const { name, appName } = req.body;

    // Check if right already exists
    const existingRight = await prisma.accessRight.findFirst({
      where: { name, appName },
    });

    if (existingRight) {
      throw createError('Access right with this name and app already exists', 400);
    }

    const right = await prisma.accessRight.create({
      data: {
        name,
        appName,
      },
    });

    res.status(201).json({
      success: true,
      data: right,
    });
  } catch (error) {
    return next(error);
  }
});

// Update access right
router.put('/rights/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('appName').optional().notEmpty().withMessage('App name cannot be empty'),
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

    const right = await prisma.accessRight.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json({
      success: true,
      data: right,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete access right
router.delete('/rights/:id', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.accessRight.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Access right deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============ Countries Endpoints ============
// Get all countries
router.get('/countries', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
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
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.country.count({ where });

    const countries = await prisma.country.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        _count: {
          select: {
            cities: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: countries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Get country by ID
router.get('/countries/:id', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const country = await prisma.country.findUnique({
      where: { id: Number(id) },
      include: {
        cities: true,
      },
    });

    if (!country) {
      throw createError('Country not found', 404);
    }

    res.json({
      success: true,
      data: country,
    });
  } catch (error) {
    return next(error);
  }
});

// Create country
router.post('/countries', [
  body('name').notEmpty().withMessage('Name is required'),
  body('code').notEmpty().withMessage('Code is required'),
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

    const { name, code, topPulldown = 'N', isDefault = 'N' } = req.body;

    // If setting as default, unset others
    if (isDefault === 'Y') {
      await prisma.country.updateMany({
        where: { isDefault: 'Y' },
        data: { isDefault: 'N' },
      });
    }

    const country = await prisma.country.create({
      data: {
        name,
        code,
        topPulldown: topPulldown || 'N',
        isDefault: isDefault || 'N',
      },
    });

    res.status(201).json({
      success: true,
      data: country,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: { message: 'Country with this code already exists' },
      });
    }
    return next(error);
  }
});

// Update country
router.put('/countries/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('code').optional().notEmpty().withMessage('Code cannot be empty'),
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
    const { isDefault, ...updateData } = req.body;

    // If setting as default, unset others
    if (isDefault === 'Y') {
      await prisma.country.updateMany({
        where: { isDefault: 'Y' },
        data: { isDefault: 'N' },
      });
      updateData.isDefault = 'Y';
    }

    const country = await prisma.country.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json({
      success: true,
      data: country,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Country not found' },
      });
    }
    return next(error);
  }
});

// Delete country
router.delete('/countries/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;

    // Check if country has cities
    const cityCount = await prisma.city.count({
      where: { country: Number(id) },
    });

    if (cityCount > 0) {
      throw createError('Cannot delete country with cities', 400);
    }

    await prisma.country.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Country deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
});

// ============ Cities Endpoints ============
// Get all cities
router.get('/cities', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      country,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (country) {
      where.country = Number(country);
    }

    const total = await prisma.city.count({ where });

    const cities = await prisma.city.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        countryRef: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: cities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Get city by ID
router.get('/cities/:id', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const city = await prisma.city.findUnique({
      where: { id: Number(id) },
      include: {
        countryRef: true,
      },
    });

    if (!city) {
      throw createError('City not found', 404);
    }

    res.json({
      success: true,
      data: city,
    });
  } catch (error) {
    return next(error);
  }
});

// Create city
router.post('/cities', [
  body('name').notEmpty().withMessage('Name is required'),
  body('country').isInt().withMessage('Country ID is required'),
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

    const { name, country, isDefault = 'N' } = req.body;

    // If setting as default, unset others
    if (isDefault === 'Y') {
      await prisma.city.updateMany({
        where: { country: Number(country), isDefault: 'Y' },
        data: { isDefault: 'N' },
      });
    }

    const city = await prisma.city.create({
      data: {
        name,
        country: Number(country),
        isDefault: isDefault || 'N',
      },
      include: {
        countryRef: true,
      },
    });

    res.status(201).json({
      success: true,
      data: city,
    });
  } catch (error) {
    return next(error);
  }
});

// Update city
router.put('/cities/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('country').optional().isInt().withMessage('Country ID must be an integer'),
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
    const { isDefault, country, ...updateData } = req.body;

    const updatePayload: any = { ...updateData };
    if (country !== undefined) {
      updatePayload.country = Number(country);
    }

    // If setting as default, unset others for the same country
    if (isDefault === 'Y') {
      const city = await prisma.city.findUnique({ where: { id: Number(id) } });
      const countryId = country !== undefined ? Number(country) : city?.country;
      if (countryId) {
        await prisma.city.updateMany({
          where: { country: countryId, isDefault: 'Y' },
          data: { isDefault: 'N' },
        });
        updatePayload.isDefault = 'Y';
      }
    }

    const updatedCity = await prisma.city.update({
      where: { id: Number(id) },
      data: updatePayload,
      include: {
        countryRef: true,
      },
    });

    res.json({
      success: true,
      data: updatedCity,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'City not found' },
      });
    }
    return next(error);
  }
});

// Delete city
router.delete('/cities/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.city.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'City deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'City not found' },
      });
    }
    return next(error);
  }
});

// ============ Languages Endpoints ============
// Get all languages
router.get('/languages', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      available,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (available !== undefined) {
      where.available = available === 'true';
    }

    const total = await prisma.language.count({ where });

    const languages = await prisma.language.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
    });

    res.json({
      success: true,
      data: languages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Get language by ID
router.get('/languages/:id', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const language = await prisma.language.findUnique({
      where: { id },
    });

    if (!language) {
      throw createError('Language not found', 404);
    }

    res.json({
      success: true,
      data: language,
    });
  } catch (error) {
    return next(error);
  }
});

// Create language
router.post('/languages', [
  body('id').notEmpty().withMessage('Language ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
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

    const { id, name, available = false, availableGuests = false, availableReservations = false, isDefault = false } = req.body;

    // If setting as default, unset others
    if (isDefault) {
      await prisma.language.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const language = await prisma.language.create({
      data: {
        id,
        name,
        available: available || false,
        availableGuests: availableGuests || false,
        availableReservations: availableReservations || false,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({
      success: true,
      data: language,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: { message: 'Language with this ID already exists' },
      });
    }
    return next(error);
  }
});

// Update language
router.put('/languages/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
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
    const { isDefault, ...updateData } = req.body;

    // If setting as default, unset others
    if (isDefault === true) {
      await prisma.language.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
      updateData.isDefault = true;
    }

    const language = await prisma.language.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: language,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Language not found' },
      });
    }
    return next(error);
  }
});

// Delete language
router.delete('/languages/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.language.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Language deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Language not found' },
      });
    }
    return next(error);
  }
});

// ============ Taxes Endpoints ============
// Get all taxes
router.get('/taxes', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      sortBy = 'code',
      sortOrder = 'asc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.tax.count({ where });

    const taxes = await prisma.tax.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder },
    });

    res.json({
      success: true,
      data: taxes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Get tax by ID
router.get('/taxes/:id', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const tax = await prisma.tax.findUnique({
      where: { id: Number(id) },
    });

    if (!tax) {
      throw createError('Tax not found', 404);
    }

    res.json({
      success: true,
      data: tax,
    });
  } catch (error) {
    return next(error);
  }
});

// Create tax
router.post('/taxes', [
  body('code').notEmpty().withMessage('Code is required'),
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

    const { code, description, tax1, tax1Text, tax2, tax2Text, tax2On1 = false, real = false } = req.body;

    const tax = await prisma.tax.create({
      data: {
        code,
        description: description || null,
        tax1: tax1 ? Number(tax1) : null,
        tax1Text: tax1Text || null,
        tax2: tax2 ? Number(tax2) : null,
        tax2Text: tax2Text || null,
        tax2On1: tax2On1 || false,
        real: real || false,
      },
    });

    res.status(201).json({
      success: true,
      data: tax,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: { message: 'Tax with this code already exists' },
      });
    }
    return next(error);
  }
});

// Update tax
router.put('/taxes/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    if (req.body.code !== undefined) updateData.code = req.body.code;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.tax1 !== undefined) updateData.tax1 = req.body.tax1 ? Number(req.body.tax1) : null;
    if (req.body.tax1Text !== undefined) updateData.tax1Text = req.body.tax1Text || null;
    if (req.body.tax2 !== undefined) updateData.tax2 = req.body.tax2 ? Number(req.body.tax2) : null;
    if (req.body.tax2Text !== undefined) updateData.tax2Text = req.body.tax2Text || null;
    if (req.body.tax2On1 !== undefined) updateData.tax2On1 = req.body.tax2On1;
    if (req.body.real !== undefined) updateData.real = req.body.real;

    const tax = await prisma.tax.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json({
      success: true,
      data: tax,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Tax not found' },
      });
    }
    return next(error);
  }
});

// Delete tax
router.delete('/taxes/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.tax.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Tax deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Tax not found' },
      });
    }
    return next(error);
  }
});

// ============ Opening Hours Endpoints ============
// Get opening hours (week days)
router.get('/opening-hours', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const days = await prisma.workTimeDay.findMany({
      orderBy: { weekday: 'asc' },
    });

    // Fill missing days with defaults
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = days.find((d: any) => d.weekday === i);
      return day || {
        weekday: i,
        startTime: 28800, // 8:00 AM
        endTime: 64800, // 6:00 PM
      };
    });

    res.json({
      success: true,
      data: weekDays,
    });
  } catch (error) {
    return next(error);
  }
});

// Update opening hours (week days)
router.put('/opening-hours', [
  body('days').isArray().withMessage('Days must be an array'),
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

    const { days } = req.body;

    // Delete all existing days
    await prisma.workTimeDay.deleteMany({});

    // Create new days
    const enabledDays = days.filter((d: any) => d.enabled);
    if (enabledDays.length > 0) {
      await prisma.workTimeDay.createMany({
        data: enabledDays.map((d: any) => ({
          weekday: Number(d.weekday),
          startTime: Number(d.startTime),
          endTime: Number(d.endTime),
        })),
      });
    }

    const updatedDays = await prisma.workTimeDay.findMany({
      orderBy: { weekday: 'asc' },
    });

    res.json({
      success: true,
      data: updatedDays,
      message: 'Opening hours updated successfully',
    });
  } catch (error) {
    return next(error);
  }
});

// Get specific date opening hours
router.get('/opening-hours/dates', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.workDate = {
        gte: Number(startDate),
        lte: Number(endDate),
      };
    }

    const dates = await prisma.workTimeDate.findMany({
      where,
      orderBy: { workDate: 'asc' },
    });

    res.json({
      success: true,
      data: dates,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
