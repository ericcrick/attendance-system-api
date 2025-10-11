import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
    Min,
    Max,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

export class CreateShiftDto {
    @ApiProperty({
        description: 'Shift name',
        example: 'Morning Shift',
    })
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'Shift start time in HH:MM format',
        example: '08:00',
    })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Start time must be in HH:MM format',
    })
    startTime: string;

    @ApiProperty({
        description: 'Shift end time in HH:MM format',
        example: '16:00',
    })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'End time must be in HH:MM format',
    })
    endTime: string;

    @ApiPropertyOptional({
        description: 'Grace period for late arrival in minutes',
        example: 15,
        default: 15,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(60)
    gracePeriodMinutes?: number;

    @ApiPropertyOptional({
        description: 'Shift description',
        example: 'Standard morning shift for operations team',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({
        description: 'Shift color code for UI (hex format)',
        example: '#3B82F6',
    })
    @IsOptional()
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, {
        message: 'Color code must be a valid hex color',
    })
    colorCode?: string;

    @ApiPropertyOptional({
        description: 'Whether shift is active',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateShiftDto {
    @ApiPropertyOptional({
        description: 'Shift name',
        example: 'Morning Shift',
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({
        description: 'Shift start time in HH:MM format',
        example: '08:00',
    })
    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    startTime?: string;

    @ApiPropertyOptional({
        description: 'Shift end time in HH:MM format',
        example: '16:00',
    })
    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    endTime?: string;

    @ApiPropertyOptional({
        description: 'Grace period for late arrival in minutes',
        example: 15,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(60)
    gracePeriodMinutes?: number;

    @ApiPropertyOptional({
        description: 'Shift description',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({
        description: 'Shift color code for UI (hex format)',
        example: '#3B82F6',
    })
    @IsOptional()
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    colorCode?: string;

    @ApiPropertyOptional({
        description: 'Whether shift is active',
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}