// src/modules/leaves/leaves.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Leave, LeaveStatus } from './entities/leave.entity';
import { CreateLeaveDto, UpdateLeaveDto, ReviewLeaveDto } from './dto/leave.dto';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(Leave)
    private readonly leavesRepository: Repository<Leave>,
    private readonly employeesService: EmployeesService,
  ) {}

  async create(createLeaveDto: CreateLeaveDto): Promise<Leave> {
    // Find employee by employeeId (not UUID)
    const employees = await this.employeesService.findAll();
    const employee = employees.find(
      (emp) => emp.employeeId === createLeaveDto.employeeId,
    );

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID "${createLeaveDto.employeeId}" not found`,
      );
    }

    // Validate dates
    const startDate = new Date(createLeaveDto.startDate);
    const endDate = new Date(createLeaveDto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping leaves
    const overlapping = await this.leavesRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId: employee.id })
      .andWhere('leave.status != :cancelled', {
        cancelled: LeaveStatus.CANCELLED,
      })
      .andWhere(
        '(leave.startDate <= :endDate AND leave.endDate >= :startDate)',
        {
          startDate: createLeaveDto.startDate,
          endDate: createLeaveDto.endDate,
        },
      )
      .getOne();

    if (overlapping) {
      throw new BadRequestException(
        'Leave dates overlap with an existing leave request',
      );
    }

    const leave = this.leavesRepository.create({
      ...createLeaveDto,
      employeeId: employee.id,
    });

    return this.leavesRepository.save(leave);
  }

  async findAll(
    startDate?: string,
    endDate?: string,
    status?: LeaveStatus,
    employeeId?: string,
  ): Promise<Leave[]> {
    const query = this.leavesRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee');

    if (startDate && endDate) {
      query.andWhere('leave.startDate >= :startDate', { startDate });
      query.andWhere('leave.endDate <= :endDate', { endDate });
    }

    if (status) {
      query.andWhere('leave.status = :status', { status });
    }

    if (employeeId) {
      query.andWhere('employee.employeeId = :employeeId', { employeeId });
    }

    return query.orderBy('leave.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Leave> {
    const leave = await this.leavesRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID "${id}" not found`);
    }

    return leave;
  }

  async update(id: string, updateLeaveDto: UpdateLeaveDto): Promise<Leave> {
    const leave = await this.findOne(id);

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'Only pending leaves can be updated',
      );
    }

    Object.assign(leave, updateLeaveDto);
    return this.leavesRepository.save(leave);
  }

  async review(id: string, reviewLeaveDto: ReviewLeaveDto): Promise<Leave> {
    const leave = await this.findOne(id);

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'Only pending leaves can be reviewed',
      );
    }

    leave.status = reviewLeaveDto.status;
    leave.reviewComments = reviewLeaveDto.reviewComments;
    leave.reviewedBy = reviewLeaveDto.reviewedBy;
    leave.reviewedAt = new Date();

    return this.leavesRepository.save(leave);
  }

  async remove(id: string): Promise<void> {
    const leave = await this.findOne(id);
    await this.leavesRepository.remove(leave);
  }

  async getStatistics(): Promise<any> {
    const leaves = await this.findAll();

    return {
      total: leaves.length,
      pending: leaves.filter((l) => l.status === LeaveStatus.PENDING).length,
      approved: leaves.filter((l) => l.status === LeaveStatus.APPROVED).length,
      rejected: leaves.filter((l) => l.status === LeaveStatus.REJECTED).length,
    };
  }
}