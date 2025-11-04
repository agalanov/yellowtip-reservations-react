import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async getBookings(filters: any) {
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
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
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

    const [total, bookings] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
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
      }),
    ]);

    return {
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getBooking(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
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
      throw new NotFoundException('Booking not found');
    }

    return { success: true, data: booking };
  }

  async createBooking(dto: CreateBookingDto) {
    const service = await this.prisma.service.findFirst({
      where: {
        id: dto.serviceId,
        active: true,
        deleted: false,
      },
    });

    if (!service) {
      throw new BadRequestException('Service not found or inactive');
    }

    const room = await this.prisma.room.findFirst({
      where: {
        id: dto.roomId,
        active: true,
        deleted: false,
      },
    });

    if (!room) {
      throw new BadRequestException('Room not found or inactive');
    }

    const guest = await this.prisma.guest.findUnique({
      where: { id: dto.guestId },
    });

    if (!guest) {
      throw new BadRequestException('Guest not found');
    }

    if (dto.therapistId) {
      const therapist = await this.prisma.therapist.findUnique({
        where: { id: dto.therapistId },
      });

      if (!therapist) {
        throw new BadRequestException('Therapist not found');
      }
    }

    const booking = await this.prisma.booking.create({
      data: {
        date: dto.date,
        serviceId: dto.serviceId,
        servicePackageId: dto.servicePackageId,
        time: dto.time,
        roomId: dto.roomId,
        guestId: dto.guestId,
        therapistId: dto.therapistId,
        comment: dto.comment,
        preDuration: dto.preDuration || 0,
        postDuration: dto.postDuration || 0,
        priority: 1,
        locker: '',
        duration: dto.duration || service.duration || 0,
        price: dto.price || service.price || 0,
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

    return { success: true, data: booking };
  }

  async updateBooking(id: number, dto: UpdateBookingDto) {
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException('Booking not found');
    }

    const booking = await this.prisma.booking.update({
      where: { id },
      data: dto,
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

    return { success: true, data: booking };
  }

  async deleteBooking(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    await this.prisma.booking.delete({
      where: { id },
    });

    return { success: true, message: 'Booking deleted successfully' };
  }
}

