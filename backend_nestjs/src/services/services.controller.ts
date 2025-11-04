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
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateServiceDto, UpdateServiceDto } from './dto';

@ApiTags('Services')
@Controller('services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all services with filters' })
  async getServices(@Query() filters: any) {
    return this.servicesService.getServices(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  async getService(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.getService(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new service' })
  async createService(@Body() dto: CreateServiceDto) {
    return this.servicesService.createService(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service' })
  async updateService(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.servicesService.updateService(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service (soft delete)' })
  async deleteService(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.deleteService(id);
  }
}




