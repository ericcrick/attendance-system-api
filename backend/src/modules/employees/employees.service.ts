// // src/modules/employees/employees.service.ts
// import {
//   Injectable,
//   NotFoundException,
//   ConflictException,
//   BadRequestException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import { Employee } from './entities/employee.entity';
// import {
//   CreateEmployeeDto,
//   UpdateEmployeeDto,
//   AssignRfidDto,
//   AssignPinDto,
//   AssignFaceEncodingDto,
// } from './dto/create-employee.dto';
// import { ShiftsService } from '../shifts/shifts.service';
// import { DepartmentsService } from '../departments/departments.service';
// import { EmploymentStatus } from '../../common/enums';

// @Injectable()
// export class EmployeesService {
//   constructor(
//     @InjectRepository(Employee)
//     private readonly employeesRepository: Repository<Employee>,
//     private readonly shiftsService: ShiftsService,
//     private readonly departmentsService: DepartmentsService,
//   ) { }

//   async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
//     // Check if employee ID already exists
//     const existingEmployee = await this.employeesRepository.findOne({
//       where: { employeeId: createEmployeeDto.employeeId },
//     });

//     if (existingEmployee) {
//       throw new ConflictException(
//         `Employee with ID "${createEmployeeDto.employeeId}" already exists`,
//       );
//     }

//     // Check if email already exists (if provided)
//     if (createEmployeeDto.email) {
//       const existingEmail = await this.employeesRepository.findOne({
//         where: { email: createEmployeeDto.email },
//       });

//       if (existingEmail) {
//         throw new ConflictException(
//           `Employee with email "${createEmployeeDto.email}" already exists`,
//         );
//       }
//     }

//     // Check if RFID card already exists (if provided)
//     if (createEmployeeDto.rfidCardId) {
//       const existingRfid = await this.employeesRepository.findOne({
//         where: { rfidCardId: createEmployeeDto.rfidCardId },
//       });

//       if (existingRfid) {
//         throw new ConflictException(
//           `RFID card "${createEmployeeDto.rfidCardId}" is already assigned`,
//         );
//       }
//     }

//     // Verify shift exists
//     await this.shiftsService.findOne(createEmployeeDto.shiftId);

//     // Verify department exists if departmentId is provided
//     if (createEmployeeDto.departmentId) {
//       try {
//         const department = await this.departmentsService.findOne(
//           createEmployeeDto.departmentId,
//         );

//         // If department name is not provided, use the department's name
//         if (!createEmployeeDto.department) {
//           createEmployeeDto.department = department.name;
//         }
//       } catch (error) {
//         throw new BadRequestException(
//           `Department with ID "${createEmployeeDto.departmentId}" not found`,
//         );
//       }
//     }

//     // Hash PIN if provided
//     let hashedPin: string | undefined;
//     if (createEmployeeDto.pinCode) {
//       hashedPin = await bcrypt.hash(createEmployeeDto.pinCode, 10);
//     }

//     const employee = this.employeesRepository.create({
//       ...createEmployeeDto,
//       pinCode: hashedPin,
//       status: createEmployeeDto.status || EmploymentStatus.ACTIVE,
//     });

//     return this.employeesRepository.save(employee);
//   }

//   async findAll(includeInactive = false): Promise<Employee[]> {
//     const queryBuilder = this.employeesRepository
//       .createQueryBuilder('employee')
//       .leftJoinAndSelect('employee.shift', 'shift')
//       .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
//       .orderBy('employee.createdAt', 'DESC');

//     if (!includeInactive) {
//       queryBuilder.where('employee.status = :status', {
//         status: EmploymentStatus.ACTIVE,
//       });
//     }

//     return queryBuilder.getMany();
//   }

//   async findByDepartment(department: string): Promise<Employee[]> {
//     return this.employeesRepository
//       .createQueryBuilder('employee')
//       .leftJoinAndSelect('employee.shift', 'shift')
//       .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
//       .where('employee.department = :department', { department })
//       .andWhere('employee.status = :status', { status: EmploymentStatus.ACTIVE })
//       .orderBy('employee.lastName', 'ASC')
//       .getMany();
//   }

