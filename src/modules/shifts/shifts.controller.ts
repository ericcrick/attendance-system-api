import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto, UpdateShiftDto } from './dto/create-shift.dto';
import { Shift } from './entities/shift.entity';

@ApiTags('shifts')
@ApiBearerAuth('JWT-auth')
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shift' })
  @ApiResponse({
    status: 201,
    description: 'Shift created successfully',
    type: Shift,
  })
  @ApiResponse({ status: 409, description: 'Shift name already exists' })
  @ApiResponse({ status: 400, description: 'Invalid shift data' })
  create(@Body() createShiftDto: CreateShiftDto): Promise<Shift> {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shifts' })
  @ApiResponse({
    status: 200,
    description: 'List of all shifts',
    type: [Shift],
  })
  findAll(): Promise<Shift[]> {
    return this.shiftsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active shifts' })
  @ApiResponse({
    status: 200,
    description: 'List of active shifts',
    type: [Shift],
  })
  findActive(): Promise<Shift[]> {
    return this.shiftsService.findActive();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get the current active shift based on time' })
  @ApiResponse({
    status: 200,
    description: 'Current shift or null',
    type: Shift,
  })
  getCurrentShift(): Promise<Shift | null> {
    return this.shiftsService.getCurrentShift();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shift by ID' })
  @ApiResponse({
    status: 200,
    description: 'Shift details',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  findOne(@Param('id') id: string): Promise<Shift> {
    return this.shiftsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shift' })
  @ApiResponse({
    status: 200,
    description: 'Shift updated successfully',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({ status: 409, description: 'Shift name already exists' })
  update(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
  ): Promise<Shift> {
    return this.shiftsService.update(id, updateShiftDto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle shift active status' })
  @ApiResponse({
    status: 200,
    description: 'Shift status toggled',
    type: Shift,
  })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  toggleActive(@Param('id') id: string): Promise<Shift> {
    return this.shiftsService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a shift' })
  @ApiResponse({ status: 204, description: 'Shift deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete shift with assigned employees',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.shiftsService.remove(id);
  }
}