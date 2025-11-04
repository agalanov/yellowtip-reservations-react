import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto, AddServiceToRoomDto } from './dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async getRooms(filters: any) {
    const {
      page = 1,
      limit = 20,
      active,
      serviceId,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
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

    if (serviceId) {
      where.services = {
        some: {
          serviceId: Number(serviceId),
        },
      };
    }

    const [total, rooms] = await Promise.all([
      this.prisma.room.count({ where }),
      this.prisma.room.findMany({
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
      }),
    ]);

    return {
      success: true,
      data: rooms,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getRoom(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
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
              gte: Math.floor(Date.now() / 1000),
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
      throw new NotFoundException('Room not found');
    }

    return { success: true, data: room };
  }

  async createRoom(dto: CreateRoomDto) {
    const existingRoom = await this.prisma.room.findFirst({
      where: {
        name: dto.name,
        deleted: false,
      },
    });

    if (existingRoom) {
      throw new BadRequestException('Room with this name already exists');
    }

    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        description: dto.description,
        priority: dto.priority || 5,
        active: dto.active !== undefined ? dto.active : true,
      },
    });

    return { success: true, data: room };
  }

  async updateRoom(id: number, dto: UpdateRoomDto) {
    const existingRoom = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      throw new NotFoundException('Room not found');
    }

    if (dto.name) {
      const duplicateRoom = await this.prisma.room.findFirst({
        where: {
          name: dto.name,
          deleted: false,
          id: { not: id },
        },
      });

      if (duplicateRoom) {
        throw new BadRequestException('Room with this name already exists');
      }
    }

    const room = await this.prisma.room.update({
      where: { id },
      data: dto,
    });

    return { success: true, data: room };
  }

  async deleteRoom(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const activeBookings = await this.prisma.booking.count({
      where: {
        roomId: id,
        cancelled: false,
        date: {
          gte: Math.floor(Date.now() / 1000),
        },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException('Cannot delete room with active bookings');
    }

    await this.prisma.room.update({
      where: { id },
      data: { deleted: true },
    });

    return { success: true, message: 'Room deleted successfully' };
  }

  async addServiceToRoom(id: number, dto: AddServiceToRoomDto) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    await this.prisma.roomService.create({
      data: {
        roomId: id,
        serviceId: dto.serviceId,
      },
    });

    return { success: true, message: 'Service added to room successfully' };
  }

  async removeServiceFromRoom(id: number, serviceId: number) {
    try {
      await this.prisma.roomService.delete({
        where: {
          roomId_serviceId: {
            roomId: id,
            serviceId: serviceId,
          },
        },
      });

      return { success: true, message: 'Service removed from room successfully' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Room service relation not found');
      }
      throw error;
    }
  }
}




