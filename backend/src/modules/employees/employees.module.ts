import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './entities/employee.entity';
import { ShiftsModule } from '../shifts/shifts.module';
import { DepartmentsModule } from '../departments/departments.module';
import { ZKTecoService } from './fingerprint/zkteco.service';
import { DigitalPersonaService } from './fingerprint/digitalpersona.service';
import { FingerprintServiceFactory } from './fingerprint/fingerprint-service.factory';


@Module({
  imports: [TypeOrmModule.forFeature([Employee]), ShiftsModule, DepartmentsModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, ZKTecoService, DigitalPersonaService, FingerprintServiceFactory],
  exports: [EmployeesService, ZKTecoService, DigitalPersonaService, FingerprintServiceFactory],
})
export class EmployeesModule { }