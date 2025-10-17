// src/modules/employees/employees.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { EmployeesService } from './employees.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  AssignRfidDto,
  AssignPinDto,
  AssignFaceEncodingDto,
  AssignFingerprintDto,
} from './dto/create-employee.dto';
import { Employee } from './entities/employee.entity';

@ApiTags('employees')
@ApiBearerAuth('JWT-auth')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    type: Employee,
  })
  @ApiResponse({ status: 409, description: 'Employee ID or email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid employee data' })
  create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive employees',
  })
  @ApiResponse({
    status: 200,
    description: 'List of employees',
    type: [Employee],
  })
  findAll(
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<Employee[]> {
    return this.employeesService.findAll(includeInactive);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get employee statistics' })
  @ApiResponse({
    status: 200,
    description: 'Employee statistics',
  })
  getStatistics() {
    return this.employeesService.getStatistics();
  }

  @Get('department/:department')
  @ApiOperation({ summary: 'Get employees by department' })
  @ApiResponse({
    status: 200,
    description: 'List of employees in department',
    type: [Employee],
  })
  findByDepartment(@Param('department') department: string): Promise<Employee[]> {
    return this.employeesService.findByDepartment(department);
  }

  @Get('shift/:shiftId')
  @ApiOperation({ summary: 'Get employees by shift' })
  @ApiResponse({
    status: 200,
    description: 'List of employees in shift',
    type: [Employee],
  })
  findByShift(@Param('shiftId') shiftId: string): Promise<Employee[]> {
    return this.employeesService.findByShift(shiftId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee details',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'Email or RFID already exists' })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate an employee' })
  @ApiResponse({
    status: 200,
    description: 'Employee deactivated',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  deactivate(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate an employee' })
  @ApiResponse({
    status: 200,
    description: 'Employee activated',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  activate(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.activate(id);
  }

  @Patch(':id/assign-rfid')
  @ApiOperation({ summary: 'Assign RFID card to employee' })
  @ApiResponse({
    status: 200,
    description: 'RFID card assigned',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'RFID card already assigned' })
  assignRfidCard(
    @Param('id') id: string,
    @Body() assignRfidDto: AssignRfidDto,
  ): Promise<Employee> {
    return this.employeesService.assignRfidCard(id, assignRfidDto);
  }

  @Patch(':id/assign-pin')
  @ApiOperation({ summary: 'Assign PIN to employee' })
  @ApiResponse({
    status: 200,
    description: 'PIN assigned',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  assignPin(
    @Param('id') id: string,
    @Body() assignPinDto: AssignPinDto,
  ): Promise<Employee> {
    return this.employeesService.assignPin(id, assignPinDto);
  }

  @Patch(':id/assign-face')
  @ApiOperation({ summary: 'Assign face encoding to employee' })
  @ApiResponse({
    status: 200,
    description: 'Face encoding assigned',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 400, description: 'Invalid face encoding data' })
  assignFaceEncoding(
    @Param('id') id: string,
    @Body() assignFaceEncodingDto: AssignFaceEncodingDto,
  ): Promise<Employee> {
    return this.employeesService.assignFaceEncoding(id, assignFaceEncodingDto);
  }

  @Patch(':id/assign-fingerprint')
  @ApiOperation({ summary: 'Assign fingerprint to employee' })
  @ApiResponse({
    status: 200,
    description: 'Fingerprint assigned successfully',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 400, description: 'Invalid fingerprint template data' })
  assignFingerprint(
    @Param('id') id: string,
    @Body() assignFingerprintDto: AssignFingerprintDto,
  ): Promise<Employee> {
    return this.employeesService.assignFingerprint(id, assignFingerprintDto);
  }

  @Delete(':id/fingerprint')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove fingerprint from employee' })
  @ApiResponse({
    status: 200,
    description: 'Fingerprint removed successfully',
    type: Employee,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 400, description: 'No fingerprint enrolled' })
  removeFingerprint(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.removeFingerprint(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }


  @Get('fingerprint/test')
  @ApiOperation({ summary: 'Test fingerprint service' })
  async testFingerprintService() {
    return this.employeesService.testFingerprintService();
  }

  @Post('fingerprint/compare')
  @ApiOperation({ summary: 'Compare two fingerprint templates (testing)' })
  async compareFingerprints(
    @Body() body: { template1: string; template2: string },
  ) {
    const score = await this.employeesService['fingerprintService']
      .compareFingerprintTemplates(body.template1, body.template2);

    return {
      similarityScore: score,
      matched: score >= 70,
      threshold: 70,
    };
  }
}