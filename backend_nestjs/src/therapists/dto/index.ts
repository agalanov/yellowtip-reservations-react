import { IsString, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TherapistAttributeDto {
  @ApiProperty({ description: 'Attribute ID' })
  @IsInt()
  attributeId: number;

  @ApiPropertyOptional({ description: 'Attribute value' })
  @IsOptional()
  @IsString()
  value?: string;
}

export class CreateTherapistDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Priority (1-10)', default: 5 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ description: 'Attributes', type: [TherapistAttributeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TherapistAttributeDto)
  attributes?: TherapistAttributeDto[];

  @ApiPropertyOptional({ description: 'Service IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  services?: number[];
}

export class UpdateTherapistDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Priority (1-10)' })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ description: 'Attributes', type: [TherapistAttributeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TherapistAttributeDto)
  attributes?: TherapistAttributeDto[];

  @ApiPropertyOptional({ description: 'Service IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  services?: number[];
}

