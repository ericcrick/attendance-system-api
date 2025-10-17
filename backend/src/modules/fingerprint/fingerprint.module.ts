// backend/src/modules/fingerprint/fingerprint.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ZKTecoService } from './zkteco.service';

import { IFingerprintService } from './fingerprint-service.interface';
import { DigitalPersonaService } from './digitalpersona.service';

@Module({
    imports: [ConfigModule],
    providers: [
        // Concrete implementations
        ZKTecoService,
        DigitalPersonaService,

        // Dynamic provider based on environment
        {
            provide: IFingerprintService,
            useFactory: (
                config: ConfigService,
                digitalPersona: DigitalPersonaService,
                zkteco: ZKTecoService,
            ) => {
                const deviceType = config
                    .get<string>('FINGERPRINT_DEVICE_TYPE', 'DIGITAL_PERSONA')
                    ?.toUpperCase()
                    .replace(/[-\s]/g, '_');

                console.log(`🔧 Active fingerprint service: ${deviceType}`);

                return deviceType === 'ZKTECO' ? zkteco : digitalPersona;
            },
            inject: [ConfigService, DigitalPersonaService, ZKTecoService],
        },
    ],
    exports: [
        // Only export what's needed
        IFingerprintService, // For injection in other modules
        DigitalPersonaService, // If you need direct access
        ZKTecoService, // If you need direct access
    ],
})
export class FingerprintModule { }