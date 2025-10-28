import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { ServiceRequest, ServiceResponse, ServiceFilters } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get all services with filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
  query('active').optional().isBoolean().withMessage('Active must be a boolean'),
], authenticate, async (req: AuthRequest, res, next) => {
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

    const {
      page = 1,
      limit = 20,
      categoryId,
      active,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    }: ServiceFilters = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {
      deleted: false,
    };

    if (categoryId) where.categoryId = Number(categoryId);
    if (active !== undefined) where.active = active;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.service.count({ where });

    // Get services
    const services = await prisma.service.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        currency: {
          select: {
            id: true,
            code: true,
            symbol: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: services,
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

// Get service by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id: Number(id) },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        currency: {
          select: {
            id: true,
            code: true,
            symbol: true,
          },
        },
        rooms: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      throw createError('Service not found', 404);
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
});

// Create new service
router.post('/', [
  body('categoryId').isInt().withMessage('Category ID must be an integer'),
  body('currencyId').isInt().withMessage('Currency ID must be an integer'),
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('price').optional().isFloat().withMessage('Price must be a number'),
  body('duration').optional().isInt().withMessage('Duration must be an integer'),
], authenticate, async (req: AuthRequest, res, next) => {
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

    const serviceData: ServiceRequest = req.body;

    // Check if category exists
    const category = await prisma.serviceCategory.findUnique({
      where: { id: serviceData.categoryId },
    });

    if (!category) {
      throw createError('Category not found', 400);
    }

    // Check if currency exists
    const currency = await prisma.currency.findUnique({
      where: { id: serviceData.currencyId },
    });

    if (!currency) {
      throw createError('Currency not found', 400);
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        categoryId: serviceData.categoryId,
        currencyId: serviceData.currencyId,
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        duration: serviceData.duration,
        preDuration: serviceData.preDuration || 0,
        postDuration: serviceData.postDuration || 0,
        space: serviceData.space || 1,
        therapistType: serviceData.therapistType || '1',
        active: serviceData.active !== undefined ? serviceData.active : true,
        roomType: serviceData.roomType || '1',
        variableTime: serviceData.variableTime || false,
        variablePrice: serviceData.variablePrice || false,
        minimalTime: serviceData.minimalTime || 5,
        maximalTime: serviceData.maximalTime || 0,
        timeUnit: serviceData.timeUnit || 5,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        currency: {
          select: {
            id: true,
            code: true,
            symbol: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
});

// Update service
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('price').optional().isFloat().withMessage('Price must be a number'),
  body('duration').optional().isInt().withMessage('Duration must be an integer'),
  body('active').optional().isBoolean().withMessage('Active must be a boolean'),
], authenticate, async (req: AuthRequest, res, next) => {
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

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: Number(id) },
    });

    if (!existingService) {
      throw createError('Service not found', 404);
    }

    // Update service
    const service = await prisma.service.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        currency: {
          select: {
            id: true,
            code: true,
            symbol: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
});

// Delete service (soft delete)
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: Number(id) },
    });

    if (!service) {
      throw createError('Service not found', 404);
    }

    // Check if service has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        serviceId: Number(id),
        cancelled: false,
        date: {
          gte: Math.floor(Date.now() / 1000),
        },
      },
    });

    if (activeBookings > 0) {
      throw createError('Cannot delete service with active bookings', 400);
    }

    // Soft delete service
    await prisma.service.update({
      where: { id: Number(id) },
      data: { deleted: true },
    });

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
