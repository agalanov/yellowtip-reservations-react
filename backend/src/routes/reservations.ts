import express from 'express';
import { PrismaClient } from '@prisma/client';
import { query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { ReservationFilters, ReservationData, QuickBookingResponse } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Root route - redirect to overview
router.get('/', (req: express.Request, res: express.Response) => {
  // Redirect to overview with the same query parameters
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(`/api/reservations/overview${queryString}`);
});

// Get reservations overview
router.get('/overview', [
  query('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  query('viewMode').optional().isIn(['day', 'week', 'month']).withMessage('View mode must be day, week, or month'),
  query('roomId').optional().isInt().withMessage('Room ID must be an integer'),
  query('therapistId').optional().isInt().withMessage('Therapist ID must be an integer'),
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

    const filters: ReservationFilters = req.query;
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    
    // Calculate date range based on view mode
    let dateFrom: Date, dateTo: Date;
    
    switch (filters.viewMode) {
      case 'week':
        dateFrom = new Date(targetDate);
        dateFrom.setDate(targetDate.getDate() - targetDate.getDay());
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(dateFrom);
        dateTo.setDate(dateFrom.getDate() + 6);
        dateTo.setHours(23, 59, 59, 999);
        break;
      case 'month':
        dateFrom = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        dateTo = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        dateTo.setHours(23, 59, 59, 999);
        break;
      default: // day
        dateFrom = new Date(targetDate);
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(targetDate);
        dateTo.setHours(23, 59, 59, 999);
    }

    const dateFromTimestamp = Math.floor(dateFrom.getTime() / 1000);
    const dateToTimestamp = Math.floor(dateTo.getTime() / 1000);

    // Build where clause for bookings
    const bookingWhere: any = {
      date: {
        gte: dateFromTimestamp,
        lte: dateToTimestamp,
      },
    };

    if (filters.roomId) bookingWhere.roomId = Number(filters.roomId);
    if (filters.therapistId) bookingWhere.therapistId = Number(filters.therapistId);
    if (filters.serviceId) bookingWhere.serviceId = Number(filters.serviceId);

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: bookingWhere,
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
                color: {
                  select: {
                    hexCode: true,
                    textColor: true,
                  },
                },
              },
            },
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
      orderBy: { date: 'asc' },
    });

    // Get all rooms
    const rooms = await prisma.room.findMany({
      where: { active: true, deleted: false },
      select: {
        id: true,
        name: true,
        description: true,
        priority: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });

    // Get all therapists
    const therapists = await prisma.therapist.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        services: {
          select: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    // Get all services
    const services = await prisma.service.findMany({
      where: { active: true, deleted: false },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: {
              select: {
                hexCode: true,
                textColor: true,
              },
            },
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
      orderBy: { name: 'asc' },
    });

    // Get quick booking options (services with quick booking flag)
    const quickBookings = await prisma.service.findMany({
      where: { 
        active: true, 
        deleted: false,
        quickBooking: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: {
              select: {
                hexCode: true,
                textColor: true,
              },
            },
          },
        },
      },
      take: 10, // Limit to 10 quick booking options
      orderBy: { name: 'asc' },
    });

    // Transform data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      date: booking.date,
      time: booking.time,
      service: {
        id: booking.service.id,
        name: booking.service.name,
        duration: booking.service.duration || 0,
        price: booking.service.price || 0,
        category: {
          hexcode: booking.service.category?.color?.hexCode || '#2196f3',
          textcolor: booking.service.category?.color?.textColor || '#ffffff',
        },
      },
      room: {
        id: booking.room.id,
        name: booking.room.name,
      },
      guest: {
        id: booking.guest.id,
        firstName: booking.guest.firstName || undefined,
        lastName: booking.guest.lastName || undefined,
      },
      therapist: booking.therapist ? {
        id: booking.therapist.id,
        firstName: booking.therapist.firstName || undefined,
        lastName: booking.therapist.lastName || undefined,
      } : undefined,
      confirmed: booking.confirmed,
      cancelled: booking.cancelled,
      comment: booking.comment || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    const transformedRooms = rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description || undefined,
      priority: room.priority,
      active: room.active,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
    }));

    const transformedTherapists = therapists.map(therapist => ({
      id: therapist.id,
      firstName: therapist.firstName || undefined,
      lastName: therapist.lastName || undefined,
      priority: therapist.priority,
      attributes: [], // Will be populated if needed
      services: therapist.services.map(ts => ({
        id: ts.service.id,
        name: ts.service.name,
      })),
      createdAt: therapist.createdAt.toISOString(),
      updatedAt: therapist.updatedAt.toISOString(),
    }));

    const transformedServices = services.map(service => ({
      id: service.id,
      category: {
        id: service.category.id,
        name: service.category.name,
        hexcode: service.category.color?.hexCode || '#2196f3',
        textcolor: service.category.color?.textColor || '#ffffff',
      },
      currency: {
        id: service.currency.id,
        code: service.currency.code,
        symbol: service.currency.symbol,
      },
      name: service.name,
      description: service.description || undefined,
      price: service.price || undefined,
      duration: service.duration || undefined,
      active: service.active,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }));

    const transformedQuickBookings: QuickBookingResponse[] = quickBookings.map(service => ({
      id: service.id,
      name: service.name,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration || 60,
        price: service.price || 0,
      },
      category: {
        id: service.category.id,
        name: service.category.name,
        hexcode: service.category.color?.hexCode || '#2196f3',
        textcolor: service.category.color?.textColor || '#ffffff',
      },
    }));

    const reservationData: ReservationData = {
      bookings: transformedBookings,
      rooms: transformedRooms,
      therapists: transformedTherapists,
      services: transformedServices,
      quickBookings: transformedQuickBookings,
    };

    res.json({
      success: true,
      data: reservationData,
    });
  } catch (error) {
    return next(error);
  }
});

