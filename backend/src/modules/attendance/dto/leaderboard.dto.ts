// src/modules/attendance/dto/leaderboard.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum TimePeriod {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export class LeaderboardQueryDto {
  @ApiProperty({ enum: TimePeriod, default: TimePeriod.MONTHLY })
  @IsEnum(TimePeriod)
  @IsOptional()
  period?: TimePeriod;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  department?: string;
}

export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  photoUrl?: string;
  totalDays: number;
  attendedDays: number;
  absentDays: number;
  lateDays: number;
  onTimeDays: number;
  overtimeHours: number;
  completedShifts: number;
  incompleteShifts: number;
  attendanceRate: number;
  onTimeRate: number;
  completionRate: number;
  averageWorkHours: number;
  totalWorkMinutes: number;
  score: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}