import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { ClockInDto, ClockOutDto, VerifyEmployeeDto } from './dto/attendance.dto';
import { EmployeesService } from '../employees/employees.service';
import { AuthMethod, AttendanceStatus } from '../../common/enums';
import { Employee } from '../employees/entities/employee.entity';
import { LeavesService } from '../leaves/leaves.service';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private readonly attendanceRepository: Repository<Attendance>,
        private readonly employeesService: EmployeesService,
        private readonly leavesService: LeavesService,
    ) { }

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
                employee = await this.employeesService.findByEmployeeId(verifyDto.employeeId);
                const isPinValid = await this.employeesService.verifyPin(
                    employee.id,
                    verifyDto.pinCode,
                );
                if (!isPinValid) {
                    throw new UnauthorizedException('Invalid PIN');
                }
                break;

            case AuthMethod.FACIAL:
                if (!verifyDto.faceEncoding) {
                    throw new BadRequestException('Face encoding is required');
                }
                employee = await this.findEmployeeByFaceEncoding(
                    verifyDto.faceEncoding,
                );
                if (!employee) {
                    throw new UnauthorizedException('Face not recognized');
                }
                break;

            default:
                throw new BadRequestException('Invalid authentication method');
        }

        if (employee.status !== 'ACTIVE') {
            throw new UnauthorizedException('Employee account is not active');
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

    // async clockIn(clockInDto: ClockInDto): Promise<Attendance> {
    //     const verifyDto: VerifyEmployeeDto = {
    //         method: clockInDto.method,
    //         rfidCardId: clockInDto.rfidCardId,
    //         employeeId: clockInDto.employeeId,
    //         pinCode: clockInDto.pinCode,
    //         faceEncoding: clockInDto.faceEncoding,
    //     };

    //     const { employee } = await this.verifyEmployee(verifyDto);

    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
    //     const tomorrow = new Date(today);
    //     tomorrow.setDate(tomorrow.getDate() + 1);

    //     // Check if employee has any attendance record for today
    //     const todayAttendance = await this.attendanceRepository.findOne({
    //         where: {
    //             employeeId: employee.id,
    //             clockInTime: Between(today, tomorrow),
    //         },
    //         order: {
    //             clockInTime: 'DESC',
    //         },
    //     });

    //     if (todayAttendance) {
    //         // If they haven't clocked out yet
    //         if (!todayAttendance.clockOutTime) {
    //             throw new BadRequestException(
    //                 'You have already clocked in today and have not clocked out yet. Please clock out before clocking in again.',
    //             );
    //         }
    //         // If they have already completed a full cycle (clocked in and out)
    //         else {
    //             throw new BadRequestException(
    //                 'You have already completed your attendance for today. You clocked in and out successfully.',
    //             );
    //         }
    //     }

    //     const fullEmployee = await this.employeesService.findOne(employee.id);

    //     const clockInTime = new Date();
    //     const status = fullEmployee.shift.isLateArrival(clockInTime)
    //         ? AttendanceStatus.LATE
    //         : AttendanceStatus.ON_TIME;

    //     const attendance = this.attendanceRepository.create({
    //         employeeId: employee.id,
    //         clockInTime,
    //         clockInMethod: clockInDto.method,
    //         clockInPhoto: clockInDto.photoUrl,
    //         clockInLocation: clockInDto.location,
    //         status,
    //     });

    //     return this.attendanceRepository.save(attendance);
    // }

    // async clockOut(clockOutDto: ClockOutDto): Promise<Attendance> {
    //     const verifyDto: VerifyEmployeeDto = {
    //         method: clockOutDto.method,
    //         rfidCardId: clockOutDto.rfidCardId,
    //         employeeId: clockOutDto.employeeId,
    //         pinCode: clockOutDto.pinCode,
    //         faceEncoding: clockOutDto.faceEncoding,
    //     };

    //     const { employee } = await this.verifyEmployee(verifyDto);

    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
    //     const tomorrow = new Date(today);
    //     tomorrow.setDate(tomorrow.getDate() + 1);

    //     // First, check if there's an already completed attendance (clocked in and out)
    //     const completedAttendance = await this.attendanceRepository.findOne({
    //         where: {
    //             employeeId: employee.id,
    //             clockInTime: Between(today, tomorrow),
    //         },
    //         order: {
    //             clockInTime: 'DESC',
    //         },
    //     });

    //     if (completedAttendance && completedAttendance.clockOutTime) {
    //         const clockOutTimeFormatted = completedAttendance.clockOutTime.toLocaleTimeString('en-US', {
    //             hour: '2-digit',
    //             minute: '2-digit',
    //             hour12: true,
    //         });
    //         throw new BadRequestException(
    //             `You have already clocked out today at ${clockOutTimeFormatted}. You cannot clock out again.`,
    //         );
    //     }

    //     // Find active clock-in record (not clocked out yet)
    //     const attendance = await this.attendanceRepository.findOne({
    //         where: {
    //             employeeId: employee.id,
    //             clockInTime: Between(today, tomorrow),
    //             clockOutTime: null as any,
    //         },
    //     });

    //     if (!attendance) {
    //         throw new BadRequestException(
    //             'No active clock-in record found for today. Please clock in first before clocking out.',
    //         );
    //     }

    //     // Update attendance record
    //     attendance.clockOutTime = new Date();
    //     attendance.clockOutMethod = clockOutDto.method;
    //     attendance.clockOutPhoto = clockOutDto.photoUrl;
    //     attendance.clockOutLocation = clockOutDto.location;
    //     attendance.notes = clockOutDto.notes;

    //     // Calculate work duration
    //     attendance.calculateWorkDuration();

    //     return this.attendanceRepository.save(attendance);
    // }





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
}