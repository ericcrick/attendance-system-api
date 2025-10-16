// // src/modules/employees/entities/employee.entity.ts


// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   ManyToOne,
//   OneToMany,
//   JoinColumn,
// } from 'typeorm';
// import { ApiProperty } from '@nestjs/swagger';
// import { EmploymentStatus } from '../../../common/enums';
// import { Shift } from '../../shifts/entities/shift.entity';
// import { Attendance } from '../../attendance/entities/attendance.entity';
// import { Department } from '../../departments/entities/department.entity';
// import { Leave } from '../../leaves/entities/leave.entity';
// import { Expose } from 'class-transformer';

// @Entity('employees')
// export class Employee {
//   @ApiProperty({ description: 'Unique identifier' })
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @ApiProperty({ description: 'Employee ID number', example: 'EMP-001' })
//   @Column({ unique: true, name: 'employee_id' })
//   employeeId: string;

//   @ApiProperty({ description: 'First name', example: 'John' })
//   @Column({ name: 'first_name' })
//   firstName: string;

//   @ApiProperty({ description: 'Last name', example: 'Doe' })
//   @Column({ name: 'last_name' })
//   lastName: string;

//   @ApiProperty({ description: 'Email address', example: 'john.doe@military.com', required: false })
//   @Column({ nullable: true, unique: true })
//   email?: string;

//   @ApiProperty({ description: 'Phone number', example: '+1234567890', required: false })
//   @Column({ nullable: true })
//   phone?: string;

//   @ApiProperty({ description: 'Department name (legacy field)', example: 'Operations' })
//   @Column()
//   department: string;

//   @ApiProperty({ description: 'Department ID (new field)', required: false })
//   @Column({ nullable: true, name: 'department_id' })
//   departmentId?: string;

//   @ApiProperty({ description: 'Department details', type: () => Department, required: false })
//   @ManyToOne(() => Department, { nullable: true, eager: false })
//   @JoinColumn({ name: 'department_id' })
//   departmentRelation?: Department;
//   @ApiProperty({ description: 'Leave records', type: () => [Leave] })
//   @OneToMany(() => Leave, (leave) => leave.employee)
//   leaves: Leave[];

//   @ApiProperty({ description: 'Job position', example: 'Security Officer' })
//   @Column()
//   position: string;

//   @ApiProperty({ description: 'RFID card identifier', required: false })
//   @Column({ unique: true, nullable: true, name: 'rfid_card_id' })
//   rfidCardId?: string;

//   @ApiProperty({ description: 'Encrypted PIN code', required: false })
//   @Column({ nullable: true, name: 'pin_code' })
//   pinCode?: string;

//   @ApiProperty({ description: 'Face encoding data (JSON)', required: false })
//   @Column({ type: 'jsonb', nullable: true, name: 'face_encoding' })
//   faceEncoding?: any;

//   @ApiProperty({ description: 'Profile photo URL', required: false })
//   @Column({ nullable: true, name: 'photo_url' })
//   photoUrl?: string;

//   @ApiProperty({ description: 'Employment status', enum: EmploymentStatus })
//   @Column({
//     type: 'enum',
//     enum: EmploymentStatus,
//     default: EmploymentStatus.ACTIVE,
//   })
//   status: EmploymentStatus;

//   @ApiProperty({ description: 'Assigned shift ID' })
//   @Column({ name: 'shift_id' })
//   shiftId: string;

//   @ApiProperty({ description: 'Shift details', type: () => Shift })
//   @ManyToOne(() => Shift, (shift) => shift.employees, { eager: true })
//   @JoinColumn({ name: 'shift_id' })
//   shift: Shift;

//   @ApiProperty({ description: 'Attendance records', type: () => [Attendance] })
//   @OneToMany(() => Attendance, (attendance) => attendance.employee)
//   attendances: Attendance[];

