import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { BookingRequest, BookingResponse, BookingFilters } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get all bookings with filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('dateFrom').optional().isInt().withMessage('Date from must be a timestamp'),
  query('dateTo').optional().isInt().withMessage('Date to must be a timestamp'),
  query('roomId').optional().isInt().withMessage('Room ID must be an integer'),
  query('serviceId').optional().isInt().withMessage('Service ID must be an integer'),
  query('therapistId').optional().isInt().withMessage('Therapist ID must be an integer'),
  query('guestId').optional().isInt().withMessage('Guest ID must be an integer'),
  query('confirmed').optional().isBoolean().withMessage('Confirmed must be a boolean'),
  query('cancelled').optional().isBoolean().withMessage('Cancelled must be a boolean'),
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
      dateFrom,
      dateTo,
      roomId,
      serviceId,
      therapistId,
      guestId,
      confirmed,
      cancelled,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
    }: BookingFilters = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = Number(dateFrom);
      if (dateTo) where.date.lte = Number(dateTo);
    }

    if (roomId) where.roomId = Number(roomId);
    if (serviceId) where.serviceId = Number(serviceId);
    if (therapistId) where.therapistId = Number(therapistId);
    if (guestId) where.guestId = Number(guestId);
    if (confirmed !== undefined) where.confirmed = confirmed;
    if (cancelled !== undefined) where.cancelled = cancelled;

    // Get total count
    const total = await prisma.booking.count({ where });

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
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
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: bookings,
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

// Get booking by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
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
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          include: {
            paymentType: true,
            voucher: true,
          },
        },
      },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

// Create new booking
router.post('/', [
  body('date').isInt().withMessage('Date must be a timestamp'),
  body('serviceId').isInt().withMessage('Service ID must be an integer'),
  body('time').isInt().withMessage('Time must be a timestamp'),
  body('roomId').isInt().withMessage('Room ID must be an integer'),
  body('guestId').isInt().withMessage('Guest ID must be an integer'),
  body('therapistId').optional().isInt().withMessage('Therapist ID must be an integer'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
  body('duration').optional().isInt().withMessage('Duration must be an integer'),
  body('price').optional().isFloat().withMessage('Price must be a number'),
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

    const bookingData: BookingRequest = req.body;

    // Check if service exists and is active
    const service = await prisma.service.findFirst({
      where: {
        id: bookingData.serviceId,
        active: true,
        deleted: false,
      },
    });

    if (!service) {
      throw createError('Service not found or inactive', 400);
    }

    // Check if room exists and is active
    const room = await prisma.room.findFirst({
      where: {
        id: bookingData.roomId,
        active: true,
        deleted: false,
      },
    });

    if (!room) {
      throw createError('Room not found or inactive', 400);
    }

    // Check if guest exists
    const guest = await prisma.guest.findUnique({
      where: { id: bookingData.guestId },
    });

    if (!guest) {
      throw createError('Guest not found', 400);
    }

    // Check if therapist exists (if provided)
    if (bookingData.therapistId) {
      const therapist = await prisma.therapist.findUnique({
        where: { id: bookingData.therapistId },
      });

      if (!therapist) {
        throw createError('Therapist not found', 400);
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        date: bookingData.date,
        serviceId: bookingData.serviceId,
        servicePackageId: bookingData.servicePackageId,
        time: bookingData.time,
        roomId: bookingData.roomId,
        guestId: bookingData.guestId,
        therapistId: bookingData.therapistId,
        comment: bookingData.comment,
        preDuration: bookingData.preDuration || 0,
        postDuration: bookingData.postDuration || 0,
        priority: bookingData.priority || 1,
        locker: bookingData.locker || '',
        duration: bookingData.duration || service.duration || 0,
        price: bookingData.price || service.price || 0,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
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
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return next(error);
  }
});

// Update booking
router.put('/:id', [
  body('date').optional().isInt().withMessage('Date must be a timestamp'),
  body('serviceId').optional().isInt().withMessage('Service ID must be an integer'),
  body('time').optional().isInt().withMessage('Time must be a timestamp'),
  body('roomId').optional().isInt().withMessage('Room ID must be an integer'),
  body('guestId').optional().isInt().withMessage('Guest ID must be an integer'),
  body('therapistId').optional().isInt().withMessage('Therapist ID must be an integer'),
  body('confirmed').optional().isBoolean().withMessage('Confirmed must be a boolean'),
  body('cancelled').optional().isBoolean().withMessage('Cancelled must be a boolean'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
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

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: Number(id) },
    });

    if (!existingBooking) {
      throw createError('Booking not found', 404);
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
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
        therapist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete booking
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
