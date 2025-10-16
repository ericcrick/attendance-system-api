// // src/modules/departments/entities/department.entity.ts
// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     CreateDateColumn,
//     UpdateDateColumn,
//     OneToMany,
// } from 'typeorm';
// import { ApiProperty } from '@nestjs/swagger';
// import { Employee } from '../../employees/entities/employee.entity';

// @Entity('departments')
// export class Department {
//     @ApiProperty({ description: 'Unique identifier' })
//     @PrimaryGeneratedColumn('uuid')
//     id: string;

//     @ApiProperty({ description: 'Department name', example: 'Security' })
//     @Column({ unique: true })
//     name: string;

//     @ApiProperty({ description: 'Department code', example: 'SEC' })
//     @Column({ unique: true, length: 10 })
//     code: string;

//     @ApiProperty({ description: 'Department description', required: false })
//     @Column({ type: 'text', nullable: true })
//     description?: string;

//     @ApiProperty({ description: 'Department head/manager name', required: false })
//     @Column({ nullable: true, name: 'manager_name' })
//     managerName?: string;

//     @ApiProperty({ description: 'Department head email', required: false })
//     @Column({ nullable: true, name: 'manager_email' })
//     managerEmail?: string;

//     @ApiProperty({ description: 'Whether department is active', default: true })
//     @Column({ name: 'is_active', default: true })
//     isActive: boolean;

//     @ApiProperty({ description: 'Employees in this department', type: () => [Employee] })
//     @OneToMany(() => Employee, (employee) => employee.department)
//     employees: Employee[];

//     @ApiProperty({ description: 'Record creation timestamp' })
//     @CreateDateColumn({ name: 'created_at' })
//     createdAt: Date;

//     @ApiProperty({ description: 'Record last update timestamp' })
//     @UpdateDateColumn({ name: 'updated_at' })
//     updatedAt: Date;
// }




// src/modules/departments/entities/department.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('departments')
export class Department {
    @ApiProperty({ description: 'Unique identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Department name', example: 'Security' })
    @Column({ unique: true })
    name: string;

    @ApiProperty({ description: 'Department code', example: 'SEC' })
    @Column({ unique: true, length: 10 })
    code: string;

    @ApiProperty({ description: 'Department description', required: false })
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiProperty({ description: 'Department head/manager name', required: false })
    @Column({ nullable: true, name: 'manager_name' })
    managerName?: string;

    @ApiProperty({ description: 'Department head email', required: false })
    @Column({ nullable: true, name: 'manager_email' })
    managerEmail?: string;

    @ApiProperty({ description: 'Whether department is active', default: true })
    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ApiProperty({ description: 'Record creation timestamp' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({ description: 'Record last update timestamp' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Virtual property for employee count
    employeeCount?: number;
}