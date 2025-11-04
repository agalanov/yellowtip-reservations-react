import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateRoomDto, UpdateRoomDto, AddServiceToRoomDto } from './dto';

@ApiTags('Rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all rooms with filters' })
  async getRooms(@Query() filters: any) {
    return this.roomsService.getRooms(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  async getRoom(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.getRoom(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new room' })
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update room' })
  async updateRoom(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.roomsService.updateRoom(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete room (soft delete)' })
  async deleteRoom(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.deleteRoom(id);
  }

  @Post(':id/services')
  @ApiOperation({ summary: 'Add service to room' })
  async addServiceToRoom(@Param('id', ParseIntPipe) id: number, @Body() dto: AddServiceToRoomDto) {
    return this.roomsService.addServiceToRoom(id, dto);
  }

  @Delete(':id/services/:serviceId')
  @ApiOperation({ summary: 'Remove service from room' })
  async removeServiceFromRoom(
    @Param('id', ParseIntPipe) id: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
  ) {
    return this.roomsService.removeServiceFromRoom(id, serviceId);
  }
}




