// src/modules/employees/dto/create-employee.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsArray,
} from 'class-validator';
import { EmploymentStatus } from '../../../common/enums';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Employee ID', example: 'EMP-001' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Department name' })
  @IsString()
  department: string;

  @ApiPropertyOptional({ description: 'Department ID (UUID)' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;

  @ApiProperty({ description: 'Position/Job title' })
  @IsString()
  position: string;

  @ApiPropertyOptional({ description: 'RFID card ID' })
  @IsOptional()
  @IsString()
  rfidCardId?: string;

  @ApiPropertyOptional({ description: 'PIN code' })
  @IsOptional()
  @IsString()
  pinCode?: string;

  @ApiProperty({ description: 'Shift ID' })
  @IsUUID()
  shiftId: string;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Department ID (UUID)' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Job position' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'RFID card identifier' })
  @IsOptional()
  @IsString()
  rfidCardId?: string;

  @ApiPropertyOptional({ description: '4-6 digit PIN code' })
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(6)
  pinCode?: string;

  @ApiPropertyOptional({ description: 'Assigned shift ID' })
  @IsOptional()
  @IsUUID()
  shiftId?: string;

  @ApiPropertyOptional({ description: 'Employment status', enum: EmploymentStatus })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignRfidDto {
  @ApiProperty({ description: 'RFID card identifier', example: 'RFID-12345' })
  @IsString()
  @MinLength(3)
  rfidCardId: string;
}

export class AssignPinDto {
  @ApiProperty({ description: '4-6 digit PIN code', example: '1234' })
  @IsString()
  @MinLength(4)
  @MaxLength(6)
  @Matches(/^\d+$/, { message: 'PIN must contain only numbers' })
  pinCode: string;
}

export class AssignFaceEncodingDto {
  @ApiProperty({
    description: 'Face encoding data (array of 128 numbers)',
    example: [0.123, -0.456],
  })
  @IsArray()
  faceEncoding: number[];
}

export class AssignFingerprintDto {
  @ApiProperty({
    description: 'Fingerprint template data (Base64 encoded string from ZKTeco device)',
    example: 'AAAAAAAAAAAAA...',
  })
  @IsString()
  fingerprintTemplate: string;

  @ApiPropertyOptional({
    description: 'Device user ID for synchronization',
    example: '1001',
  })
  @IsOptional()
  @IsString()
  fingerprintDeviceId?: string;
}