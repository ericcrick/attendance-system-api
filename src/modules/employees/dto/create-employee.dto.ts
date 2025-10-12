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
    @ApiProperty({
        description: 'Employee ID number',
        example: 'EMP-001',
    })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    employeeId: string;

    @ApiProperty({
        description: 'First name',
        example: 'John',
    })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    firstName: string;

    @ApiProperty({
        description: 'Last name',
        example: 'Doe',
    })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    lastName: string;

    @ApiPropertyOptional({
        description: 'Email address',
        example: 'john.doe@military.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '+1234567890',
    })
    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be in valid international format',
    })
    phone?: string;

    @ApiProperty({
        description: 'Department',
        example: 'Operations',
    })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    department: string;

    @ApiProperty({
        description: 'Job position',
        example: 'Security Officer',
    })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    position: string;

    @ApiPropertyOptional({
        description: 'RFID card identifier',
        example: 'RFID-12345',
    })
    @IsOptional()
    @IsString()
    rfidCardId?: string;

    @ApiPropertyOptional({
        description: '4-6 digit PIN code',
        example: '1234',
    })
    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(6)
    @Matches(/^\d+$/, { message: 'PIN must contain only numbers' })
    pinCode?: string;

    @ApiProperty({
        description: 'Assigned shift ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    shiftId: string;

    @ApiPropertyOptional({
        description: 'Employment status',
        enum: EmploymentStatus,
        default: EmploymentStatus.ACTIVE,
    })
    @IsOptional()
    @IsEnum(EmploymentStatus)
    status?: EmploymentStatus;

    @ApiPropertyOptional({
        description: 'Additional notes',
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    notes?: string;
}

export class UpdateEmployeeDto {
    @ApiPropertyOptional({
        description: 'First name',
        example: 'John',
    })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    firstName?: string;

    @ApiPropertyOptional({
        description: 'Last name',
        example: 'Doe',
    })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    lastName?: string;

    @ApiPropertyOptional({
        description: 'Email address',
        example: 'john.doe@military.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '+1234567890',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Department',
        example: 'Operations',
    })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional({
        description: 'Job position',
        example: 'Security Officer',
    })
    @IsOptional()
    @IsString()
    position?: string;

    @ApiPropertyOptional({
        description: 'RFID card identifier',
    })
    @IsOptional()
    @IsString()
    rfidCardId?: string;

    @ApiPropertyOptional({
        description: '4-6 digit PIN code',
    })
    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(6)
    pinCode?: string;

    @ApiPropertyOptional({
        description: 'Assigned shift ID',
    })
    @IsOptional()
    @IsUUID()
    shiftId?: string;

    @ApiPropertyOptional({
        description: 'Employment status',
        enum: EmploymentStatus,
    })
    @IsOptional()
    @IsEnum(EmploymentStatus)
    status?: EmploymentStatus;

    @ApiPropertyOptional({
        description: 'Additional notes',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class AssignRfidDto {
    @ApiProperty({
        description: 'RFID card identifier',
        example: 'RFID-12345',
    })
    @IsString()
    @MinLength(3)
    rfidCardId: string;
}

export class AssignPinDto {
    @ApiProperty({
        description: '4-6 digit PIN code',
        example: '1234',
    })
    @IsString()
    @MinLength(4)
    @MaxLength(6)
    @Matches(/^\d+$/, { message: 'PIN must contain only numbers' })
    pinCode: string;
}

export class AssignFaceEncodingDto {
    @ApiProperty({
        description: 'Face encoding data (array of 128 numbers)',
        example: [0.123, -0.456, /* ...128 numbers */],
    })
    @IsArray()
    faceEncoding: number[];
}