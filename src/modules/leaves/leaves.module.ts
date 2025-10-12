import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leave } from './entities/leave.entity';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { EmployeesModule } from '../employees/employees.module';

@Module({
    imports: [TypeOrmModule.forFeature([Leave]), EmployeesModule],
    controllers: [LeavesController],
    providers: [LeavesService],
    exports: [LeavesService],
})
export class LeavesModule { }