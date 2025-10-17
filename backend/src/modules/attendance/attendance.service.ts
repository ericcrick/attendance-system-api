//backend/src/modules/attendance/attendance.service.ts

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { ClockInDto, ClockOutDto, VerifyEmployeeDto } from './dto/attendance.dto';
import { EmployeesService } from '../employees/employees.service';
import { AuthMethod, AttendanceStatus, EmploymentStatus } from '../../common/enums';
import { Employee } from '../employees/entities/employee.entity';
import { LeavesService } from '../leaves/leaves.service';
import { EmployeePerformance, LeaderboardQueryDto, TimePeriod } from './dto/leaderboard.dto';

@Injectable()
export class AttendanceService {
    private readonly logger = new Logger(AttendanceService.name);
    constructor(
        @InjectRepository(Attendance)
        private readonly attendanceRepository: Repository<Attendance>,
        private readonly employeesService: EmployeesService,
        private readonly leavesService: LeavesService,

    ) { }


    async clockIn(clockInDto: ClockInDto): Promise<Attendance> {
        const verifyDto: VerifyEmployeeDto = {
            method: clockInDto.method,
            rfidCardId: clockInDto.rfidCardId,
            employeeId: clockInDto.employeeId,
            pinCode: clockInDto.pinCode,
            faceEncoding: clockInDto.faceEncoding,
        };

        const { employee } = await this.verifyEmployee(verifyDto);

        // Check if employee is on approved leave today
        const today = new Date();
        const isOnLeave = await this.leavesService.isEmployeeOnLeave(
            employee.id,
            today,
        );

        if (isOnLeave) {
            throw new BadRequestException(
                'You cannot clock in today because you have an approved leave for this date. Please contact HR if this is incorrect.',
            );
        }

        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if employee has any attendance record for today
        const todayAttendance = await this.attendanceRepository.findOne({
            where: {
                employeeId: employee.id,
                clockInTime: Between(today, tomorrow),
            },
            order: {
                clockInTime: 'DESC',
            },
        });

        if (todayAttendance) {
            if (!todayAttendance.clockOutTime) {
                throw new BadRequestException(
                    'You have already clocked in today and have not clocked out yet. Please clock out before clocking in again.',
                );
            } else {
                throw new BadRequestException(
                    'You have already completed your attendance for today. You clocked in and out successfully.',
                );
            }
        }

        const fullEmployee = await this.employeesService.findOne(employee.id);

        const clockInTime = new Date();
        const status = fullEmployee.shift.isLateArrival(clockInTime)
            ? AttendanceStatus.LATE
            : AttendanceStatus.ON_TIME;

        const attendance = this.attendanceRepository.create({
            employeeId: employee.id,
            clockInTime,
            clockInMethod: clockInDto.method,
            clockInPhoto: clockInDto.photoUrl,
            clockInLocation: clockInDto.location,
            status,
            shiftCompleted: false,
            overtimeMinutes: 0,
        });

        return this.attendanceRepository.save(attendance);
    }

