import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('shifts')
export class Shift {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Shift name', example: 'Morning Shift' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Shift start time', example: '08:00' })
  @Column({ name: 'start_time' })
  startTime: string;

  @ApiProperty({ description: 'Shift end time', example: '16:00' })
  @Column({ name: 'end_time' })
  endTime: string;

  @ApiProperty({ description: 'Grace period for late arrival in minutes', example: 15 })
  @Column({ name: 'grace_period_minutes', default: 15 })
  gracePeriodMinutes: number;

  @ApiProperty({ description: 'Shift description', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Shift color code for UI', example: '#3B82F6', required: false })
  @Column({ name: 'color_code', nullable: true })
  colorCode?: string;

  @ApiProperty({ description: 'Whether shift is active', default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Employees assigned to this shift', type: () => [Employee] })
  @OneToMany(() => Employee, (employee) => employee.shift)
  employees: Employee[];

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper method to check if current time is within shift
  isWithinShift(time: Date = new Date()): boolean {
    const currentTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= this.startTime && currentTime <= this.endTime;
  }

  // Calculate if arrival is late
  isLateArrival(arrivalTime: Date): boolean {
    const [shiftHour, shiftMinute] = this.startTime.split(':').map(Number);
    const shiftStart = new Date(arrivalTime);
    shiftStart.setHours(shiftHour, shiftMinute, 0, 0);

    const graceEnd = new Date(shiftStart.getTime() + this.gracePeriodMinutes * 60000);
    return arrivalTime > graceEnd;
  }
}