import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from './entities/employee.entity';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  AssignRfidDto,
  AssignPinDto,
  AssignFaceEncodingDto,
} from './dto/create-employee.dto';
import { ShiftsService } from '../shifts/shifts.service';
import { EmploymentStatus } from '../../common/enums';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    private readonly shiftsService: ShiftsService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Check if employee ID already exists
    const existingEmployee = await this.employeesRepository.findOne({
      where: { employeeId: createEmployeeDto.employeeId },
    });

    if (existingEmployee) {
      throw new ConflictException(
        `Employee with ID "${createEmployeeDto.employeeId}" already exists`,
      );
    }

    // Check if email already exists (if provided)
    if (createEmployeeDto.email) {
      const existingEmail = await this.employeesRepository.findOne({
        where: { email: createEmployeeDto.email },
      });

      if (existingEmail) {
        throw new ConflictException(
          `Employee with email "${createEmployeeDto.email}" already exists`,
        );
      }
    }

    // Check if RFID card already exists (if provided)
    if (createEmployeeDto.rfidCardId) {
      const existingRfid = await this.employeesRepository.findOne({
        where: { rfidCardId: createEmployeeDto.rfidCardId },
      });

      if (existingRfid) {
        throw new ConflictException(
          `RFID card "${createEmployeeDto.rfidCardId}" is already assigned`,
        );
      }
    }

    // Verify shift exists
    await this.shiftsService.findOne(createEmployeeDto.shiftId);

    // Hash PIN if provided
    let hashedPin: string | undefined;
    if (createEmployeeDto.pinCode) {
      hashedPin = await bcrypt.hash(createEmployeeDto.pinCode, 10);
    }

    const employee = this.employeesRepository.create({
      ...createEmployeeDto,
      pinCode: hashedPin,
      status: createEmployeeDto.status || EmploymentStatus.ACTIVE,
    });

    return this.employeesRepository.save(employee);
  }

  async findAll(includeInactive = false): Promise<Employee[]> {
    const query: any = {};

    if (!includeInactive) {
      query.status = EmploymentStatus.ACTIVE;
    }

    return this.employeesRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });
  }

  async findByDepartment(department: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: {
        department,
        status: EmploymentStatus.ACTIVE,
      },
      order: { lastName: 'ASC' },
    });
  }

  async findByShift(shiftId: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: {
        shiftId,
        status: EmploymentStatus.ACTIVE,
      },
      order: { lastName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ['shift', 'attendances'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }

    return employee;
  }

  async findByEmployeeId(employeeId: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { employeeId },
      relations: ['shift'],
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID "${employeeId}" not found`,
      );
    }

    return employee;
  }

  async findByRfidCard(rfidCardId: string): Promise<Employee | null> {
    return this.employeesRepository.findOne({
      where: { rfidCardId },
      relations: ['shift'],
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    // Check email conflict if email is being updated
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmail = await this.employeesRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });

      if (existingEmail) {
        throw new ConflictException(
          `Email "${updateEmployeeDto.email}" is already in use`,
        );
      }
    }

    // Check RFID conflict if RFID is being updated
    if (
      updateEmployeeDto.rfidCardId &&
      updateEmployeeDto.rfidCardId !== employee.rfidCardId
    ) {
      const existingRfid = await this.employeesRepository.findOne({
        where: { rfidCardId: updateEmployeeDto.rfidCardId },
      });

      if (existingRfid) {
        throw new ConflictException(
          `RFID card "${updateEmployeeDto.rfidCardId}" is already assigned`,
        );
      }
    }

    // Verify new shift exists if shift is being updated
    if (updateEmployeeDto.shiftId) {
      await this.shiftsService.findOne(updateEmployeeDto.shiftId);
    }

    // Hash new PIN if provided
    if (updateEmployeeDto.pinCode) {
      updateEmployeeDto.pinCode = await bcrypt.hash(
        updateEmployeeDto.pinCode,
        10,
      );
    }

    Object.assign(employee, updateEmployeeDto);
    return this.employeesRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeesRepository.remove(employee);
  }

  async deactivate(id: string): Promise<Employee> {
    const employee = await this.findOne(id);
    employee.status = EmploymentStatus.INACTIVE;
    return this.employeesRepository.save(employee);
  }

  async activate(id: string): Promise<Employee> {
    const employee = await this.findOne(id);
    employee.status = EmploymentStatus.ACTIVE;
    return this.employeesRepository.save(employee);
  }

  async assignRfidCard(id: string, assignRfidDto: AssignRfidDto): Promise<Employee> {
    const employee = await this.findOne(id);

    // Check if RFID card is already assigned to another employee
    const existingRfid = await this.employeesRepository.findOne({
      where: { rfidCardId: assignRfidDto.rfidCardId },
    });

    if (existingRfid && existingRfid.id !== id) {
      throw new ConflictException(
        `RFID card "${assignRfidDto.rfidCardId}" is already assigned to ${existingRfid.fullName}`,
      );
    }

    employee.rfidCardId = assignRfidDto.rfidCardId;
    return this.employeesRepository.save(employee);
  }

  async assignPin(id: string, assignPinDto: AssignPinDto): Promise<Employee> {
    const employee = await this.findOne(id);

    const hashedPin = await bcrypt.hash(assignPinDto.pinCode, 10);
    employee.pinCode = hashedPin;

    return this.employeesRepository.save(employee);
  }

  async assignFaceEncoding(
    id: string,
    assignFaceEncodingDto: AssignFaceEncodingDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    if (
      !Array.isArray(assignFaceEncodingDto.faceEncoding) ||
      assignFaceEncodingDto.faceEncoding.length === 0
    ) {
      throw new BadRequestException('Invalid face encoding data');
    }

    employee.faceEncoding = assignFaceEncodingDto.faceEncoding;
    return this.employeesRepository.save(employee);
  }

  async verifyPin(id: string, pinCode: string): Promise<boolean> {
    const employee = await this.findOne(id);

    if (!employee.pinCode) {
      return false;
    }

    return bcrypt.compare(pinCode, employee.pinCode);
  }

  async getStatistics() {
    const [total, active, inactive, suspended, terminated] = await Promise.all([
      this.employeesRepository.count(),
      this.employeesRepository.count({
        where: { status: EmploymentStatus.ACTIVE },
      }),
      this.employeesRepository.count({
        where: { status: EmploymentStatus.INACTIVE },
      }),
      this.employeesRepository.count({
        where: { status: EmploymentStatus.SUSPENDED },
      }),
      this.employeesRepository.count({
        where: { status: EmploymentStatus.TERMINATED },
      }),
    ]);

    // Count by authentication method
    const withRfid = await this.employeesRepository
      .createQueryBuilder('employee')
      .where('employee.rfid_card_id IS NOT NULL')
      .andWhere('employee.status = :status', { status: EmploymentStatus.ACTIVE })
      .getCount();

    const withPin = await this.employeesRepository
      .createQueryBuilder('employee')
      .where('employee.pin_code IS NOT NULL')
      .andWhere('employee.status = :status', { status: EmploymentStatus.ACTIVE })
      .getCount();

    const withFace = await this.employeesRepository
      .createQueryBuilder('employee')
      .where('employee.face_encoding IS NOT NULL')
      .andWhere('employee.status = :status', { status: EmploymentStatus.ACTIVE })
      .getCount();

    return {
      total,
      byStatus: {
        active,
        inactive,
        suspended,
        terminated,
      },
      byAuthMethod: {
        withRfid,
        withPin,
        withFace,
      },
    };
  }
}