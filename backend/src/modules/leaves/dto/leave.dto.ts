// src/modules/leaves/dto/leave.dto.ts
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEnum, IsDateString, IsInt, Min, IsOptional, IsUUID } from 'class-validator';
import { LeaveType, LeaveStatus } from '../entities/leave.entity';

export class CreateLeaveDto {
  @ApiProperty({
    description: 'Employee ID',
    example: 'EMP-001',
  })
  @IsString()
  employeeId: string;

  @ApiProperty({
    description: 'Leave type',
    enum: LeaveType,
    example: LeaveType.ANNUAL,
  })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2025-10-20',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date (YYYY-MM-DD)',
    example: '2025-10-25',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Number of leave days',
    example: 5,
  })
  @IsInt()
  @Min(1)
  daysCount: number;

  @ApiProperty({
    description: 'Reason for leave',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Attachment URL',
  })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {}

export class ReviewLeaveDto {
  @ApiProperty({
    description: 'Leave status',
    enum: LeaveStatus,
    example: LeaveStatus.APPROVED,
  })
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @ApiPropertyOptional({
    description: 'Review comments',
  })
  @IsOptional()
  @IsString()
  reviewComments?: string;

  @ApiProperty({
    description: 'Reviewer ID',
  })
  @IsUUID()
  reviewedBy: string;
}