// Get quick booking options
router.get('/quick-booking', authenticate, async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const quickBookings = await prisma.service.findMany({
      where: { 
        active: true, 
        deleted: false,
        quickBooking: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: {
              select: {
                hexCode: true,
                textColor: true,
              },
            },
          },
        },
      },
      take: 10,
      orderBy: { name: 'asc' },
    });

    const transformedQuickBookings: QuickBookingResponse[] = quickBookings.map(service => ({
      id: service.id,
      name: service.name,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration || 60,
        price: service.price || 0,
      },
      category: {
        id: service.category.id,
        name: service.category.name,
        hexcode: service.category.color?.hexCode || '#2196f3',
        textcolor: service.category.color?.textColor || '#ffffff',
      },
    }));

    res.json({
      success: true,
      data: transformedQuickBookings,
    });
  } catch (error) {
    return next(error);
  }
});

// Get room overview
router.get('/rooms', [
  query('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  query('viewMode').optional().isIn(['day', 'week', 'month']).withMessage('View mode must be day, week, or month'),
  query('roomId').optional().isInt().withMessage('Room ID must be an integer'),
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

    const filters: ReservationFilters = req.query;
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    
    // Calculate date range based on view mode
    let dateFrom: Date, dateTo: Date;
    
    switch (filters.viewMode) {
      case 'week':
        dateFrom = new Date(targetDate);
        dateFrom.setDate(targetDate.getDate() - targetDate.getDay());
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(dateFrom);
        dateTo.setDate(dateFrom.getDate() + 6);
        dateTo.setHours(23, 59, 59, 999);
        break;
      case 'month':
        dateFrom = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        dateTo = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        dateTo.setHours(23, 59, 59, 999);
        break;
      default: // day
        dateFrom = new Date(targetDate);
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(targetDate);
        dateTo.setHours(23, 59, 59, 999);
    }

    const dateFromTimestamp = Math.floor(dateFrom.getTime() / 1000);
    const dateToTimestamp = Math.floor(dateTo.getTime() / 1000);

    // Get rooms
    const rooms = await prisma.room.findMany({
      where: { 
        active: true, 
        deleted: false,
        ...(filters.roomId && { id: Number(filters.roomId) }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        priority: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });

    // Get bookings for the date range
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: dateFromTimestamp,
          lte: dateToTimestamp,
        },
        ...(filters.roomId && { roomId: Number(filters.roomId) }),
      },
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
                color: {
                  select: {
                    hexCode: true,
                    textColor: true,
                  },
                },
              },
            },
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
      orderBy: { date: 'asc' },
    });

    // Transform data
    const transformedRooms = rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description || undefined,
      priority: room.priority,
      active: room.active,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
    }));

    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      date: booking.date,
      time: booking.time,
      service: {
        id: booking.service.id,
        name: booking.service.name,
        duration: booking.service.duration || 0,
        price: booking.service.price || 0,
        category: {
          hexcode: booking.service.category?.color?.hexCode || '#2196f3',
          textcolor: booking.service.category?.color?.textColor || '#ffffff',
        },
      },
      room: {
        id: booking.room.id,
        name: booking.room.name,
      },
      guest: {
        id: booking.guest.id,
        firstName: booking.guest.firstName || undefined,
        lastName: booking.guest.lastName || undefined,
      },
      therapist: booking.therapist ? {
        id: booking.therapist.id,
        firstName: booking.therapist.firstName || undefined,
        lastName: booking.therapist.lastName || undefined,
      } : undefined,
      confirmed: booking.confirmed,
      cancelled: booking.cancelled,
      comment: booking.comment || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        rooms: transformedRooms,
        bookings: transformedBookings,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Get therapist overview
