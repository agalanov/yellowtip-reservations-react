import { IsString, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GuestAttributeDto {
  @ApiProperty({ description: 'Attribute ID' })
  @IsInt()
  attributeId: number;

  @ApiPropertyOptional({ description: 'Attribute value' })
  @IsOptional()
  @IsString()
  value?: string;
}

export class CreateGuestDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Attributes', type: [GuestAttributeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestAttributeDto)
  attributes?: GuestAttributeDto[];
}

export class UpdateGuestDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Attributes', type: [GuestAttributeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestAttributeDto)
  attributes?: GuestAttributeDto[];
}

