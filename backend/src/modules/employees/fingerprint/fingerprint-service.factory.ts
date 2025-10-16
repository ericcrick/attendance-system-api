// backend/src/modules/employees/fingerprint/fingerprint-service.factory.ts
import { Injectable, Logger } from '@nestjs/common';
import { IFingerprintService } from './fingerprint-service.interface';
import { ZKTecoService } from './zkteco.service';
import { DigitalPersonaService } from './digitalpersona.service';

export enum FingerprintDeviceType {
  ZKTECO = 'ZKTECO',
  DIGITAL_PERSONA = 'DIGITAL_PERSONA',
}

@Injectable()
export class FingerprintServiceFactory {
  private readonly logger = new Logger(FingerprintServiceFactory.name);
  private currentService: IFingerprintService;
  private deviceType: FingerprintDeviceType;

  constructor(
    private readonly zkTecoService: ZKTecoService,
    private readonly digitalPersonaService: DigitalPersonaService,
  ) {
    // Determine which device to use from environment variable
    const deviceConfig = process.env.FINGERPRINT_DEVICE_TYPE?.toUpperCase() || 'DIGITAL_PERSONA';
    
    this.deviceType = deviceConfig === 'ZKTECO' 
      ? FingerprintDeviceType.ZKTECO 
      : FingerprintDeviceType.DIGITAL_PERSONA;

    this.currentService = this.getService(this.deviceType);
    
    this.logger.log(`✓ Fingerprint service initialized with ${this.deviceType} device`);
  }

  /**
   * Get the current active fingerprint service
   */
  getService(type?: FingerprintDeviceType): IFingerprintService {
    const serviceType = type || this.deviceType;

    switch (serviceType) {
      case FingerprintDeviceType.ZKTECO:
        return this.zkTecoService;
      case FingerprintDeviceType.DIGITAL_PERSONA:
        return this.digitalPersonaService;
      default:
        this.logger.warn(`Unknown device type: ${serviceType}, defaulting to Digital Persona`);
        return this.digitalPersonaService;
    }
  }

  /**
   * Switch between fingerprint devices
   */
  async switchDevice(type: FingerprintDeviceType): Promise<void> {
    this.logger.log(`Switching fingerprint device to: ${type}`);
    
    // Disconnect current device
    await this.currentService.disconnectFromDevice();
    
    // Switch to new device
    this.deviceType = type;
    this.currentService = this.getService(type);
    
    // Connect to new device
    await this.currentService.connectToDevice();
    
    this.logger.log(`✓ Successfully switched to ${type}`);
  }

  /**
   * Get current device type
   */
  getCurrentDeviceType(): FingerprintDeviceType {
    return this.deviceType;
  }

  /**
   * Get info about all available devices
   */
  async getAllDevicesInfo(): Promise<any> {
    const zktecoInfo = await this.zkTecoService.getDeviceInfo();
    const dpInfo = await this.digitalPersonaService.getDeviceInfo();

    return {
      current: this.deviceType,
      devices: {
        ZKTECO: zktecoInfo,
        DIGITAL_PERSONA: dpInfo,
      },
    };
  }
}