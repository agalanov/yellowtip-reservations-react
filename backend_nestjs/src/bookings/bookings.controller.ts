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
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateBookingDto, UpdateBookingDto } from './dto';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bookings with filters' })
  async getBookings(@Query() filters: any) {
    return this.bookingsService.getBookings(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async getBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.getBooking(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new booking' })
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking' })
  async updateBooking(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.updateBooking(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking' })
  async deleteBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.deleteBooking(id);
  }
}