//   async findByDepartmentId(departmentId: string): Promise<Employee[]> {
//     return this.employeesRepository
//       .createQueryBuilder('employee')
//       .leftJoinAndSelect('employee.shift', 'shift')
//       .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
//       .where('employee.department_id = :departmentId', { departmentId })
//       .andWhere('employee.status = :status', { status: EmploymentStatus.ACTIVE })
//       .orderBy('employee.lastName', 'ASC')
//       .getMany();
//   }

//   async findByShift(shiftId: string): Promise<Employee[]> {
//     return this.employeesRepository.find({
//       where: {
//         shiftId,
//         status: EmploymentStatus.ACTIVE,
//       },
//       relations: ['shift', 'departmentRelation'],
//       order: { lastName: 'ASC' },
//     });
//   }

//   async findOne(id: string): Promise<Employee> {
//     const employee = await this.employeesRepository.findOne({
//       where: { id },
//       relations: ['shift', 'departmentRelation', 'attendances'],
//     });

//     if (!employee) {
//       throw new NotFoundException(`Employee with ID "${id}" not found`);
//     }

//     return employee;
//   }

//   async findByEmployeeId(employeeId: string): Promise<Employee> {
//     // Case-insensitive search using ILIKE (PostgreSQL) or LOWER
//     const employee = await this.employeesRepository
//       .createQueryBuilder('employee')
//       .leftJoinAndSelect('employee.shift', 'shift')
//       .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
//       .where('LOWER(employee.employee_id) = LOWER(:employeeId)', { employeeId })
//       .getOne();

//     if (!employee) {
//       throw new NotFoundException(
//         `Employee with ID "${employeeId}" not found`,
//       );
//     }

//     return employee;
//   }

//   async findByRfidCard(rfidCardId: string): Promise<Employee | null> {
//     // Case-insensitive search for RFID card
//     return this.employeesRepository
//       .createQueryBuilder('employee')
//       .leftJoinAndSelect('employee.shift', 'shift')
//       .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
//       .where('LOWER(employee.rfid_card_id) = LOWER(:rfidCardId)', { rfidCardId })
//       .getOne();
//   }

//   async update(
//     id: string,
//     updateEmployeeDto: UpdateEmployeeDto,
//   ): Promise<Employee> {
//     const employee = await this.findOne(id);

//     // Check email conflict if email is being updated
//     if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
//       const existingEmail = await this.employeesRepository.findOne({
//         where: { email: updateEmployeeDto.email },
//       });

//       if (existingEmail && existingEmail.id !== id) {
//         throw new ConflictException(
//           `Email "${updateEmployeeDto.email}" is already in use`,
//         );
//       }
//     }

//     // Check RFID conflict if RFID is being updated
//     if (
//       updateEmployeeDto.rfidCardId &&
//       updateEmployeeDto.rfidCardId !== employee.rfidCardId
//     ) {
//       const existingRfid = await this.employeesRepository.findOne({
//         where: { rfidCardId: updateEmployeeDto.rfidCardId },
//       });

//       if (existingRfid && existingRfid.id !== id) {
//         throw new ConflictException(
//           `RFID card "${updateEmployeeDto.rfidCardId}" is already assigned`,
//         );
//       }
//     }

//     // Verify new shift exists if shift is being updated
//     if (updateEmployeeDto.shiftId && updateEmployeeDto.shiftId !== employee.shiftId) {
//       await this.shiftsService.findOne(updateEmployeeDto.shiftId);
//     }

//     // Verify department exists if departmentId is being updated
//     if (updateEmployeeDto.departmentId) {
//       try {
//         const department = await this.departmentsService.findOne(
//           updateEmployeeDto.departmentId,
//         );

//         // Update department name to match the department relation
//         if (!updateEmployeeDto.department) {
//           updateEmployeeDto.department = department.name;
//         }
//       } catch (error) {
//         throw new BadRequestException(
//           `Department with ID "${updateEmployeeDto.departmentId}" not found`,
//         );
//       }
//     }

