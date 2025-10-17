// src/modules/attendance/dto/attendance.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { AuthMethod } from '../../../common/enums';

export class ClockInDto {
  @ApiProperty({ description: 'Employee ID', example: 'EMP-001' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Authentication method', enum: AuthMethod })
  @IsEnum(AuthMethod)
  method: AuthMethod;

  @ApiPropertyOptional({ description: 'RFID card ID' })
  @IsOptional()
  @IsString()
  rfidCardId?: string;

  @ApiPropertyOptional({ description: 'PIN code' })
  @IsOptional()
  @IsString()
  pinCode?: string;

  @ApiPropertyOptional({ description: 'Face encoding data' })
  @IsOptional()
  @IsArray()
  faceEncoding?: number[];

  @ApiPropertyOptional({ description: 'Fingerprint template (Base64)' })
  @IsOptional()
  @IsString()
  fingerprintTemplate?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class ClockOutDto {
  @ApiProperty({ description: 'Employee ID', example: 'EMP-001' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Authentication method', enum: AuthMethod })
  @IsEnum(AuthMethod)
  method: AuthMethod;

  @ApiPropertyOptional({ description: 'RFID card ID' })
  @IsOptional()
  @IsString()
  rfidCardId?: string;

  @ApiPropertyOptional({ description: 'PIN code' })
  @IsOptional()
  @IsString()
  pinCode?: string;

  @ApiPropertyOptional({ description: 'Face encoding data' })
  @IsOptional()
  @IsArray()
  faceEncoding?: number[];

  @ApiPropertyOptional({ description: 'Fingerprint template (Base64)' })
  @IsOptional()
  @IsString()
  fingerprintTemplate?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class VerifyEmployeeDto {
  @ApiProperty({ description: 'Authentication method', enum: AuthMethod })
  @IsEnum(AuthMethod)
  method: AuthMethod;

  @ApiPropertyOptional({ description: 'RFID card ID' })
  @IsOptional()
  @IsString()
  rfidCardId?: string;

  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'PIN code' })
  @IsOptional()
  @IsString()
  pinCode?: string;

  @ApiPropertyOptional({ description: 'Face encoding' })
  @IsOptional()
  @IsArray()
  faceEncoding?: number[];

  @ApiPropertyOptional({ description: 'Fingerprint template (Base64)' })
  @IsOptional()
  @IsString()
  fingerprintTemplate?: string;
}