router.get('/therapists', [
  query('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  query('viewMode').optional().isIn(['day', 'week', 'month']).withMessage('View mode must be day, week, or month'),
  query('therapistId').optional().isInt().withMessage('Therapist ID must be an integer'),
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

    const filters: ReservationFilters = req.query;
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    
    // Calculate date range based on view mode
    let dateFrom: Date, dateTo: Date;
    
    switch (filters.viewMode) {
      case 'week':
        dateFrom = new Date(targetDate);
        dateFrom.setDate(targetDate.getDate() - targetDate.getDay());
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(dateFrom);
        dateTo.setDate(dateFrom.getDate() + 6);
        dateTo.setHours(23, 59, 59, 999);
        break;
      case 'month':
        dateFrom = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        dateTo = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        dateTo.setHours(23, 59, 59, 999);
        break;
      default: // day
        dateFrom = new Date(targetDate);
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(targetDate);
        dateTo.setHours(23, 59, 59, 999);
    }

    const dateFromTimestamp = Math.floor(dateFrom.getTime() / 1000);
    const dateToTimestamp = Math.floor(dateTo.getTime() / 1000);

    // Get therapists
    const therapists = await prisma.therapist.findMany({
      where: {
        ...(filters.therapistId && { id: Number(filters.therapistId) }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        services: {
          select: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    // Get bookings for the date range
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: dateFromTimestamp,
          lte: dateToTimestamp,
        },
        ...(filters.therapistId && { therapistId: Number(filters.therapistId) }),
      },
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
                color: {
                  select: {
                    hexCode: true,
                    textColor: true,
                  },
                },
              },
            },
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
      orderBy: { date: 'asc' },
    });

    // Transform data
    const transformedTherapists = therapists.map(therapist => ({
      id: therapist.id,
      firstName: therapist.firstName || undefined,
      lastName: therapist.lastName || undefined,
      priority: therapist.priority,
      attributes: [], // Will be populated if needed
      services: therapist.services.map(ts => ({
        id: ts.service.id,
        name: ts.service.name,
      })),
      createdAt: therapist.createdAt.toISOString(),
      updatedAt: therapist.updatedAt.toISOString(),
    }));

    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      date: booking.date,
      time: booking.time,
      service: {
        id: booking.service.id,
        name: booking.service.name,
        duration: booking.service.duration || 0,
        price: booking.service.price || 0,
        category: {
          hexcode: booking.service.category?.color?.hexCode || '#2196f3',
          textcolor: booking.service.category?.color?.textColor || '#ffffff',
        },
      },
      room: {
        id: booking.room.id,
        name: booking.room.name,
      },
      guest: {
        id: booking.guest.id,
        firstName: booking.guest.firstName || undefined,
        lastName: booking.guest.lastName || undefined,
      },
      therapist: booking.therapist ? {
        id: booking.therapist.id,
        firstName: booking.therapist.firstName || undefined,
        lastName: booking.therapist.lastName || undefined,
      } : undefined,
      confirmed: booking.confirmed,
      cancelled: booking.cancelled,
      comment: booking.comment || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        therapists: transformedTherapists,
        bookings: transformedBookings,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// Get calendar view
router.get('/calendar', [
  query('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  query('viewMode').optional().isIn(['day', 'week', 'month']).withMessage('View mode must be day, week, or month'),
  query('roomId').optional().isInt().withMessage('Room ID must be an integer'),
  query('therapistId').optional().isInt().withMessage('Therapist ID must be an integer'),
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

    const filters: ReservationFilters = req.query;
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    
    // Calculate date range based on view mode
    let dateFrom: Date, dateTo: Date;
    
    switch (filters.viewMode) {
      case 'week':
        dateFrom = new Date(targetDate);
        dateFrom.setDate(targetDate.getDate() - targetDate.getDay());
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(dateFrom);
        dateTo.setDate(dateFrom.getDate() + 6);
        dateTo.setHours(23, 59, 59, 999);
        break;
      case 'month':
        dateFrom = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        dateTo = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        dateTo.setHours(23, 59, 59, 999);
        break;
      default: // day
        dateFrom = new Date(targetDate);
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(targetDate);
        dateTo.setHours(23, 59, 59, 999);
    }

    const dateFromTimestamp = Math.floor(dateFrom.getTime() / 1000);
    const dateToTimestamp = Math.floor(dateTo.getTime() / 1000);

    // Build where clause for bookings
    const bookingWhere: any = {
      date: {
        gte: dateFromTimestamp,
        lte: dateToTimestamp,
      },
    };

    if (filters.roomId) bookingWhere.roomId = Number(filters.roomId);
    if (filters.therapistId) bookingWhere.therapistId = Number(filters.therapistId);
    if (filters.serviceId) bookingWhere.serviceId = Number(filters.serviceId);

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: bookingWhere,
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
                color: {
                  select: {
                    hexCode: true,
                    textColor: true,
                  },
                },
              },
            },
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
      orderBy: { date: 'asc' },
    });

    // Transform data
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      date: booking.date,
      time: booking.time,
      service: {
        id: booking.service.id,
        name: booking.service.name,
        duration: booking.service.duration || 0,
        price: booking.service.price || 0,
        category: {
          hexcode: booking.service.category?.color?.hexCode || '#2196f3',
          textcolor: booking.service.category?.color?.textColor || '#ffffff',
        },
      },
      room: {
        id: booking.room.id,
        name: booking.room.name,
      },
      guest: {
        id: booking.guest.id,
        firstName: booking.guest.firstName || undefined,
        lastName: booking.guest.lastName || undefined,
      },
      therapist: booking.therapist ? {
        id: booking.therapist.id,
        firstName: booking.therapist.firstName || undefined,
        lastName: booking.therapist.lastName || undefined,
      } : undefined,
      confirmed: booking.confirmed,
      cancelled: booking.cancelled,
      comment: booking.comment || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        bookings: transformedBookings,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