//     // Hash new PIN if provided
//     if (updateEmployeeDto.pinCode) {
//       updateEmployeeDto.pinCode = await bcrypt.hash(
//         updateEmployeeDto.pinCode,
//         10,
//       );
//     }

//     Object.assign(employee, updateEmployeeDto);
//     return this.employeesRepository.save(employee);
//   }

//   async remove(id: string): Promise<void> {
//     const employee = await this.findOne(id);
//     await this.employeesRepository.remove(employee);
//   }

//   async deactivate(id: string): Promise<Employee> {
//     const employee = await this.findOne(id);
//     employee.status = EmploymentStatus.INACTIVE;
//     return this.employeesRepository.save(employee);
//   }

//   async activate(id: string): Promise<Employee> {
//     const employee = await this.findOne(id);
//     employee.status = EmploymentStatus.ACTIVE;
//     return this.employeesRepository.save(employee);
//   }

//   async assignRfidCard(
//     id: string,
//     assignRfidDto: AssignRfidDto,
//   ): Promise<Employee> {
//     const employee = await this.findOne(id);

//     // Check if RFID card is already assigned to another employee
//     const existingRfid = await this.employeesRepository.findOne({
//       where: { rfidCardId: assignRfidDto.rfidCardId },
//     });

//     if (existingRfid && existingRfid.id !== id) {
//       throw new ConflictException(
//         `RFID card "${assignRfidDto.rfidCardId}" is already assigned to ${existingRfid.fullName}`,
//       );
//     }

//     employee.rfidCardId = assignRfidDto.rfidCardId;
//     return this.employeesRepository.save(employee);
//   }

//   async assignPin(id: string, assignPinDto: AssignPinDto): Promise<Employee> {
//     const employee = await this.findOne(id);

//     const hashedPin = await bcrypt.hash(assignPinDto.pinCode, 10);
//     employee.pinCode = hashedPin;

//     return this.employeesRepository.save(employee);
//   }

//   async assignFaceEncoding(
//     id: string,
//     assignFaceEncodingDto: AssignFaceEncodingDto,
//   ): Promise<Employee> {
//     const employee = await this.findOne(id);

//     if (
//       !Array.isArray(assignFaceEncodingDto.faceEncoding) ||
//       assignFaceEncodingDto.faceEncoding.length === 0
//     ) {
//       throw new BadRequestException('Invalid face encoding data');
//     }

//     employee.faceEncoding = assignFaceEncodingDto.faceEncoding;
//     return this.employeesRepository.save(employee);
//   }

//   async verifyPin(id: string, pinCode: string): Promise<boolean> {
//     const employee = await this.findOne(id);

//     if (!employee.pinCode) {
//       return false;
//     }

//     return bcrypt.compare(pinCode, employee.pinCode);
//   }

//   async getStatistics() {
//     const [total, active, inactive, suspended, terminated] = await Promise.all([
//       this.employeesRepository.count(),
//       this.employeesRepository.count({
//         where: { status: EmploymentStatus.ACTIVE },
//       }),
//       this.employeesRepository.count({
//         where: { status: EmploymentStatus.INACTIVE },
//       }),
//       this.employeesRepository.count({
//         where: { status: EmploymentStatus.SUSPENDED },
//       }),
//       this.employeesRepository.count({
//         where: { status: EmploymentStatus.TERMINATED },
//       }),
//     ]);

//     // Count by authentication method
//     const withRfid = await this.employeesRepository
//       .createQueryBuilder('employee')
//       .where('employee.rfid_card_id IS NOT NULL')
//       .andWhere('employee.status = :status', { status: EmploymentStatus.ACTIVE })
//       .getCount();

//     const withPin = await this.employeesRepository
//       .createQueryBuilder('employee')
//       .where('employee.pin_code IS NOT NULL')
//       .andWhere('employee.status = :status', { status: EmploymentStatus.ACTIVE })
//       .getCount();

//     const withFace = await this.employeesRepository
//       .createQueryBuilder('employee')
//       .where('employee.face_encoding IS NOT NULL')
//       .andWhere('employee.status = :status', { status: EmploymentStatus.ACTIVE })
//       .getCount();

