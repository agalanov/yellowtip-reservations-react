import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationFiltersDto } from './dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private calculateDateRange(date: Date, viewMode: 'day' | 'week' | 'month') {
    let dateFrom: Date, dateTo: Date;

    switch (viewMode) {
      case 'week':
        dateFrom = new Date(date);
        dateFrom.setDate(date.getDate() - date.getDay());
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(dateFrom);
        dateTo.setDate(dateFrom.getDate() + 6);
        dateTo.setHours(23, 59, 59, 999);
        break;
      case 'month':
        dateFrom = new Date(date.getFullYear(), date.getMonth(), 1);
        dateTo = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        dateTo.setHours(23, 59, 59, 999);
        break;
      default: // day
        dateFrom = new Date(date);
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(date);
        dateTo.setHours(23, 59, 59, 999);
    }

    return {
      dateFrom: Math.floor(dateFrom.getTime() / 1000),
      dateTo: Math.floor(dateTo.getTime() / 1000),
    };
  }

  private transformBooking(booking: any) {
    return {
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
      therapist: booking.therapist
        ? {
            id: booking.therapist.id,
            firstName: booking.therapist.firstName || undefined,
            lastName: booking.therapist.lastName || undefined,
          }
        : undefined,
      confirmed: booking.confirmed,
      cancelled: booking.cancelled,
      comment: booking.comment || undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }

  async getOverview(filters: ReservationFiltersDto) {
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    const viewMode = filters.viewMode || 'day';
    const { dateFrom, dateTo } = this.calculateDateRange(targetDate, viewMode);

    const bookingWhere: any = {
      date: {
        gte: dateFrom,
        lte: dateTo,
      },
    };

    if (filters.roomId) bookingWhere.roomId = Number(filters.roomId);
    if (filters.therapistId) bookingWhere.therapistId = Number(filters.therapistId);
    if (filters.serviceId) bookingWhere.serviceId = Number(filters.serviceId);

    const [bookings, rooms, therapists, services, quickBookings] = await Promise.all([
      this.prisma.booking.findMany({
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
      }),
      this.prisma.room.findMany({
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
      }),
      this.prisma.therapist.findMany({
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
      }),
      this.prisma.service.findMany({
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
      }),
      this.prisma.service.findMany({
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
      }),
    ]);

    const transformedBookings = bookings.map(booking => this.transformBooking(booking));
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
      attributes: [],
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
    const transformedQuickBookings = quickBookings.map(service => ({
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

    return {
      success: true,
      data: {
        bookings: transformedBookings,
        rooms: transformedRooms,
        therapists: transformedTherapists,
        services: transformedServices,
        quickBookings: transformedQuickBookings,
      },
    };
  }

  async getQuickBooking() {
    const quickBookings = await this.prisma.service.findMany({
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

    const transformedQuickBookings = quickBookings.map(service => ({
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

    return { success: true, data: transformedQuickBookings };
  }

  async getRoomsOverview(filters: ReservationFiltersDto) {
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    const viewMode = filters.viewMode || 'day';
    const { dateFrom, dateTo } = this.calculateDateRange(targetDate, viewMode);

    const [rooms, bookings] = await Promise.all([
      this.prisma.room.findMany({
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
      }),
      this.prisma.booking.findMany({
        where: {
          date: {
            gte: dateFrom,
            lte: dateTo,
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
      }),
    ]);

    const transformedRooms = rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description || undefined,
      priority: room.priority,
      active: room.active,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
    }));

    const transformedBookings = bookings.map(booking => this.transformBooking(booking));

    return {
      success: true,
      data: {
        rooms: transformedRooms,
        bookings: transformedBookings,
      },
    };
  }

  async getTherapistsOverview(filters: ReservationFiltersDto) {
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    const viewMode = filters.viewMode || 'day';
    const { dateFrom, dateTo } = this.calculateDateRange(targetDate, viewMode);

    const [therapists, bookings] = await Promise.all([
      this.prisma.therapist.findMany({
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
      }),
      this.prisma.booking.findMany({
        where: {
          date: {
            gte: dateFrom,
            lte: dateTo,
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
      }),
    ]);

    const transformedTherapists = therapists.map(therapist => ({
      id: therapist.id,
      firstName: therapist.firstName || undefined,
      lastName: therapist.lastName || undefined,
      priority: therapist.priority,
      attributes: [],
      services: therapist.services.map(ts => ({
        id: ts.service.id,
        name: ts.service.name,
      })),
      createdAt: therapist.createdAt.toISOString(),
      updatedAt: therapist.updatedAt.toISOString(),
    }));

    const transformedBookings = bookings.map(booking => this.transformBooking(booking));

    return {
      success: true,
      data: {
        therapists: transformedTherapists,
        bookings: transformedBookings,
      },
    };
  }

  async getCalendar(filters: ReservationFiltersDto) {
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    const viewMode = filters.viewMode || 'day';
    const { dateFrom, dateTo } = this.calculateDateRange(targetDate, viewMode);

    const bookingWhere: any = {
      date: {
        gte: dateFrom,
        lte: dateTo,
      },
    };

    if (filters.roomId) bookingWhere.roomId = Number(filters.roomId);
    if (filters.therapistId) bookingWhere.therapistId = Number(filters.therapistId);
    if (filters.serviceId) bookingWhere.serviceId = Number(filters.serviceId);

    const bookings = await this.prisma.booking.findMany({
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

    const transformedBookings = bookings.map(booking => this.transformBooking(booking));

    return {
      success: true,
      data: {
        bookings: transformedBookings,
      },
    };
  }
}




