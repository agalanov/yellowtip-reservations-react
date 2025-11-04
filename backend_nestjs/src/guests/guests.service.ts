import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestDto, UpdateGuestDto } from './dto';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async getGuests(filters: any) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'lastName',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, guests] = await Promise.all([
      this.prisma.guest.count({ where }),
      this.prisma.guest.findMany({
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
      }),
    ]);

    return {
      success: true,
      data: guests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getGuest(id: number) {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
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
      throw new NotFoundException('Guest not found');
    }

    return { success: true, data: guest };
  }

  async createGuest(dto: CreateGuestDto) {
    const guest = await this.prisma.guest.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        firstLetter: dto.lastName?.charAt(0).toUpperCase() || dto.firstName?.charAt(0).toUpperCase(),
      },
    });

    if (dto.attributes && dto.attributes.length > 0) {
      await this.prisma.guestAttribute.createMany({
        data: dto.attributes.map(attr => ({
          guestId: guest.id,
          attributeId: attr.attributeId,
          value: attr.value,
        })),
      });
    }

    const guestWithAttributes = await this.prisma.guest.findUnique({
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

    return { success: true, data: guestWithAttributes };
  }

  async updateGuest(id: number, dto: UpdateGuestDto) {
    const existingGuest = await this.prisma.guest.findUnique({
      where: { id },
    });

    if (!existingGuest) {
      throw new NotFoundException('Guest not found');
    }

    const guest = await this.prisma.guest.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        firstLetter: dto.lastName?.charAt(0).toUpperCase() || dto.firstName?.charAt(0).toUpperCase(),
      },
    });

    if (dto.attributes) {
      await this.prisma.guestAttribute.deleteMany({
        where: { guestId: id },
      });

      if (dto.attributes.length > 0) {
        await this.prisma.guestAttribute.createMany({
          data: dto.attributes.map((attr: any) => ({
            guestId: id,
            attributeId: attr.attributeId,
            value: attr.value,
          })),
        });
      }
    }

    const guestWithAttributes = await this.prisma.guest.findUnique({
      where: { id },
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

    return { success: true, data: guestWithAttributes };
  }

  async deleteGuest(id: number) {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    const activeBookings = await this.prisma.booking.count({
      where: {
        guestId: id,
        cancelled: false,
        date: {
          gte: Math.floor(Date.now() / 1000),
        },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException('Cannot delete guest with active bookings');
    }

    await this.prisma.guest.delete({
      where: { id },
    });

    return { success: true, message: 'Guest deleted successfully' };
  }
}

