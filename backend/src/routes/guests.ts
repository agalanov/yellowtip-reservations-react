import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { GuestRequest, GuestResponse, GuestFilters } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get all guests with filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
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
      search,
      sortBy = 'lastName',
      sortOrder = 'asc',
    }: GuestFilters = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.guest.count({ where });

    // Get guests
    const guests = await prisma.guest.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        attributes: {
          include: {
            attribute: {
              select: {
                id: true,
                name: true,
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
      data: guests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Get guest by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const guest = await prisma.guest.findUnique({
      where: { id: Number(id) },
      include: {
        attributes: {
          include: {
            attribute: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        bookings: {
          where: {
            cancelled: false,
          },
          select: {
            id: true,
            date: true,
            time: true,
            service: {
              select: {
                id: true,
                name: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
              },
            },
            therapist: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!guest) {
      throw createError('Guest not found', 404);
    }

    res.json({
      success: true,
      data: guest,
    });
  } catch (error) {
    return next(error);
  }
});

// Create new guest
router.post('/', [
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
  body('attributes').optional().isArray().withMessage('Attributes must be an array'),
], authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
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

    const guestData: GuestRequest = req.body;

    // Create guest
    const guest = await prisma.guest.create({
      data: {
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        firstLetter: guestData.lastName?.charAt(0).toUpperCase() || guestData.firstName?.charAt(0).toUpperCase(),
      },
    });

    // Add attributes if provided
    if (guestData.attributes && guestData.attributes.length > 0) {
      await prisma.guestAttribute.createMany({
        data: guestData.attributes.map(attr => ({
          guestId: guest.id,
          attributeId: attr.attributeId,
          value: attr.value,
        })),
      });
    }

    // Fetch guest with attributes
    const guestWithAttributes = await prisma.guest.findUnique({
      where: { id: guest.id },
      include: {
        attributes: {
          include: {
            attribute: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: guestWithAttributes,
    });
  } catch (error) {
    return next(error);
  }
});

// Update guest
router.put('/:id', [
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
  body('attributes').optional().isArray().withMessage('Attributes must be an array'),
], authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
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

    // Check if guest exists
    const existingGuest = await prisma.guest.findUnique({
      where: { id: Number(id) },
    });

    if (!existingGuest) {
      throw createError('Guest not found', 404);
    }

    // Update guest
    const guest = await prisma.guest.update({
      where: { id: Number(id) },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        firstLetter: updateData.lastName?.charAt(0).toUpperCase() || updateData.firstName?.charAt(0).toUpperCase(),
      },
    });

    // Update attributes if provided
    if (updateData.attributes) {
      // Delete existing attributes
      await prisma.guestAttribute.deleteMany({
        where: { guestId: Number(id) },
      });

      // Add new attributes
      if (updateData.attributes.length > 0) {
        await prisma.guestAttribute.createMany({
          data: updateData.attributes.map((attr: any) => ({
            guestId: Number(id),
            attributeId: attr.attributeId,
            value: attr.value,
          })),
        });
      }
    }

    // Fetch guest with attributes
    const guestWithAttributes = await prisma.guest.findUnique({
      where: { id: Number(id) },
      include: {
        attributes: {
          include: {
            attribute: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: guestWithAttributes,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete guest
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if guest exists
    const guest = await prisma.guest.findUnique({
      where: { id: Number(id) },
    });

    if (!guest) {
      throw createError('Guest not found', 404);
    }

    // Check if guest has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        guestId: Number(id),
        cancelled: false,
        date: {
          gte: Math.floor(Date.now() / 1000),
        },
      },
    });

    if (activeBookings > 0) {
      throw createError('Cannot delete guest with active bookings', 400);
    }

    // Delete guest and related data
    await prisma.guest.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Guest deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
