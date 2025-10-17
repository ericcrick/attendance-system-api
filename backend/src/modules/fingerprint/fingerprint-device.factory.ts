// backend/src/modules/fingerprint/fingerprint-service.factory.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZKTecoService } from './zkteco.service';
import { IFingerprintService } from './fingerprint-service.interface';


export enum FingerprintDeviceType {
    ZKTECO = 'ZKTECO',
    DIGITAL_PERSONA = 'DIGITAL_PERSONA',
}

@Injectable()
export class FingerprintServiceFactory {
    private readonly logger = new Logger(FingerprintServiceFactory.name);
    private currentDeviceType: FingerprintDeviceType;

    constructor(
        private configService: ConfigService,
        private zkTecoService: ZKTecoService,
        private digitalPersonaService: IFingerprintService, // Inject DigitalPersonaService
    ) {
        // Get device type from environment
        const deviceType = this.configService
            .get<string>('FINGERPRINT_DEVICE_TYPE', 'DIGITAL_PERSONA')
            .toUpperCase()
            .replace('-', '_'); // Handle both DIGITAL_PERSONA and DIGITAL-PERSONA

        this.currentDeviceType =
            FingerprintDeviceType[deviceType] || FingerprintDeviceType.DIGITAL_PERSONA;

        this.logger.log(`Fingerprint device initialized: ${this.currentDeviceType}`);
    }

    /**
     * Get the active fingerprint service
     */
    getService(): IFingerprintService {
        switch (this.currentDeviceType) {
            case FingerprintDeviceType.ZKTECO:
                return this.zkTecoService;

            case FingerprintDeviceType.DIGITAL_PERSONA:
                return this.digitalPersonaService;

            default:
                this.logger.warn(
                    `Unknown device type: ${this.currentDeviceType}, defaulting to DigitalPersona`,
                );
                return this.digitalPersonaService;
        }
    }

    /**
     * Switch device type
     */
    async switchDevice(deviceType: FingerprintDeviceType): Promise<void> {
        this.logger.log(
            `Switching fingerprint device from ${this.currentDeviceType} to ${deviceType}`,
        );

        // Disconnect current device
        const currentService = this.getService();
        await currentService.disconnectFromDevice();

        // Switch
        this.currentDeviceType = deviceType;

        // Connect new device
        const newService = this.getService();
        await newService.connectToDevice();

        this.logger.log(`✓ Switched to ${deviceType}`);
    }

    /**
     * Get current device type
     */
    getCurrentDeviceType(): FingerprintDeviceType {
        return this.currentDeviceType;
    }

    /**
     * Get info for all available devices
     */
    async getAllDevicesInfo() {
        const [zktecoInfo, digitalPersonaInfo] = await Promise.all([
            this.zkTecoService.getDeviceInfo().catch(() => ({
                connected: false,
                model: 'ZKTeco',
            })),
            this.digitalPersonaService.getDeviceInfo().catch(() => ({
                connected: false,
                model: 'DigitalPersona U.are.U 4500',
            })),
        ]);

        return {
            current: this.currentDeviceType,
            devices: {
                ZKTECO: {
                    type: FingerprintDeviceType.ZKTECO,
                    info: zktecoInfo,
                    active: this.currentDeviceType === FingerprintDeviceType.ZKTECO,
                },
                DIGITAL_PERSONA: {
                    type: FingerprintDeviceType.DIGITAL_PERSONA,
                    info: digitalPersonaInfo,
                    active: this.currentDeviceType === FingerprintDeviceType.DIGITAL_PERSONA,
                },
            },
        };
    }

    /**
     * Test connection to a specific device
     */
    async testDeviceConnection(deviceType: FingerprintDeviceType) {
        const service =
            deviceType === FingerprintDeviceType.ZKTECO
                ? this.zkTecoService
                : this.digitalPersonaService;

        return await service.testConnection();
    }
}