import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReservationFiltersDto } from './dto';

@ApiTags('Reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Redirect to overview' })
  async getRoot() {
    return { message: 'Use /reservations/overview endpoint' };
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get reservations overview with all data' })
  async getOverview(@Query() filters: ReservationFiltersDto) {
    return this.reservationsService.getOverview(filters);
  }

  @Get('quick-booking')
  @ApiOperation({ summary: 'Get quick booking options' })
  async getQuickBooking() {
    return this.reservationsService.getQuickBooking();
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get rooms overview' })
  async getRoomsOverview(@Query() filters: ReservationFiltersDto) {
    return this.reservationsService.getRoomsOverview(filters);
  }

  @Get('therapists')
  @ApiOperation({ summary: 'Get therapists overview' })
  async getTherapistsOverview(@Query() filters: ReservationFiltersDto) {
    return this.reservationsService.getTherapistsOverview(filters);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get calendar view' })
  async getCalendar(@Query() filters: ReservationFiltersDto) {
    return this.reservationsService.getCalendar(filters);
  }
}