//   @ApiProperty({ description: 'Date joined', example: '2024-01-01T00:00:00Z' })
//   @Column({ type: 'timestamp', name: 'date_joined', default: () => 'CURRENT_TIMESTAMP' })
//   dateJoined: Date;

//   @ApiProperty({ description: 'Additional notes', required: false })
//   @Column({ type: 'text', nullable: true })
//   notes?: string;

//   @ApiProperty({ description: 'Record creation timestamp' })
//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date;

//   @ApiProperty({ description: 'Record last update timestamp' })
//   @UpdateDateColumn({ name: 'updated_at' })
//   updatedAt: Date;

//   @Expose()
//   get fullName(): string {
//     return `${this.firstName} ${this.lastName}`;
//   }
// }




// src/modules/employees/entities/employee.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EmploymentStatus } from '../../../common/enums';
import { Shift } from '../../shifts/entities/shift.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Department } from '../../departments/entities/department.entity';
import { Leave } from '../../leaves/entities/leave.entity';
import { Expose } from 'class-transformer';

@Entity('employees')
export class Employee {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Employee ID number', example: 'EMP-001' })
  @Column({ unique: true, name: 'employee_id' })
  employeeId: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@military.com', required: false })
  @Column({ nullable: true, unique: true })
  email?: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890', required: false })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ description: 'Department name (legacy field)', example: 'Operations' })
  @Column()
  department: string;

  @ApiProperty({ description: 'Department ID (new field)', required: false })
  @Column({ nullable: true, name: 'department_id' })
  departmentId?: string;

  @ApiProperty({ description: 'Department details', type: () => Department, required: false })
  @ManyToOne(() => Department, { nullable: true, eager: false })
  @JoinColumn({ name: 'department_id' })
  departmentRelation?: Department;

  @ApiProperty({ description: 'Leave records', type: () => [Leave] })
  @OneToMany(() => Leave, (leave) => leave.employee)
  leaves: Leave[];

  @ApiProperty({ description: 'Job position', example: 'Security Officer' })
  @Column()
  position: string;

  @ApiProperty({ description: 'RFID card identifier', required: false })
  @Column({ unique: true, nullable: true, name: 'rfid_card_id' })
  rfidCardId?: string;

  @ApiProperty({ description: 'Encrypted PIN code', required: false })
  @Column({ nullable: true, name: 'pin_code' })
  pinCode?: string;

  @ApiProperty({ description: 'Face encoding data (JSON)', required: false })
  @Column({ type: 'jsonb', nullable: true, name: 'face_encoding' })
  faceEncoding?: any;

  @ApiProperty({ description: 'Fingerprint template data (Base64 encoded)', required: false })
  @Column({ type: 'text', nullable: true, name: 'fingerprint_template' })
  fingerprintTemplate?: string;

  @ApiProperty({ description: 'Fingerprint device user ID', required: false })
  @Column({ nullable: true, name: 'fingerprint_device_id' })
  fingerprintDeviceId?: string;

  @ApiProperty({ description: 'Profile photo URL', required: false })
  @Column({ nullable: true, name: 'photo_url' })
  photoUrl?: string;

  @ApiProperty({ description: 'Employment status', enum: EmploymentStatus })
  @Column({
    type: 'enum',
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE,
  })
  status: EmploymentStatus;

  @ApiProperty({ description: 'Assigned shift ID' })
  @Column({ name: 'shift_id' })
  shiftId: string;

  @ApiProperty({ description: 'Shift details', type: () => Shift })
  @ManyToOne(() => Shift, (shift) => shift.employees, { eager: true })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @ApiProperty({ description: 'Attendance records', type: () => [Attendance] })
  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendances: Attendance[];

  @ApiProperty({ description: 'Date joined', example: '2024-01-01T00:00:00Z' })
  @Column({ type: 'timestamp', name: 'date_joined', default: () => 'CURRENT_TIMESTAMP' })
  dateJoined: Date;

  @ApiProperty({ description: 'Additional notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}