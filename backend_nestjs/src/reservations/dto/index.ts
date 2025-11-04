import { IsOptional, IsString, IsInt, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReservationFiltersDto {
  @ApiPropertyOptional({ description: 'Date (ISO format)' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ description: 'View mode', enum: ['day', 'week', 'month'] })
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  viewMode?: 'day' | 'week' | 'month';

  @ApiPropertyOptional({ description: 'Room ID' })
  @IsOptional()
  @IsInt()
  roomId?: number;

  @ApiPropertyOptional({ description: 'Therapist ID' })
  @IsOptional()
  @IsInt()
  therapistId?: number;

  @ApiPropertyOptional({ description: 'Service ID' })
  @IsOptional()
  @IsInt()
  serviceId?: number;
}




