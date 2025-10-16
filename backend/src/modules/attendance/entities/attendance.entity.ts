// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   ManyToOne,
//   JoinColumn,
// } from 'typeorm';
// import { ApiProperty } from '@nestjs/swagger';
// import { AuthMethod, AttendanceStatus } from '../../../common/enums';
// import { Employee } from '../../employees/entities/employee.entity';

// @Entity('attendances')
// export class Attendance {
//   @ApiProperty({ description: 'Unique identifier' })
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @ApiProperty({ description: 'Employee ID' })
//   @Column({ name: 'employee_id' })
//   employeeId: string;

//   @ApiProperty({ description: 'Employee details', type: () => Employee })
//   @ManyToOne(() => Employee, (employee) => employee.attendances, { eager: true })
//   @JoinColumn({ name: 'employee_id' })
//   employee: Employee;

//   @ApiProperty({ description: 'Clock in timestamp', example: '2024-10-11T08:00:00Z' })
//   @Column({ type: 'timestamp', name: 'clock_in_time' })
//   clockInTime: Date;

//   @ApiProperty({ description: 'Clock out timestamp', example: '2024-10-11T16:00:00Z', required: false })
//   @Column({ type: 'timestamp', nullable: true, name: 'clock_out_time' })
//   clockOutTime?: Date;

//   @ApiProperty({ description: 'Authentication method used for clock in', enum: AuthMethod })
//   @Column({
//     type: 'enum',
//     enum: AuthMethod,
//     name: 'clock_in_method',
//   })
//   clockInMethod: AuthMethod;

//   @ApiProperty({ description: 'Authentication method used for clock out', enum: AuthMethod, required: false })
//   @Column({
//     type: 'enum',
//     enum: AuthMethod,
//     nullable: true,
//     name: 'clock_out_method',
//   })
//   clockOutMethod?: AuthMethod;

//   @ApiProperty({ description: 'Clock in photo URL for audit', required: false })
//   @Column({ nullable: true, name: 'clock_in_photo' })
//   clockInPhoto?: string;

//   @ApiProperty({ description: 'Clock out photo URL for audit', required: false })
//   @Column({ nullable: true, name: 'clock_out_photo' })
//   clockOutPhoto?: string;

//   @ApiProperty({ description: 'Attendance status', enum: AttendanceStatus })
//   @Column({
//     type: 'enum',
//     enum: AttendanceStatus,
//     default: AttendanceStatus.ON_TIME,
//   })
//   status: AttendanceStatus;

//   @ApiProperty({ description: 'Total work duration in minutes', required: false })
//   @Column({ type: 'int', nullable: true, name: 'work_duration_minutes' })
//   workDurationMinutes?: number;

//   @ApiProperty({ description: 'Clock in location (IP or station ID)', required: false })
//   @Column({ nullable: true, name: 'clock_in_location' })
//   clockInLocation?: string;

//   @ApiProperty({ description: 'Clock out location (IP or station ID)', required: false })
//   @Column({ nullable: true, name: 'clock_out_location' })
//   clockOutLocation?: string;

//   @ApiProperty({ description: 'Additional notes or reasons', required: false })
//   @Column({ type: 'text', nullable: true })
//   notes?: string;

//   @ApiProperty({ description: 'Whether attendance was manually adjusted', default: false })
//   @Column({ default: false, name: 'is_manual_entry' })
//   isManualEntry: boolean;

//   @ApiProperty({ description: 'Admin who made manual adjustment', required: false })
//   @Column({ nullable: true, name: 'adjusted_by' })
//   adjustedBy?: string;

//   @ApiProperty({ description: 'Record creation timestamp' })
//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date;

//   @ApiProperty({ description: 'Record last update timestamp' })
//   @UpdateDateColumn({ name: 'updated_at' })
//   updatedAt: Date;

//   // Calculate work duration when clocking out
//   calculateWorkDuration(): void {
//     if (this.clockInTime && this.clockOutTime) {
//       const diffMs = this.clockOutTime.getTime() - this.clockInTime.getTime();
//       this.workDurationMinutes = Math.floor(diffMs / 60000);
//     }
//   }

//   // Check if still clocked in
//   get isClockedIn(): boolean {
//     return !this.clockOutTime;
//   }
// }




