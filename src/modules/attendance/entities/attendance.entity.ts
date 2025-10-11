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
import { AuthMethod, AttendanceStatus } from '../../../common/enums';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('attendances')
export class Attendance {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Employee ID' })
  @Column({ name: 'employee_id' })
  employeeId: string;

  @ApiProperty({ description: 'Employee details', type: () => Employee })
  @ManyToOne(() => Employee, (employee) => employee.attendances, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ApiProperty({ description: 'Clock in timestamp', example: '2024-10-11T08:00:00Z' })
  @Column({ type: 'timestamp', name: 'clock_in_time' })
  clockInTime: Date;

  @ApiProperty({ description: 'Clock out timestamp', example: '2024-10-11T16:00:00Z', required: false })
  @Column({ type: 'timestamp', nullable: true, name: 'clock_out_time' })
  clockOutTime?: Date;

  @ApiProperty({ description: 'Authentication method used for clock in', enum: AuthMethod })
  @Column({
    type: 'enum',
    enum: AuthMethod,
    name: 'clock_in_method',
  })
  clockInMethod: AuthMethod;

  @ApiProperty({ description: 'Authentication method used for clock out', enum: AuthMethod, required: false })
  @Column({
    type: 'enum',
    enum: AuthMethod,
    nullable: true,
    name: 'clock_out_method',
  })
  clockOutMethod?: AuthMethod;

  @ApiProperty({ description: 'Clock in photo URL for audit', required: false })
  @Column({ nullable: true, name: 'clock_in_photo' })
  clockInPhoto?: string;

  @ApiProperty({ description: 'Clock out photo URL for audit', required: false })
  @Column({ nullable: true, name: 'clock_out_photo' })
  clockOutPhoto?: string;

  @ApiProperty({ description: 'Attendance status', enum: AttendanceStatus })
  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ON_TIME,
  })
  status: AttendanceStatus;

  @ApiProperty({ description: 'Total work duration in minutes', required: false })
  @Column({ type: 'int', nullable: true, name: 'work_duration_minutes' })
  workDurationMinutes?: number;

  @ApiProperty({ description: 'Clock in location (IP or station ID)', required: false })
  @Column({ nullable: true, name: 'clock_in_location' })
  clockInLocation?: string;

  @ApiProperty({ description: 'Clock out location (IP or station ID)', required: false })
  @Column({ nullable: true, name: 'clock_out_location' })
  clockOutLocation?: string;

  @ApiProperty({ description: 'Additional notes or reasons', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Whether attendance was manually adjusted', default: false })
  @Column({ default: false, name: 'is_manual_entry' })
  isManualEntry: boolean;

  @ApiProperty({ description: 'Admin who made manual adjustment', required: false })
  @Column({ nullable: true, name: 'adjusted_by' })
  adjustedBy?: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Calculate work duration when clocking out
  calculateWorkDuration(): void {
    if (this.clockInTime && this.clockOutTime) {
      const diffMs = this.clockOutTime.getTime() - this.clockInTime.getTime();
      this.workDurationMinutes = Math.floor(diffMs / 60000);
    }
  }

  // Check if still clocked in
  get isClockedIn(): boolean {
    return !this.clockOutTime;
  }
}