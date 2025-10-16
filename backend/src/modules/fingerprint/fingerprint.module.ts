import { Module } from '@nestjs/common';
import { FingerprintController } from './fingerprint.controller';
import { FingerprintBridgeService } from './fingerprint-bridgge.service';
import { EmployeesModule } from '../employees/employees.module';



@Module({
    imports: [EmployeesModule],
    controllers: [FingerprintController],
    providers: [FingerprintBridgeService],
    exports: [FingerprintBridgeService],
})
export class FingerprintModule { }