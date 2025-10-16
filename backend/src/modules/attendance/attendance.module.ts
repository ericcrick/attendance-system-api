import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './entities/attendance.entity';
import { EmployeesModule } from '../employees/employees.module';
import { LeavesModule } from '../leaves/leaves.module';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]), EmployeesModule, LeavesModule,],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule { }