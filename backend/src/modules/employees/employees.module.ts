import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './entities/employee.entity';
import { ShiftsModule } from '../shifts/shifts.module';
import { DepartmentsModule } from '../departments/departments.module';

import { FingerprintModule } from '../fingerprint/fingerprint.module';
import { ConfigModule } from '@nestjs/config';



@Module({
  imports: [TypeOrmModule.forFeature([Employee]), ShiftsModule, DepartmentsModule, FingerprintModule, ConfigModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule { }