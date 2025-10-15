// src/types/leaderboard.ts
export enum TimePeriod {
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
    CUSTOM = 'CUSTOM',
}

export enum CustomPeriod {
    LAST_7_DAYS = 'LAST_7_DAYS',
    LAST_14_DAYS = 'LAST_14_DAYS',
    LAST_30_DAYS = 'LAST_30_DAYS',
    LAST_60_DAYS = 'LAST_60_DAYS',
    LAST_90_DAYS = 'LAST_90_DAYS',
    CUSTOM_RANGE = 'CUSTOM_RANGE',
    YEARLY = 'YEARLY',
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

export interface LeaderboardStatistics {
    averageAttendanceRate: number;
    averageOnTimeRate: number;
    averageCompletionRate: number;
    totalEmployees: number;
    excellentPerformers: number;
    goodPerformers: number;
    poorPerformers: number;
}

export interface LeaderboardPeriod {
    startDate: string;
    endDate: string;
}

export interface LeaderboardData {
    topPerformers: EmployeePerformance[];
    bottomPerformers: EmployeePerformance[];
    period: LeaderboardPeriod;
    statistics: LeaderboardStatistics;
}