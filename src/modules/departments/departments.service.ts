// // src/modules/departments/departments.service.ts
// import {
//   Injectable,
//   NotFoundException,
//   ConflictException,
//   BadRequestException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Department } from './entities/department.entity';
// import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

// @Injectable()
// export class DepartmentsService {
//   constructor(
//     @InjectRepository(Department)
//     private readonly departmentsRepository: Repository<Department>,
//   ) { }

//   async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
//     const existingName = await this.departmentsRepository.findOne({
//       where: { name: createDepartmentDto.name },
//     });

//     if (existingName) {
//       throw new ConflictException(
//         `Department with name "${createDepartmentDto.name}" already exists`,
//       );
//     }

//     const existingCode = await this.departmentsRepository.findOne({
//       where: { code: createDepartmentDto.code },
//     });

//     if (existingCode) {
//       throw new ConflictException(
//         `Department with code "${createDepartmentDto.code}" already exists`,
//       );
//     }

//     const department = this.departmentsRepository.create(createDepartmentDto);
//     return this.departmentsRepository.save(department);
//   }

//   async findAll(includeInactive?: boolean): Promise<Department[]> {
//     const query = this.departmentsRepository
//       .createQueryBuilder('department')
//       .leftJoinAndSelect('department.employees', 'employees')
//       .loadRelationCountAndMap(
//         'department.employeeCount',
//         'department.employees',
//         'employeeCount',
//         (qb) => qb.where('employeeCount.status = :status', { status: 'ACTIVE' }),
//       );

//     if (!includeInactive) {
//       query.where('department.isActive = :isActive', { isActive: true });
//     }

//     const departments = await query
//       .orderBy('department.name', 'ASC')
//       .getMany();

//     // Manually count employees for each department
//     return Promise.all(
//       departments.map(async (dept) => {
//         const employeeCount = await this.departmentsRepository
//           .createQueryBuilder('department')
//           .leftJoin('department.employees', 'employees')
//           .where('department.id = :id', { id: dept.id })
//           .andWhere('employees.status = :status', { status: 'ACTIVE' })
//           .getCount();

//         return {
//           ...dept,
//           employees: undefined, // Don't send all employee data
//           employeeCount,
//         } as any;
//       }),
//     );
//   }

//   async findOne(id: string): Promise<Department> {
//     const department = await this.departmentsRepository.findOne({
//       where: { id },
//       relations: ['employees'],
//     });

//     if (!department) {
//       throw new NotFoundException(`Department with ID "${id}" not found`);
//     }

//     return department;
//   }

//   async update(
//     id: string,
//     updateDepartmentDto: UpdateDepartmentDto,
//   ): Promise<Department> {
//     const department = await this.findOne(id);

//     if (
//       updateDepartmentDto.name &&
//       updateDepartmentDto.name !== department.name
//     ) {
//       const existingName = await this.departmentsRepository.findOne({
//         where: { name: updateDepartmentDto.name },
//       });

//       if (existingName) {
//         throw new ConflictException(
//           `Department with name "${updateDepartmentDto.name}" already exists`,
//         );
//       }
//     }

//     if (
//       updateDepartmentDto.code &&
//       updateDepartmentDto.code !== department.code
//     ) {
//       const existingCode = await this.departmentsRepository.findOne({
//         where: { code: updateDepartmentDto.code },
//       });

//       if (existingCode) {
//         throw new ConflictException(
//           `Department with code "${updateDepartmentDto.code}" already exists`,
//         );
//       }
//     }

//     Object.assign(department, updateDepartmentDto);
//     return this.departmentsRepository.save(department);
//   }

//   async remove(id: string): Promise<void> {
//     const department = await this.findOne(id);

//     if (department.employees && department.employees.length > 0) {
//       throw new BadRequestException(
//         `Cannot delete department "${department.name}" because it has ${department.employees.length} assigned employee(s). Reassign employees first.`,
//       );
//     }

//     await this.departmentsRepository.remove(department);
//   }

//   async toggle(id: string): Promise<Department> {
//     const department = await this.findOne(id);
//     department.isActive = !department.isActive;
//     return this.departmentsRepository.save(department);
//   }

//   async getStatistics(): Promise<any> {
//     const departments = await this.findAll(true);

//     return {
//       total: departments.length,
//       active: departments.filter((d) => d.isActive).length,
//       inactive: departments.filter((d) => !d.isActive).length,
//     };
//   }
// }



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

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
  ) {}

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

  async findAll(includeInactive?: boolean): Promise<Department[]> {
    const whereCondition = includeInactive ? {} : { isActive: true };

    const departments = await this.departmentsRepository.find({
      where: whereCondition,
      order: { name: 'ASC' },
    });

    // Get employee count for each department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await this.departmentsRepository
          .createQueryBuilder()
          .select('COUNT(*)', 'count')
          .from('employees', 'employee')
          .where('employee.department_id = :deptId', { deptId: dept.id })
          .andWhere('employee.status = :status', { status: 'ACTIVE' })
          .getRawOne();

        return {
          ...dept,
          employeeCount: parseInt(employeeCount?.count || '0', 10),
        };
      }),
    );

    return departmentsWithCount;
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