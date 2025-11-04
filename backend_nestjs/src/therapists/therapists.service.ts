import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTherapistDto, UpdateTherapistDto } from './dto';

@Injectable()
export class TherapistsService {
  constructor(private prisma: PrismaService) {}

  async getTherapists(filters: any) {
    const {
      page = 1,
      limit = 20,
      serviceId,
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

    if (serviceId) {
      where.services = {
        some: {
          serviceId: Number(serviceId),
        },
      };
    }

    const [total, therapists] = await Promise.all([
      this.prisma.therapist.count({ where }),
      this.prisma.therapist.findMany({
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
      }),
    ]);

    return {
      success: true,
      data: therapists,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getTherapist(id: number) {
    const therapist = await this.prisma.therapist.findUnique({
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
      throw new NotFoundException('Therapist not found');
    }

    return { success: true, data: therapist };
  }

  async createTherapist(dto: CreateTherapistDto) {
    const therapist = await this.prisma.therapist.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        firstLetter: dto.lastName?.charAt(0).toUpperCase() || dto.firstName?.charAt(0).toUpperCase(),
        priority: dto.priority || 5,
      },
    });

    if (dto.attributes && dto.attributes.length > 0) {
      await this.prisma.therapistAttribute.createMany({
        data: dto.attributes.map(attr => ({
          therapistId: therapist.id,
          attributeId: attr.attributeId,
          value: attr.value,
        })),
      });
    }

    if (dto.services && dto.services.length > 0) {
      await this.prisma.therapistService.createMany({
        data: dto.services.map(serviceId => ({
          therapistId: therapist.id,
          serviceId: serviceId,
        })),
      });
    }

    const therapistWithRelations = await this.prisma.therapist.findUnique({
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

    return { success: true, data: therapistWithRelations };
  }

  async updateTherapist(id: number, dto: UpdateTherapistDto) {
    const existingTherapist = await this.prisma.therapist.findUnique({
      where: { id },
    });

    if (!existingTherapist) {
      throw new NotFoundException('Therapist not found');
    }

    const therapist = await this.prisma.therapist.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        firstLetter: dto.lastName?.charAt(0).toUpperCase() || dto.firstName?.charAt(0).toUpperCase(),
        priority: dto.priority,
      },
    });

    if (dto.attributes) {
      await this.prisma.therapistAttribute.deleteMany({
        where: { therapistId: id },
      });

      if (dto.attributes.length > 0) {
        await this.prisma.therapistAttribute.createMany({
          data: dto.attributes.map((attr: any) => ({
            therapistId: id,
            attributeId: attr.attributeId,
            value: attr.value,
          })),
        });
      }
    }

    if (dto.services) {
      await this.prisma.therapistService.deleteMany({
        where: { therapistId: id },
      });

      if (dto.services.length > 0) {
        await this.prisma.therapistService.createMany({
          data: dto.services.map((serviceId: number) => ({
            therapistId: id,
            serviceId: serviceId,
          })),
        });
      }
    }

    const therapistWithRelations = await this.prisma.therapist.findUnique({
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

    return { success: true, data: therapistWithRelations };
  }

  async deleteTherapist(id: number) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { id },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    const activeBookings = await this.prisma.booking.count({
      where: {
        therapistId: id,
        cancelled: false,
        date: {
          gte: Math.floor(Date.now() / 1000),
        },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException('Cannot delete therapist with active bookings');
    }

    await this.prisma.therapist.delete({
      where: { id },
    });

    return { success: true, message: 'Therapist deleted successfully' };
  }
}




