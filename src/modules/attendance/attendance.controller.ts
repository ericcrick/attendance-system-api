// src/modules/attendance/attendance.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
    ClockInDto,
    ClockOutDto,
    VerifyEmployeeDto,
} from './dto/attendance.dto';
import { Attendance } from './entities/attendance.entity';
import { Public } from '../auth/decorators/public.decorator';
import { LeaderboardQueryDto } from './dto/leaderboard.dto';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Public()
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify employee identity using RFID, PIN, or Facial recognition',
    })
    @ApiResponse({
        status: 200,
        description: 'Employee verified successfully',
    })
    @ApiResponse({ status: 401, description: 'Authentication failed' })
    @ApiResponse({ status: 400, description: 'Invalid verification data' })
    verifyEmployee(@Body() verifyDto: VerifyEmployeeDto): Promise<any> {
        return this.attendanceService.verifyEmployee(verifyDto);
    }

    @Public()
    @Post('clock-in')
    @ApiOperation({ summary: 'Clock in an employee' })
    @ApiResponse({
        status: 201,
        description: 'Clocked in successfully',
        type: Attendance,
    })
    @ApiResponse({ status: 400, description: 'Already clocked in or invalid data' })
    @ApiResponse({ status: 401, description: 'Authentication failed' })
    clockIn(@Body() clockInDto: ClockInDto): Promise<Attendance> {
        return this.attendanceService.clockIn(clockInDto);
    }

    @Public()
    @Post('clock-out')
    @ApiOperation({ summary: 'Clock out an employee' })
    @ApiResponse({
        status: 200,
        description: 'Clocked out successfully',
        type: Attendance,
    })
    @ApiResponse({ status: 400, description: 'No active clock-in found' })
    @ApiResponse({ status: 401, description: 'Authentication failed' })
    clockOut(@Body() clockOutDto: ClockOutDto): Promise<Attendance> {
        return this.attendanceService.clockOut(clockOutDto);
    }

    @ApiBearerAuth('JWT-auth')
    @Get('today')
    @ApiOperation({ summary: 'Get all attendance records for today' })
    @ApiResponse({
        status: 200,
        description: 'Today\'s attendance records',
        type: [Attendance],
    })
    getTodayAttendance(): Promise<Attendance[]> {
        return this.attendanceService.getTodayAttendance();
    }

    @ApiBearerAuth('JWT-auth')
    @Get('currently-present')
    @ApiOperation({ summary: 'Get all employees currently present (clocked in but not out)' })
    @ApiResponse({
        status: 200,
        description: 'Currently present employees',
        type: [Attendance],
    })
    getCurrentlyPresent(): Promise<Attendance[]> {
        return this.attendanceService.getCurrentlyPresent();
    }

    // IMPORTANT: Move leaderboard route BEFORE :id route
    @ApiBearerAuth('JWT-auth')
    @Get('leaderboard')
    @ApiOperation({ summary: 'Get attendance leaderboard' })
    @ApiResponse({
        status: 200,
        description: 'Leaderboard data retrieved successfully',
    })
    async getLeaderboard(@Query() queryDto: LeaderboardQueryDto) {
        return this.attendanceService.getLeaderboard(queryDto);
    }

    @ApiBearerAuth('JWT-auth')
    @Get('report')
    @ApiOperation({ summary: 'Get attendance report with statistics' })
    @ApiQuery({ name: 'startDate', required: true, type: String })
    @ApiQuery({ name: 'endDate', required: true, type: String })
    @ApiQuery({ name: 'department', required: false, type: String })
    @ApiResponse({
        status: 200,
        description: 'Attendance report',
    })
    getAttendanceReport(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('department') department?: string,
    ): Promise<any> {
        return this.attendanceService.getAttendanceReport(
            new Date(startDate),
            new Date(endDate),
            department,
        );
    }

    @ApiBearerAuth('JWT-auth')
    @Get('employee/:employeeId')
    @ApiOperation({ summary: 'Get attendance records for a specific employee' })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiResponse({
        status: 200,
        description: 'Employee attendance records',
        type: [Attendance],
    })
    getEmployeeAttendance(
        @Param('employeeId') employeeId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<Attendance[]> {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.attendanceService.getEmployeeAttendance(employeeId, start, end);
    }

    // IMPORTANT: :id route must come LAST to avoid catching specific routes
    @ApiBearerAuth('JWT-auth')
    @Get(':id')
    @ApiOperation({ summary: 'Get attendance record by ID' })
    @ApiResponse({
        status: 200,
        description: 'Attendance record details',
        type: Attendance,
    })
    @ApiResponse({ status: 404, description: 'Attendance record not found' })
    getAttendanceById(@Param('id') id: string): Promise<Attendance> {
        return this.attendanceService.getAttendanceById(id);
    }
}