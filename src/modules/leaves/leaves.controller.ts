// src/modules/leaves/leaves.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto, UpdateLeaveDto, ReviewLeaveDto } from './dto/leave.dto';
import { Leave, LeaveStatus } from './entities/leave.entity';

@ApiTags('leaves')
@ApiBearerAuth('JWT-auth')
@Controller('leaves')
export class LeavesController {
    constructor(private readonly leavesService: LeavesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new leave request' })
    @ApiResponse({
        status: 201,
        description: 'Leave request created successfully',
        type: Leave,
    })
    create(@Body() createLeaveDto: CreateLeaveDto): Promise<Leave> {
        return this.leavesService.create(createLeaveDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all leave requests' })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, enum: LeaveStatus })
    @ApiQuery({ name: 'employeeId', required: false, type: String })
    @ApiResponse({
        status: 200,
        description: 'List of leave requests',
        type: [Leave],
    })
    findAll(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('status') status?: LeaveStatus,
        @Query('employeeId') employeeId?: string,
    ): Promise<Leave[]> {
        return this.leavesService.findAll(startDate, endDate, status, employeeId);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get leave statistics' })
    @ApiResponse({
        status: 200,
        description: 'Leave statistics',
    })
    getStatistics(): Promise<any> {
        return this.leavesService.getStatistics();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get leave by ID' })
    @ApiResponse({
        status: 200,
        description: 'Leave details',
        type: Leave,
    })
    findOne(@Param('id') id: string): Promise<Leave> {
        return this.leavesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update leave request' })
    @ApiResponse({
        status: 200,
        description: 'Leave updated successfully',
        type: Leave,
    })
    update(
        @Param('id') id: string,
        @Body() updateLeaveDto: UpdateLeaveDto,
    ): Promise<Leave> {
        return this.leavesService.update(id, updateLeaveDto);
    }

    @Patch(':id/review')
    @ApiOperation({ summary: 'Approve or reject leave request' })
    @ApiResponse({
        status: 200,
        description: 'Leave reviewed successfully',
        type: Leave,
    })
    review(
        @Param('id') id: string,
        @Body() reviewLeaveDto: ReviewLeaveDto,
    ): Promise<Leave> {
        return this.leavesService.review(id, reviewLeaveDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete leave request' })
    @ApiResponse({
        status: 200,
        description: 'Leave deleted successfully',
    })
    remove(@Param('id') id: string): Promise<void> {
        return this.leavesService.remove(id);
    }
}