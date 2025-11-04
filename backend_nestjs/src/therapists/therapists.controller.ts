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
import { TherapistsService } from './therapists.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTherapistDto, UpdateTherapistDto } from './dto';

@ApiTags('Therapists')
@Controller('therapists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TherapistsController {
  constructor(private readonly therapistsService: TherapistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all therapists with filters' })
  async getTherapists(@Query() filters: any) {
    return this.therapistsService.getTherapists(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get therapist by ID' })
  async getTherapist(@Param('id', ParseIntPipe) id: number) {
    return this.therapistsService.getTherapist(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new therapist' })
  async createTherapist(@Body() dto: CreateTherapistDto) {
    return this.therapistsService.createTherapist(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update therapist' })
  async updateTherapist(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTherapistDto) {
    return this.therapistsService.updateTherapist(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete therapist' })
  async deleteTherapist(@Param('id', ParseIntPipe) id: number) {
    return this.therapistsService.deleteTherapist(id);
  }
}




