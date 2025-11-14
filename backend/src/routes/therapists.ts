import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { TherapistRequest, TherapistResponse, TherapistFilters } from '../types';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Get all therapists with filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('serviceId').optional().isInt().withMessage('Service ID must be an integer'),
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
      serviceId,
      search,
      sortBy = 'lastName',
      sortOrder = 'asc',
    }: TherapistFilters = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // If filtering by service, include only therapists that provide this service
    if (serviceId) {
      where.services = {
        some: {
          serviceId: Number(serviceId),
        },
      };
    }

    // Get total count
    const total = await prisma.therapist.count({ where });

    // Get therapists
    const therapists = await prisma.therapist.findMany({
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
        services: {
          include: {
            service: {
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
      data: therapists,
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

// Get therapist by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const therapist = await prisma.therapist.findUnique({
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
        bookings: {
          where: {
            cancelled: false,
            date: {
              gte: Math.floor(Date.now() / 1000),
            },
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
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!therapist) {
      throw createError('Therapist not found', 404);
    }

    res.json({
      success: true,
      data: therapist,
    });
  } catch (error) {
    return next(error);
  }
});

// Create new therapist
router.post('/', [
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
  body('priority').optional().isInt({ min: 1, max: 10 }).withMessage('Priority must be between 1 and 10'),
  body('attributes').optional().isArray().withMessage('Attributes must be an array'),
  body('services').optional().isArray().withMessage('Services must be an array'),
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

    const therapistData: TherapistRequest = req.body;

    // Create therapist
    const therapist = await prisma.therapist.create({
      data: {
        firstName: therapistData.firstName,
        lastName: therapistData.lastName,
        firstLetter: therapistData.lastName?.charAt(0).toUpperCase() || therapistData.firstName?.charAt(0).toUpperCase(),
        priority: therapistData.priority || 5,
      },
    });

    // Add attributes if provided
    if (therapistData.attributes && therapistData.attributes.length > 0) {
      await prisma.therapistAttribute.createMany({
        data: therapistData.attributes.map(attr => ({
          therapistId: therapist.id,
          attributeId: attr.attributeId,
          value: attr.value,
        })),
      });
    }

    // Add services if provided
    if (therapistData.services && therapistData.services.length > 0) {
      await prisma.therapistService.createMany({
        data: therapistData.services.map(serviceId => ({
          therapistId: therapist.id,
          serviceId: serviceId,
        })),
      });
    }

    // Fetch therapist with relations
    const therapistWithRelations = await prisma.therapist.findUnique({
      where: { id: therapist.id },
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
        services: {
          include: {
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

    res.status(201).json({
      success: true,
      data: therapistWithRelations,
    });
  } catch (error) {
    return next(error);
  }
});

// Update therapist
router.put('/:id', [
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
  body('priority').optional().isInt({ min: 1, max: 10 }).withMessage('Priority must be between 1 and 10'),
  body('attributes').optional().isArray().withMessage('Attributes must be an array'),
  body('services').optional().isArray().withMessage('Services must be an array'),
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

    // Check if therapist exists
    const existingTherapist = await prisma.therapist.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTherapist) {
      throw createError('Therapist not found', 404);
    }

    // Update therapist
    const therapist = await prisma.therapist.update({
      where: { id: Number(id) },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        firstLetter: updateData.lastName?.charAt(0).toUpperCase() || updateData.firstName?.charAt(0).toUpperCase(),
        priority: updateData.priority,
      },
    });

    // Update attributes if provided
    if (updateData.attributes) {
      // Delete existing attributes
      await prisma.therapistAttribute.deleteMany({
        where: { therapistId: Number(id) },
      });

      // Add new attributes
      if (updateData.attributes.length > 0) {
        await prisma.therapistAttribute.createMany({
          data: updateData.attributes.map((attr: any) => ({
            therapistId: Number(id),
            attributeId: attr.attributeId,
            value: attr.value,
          })),
        });
      }
    }

    // Update services if provided
    if (updateData.services) {
      // Delete existing services
      await prisma.therapistService.deleteMany({
        where: { therapistId: Number(id) },
      });

      // Add new services
      if (updateData.services.length > 0) {
        await prisma.therapistService.createMany({
          data: updateData.services.map((serviceId: number) => ({
            therapistId: Number(id),
            serviceId: serviceId,
          })),
        });
      }
    }

    // Fetch therapist with relations
    const therapistWithRelations = await prisma.therapist.findUnique({
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
        services: {
          include: {
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

    res.json({
      success: true,
      data: therapistWithRelations,
    });
  } catch (error) {
    return next(error);
  }
});

// Upload therapist avatar
router.post('/:id/avatar', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const therapistId = Number(id);

    // Check if therapist exists
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
    });

    if (!therapist) {
      throw createError('Therapist not found', 404);
    }

    // Check if file was uploaded
    if (!req.body || !req.body.avatar) {
      throw createError('No avatar file provided', 400);
    }

    // For now, we'll store the file path/URL in a simple way
    // In production, you should use proper file storage (S3, Cloudinary, etc.)
    const uploadsDir = path.join(process.cwd(), 'uploads', 'therapists');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // For Express 5.x, files are available in req.body when using multipart/form-data
    // Note: This is a simplified implementation. In production, use multer or similar
    const avatarUrl = `/uploads/therapists/${therapistId}.jpg`;

    // Store avatar URL in therapist record (you may need to add avatarUrl field to schema)
    // For now, we'll return the URL
    // In a real implementation, you would:
    // 1. Save the file to disk or cloud storage
    // 2. Update the therapist record with the avatar URL
    // 3. Return the avatar URL

    res.json({
      success: true,
      data: {
        avatarUrl: avatarUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Delete therapist
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if therapist exists
    const therapist = await prisma.therapist.findUnique({
      where: { id: Number(id) },
    });

    if (!therapist) {
      throw createError('Therapist not found', 404);
    }

    // Check if therapist has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        therapistId: Number(id),
        cancelled: false,
        date: {
          gte: Math.floor(Date.now() / 1000),
        },
      },
    });

    if (activeBookings > 0) {
      throw createError('Cannot delete therapist with active bookings', 400);
    }

    // Delete therapist and related data
    await prisma.therapist.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Therapist deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
