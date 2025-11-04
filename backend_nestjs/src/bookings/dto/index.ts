import { IsInt, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Booking date (timestamp)' })
  @IsInt()
  date: number;

  @ApiProperty({ description: 'Service ID' })
  @IsInt()
  serviceId: number;

  @ApiProperty({ description: 'Booking time (timestamp)' })
  @IsInt()
  time: number;

  @ApiProperty({ description: 'Room ID' })
  @IsInt()
  roomId: number;

  @ApiProperty({ description: 'Guest ID' })
  @IsInt()
  guestId: number;

  @ApiPropertyOptional({ description: 'Therapist ID' })
  @IsOptional()
  @IsInt()
  therapistId?: number;

  @ApiPropertyOptional({ description: 'Comment' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiPropertyOptional({ description: 'Price' })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Pre-duration' })
  @IsOptional()
  @IsInt()
  preDuration?: number;

  @ApiPropertyOptional({ description: 'Post-duration' })
  @IsOptional()
  @IsInt()
  postDuration?: number;

  @ApiPropertyOptional({ description: 'Service package ID' })
  @IsOptional()
  @IsInt()
  servicePackageId?: number;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ description: 'Booking date (timestamp)' })
  @IsOptional()
  @IsInt()
  date?: number;

  @ApiPropertyOptional({ description: 'Service ID' })
  @IsOptional()
  @IsInt()
  serviceId?: number;

  @ApiPropertyOptional({ description: 'Booking time (timestamp)' })
  @IsOptional()
  @IsInt()
  time?: number;

  @ApiPropertyOptional({ description: 'Room ID' })
  @IsOptional()
  @IsInt()
  roomId?: number;

  @ApiPropertyOptional({ description: 'Guest ID' })
  @IsOptional()
  @IsInt()
  guestId?: number;

  @ApiPropertyOptional({ description: 'Therapist ID' })
  @IsOptional()
  @IsInt()
  therapistId?: number;

  @ApiPropertyOptional({ description: 'Confirmed status' })
  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;

  @ApiPropertyOptional({ description: 'Cancelled status' })
  @IsOptional()
  @IsBoolean()
  cancelled?: boolean;

  @ApiPropertyOptional({ description: 'Comment' })
  @IsOptional()
  @IsString()
  comment?: string;
}

