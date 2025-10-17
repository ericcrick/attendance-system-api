import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FingerprintController } from './fingerprint.controller';
import { FingerprintBridgeService } from './fingerprint-bridge.service';
import { FingerprintServiceFactory } from './fingerprint-device.factory';
import { ZKTecoService } from './zkteco.service';
import { DigitalPersonaService } from './digital-persona.service';
import { IFingerprintService } from './fingerprint-service.interface';

@Module({
    imports: [ConfigModule], // 👈 make sure ConfigModule is imported
    controllers: [FingerprintController],
    providers: [
        FingerprintBridgeService,
        FingerprintServiceFactory,
        ZKTecoService,
        DigitalPersonaService,
        {
            provide: IFingerprintService,
            useFactory: (
                config: ConfigService,
                dp: DigitalPersonaService,
                zk: ZKTecoService,
            ) => {
                const type = config
                    .get<string>('FINGERPRINT_DEVICE_TYPE', 'DIGITAL_PERSONA')
                    ?.toUpperCase();

                console.log(`Active fingerprint device from .env: ${type}`);

                return type === 'ZKTECO' ? zk : dp;
            },
            inject: [ConfigService, DigitalPersonaService, ZKTecoService],
        },
    ],
    exports: [
        FingerprintBridgeService,
        FingerprintServiceFactory,
        ZKTecoService,
        DigitalPersonaService,
        IFingerprintService,
    ],
})
export class FingerprintModule { }
