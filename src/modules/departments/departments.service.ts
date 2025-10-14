



// src/modules/departments/departments.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) { }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const existingName = await this.departmentsRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existingName) {
      throw new ConflictException(
        `Department with name "${createDepartmentDto.name}" already exists`,
      );
    }

    const existingCode = await this.departmentsRepository.findOne({
      where: { code: createDepartmentDto.code },
    });

    if (existingCode) {
      throw new ConflictException(
        `Department with code "${createDepartmentDto.code}" already exists`,
      );
    }

    const department = this.departmentsRepository.create(createDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  // async findAll(includeInactive?: boolean): Promise<Department[]> {
  //   const whereCondition = includeInactive ? {} : { isActive: true };

  //   const departments = await this.departmentsRepository.find({
  //     where: whereCondition,
  //     order: { name: 'ASC' },
  //   });

  //   // Get employee count for each department
  //   const departmentsWithCount = await Promise.all(
  //     departments.map(async (dept) => {
  //       const employeeCount = await this.departmentsRepository
  //         .createQueryBuilder()
  //         .select('COUNT(*)', 'count')
  //         .from('employees', 'employee')
  //         .where('employee.department_id = :deptId', { deptId: dept.id })
  //         .andWhere('employee.status = :status', { status: 'ACTIVE' })
  //         .getRawOne();

  //       return {
  //         ...dept,
  //         employeeCount: parseInt(employeeCount?.count || '0', 10),
  //       };
  //     }),
  //   );

  //   return departmentsWithCount;
  // }



  async findAll(includeInactive?: boolean): Promise<Department[]> {
    const whereCondition = includeInactive ? {} : { isActive: true };

    // Fetch all departments
    const departments = await this.departmentsRepository.find({
      where: whereCondition,
      order: { name: 'ASC' },
    });

    if (!departments.length) return [];

    // Fetch all employee counts grouped by department
    const counts = await this.employeesRepository
      .createQueryBuilder('employee')
      .select('employee.department_id', 'departmentId')
      .addSelect('COUNT(*)', 'count')
      .where('employee.status = :status', { status: 'ACTIVE' })
      .groupBy('employee.department_id')
      .getRawMany();

    // Convert count results into a map
    const countMap = new Map(
      counts.map((c) => [c.departmentId, parseInt(c.count, 10)]),
    );

    // Attach count to each department
    return departments.map((dept) => ({
      ...dept,
      employeeCount: countMap.get(dept.id) || 0,
    }));
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }

    // Get employee count
    const employeeCount = await this.departmentsRepository
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('employees', 'employee')
      .where('employee.department_id = :deptId', { deptId: department.id })
      .getRawOne();

    return {
      ...department,
      employeeCount: parseInt(employeeCount?.count || '0', 10),
    };
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    const department = await this.findOne(id);

    if (
      updateDepartmentDto.name &&
      updateDepartmentDto.name !== department.name
    ) {
      const existingName = await this.departmentsRepository.findOne({
        where: { name: updateDepartmentDto.name },
      });

      if (existingName) {
        throw new ConflictException(
          `Department with name "${updateDepartmentDto.name}" already exists`,
        );
      }
    }

    if (
      updateDepartmentDto.code &&
      updateDepartmentDto.code !== department.code
    ) {
      const existingCode = await this.departmentsRepository.findOne({
        where: { code: updateDepartmentDto.code },
      });

      if (existingCode) {
        throw new ConflictException(
          `Department with code "${updateDepartmentDto.code}" already exists`,
        );
      }
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }

    // Check if department has employees
    const employeeCount = await this.departmentsRepository
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('employees', 'employee')
      .where('employee.department_id = :deptId', { deptId: id })
      .getRawOne();

    const count = parseInt(employeeCount?.count || '0', 10);

    if (count > 0) {
      throw new BadRequestException(
        `Cannot delete department "${department.name}" because it has ${count} assigned employee(s). Reassign employees first.`,
      );
    }

    await this.departmentsRepository.remove(department);
  }

  async toggle(id: string): Promise<Department> {
    const department = await this.findOne(id);
    department.isActive = !department.isActive;
    return this.departmentsRepository.save(department);
  }

  async getStatistics(): Promise<any> {
    const departments = await this.findAll(true);

    return {
      total: departments.length,
      active: departments.filter((d) => d.isActive).length,
      inactive: departments.filter((d) => !d.isActive).length,
    };
  }

  async getEmployees(departmentId: string): Promise<any[]> {
    const department = await this.findOne(departmentId);

    const employees = await this.departmentsRepository
      .createQueryBuilder()
      .select('employee.*')
      .from('employees', 'employee')
      .where('employee.department_id = :deptId', { deptId: departmentId })
      .getRawMany();

    return employees;
  }
}