// src/modules/attendance/entities/attendance.entity.ts
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

  @ApiProperty({ description: 'Clock in timestamp' })
  @Column({ type: 'timestamp', name: 'clock_in_time' })
  clockInTime: Date;

  @ApiProperty({ description: 'Clock out timestamp', required: false })
  @Column({ type: 'timestamp', nullable: true, name: 'clock_out_time' })
  clockOutTime?: Date;

  @ApiProperty({ description: 'Authentication method used for clock in' })
  @Column({
    type: 'enum',
    enum: AuthMethod,
    name: 'clock_in_method',
  })
  clockInMethod: AuthMethod;

  @ApiProperty({ description: 'Authentication method used for clock out', required: false })
  @Column({
    type: 'enum',
    enum: AuthMethod,
    nullable: true,
    name: 'clock_out_method',
  })
  clockOutMethod?: AuthMethod;

  @ApiProperty({ description: 'Clock in photo URL', required: false })
  @Column({ nullable: true, name: 'clock_in_photo' })
  clockInPhoto?: string;

  @ApiProperty({ description: 'Clock out photo URL', required: false })
  @Column({ nullable: true, name: 'clock_out_photo' })
  clockOutPhoto?: string;

  @ApiProperty({ description: 'Attendance status' })
  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ON_TIME,
  })
  status: AttendanceStatus;

  @ApiProperty({ description: 'Total work duration in minutes', required: false })
  @Column({ type: 'int', nullable: true, name: 'work_duration_minutes' })
  workDurationMinutes?: number;

  @ApiProperty({ description: 'Overtime duration in minutes', required: false })
  @Column({ type: 'int', nullable: true, default: 0, name: 'overtime_minutes' })
  overtimeMinutes?: number;

  @ApiProperty({ description: 'Whether shift was completed', default: false })
  @Column({ default: false, name: 'shift_completed' })
  shiftCompleted: boolean;

  @ApiProperty({ description: 'Clock in location', required: false })
  @Column({ nullable: true, name: 'clock_in_location' })
  clockInLocation?: string;

  @ApiProperty({ description: 'Clock out location', required: false })
  @Column({ nullable: true, name: 'clock_out_location' })
  clockOutLocation?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Manual entry flag', default: false })
  @Column({ default: false, name: 'is_manual_entry' })
  isManualEntry: boolean;

  @ApiProperty({ description: 'Admin who adjusted', required: false })
  @Column({ nullable: true, name: 'adjusted_by' })
  adjustedBy?: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Calculate work duration and overtime when clocking out
  calculateWorkDuration(): void {
    if (this.clockInTime && this.clockOutTime && this.employee?.shift) {
      // Calculate total work duration
      const diffMs = this.clockOutTime.getTime() - this.clockInTime.getTime();
      this.workDurationMinutes = Math.floor(diffMs / 60000);

      // Calculate expected shift duration
      const shiftStart = this.parseTime(this.employee.shift.startTime);
      const shiftEnd = this.parseTime(this.employee.shift.endTime);
      const expectedMinutes = this.calculateMinutesBetween(shiftStart, shiftEnd);

      // Calculate overtime (work duration exceeding shift duration)
      this.overtimeMinutes = Math.max(0, this.workDurationMinutes - expectedMinutes);

      // Determine if shift was completed (worked at least 90% of expected time)
      const completionThreshold = expectedMinutes * 0.9;
      this.shiftCompleted = this.workDurationMinutes >= completionThreshold;

      // Update status based on completion and overtime
      if (this.overtimeMinutes > 30) {
        this.status = AttendanceStatus.OVERTIME;
      } else if (this.shiftCompleted) {
        this.status = AttendanceStatus.COMPLETED;
      } else {
        this.status = AttendanceStatus.EARLY_DEPARTURE;
      }
    }
  }

  private parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  private calculateMinutesBetween(
    start: { hours: number; minutes: number },
    end: { hours: number; minutes: number },
  ): number {
    const startMinutes = start.hours * 60 + start.minutes;
    let endMinutes = end.hours * 60 + end.minutes;

    // Handle overnight shifts
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    return endMinutes - startMinutes;
  }

  get isClockedIn(): boolean {
    return !this.clockOutTime;
  }
}