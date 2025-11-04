import { IsString, IsOptional, IsInt, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Category ID' })
  @IsInt()
  categoryId: number;

  @ApiProperty({ description: 'Currency ID' })
  @IsInt()
  currencyId: number;

  @ApiProperty({ description: 'Service name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Service description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Price' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiPropertyOptional({ description: 'Pre-duration' })
  @IsOptional()
  @IsInt()
  preDuration?: number;

  @ApiPropertyOptional({ description: 'Post-duration' })
  @IsOptional()
  @IsInt()
  postDuration?: number;

  @ApiPropertyOptional({ description: 'Space' })
  @IsOptional()
  @IsInt()
  space?: number;

  @ApiPropertyOptional({ description: 'Therapist type', default: '1' })
  @IsOptional()
  @IsString()
  therapistType?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Room type', default: '1' })
  @IsOptional()
  @IsString()
  roomType?: string;

  @ApiPropertyOptional({ description: 'Variable time' })
  @IsOptional()
  @IsBoolean()
  variableTime?: boolean;

  @ApiPropertyOptional({ description: 'Variable price' })
  @IsOptional()
  @IsBoolean()
  variablePrice?: boolean;

  @ApiPropertyOptional({ description: 'Minimal time', default: 5 })
  @IsOptional()
  @IsInt()
  minimalTime?: number;

  @ApiPropertyOptional({ description: 'Maximal time' })
  @IsOptional()
  @IsInt()
  maximalTime?: number;

  @ApiPropertyOptional({ description: 'Time unit', default: 5 })
  @IsOptional()
  @IsInt()
  timeUnit?: number;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ description: 'Service name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Service description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Price' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

