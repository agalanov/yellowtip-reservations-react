import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { RoomRequest, RoomResponse, RoomFilters } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get all rooms with filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('active').optional().isBoolean().withMessage('Active must be a boolean'),
  query('serviceId').optional().isInt().withMessage('Service ID must be an integer'),
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
      active,
      serviceId,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    }: RoomFilters = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {
      deleted: false,
    };

    if (active !== undefined) where.active = active;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // If filtering by service, include only rooms that have this service
    if (serviceId) {
      where.services = {
        some: {
          serviceId: Number(serviceId),
        },
      };
    }

    // Get total count
    const total = await prisma.room.count({ where });

    // Get rooms
    const rooms = await prisma.room.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                duration: true,
                price: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: rooms,
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

// Get room by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: Number(id) },
      include: {
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                duration: true,
                price: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        bookings: {
          where: {
            cancelled: false,
            date: {
              gte: Math.floor(Date.now() / 1000), // Only future bookings
            },
          },
          select: {
            id: true,
            date: true,
            time: true,
            duration: true,
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw createError('Room not found', 404);
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
});

// Create new room
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isInt({ min: 1, max: 10 }).withMessage('Priority must be between 1 and 10'),
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

    const roomData: RoomRequest = req.body;

    // Check if room with same name already exists
    const existingRoom = await prisma.room.findFirst({
      where: {
        name: roomData.name,
        deleted: false,
      },
    });

    if (existingRoom) {
      throw createError('Room with this name already exists', 400);
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        name: roomData.name,
        description: roomData.description,
        priority: roomData.priority || 5,
        active: roomData.active !== undefined ? roomData.active : true,
      },
    });

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
});

// Update room
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isInt({ min: 1, max: 10 }).withMessage('Priority must be between 1 and 10'),
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

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id: Number(id) },
    });

    if (!existingRoom) {
      throw createError('Room not found', 404);
    }

    // Check if room with same name already exists (excluding current room)
    if (updateData.name) {
      const duplicateRoom = await prisma.room.findFirst({
        where: {
          name: updateData.name,
          deleted: false,
          id: { not: Number(id) },
        },
      });

      if (duplicateRoom) {
        throw createError('Room with this name already exists', 400);
      }
    }

    // Update room
    const room = await prisma.room.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
});

// Delete room (soft delete)
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: Number(id) },
    });

    if (!room) {
      throw createError('Room not found', 404);
    }

    // Check if room has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        roomId: Number(id),
        cancelled: false,
        date: {
          gte: Math.floor(Date.now() / 1000),
        },
      },
    });

    if (activeBookings > 0) {
      throw createError('Cannot delete room with active bookings', 400);
    }

    // Soft delete room
    await prisma.room.update({
      where: { id: Number(id) },
      data: { deleted: true },
    });

    res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Add service to room
router.post('/:id/services', [
  body('serviceId').isInt().withMessage('Service ID must be an integer'),
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
    const { serviceId } = req.body;

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: Number(id) },
    });

    if (!room) {
      throw createError('Room not found', 404);
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw createError('Service not found', 404);
    }

    // Add service to room
    await prisma.roomService.create({
      data: {
        roomId: Number(id),
        serviceId: serviceId,
      },
    });

    res.json({
      success: true,
      message: 'Service added to room successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Remove service from room
router.delete('/:id/services/:serviceId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id, serviceId } = req.params;

    // Remove service from room
    await prisma.roomService.delete({
      where: {
        roomId_serviceId: {
          roomId: Number(id),
          serviceId: Number(serviceId),
        },
      },
    });

    res.json({
      success: true,
      message: 'Service removed from room successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
