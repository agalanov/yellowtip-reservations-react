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
import { GuestsService } from './guests.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateGuestDto, UpdateGuestDto } from './dto';

@ApiTags('Guests')
@Controller('guests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all guests with filters' })
  async getGuests(@Query() filters: any) {
    return this.guestsService.getGuests(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guest by ID' })
  async getGuest(@Param('id', ParseIntPipe) id: number) {
    return this.guestsService.getGuest(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new guest' })
  async createGuest(@Body() dto: CreateGuestDto) {
    return this.guestsService.createGuest(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update guest' })
  async updateGuest(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGuestDto) {
    return this.guestsService.updateGuest(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete guest' })
  async deleteGuest(@Param('id', ParseIntPipe) id: number) {
    return this.guestsService.deleteGuest(id);
  }
}

