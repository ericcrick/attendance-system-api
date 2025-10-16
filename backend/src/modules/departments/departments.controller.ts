// src/modules/departments/departments.controller.ts
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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { Department } from './entities/department.entity';

@ApiTags('departments')
@ApiBearerAuth('JWT-auth')
@Controller('departments')
export class DepartmentsController {
    constructor(private readonly departmentsService: DepartmentsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new department' })
    @ApiResponse({
        status: 201,
        description: 'Department created successfully',
        type: Department,
    })
    create(@Body() createDepartmentDto: CreateDepartmentDto): Promise<Department> {
        return this.departmentsService.create(createDepartmentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all departments' })
    @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
    @ApiResponse({
        status: 200,
        description: 'List of departments',
        type: [Department],
    })
    findAll(
        @Query('includeInactive') includeInactive?: boolean,
    ): Promise<Department[]> {
        return this.departmentsService.findAll(includeInactive);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get department statistics' })
    @ApiResponse({
        status: 200,
        description: 'Department statistics',
    })
    getStatistics(): Promise<any> {
        return this.departmentsService.getStatistics();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get department by ID' })
    @ApiResponse({
        status: 200,
        description: 'Department details',
        type: Department,
    })
    findOne(@Param('id') id: string): Promise<Department> {
        return this.departmentsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update department' })
    @ApiResponse({
        status: 200,
        description: 'Department updated successfully',
        type: Department,
    })
    update(
        @Param('id') id: string,
        @Body() updateDepartmentDto: UpdateDepartmentDto,
    ): Promise<Department> {
        return this.departmentsService.update(id, updateDepartmentDto);
    }

    @Patch(':id/toggle')
    @ApiOperation({ summary: 'Toggle department active status' })
    @ApiResponse({
        status: 200,
        description: 'Department status toggled',
        type: Department,
    })
    toggle(@Param('id') id: string): Promise<Department> {
        return this.departmentsService.toggle(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete department' })
    @ApiResponse({
        status: 200,
        description: 'Department deleted successfully',
    })
    remove(@Param('id') id: string): Promise<void> {
        return this.departmentsService.remove(id);
    }
}