//     return {
//       total,
//       byStatus: {
//         active,
//         inactive,
//         suspended,
//         terminated,
//       },
//       byAuthMethod: {
//         withRfid,
//         withPin,
//         withFace,
//       },
//     };
//   }
// }





// src/modules/employees/employees.service.ts
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
  AssignFingerprintDto,
} from './dto/create-employee.dto';
import { ShiftsService } from '../shifts/shifts.service';
import { DepartmentsService } from '../departments/departments.service';
import { ZKTecoService } from './fingerprint/zkteco.service';
import { EmploymentStatus } from '../../common/enums';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    private readonly shiftsService: ShiftsService,
    private readonly departmentsService: DepartmentsService,
    private readonly zkTecoService: ZKTecoService,
  ) { }

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

    // Verify department exists if departmentId is provided
    if (createEmployeeDto.departmentId) {
      try {
        const department = await this.departmentsService.findOne(
          createEmployeeDto.departmentId,
        );

        if (!createEmployeeDto.department) {
          createEmployeeDto.department = department.name;
        }
      } catch (error) {
        throw new BadRequestException(
          `Department with ID "${createEmployeeDto.departmentId}" not found`,
        );
      }
    }

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
    const queryBuilder = this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.shift', 'shift')
      .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
      .orderBy('employee.createdAt', 'DESC');

    if (!includeInactive) {
      queryBuilder.where('employee.status = :status', {
        status: EmploymentStatus.ACTIVE,
      });
    }

    return queryBuilder.getMany();
  }

  async findByDepartment(department: string): Promise<Employee[]> {
    return this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.shift', 'shift')
      .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
      .where('employee.department = :department', { department })
      .andWhere('employee.status = :status', { status: EmploymentStatus.ACTIVE })
      .orderBy('employee.lastName', 'ASC')
      .getMany();
  }

  async findByDepartmentId(departmentId: string): Promise<Employee[]> {
    return this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.shift', 'shift')
      .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
      .where('employee.department_id = :departmentId', { departmentId })
      .andWhere('employee.status = :status', { status: EmploymentStatus.ACTIVE })
      .orderBy('employee.lastName', 'ASC')
      .getMany();
  }

  async findByShift(shiftId: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: {
        shiftId,
        status: EmploymentStatus.ACTIVE,
      },
      relations: ['shift', 'departmentRelation'],
      order: { lastName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ['shift', 'departmentRelation', 'attendances'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }

    return employee;
  }

  async findByEmployeeId(employeeId: string): Promise<Employee> {
    const employee = await this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.shift', 'shift')
      .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
      .where('LOWER(employee.employee_id) = LOWER(:employeeId)', { employeeId })
      .getOne();

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID "${employeeId}" not found`,
      );
    }

    return employee;
  }

  async findByRfidCard(rfidCardId: string): Promise<Employee | null> {
    return this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.shift', 'shift')
      .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
      .where('LOWER(employee.rfid_card_id) = LOWER(:rfidCardId)', { rfidCardId })
      .getOne();
  }

  async findByFingerprintDeviceId(deviceId: string): Promise<Employee | null> {
    return this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.shift', 'shift')
      .leftJoinAndSelect('employee.departmentRelation', 'departmentRelation')
      .where('employee.fingerprint_device_id = :deviceId', { deviceId })
      .getOne();
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    // Check email conflict if email is being updated
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmail = await this.employeesRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });

      if (existingEmail && existingEmail.id !== id) {
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

      if (existingRfid && existingRfid.id !== id) {
        throw new ConflictException(
          `RFID card "${updateEmployeeDto.rfidCardId}" is already assigned`,
        );
      }
    }

    // Verify new shift exists if shift is being updated
    if (updateEmployeeDto.shiftId && updateEmployeeDto.shiftId !== employee.shiftId) {
      await this.shiftsService.findOne(updateEmployeeDto.shiftId);
    }

    // Verify department exists if departmentId is being updated
    if (updateEmployeeDto.departmentId) {
      try {
        const department = await this.departmentsService.findOne(
          updateEmployeeDto.departmentId,
        );

        if (!updateEmployeeDto.department) {
          updateEmployeeDto.department = department.name;
        }
      } catch (error) {
        throw new BadRequestException(
          `Department with ID "${updateEmployeeDto.departmentId}" not found`,
        );
      }
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

    // Delete fingerprint from device if exists
    if (employee.fingerprintDeviceId) {
      await this.zkTecoService.deleteFingerprintFromDevice(
        employee.fingerprintDeviceId,
      );
    }

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

  async assignRfidCard(
    id: string,
    assignRfidDto: AssignRfidDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

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

  async assignFingerprint(
    id: string,
    assignFingerprintDto: AssignFingerprintDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    // Validate fingerprint template
    if (!this.zkTecoService.validateFingerprintTemplate(
      assignFingerprintDto.fingerprintTemplate,
    )) {
      throw new BadRequestException('Invalid fingerprint template data');
    }

    // Enroll on device and get device user ID
    const deviceUserId = await this.zkTecoService.enrollFingerprintOnDevice(
      employee.employeeId,
      assignFingerprintDto.fingerprintTemplate,
    );

    employee.fingerprintTemplate = assignFingerprintDto.fingerprintTemplate;
    employee.fingerprintDeviceId = assignFingerprintDto.fingerprintDeviceId || deviceUserId;

    return this.employeesRepository.save(employee);
  }

  async removeFingerprint(id: string): Promise<Employee> {
    const employee = await this.findOne(id);

    if (!employee.fingerprintTemplate) {
      throw new BadRequestException('No fingerprint enrolled for this employee');
    }

    // Delete from device if device ID exists
    if (employee.fingerprintDeviceId) {
      await this.zkTecoService.deleteFingerprintFromDevice(
        employee.fingerprintDeviceId,
      );
    }

    // TypeScript fix: Set to null instead of undefined
    employee.fingerprintTemplate = null as any;
    employee.fingerprintDeviceId = null as any;

    return this.employeesRepository.save(employee);
  }

  async verifyPin(id: string, pinCode: string): Promise<boolean> {
    const employee = await this.findOne(id);

    if (!employee.pinCode) {
      return false;
    }

    return bcrypt.compare(pinCode, employee.pinCode);
  }

  async verifyFingerprint(fingerprintTemplate: string): Promise<Employee | null> {
    const employees = await this.findAll(false);
    const employeesWithFingerprints = employees.filter(
      (emp) => emp.fingerprintTemplate && emp.fingerprintTemplate.length > 0,
    );

    for (const employee of employeesWithFingerprints) {
      // TypeScript fix: Check for null/undefined before passing
      if (!employee.fingerprintTemplate) continue;

      const isMatch = await this.zkTecoService.matchFingerprints(
        fingerprintTemplate,
        employee.fingerprintTemplate,
      );

      if (isMatch) {
        return employee;
      }
    }

    return null;
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

    const withFingerprint = await this.employeesRepository
      .createQueryBuilder('employee')
      .where('employee.fingerprint_template IS NOT NULL')
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
        withFingerprint,
      },
    };
  }


  async getFingerprintDeviceInfo(): Promise<any> {
    return this.zkTecoService.getDeviceInfo();
  }

  async testFingerprintDeviceConnection(): Promise<any> {
    return this.zkTecoService.testConnection();
  }

  async syncAllFingerprintsToDevice(): Promise<any> {
    const employees = await this.findAll(false);

    const employeesWithFingerprints = employees
      .filter((emp) => emp.fingerprintTemplate && emp.fingerprintTemplate.length > 0)
      .map((emp) => ({
        id: emp.id,
        employeeId: emp.employeeId,
        fingerprintTemplate: emp.fingerprintTemplate!,
      }));

    if (employeesWithFingerprints.length === 0) {
      return {
        success: 0,
        failed: 0,
        message: 'No employees with fingerprints found',
      };
    }

    const result = await this.zkTecoService.syncFingerprintsToDevice(
      employeesWithFingerprints,
    );

    return {
      ...result,
      message: `Synced ${result.success} fingerprints successfully, ${result.failed} failed`,
    };
  }
}