    async clockOut(clockOutDto: ClockOutDto): Promise<Attendance> {
        const verifyDto: VerifyEmployeeDto = {
            method: clockOutDto.method,
            rfidCardId: clockOutDto.rfidCardId,
            employeeId: clockOutDto.employeeId,
            pinCode: clockOutDto.pinCode,
            faceEncoding: clockOutDto.faceEncoding,
        };

        const { employee } = await this.verifyEmployee(verifyDto);

        // Check if employee is on approved leave today
        const today = new Date();
        const isOnLeave = await this.leavesService.isEmployeeOnLeave(
            employee.id,
            today,
        );

        if (isOnLeave) {
            throw new BadRequestException(
                'You cannot clock out today because you have an approved leave for this date. Please contact HR if this is incorrect.',
            );
        }

        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check for already completed attendance
        const completedAttendance = await this.attendanceRepository.findOne({
            where: {
                employeeId: employee.id,
                clockInTime: Between(today, tomorrow),
            },
            order: {
                clockInTime: 'DESC',
            },
        });

        if (completedAttendance && completedAttendance.clockOutTime) {
            const clockOutTimeFormatted =
                completedAttendance.clockOutTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                });
            throw new BadRequestException(
                `You have already clocked out today at ${clockOutTimeFormatted}. You cannot clock out again.`,
            );
        }

        // Find active clock-in record
        const attendance = await this.attendanceRepository.findOne({
            where: {
                employeeId: employee.id,
                clockInTime: Between(today, tomorrow),
                clockOutTime: null as any,
            },
        });

        if (!attendance) {
            throw new BadRequestException(
                'No active clock-in record found for today. Please clock in first before clocking out.',
            );
        }

        // Update attendance record
        attendance.clockOutTime = new Date();
        attendance.clockOutMethod = clockOutDto.method;
        attendance.clockOutPhoto = clockOutDto.photoUrl;
        attendance.clockOutLocation = clockOutDto.location;
        attendance.notes = clockOutDto.notes;

        // Calculate work duration, overtime, and shift completion
        attendance.calculateWorkDuration();

        return this.attendanceRepository.save(attendance);
    }

    async getTodayAttendance(): Promise<Attendance[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.attendanceRepository.find({
            where: {
                clockInTime: Between(today, tomorrow),
            },
            order: {
                clockInTime: 'DESC',
            },
        });
    }

    async getEmployeeAttendance(
        employeeId: string,
        startDate?: Date,
        endDate?: Date,
    ): Promise<Attendance[]> {
        const query: any = {
            employeeId,
        };

        if (startDate && endDate) {
            query.clockInTime = Between(startDate, endDate);
        }

        return this.attendanceRepository.find({
            where: query,
            order: {
                clockInTime: 'DESC',
            },
        });
    }

    async getAttendanceById(id: string): Promise<Attendance> {
        const attendance = await this.attendanceRepository.findOne({
            where: { id },
        });

        if (!attendance) {
            throw new NotFoundException(`Attendance record with ID "${id}" not found`);
        }

        return attendance;
    }

    async getAttendanceReport(
        startDate: Date,
        endDate: Date,
        department?: string,
    ): Promise<any> {
        let query = this.attendanceRepository
            .createQueryBuilder('attendance')
            .leftJoinAndSelect('attendance.employee', 'employee')
            .leftJoinAndSelect('employee.shift', 'shift')
            .where('attendance.clockInTime BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });

        if (department) {
            query = query.andWhere('employee.department = :department', {
                department,
            });
        }

        const attendances = await query
            .orderBy('attendance.clockInTime', 'DESC')
            .getMany();

        const totalRecords = attendances.length;
        const onTime = attendances.filter(
            (a) => a.status === AttendanceStatus.ON_TIME,
        ).length;
        const late = attendances.filter(
            (a) => a.status === AttendanceStatus.LATE,
        ).length;
        const earlyDeparture = attendances.filter(
            (a) => a.status === AttendanceStatus.EARLY_DEPARTURE,
        ).length;

        return {
            attendances,
            statistics: {
                totalRecords,
                onTime,
                late,
                earlyDeparture,
                onTimePercentage: totalRecords > 0 ? (onTime / totalRecords) * 100 : 0,
            },
        };
    }

    async getCurrentlyPresent(): Promise<Attendance[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.attendanceRepository.find({
            where: {
                clockInTime: Between(today, tomorrow),
                clockOutTime: null as any,
            },
            order: {
                clockInTime: 'DESC',
            },
        });
    }

    private async findEmployeeByFaceEncoding(
        faceEncoding: number[],
    ): Promise<any> {
        const employees = await this.employeesService.findAll(false);
        const employeesWithFaces = employees.filter((emp) => emp.faceEncoding);

        let bestMatch: Employee | null = null;
        let highestSimilarity = 0;
        const threshold = 0.6;

        for (const employee of employeesWithFaces) {
            const similarity = this.calculateCosineSimilarity(
                faceEncoding,
                employee.faceEncoding,
            );

            if (similarity > highestSimilarity && similarity > threshold) {
                highestSimilarity = similarity;
                bestMatch = employee;
            }
        }

        return bestMatch;
    }

    private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
        if (vec1.length !== vec2.length) {
            return 0;
        }

        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;

        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            magnitude1 += vec1[i] * vec1[i];
            magnitude2 += vec2[i] * vec2[i];
        }

        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);

        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }

        return dotProduct / (magnitude1 * magnitude2);
    }





    async getLeaderboard(queryDto: LeaderboardQueryDto): Promise<{
        topPerformers: EmployeePerformance[];
        bottomPerformers: EmployeePerformance[];
        period: { startDate: Date; endDate: Date };
        statistics: any;
    }> {
        const { startDate, endDate } = this.calculateDateRange(queryDto);

        // Get all active employees
        const employees = await this.employeesService.findAll(false);

        // Calculate performance for each employee
        const performances: EmployeePerformance[] = await Promise.all(
            employees.map((employee) =>
                this.calculateEmployeePerformance(employee, startDate, endDate),
            ),
        );

        // Filter out employees with no attendance data
        const validPerformances = performances.filter((p) => p.totalDays > 0);

        // Sort by score (descending)
        validPerformances.sort((a, b) => b.score - a.score);

        // Assign ranks
        validPerformances.forEach((perf, index) => {
            perf.rank = index + 1;
        });

        // Get top 10 and bottom 10
        const topPerformers = validPerformances.slice(0, 10);
        const bottomPerformers = validPerformances
            .slice(-10)
            .reverse();

        // Calculate overall statistics
        const statistics = this.calculateOverallStatistics(validPerformances);

        return {
            topPerformers,
            bottomPerformers,
            period: { startDate, endDate },
            statistics,
        };
    }



    private calculateWorkingDays(startDate: Date, endDate: Date): number {
        let count = 0;
        const current = new Date(startDate);

        while (current <= endDate) {
            // Count ALL days since staff work weekends too
            count++;
            current.setDate(current.getDate() + 1);
        }

        return count;
    }

    private calculateDateRange(queryDto: LeaderboardQueryDto): {
        startDate: Date;
        endDate: Date;
    } {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = new Date(now);
        endDate.setHours(23, 59, 59, 999);

        if (queryDto.period === TimePeriod.CUSTOM && queryDto.startDate && queryDto.endDate) {
            startDate = new Date(queryDto.startDate);
            endDate = new Date(queryDto.endDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            switch (queryDto.period) {
                case TimePeriod.WEEKLY:
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 7); // Last 7 days
                    startDate.setHours(0, 0, 0, 0);
                    break;

                case TimePeriod.MONTHLY:
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 30); // Last 30 days
                    startDate.setHours(0, 0, 0, 0);
                    break;

                case TimePeriod.YEARLY:
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 365); // Last 365 days
                    startDate.setHours(0, 0, 0, 0);
                    break;

                default:
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 30); // Default to last 30 days
                    startDate.setHours(0, 0, 0, 0);
            }
        }

        return { startDate, endDate };
    }



    private async calculateEmployeePerformance(
        employee: any,
        startDate: Date,
        endDate: Date,
    ): Promise<EmployeePerformance> {
        // Get attendance records for the period
        const attendances = await this.attendanceRepository.find({
            where: {
                employeeId: employee.id,
                clockInTime: Between(startDate, endDate),
            },
            order: {
                clockInTime: 'DESC',
            },
        });

        // Calculate total expected working days (excluding weekends)
        const totalDays = this.calculateWorkingDays(startDate, endDate);
        const attendedDays = attendances.length;
        const absentDays = totalDays - attendedDays;

        // Calculate various metrics
        const lateDays = attendances.filter((a) => a.status === AttendanceStatus.LATE).length;
        const onTimeDays = attendances.filter((a) => a.status === AttendanceStatus.ON_TIME).length;
        const completedShifts = attendances.filter((a) => a.shiftCompleted).length;
        const incompleteShifts = attendances.filter((a) => !a.clockOutTime || !a.shiftCompleted).length;

        // Calculate total overtime and work hours
        const totalOvertimeMinutes = attendances.reduce(
            (sum, a) => sum + (a.overtimeMinutes || 0),
            0,
        );
        const totalWorkMinutes = attendances.reduce(
            (sum, a) => sum + (a.workDurationMinutes || 0),
            0,
        );

        // Calculate rates
        const attendanceRate = totalDays > 0 ? (attendedDays / totalDays) * 100 : 0;
        const onTimeRate = attendedDays > 0 ? (onTimeDays / attendedDays) * 100 : 0;
        const completionRate = attendedDays > 0 ? (completedShifts / attendedDays) * 100 : 0;
        const averageWorkHours = attendedDays > 0 ? totalWorkMinutes / 60 / attendedDays : 0;

        // Calculate performance score (weighted)
        const score = this.calculatePerformanceScore({
            attendanceRate,
            onTimeRate,
            completionRate,
            overtimeHours: totalOvertimeMinutes / 60,
        });

        return {
            employeeId: employee.employeeId,
            employeeName: employee.fullName,
            department: employee.department,
            position: employee.position,
            photoUrl: employee.photoUrl,
            totalDays,
            attendedDays,
            absentDays,
            lateDays,
            onTimeDays,
            overtimeHours: Math.round((totalOvertimeMinutes / 60) * 10) / 10,
            completedShifts,
            incompleteShifts,
            attendanceRate: Math.round(attendanceRate * 10) / 10,
            onTimeRate: Math.round(onTimeRate * 10) / 10,
            completionRate: Math.round(completionRate * 10) / 10,
            averageWorkHours: Math.round(averageWorkHours * 10) / 10,
            totalWorkMinutes,
            score: Math.round(score * 10) / 10,
            rank: 0,
            trend: 'stable',
        };
    }


    private calculatePerformanceScore(metrics: {
        attendanceRate: number;
        onTimeRate: number;
        completionRate: number;
        overtimeHours: number;
    }): number {
        // Weighted scoring system
        const weights = {
            attendance: 0.4, // 40% weight
            onTime: 0.3, // 30% weight
            completion: 0.25, // 25% weight
            overtime: 0.05, // 5% weight (bonus)
        };

        let score = 0;

        // Attendance rate contribution
        score += metrics.attendanceRate * weights.attendance;

        // On-time rate contribution
        score += metrics.onTimeRate * weights.onTime;

        // Completion rate contribution
        score += metrics.completionRate * weights.completion;

        // Overtime bonus (capped at 5 points)
        const overtimeBonus = Math.min(metrics.overtimeHours * 0.5, 5);
        score += overtimeBonus * weights.overtime * 100;

        return Math.min(score, 100); // Cap at 100
    }

    private calculateOverallStatistics(performances: EmployeePerformance[]): any {
        if (performances.length === 0) {
            return {
                averageAttendanceRate: 0,
                averageOnTimeRate: 0,
                averageCompletionRate: 0,
                totalEmployees: 0,
                excellentPerformers: 0,
                goodPerformers: 0,
                poorPerformers: 0,
            };
        }

        const avgAttendance =
            performances.reduce((sum, p) => sum + p.attendanceRate, 0) /
            performances.length;
        const avgOnTime =
            performances.reduce((sum, p) => sum + p.onTimeRate, 0) /
            performances.length;
        const avgCompletion =
            performances.reduce((sum, p) => sum + p.completionRate, 0) /
            performances.length;

        // Categorize performers
        const excellent = performances.filter((p) => p.score >= 90).length;
        const good = performances.filter((p) => p.score >= 70 && p.score < 90).length;
        const poor = performances.filter((p) => p.score < 70).length;

        return {
            averageAttendanceRate: Math.round(avgAttendance * 10) / 10,
            averageOnTimeRate: Math.round(avgOnTime * 10) / 10,
            averageCompletionRate: Math.round(avgCompletion * 10) / 10,
            totalEmployees: performances.length,
            excellentPerformers: excellent,
            goodPerformers: good,
            poorPerformers: poor,
        };
    }


    async verifyEmployee(verifyDto: VerifyEmployeeDto): Promise<any> {
        let employee: Employee | null = null;

        switch (verifyDto.method) {
            case AuthMethod.RFID:
                if (!verifyDto.rfidCardId) {
                    throw new BadRequestException('RFID card ID is required');
                }
                employee = await this.employeesService.findByRfidCard(
                    verifyDto.rfidCardId,
                );
                if (!employee) {
                    throw new UnauthorizedException('RFID card not recognized');
                }
                break;

            case AuthMethod.PIN:
                if (!verifyDto.employeeId || !verifyDto.pinCode) {
                    throw new BadRequestException('Employee ID and PIN are required');
                }
                employee = await this.employeesService.findByEmployeeId(
                    verifyDto.employeeId,
                );
                const isPinValid = await this.employeesService.verifyPin(
                    employee.id,
                    verifyDto.pinCode,
                );
                if (!isPinValid) {
                    throw new UnauthorizedException('Invalid PIN code');
                }
                break;

            case AuthMethod.FACIAL:
                if (!verifyDto.faceEncoding) {
                    throw new BadRequestException('Face encoding is required');
                }
                employee = await this.findEmployeeByFaceEncoding(verifyDto.faceEncoding);
                if (!employee) {
                    throw new UnauthorizedException('Face not recognized');
                }
                break;

            case AuthMethod.FINGERPRINT:
                if (!verifyDto.fingerprintTemplate) {
                    throw new BadRequestException('Fingerprint template is required');
                }

                this.logger.log(
                    `🔐 Attempting fingerprint verification (template length: ${verifyDto.fingerprintTemplate.length})`,
                );

                employee = await this.employeesService.verifyFingerprint(
                    verifyDto.fingerprintTemplate,
                );

                if (!employee) {
                    this.logger.warn('❌ Fingerprint verification failed - no match found');
                    throw new UnauthorizedException(
                        'Fingerprint not recognized. Please try again or use an alternate method.',
                    );
                }

                this.logger.log(
                    `✅ Fingerprint verified: ${employee.fullName} (${employee.employeeId})`,
                );
                break;

            default:
                throw new BadRequestException('Invalid authentication method');
        }

        // Check employee status
        if (employee.status !== EmploymentStatus.ACTIVE) {
            throw new UnauthorizedException(
                `Employee account is ${employee.status.toLowerCase()}. Please contact HR.`,
            );
        }

        return {
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                fullName: employee.fullName,
                department: employee.department,
                position: employee.position,
                shift: employee.shift,
            },
            verified: true,
        };
    }
}

