import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async getServices(filters: any) {
    const {
      page = 1,
      limit = 20,
      categoryId,
      active,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
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

    const [total, services] = await Promise.all([
      this.prisma.service.count({ where }),
      this.prisma.service.findMany({
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
      }),
    ]);

    return {
      success: true,
      data: services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getService(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
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
      throw new NotFoundException('Service not found');
    }

    return { success: true, data: service };
  }

  async createService(dto: CreateServiceDto) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const currency = await this.prisma.currency.findUnique({
      where: { id: dto.currencyId },
    });

    if (!currency) {
      throw new BadRequestException('Currency not found');
    }

    const service = await this.prisma.service.create({
      data: {
        categoryId: dto.categoryId,
        currencyId: dto.currencyId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        duration: dto.duration,
        preDuration: dto.preDuration || 0,
        postDuration: dto.postDuration || 0,
        space: dto.space || 1,
        therapistType: dto.therapistType || '1',
        active: dto.active !== undefined ? dto.active : true,
        roomType: dto.roomType || '1',
        variableTime: dto.variableTime || false,
        variablePrice: dto.variablePrice || false,
        minimalTime: dto.minimalTime || 5,
        maximalTime: dto.maximalTime || 0,
        timeUnit: dto.timeUnit || 5,
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

    return { success: true, data: service };
  }

  async updateService(id: number, dto: UpdateServiceDto) {
    const existingService = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new NotFoundException('Service not found');
    }

    const service = await this.prisma.service.update({
      where: { id },
      data: dto,
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

    return { success: true, data: service };
  }

  async deleteService(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const activeBookings = await this.prisma.booking.count({
      where: {
        serviceId: id,
        cancelled: false,
        date: {
          gte: Math.floor(Date.now() / 1000),
        },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException('Cannot delete service with active bookings');
    }

    await this.prisma.service.update({
      where: { id },
      data: { deleted: true },
    });

    return { success: true, message: 'Service deleted successfully' };
  }
}




