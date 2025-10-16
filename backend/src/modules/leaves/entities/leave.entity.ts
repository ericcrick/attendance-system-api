// src/modules/leaves/entities/leave.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '../../employees/entities/employee.entity';

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  STUDY = 'STUDY',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  PASS = 'PASS',
  OTHER = 'OTHER',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('leaves')
export class Leave {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Employee ID' })
  @Column({ name: 'employee_id' })
  employeeId: string;

  @ApiProperty({ description: 'Employee details', type: () => Employee })
  @ManyToOne(() => Employee, (employee) => employee.leaves, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ApiProperty({ description: 'Leave type', enum: LeaveType })
  @Column({
    type: 'enum',
    enum: LeaveType,
    name: 'leave_type',
  })
  leaveType: LeaveType;

  @ApiProperty({ description: 'Leave start date' })
  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @ApiProperty({ description: 'Leave end date' })
  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @ApiProperty({ description: 'Number of days' })
  @Column({ type: 'int', name: 'days_count' })
  daysCount: number;

  @ApiProperty({ description: 'Reason for leave' })
  @Column({ type: 'text' })
  reason: string;

  @ApiProperty({ description: 'Leave status', enum: LeaveStatus })
  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @ApiProperty({ description: 'Approver/Reviewer ID', required: false })
  @Column({ nullable: true, name: 'reviewed_by' })
  reviewedBy?: string;

  @ApiProperty({ description: 'Review comments', required: false })
  @Column({ type: 'text', nullable: true, name: 'review_comments' })
  reviewComments?: string;

  @ApiProperty({ description: 'Review date', required: false })
  @Column({ type: 'timestamp', nullable: true, name: 'reviewed_at' })
  reviewedAt?: Date;

  @ApiProperty({ description: 'Supporting documents URL', required: false })
  @Column({ nullable: true, name: 'attachment_url' })
  attachmentUrl?: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}