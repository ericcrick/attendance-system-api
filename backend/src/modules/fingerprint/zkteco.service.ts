
// backend/src/modules/fingerprint/zkteco.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { IFingerprintService, FingerprintDeviceInfo, FingerprintScanResult } from './fingerprint-service.interface';

// Fix ZKLib import - it's a CommonJS module
let ZKLib: any;
try {
  ZKLib = require('zklib');
  // Some versions export differently
  if (ZKLib.default) {
    ZKLib = ZKLib.default;
  }
  // If it's wrapped in another object
  if (typeof ZKLib !== 'function' && ZKLib.ZKLib) {
    ZKLib = ZKLib.ZKLib;
  }
} catch (error) {
  console.warn('ZKTeco library (zklib) not installed. ZKTeco features will be unavailable.');
  ZKLib = null;
}

@Injectable()
export class ZKTecoService implements IFingerprintService {
  private readonly logger = new Logger(ZKTecoService.name);
  private deviceIp: string;
  private devicePort: number;
  private devicePassword: string;
  private device: any = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private isCapturing: boolean = false;
  private captureCallback: ((result: FingerprintScanResult) => void) | null = null;
  private captureInterval: NodeJS.Timeout | null = null;
  private zkLibAvailable: boolean = false;

  constructor() {
    this.deviceIp = process.env.ZKTECO_DEVICE_IP || '192.168.1.201';
    this.devicePort = parseInt(process.env.ZKTECO_DEVICE_PORT || '4370');
    this.devicePassword = process.env.ZKTECO_DEVICE_PASSWORD || '';
    this.zkLibAvailable = ZKLib !== null;
    
    this.logger.log(`ZKTeco Service initialized for device at ${this.deviceIp}:${this.devicePort} (Library Available: ${this.zkLibAvailable})`);
  }

  validateFingerprintTemplate(template: string): boolean {
    if (!template || template.length < 100) {
      this.logger.warn('Fingerprint template too short');
      return false;
    }

    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(template)) {
      this.logger.warn('Invalid Base64 format for fingerprint template');
      return false;
    }

    const estimatedByteSize = (template.length * 3) / 4;
    if (estimatedByteSize < 400 || estimatedByteSize > 3000) {
      this.logger.warn(`Fingerprint template size out of range: ${estimatedByteSize} bytes`);
      return false;
    }

    return true;
  }

  async connectToDevice(): Promise<boolean> {
    try {
      if (this.isConnected && this.device) {
        this.logger.log('Already connected to device');
        return true;
      }

      if (!this.zkLibAvailable) {
        this.logger.warn('ZKTeco library not available. Install with: npm install zklib');
        return false;
      }

      this.logger.log(`Attempting to connect to ZKTeco device at ${this.deviceIp}:${this.devicePort}`);

      // Create new device instance with proper constructor
      this.device = new ZKLib(this.deviceIp, this.devicePort, 10000, 4000);
      
      await this.device.createSocket();
      this.isConnected = true;
      this.reconnectAttempts = 0;

      this.logger.log('Successfully connected to ZKTeco device');

      const info = await this.getDeviceInfo();
      this.logger.log(`Device Info: ${JSON.stringify(info)}`);

      return true;
    } catch (error) {
      this.isConnected = false;
      this.logger.error(`Failed to connect to ZKTeco device: ${error.message}`, error.stack);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.logger.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.connectToDevice();
      }
      
      return false;
    }
  }

  async disconnectFromDevice(): Promise<void> {
    try {
      if (this.isCapturing) {
        await this.stopContinuousCapture();
      }

      if (this.device && this.isConnected) {
        await this.device.disconnect();
        this.isConnected = false;
        this.device = null;
        this.logger.log('Disconnected from ZKTeco device');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from device:', error);
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      const connected = await this.connectToDevice();
      if (!connected) {
        throw new BadRequestException('Unable to connect to fingerprint device');
      }
    }
  }

  async getDeviceInfo(): Promise<FingerprintDeviceInfo> {
    try {
      await this.ensureConnection();

      const info = await this.device.getInfo();
      const version = await this.device.getVersion();
      const platform = await this.device.getPlatform();
      const users = await this.device.getUsers();
      const userCount = users ? users.data.length : 0;

      return {
        connected: this.isConnected,
        model: platform || 'ZKTeco',
        serialNumber: info?.serialNumber || 'Unknown',
        firmware: version || 'Unknown',
        ip: this.deviceIp,
        port: this.devicePort,
      };
    } catch (error) {
      this.logger.error('Failed to get device info:', error);
      return {
        connected: false,
        model: 'ZKTeco',
        ip: this.deviceIp,
        port: this.devicePort,
      };
    }
  }

  /**
   * Capture a single fingerprint template
   * ZKTeco devices work with real-time monitoring, so this polls for a scan
   */
  async captureFingerprintTemplate(): Promise<FingerprintScanResult> {
    try {
      if (!this.isConnected) {
        const connected = await this.connectToDevice();
        if (!connected) {
          return {
            success: false,
            error: 'Device not connected',
          };
        }
      }

      this.logger.log('Waiting for fingerprint scan on ZKTeco device...');

      return await new Promise<FingerprintScanResult>((resolve) => {
        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve({
              success: false,
              error: 'Capture timeout - no finger detected',
            });
          }
        }, 30000); // 30 second timeout

        // Enable real-time monitoring temporarily
        this.enableRealTimeMonitoring((data) => {
          if (!resolved && data.template) {
            resolved = true;
            clearTimeout(timeout);

            // Convert template to base64 if it's a Buffer
            let template = data.template;
            if (Buffer.isBuffer(template)) {
              template = template.toString('base64');
            }

            resolve({
              success: true,
              template: template,
              quality: 85, // ZKTeco doesn't provide quality score
            });

            // Disable monitoring after capture
            this.disableRealTimeMonitoring();
          }
        }).catch((error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve({
              success: false,
              error: error.message,
            });
          }
        });
      });
    } catch (error) {
      this.logger.error('Capture error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Start continuous fingerprint capture
   */
  async startContinuousCapture(callback: (result: FingerprintScanResult) => void): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connectToDevice();
      }

      if (this.isCapturing) {
        this.logger.warn('Already capturing');
        return;
      }

      this.captureCallback = callback;
      this.isCapturing = true;

      this.logger.log('Starting continuous fingerprint capture on ZKTeco...');

      // Enable real-time monitoring on the device
      await this.enableRealTimeMonitoring((data) => {
        if (data.template && this.captureCallback) {
          let template = data.template;
          if (Buffer.isBuffer(template)) {
            template = template.toString('base64');
          }

          this.captureCallback({
            success: true,
            template: template,
            quality: 85,
          });
        }
      });

    } catch (error) {
      this.isCapturing = false;
      this.logger.error('Failed to start continuous capture:', error);
      throw error;
    }
  }

  /**
   * Stop continuous capture
   */
  async stopContinuousCapture(): Promise<void> {
    try {
      if (!this.isCapturing) {
        return;
      }

      this.logger.log('Stopping continuous capture...');

      await this.disableRealTimeMonitoring();

      if (this.captureInterval) {
        clearInterval(this.captureInterval);
        this.captureInterval = null;
      }

      this.isCapturing = false;
      this.captureCallback = null;

      this.logger.log('✓ Continuous capture stopped');
    } catch (error) {
      this.logger.error('Error stopping capture:', error);
      this.isCapturing = false;
      this.captureCallback = null;
    }
  }

  async enrollFingerprintOnDevice(
    employeeId: string,
    fingerprintTemplate: string,
  ): Promise<string> {
    try {
      await this.ensureConnection();

      if (!this.validateFingerprintTemplate(fingerprintTemplate)) {
        throw new BadRequestException('Invalid fingerprint template');
      }

      const templateBuffer = Buffer.from(fingerprintTemplate, 'base64');
      const timestamp = Date.now();
      const deviceUserId = (timestamp % 1000000).toString();

      this.logger.log(`Enrolling fingerprint for employee ${employeeId} with device ID ${deviceUserId}`);

      const userData = {
        uid: parseInt(deviceUserId),
        userId: employeeId,
        name: employeeId,
        password: '',
        role: 0,
        cardno: 0,
      };

      await this.device.setUser(userData);

      const templateData = {
        uid: parseInt(deviceUserId),
        fid: 0,
        valid: 1,
        template: templateBuffer,
      };

      await this.device.setTemplate(templateData);

      this.logger.log(`Successfully enrolled fingerprint for ${employeeId}`);

      return deviceUserId;
    } catch (error) {
      this.logger.error(`Device enrollment error for ${employeeId}:`, error);
      throw new BadRequestException(`Failed to enroll fingerprint on device: ${error.message}`);
    }
  }

  async deleteFingerprintFromDevice(deviceUserId: string): Promise<boolean> {
    try {
      await this.ensureConnection();

      this.logger.log(`Deleting fingerprint with device ID: ${deviceUserId}`);
      await this.device.deleteUser(parseInt(deviceUserId));
      this.logger.log(`Successfully deleted fingerprint for device ID ${deviceUserId}`);

      return true;
    } catch (error) {
      this.logger.error(`Device deletion error for ${deviceUserId}:`, error);
      return false;
    }
  }

  async getAllUsersFromDevice(): Promise<any[]> {
    try {
      await this.ensureConnection();
      const users = await this.device.getUsers();
      return users?.data || [];
    } catch (error) {
      this.logger.error('Failed to get users from device:', error);
      return [];
    }
  }

  async getAllTemplatesFromDevice(): Promise<any[]> {
    try {
      await this.ensureConnection();
      const templates = await this.device.getTemplates();
      return templates?.data || [];
    } catch (error) {
      this.logger.error('Failed to get templates from device:', error);
      return [];
    }
  }

  async verifyFingerprintOnDevice(fingerprintTemplate: string): Promise<string | null> {
    try {
      await this.ensureConnection();

      if (!this.validateFingerprintTemplate(fingerprintTemplate)) {
        throw new BadRequestException('Invalid fingerprint template');
      }

      const deviceTemplates = await this.getAllTemplatesFromDevice();
      const inputBuffer = Buffer.from(fingerprintTemplate, 'base64');

      for (const template of deviceTemplates) {
        const deviceBuffer = template.template;
        const similarity = this.calculateTemplateSimilarity(inputBuffer, deviceBuffer);
        const threshold = parseFloat(process.env.FINGERPRINT_MATCH_THRESHOLD || '60');

        if (similarity >= threshold) {
          this.logger.log(`Fingerprint matched with similarity ${similarity}%`);
          return template.userId;
        }
      }

      this.logger.log('No matching fingerprint found on device');
      return null;
    } catch (error) {
      this.logger.error('Fingerprint verification error:', error);
      return null;
    }
  }

  async compareFingerprintTemplates(template1: string, template2: string): Promise<number> {
    try {
      if (!this.validateFingerprintTemplate(template1) ||
        !this.validateFingerprintTemplate(template2)) {
        throw new BadRequestException('Invalid fingerprint template');
      }

      if (template1 === template2) {
        return 100;
      }

      const buffer1 = Buffer.from(template1, 'base64');
      const buffer2 = Buffer.from(template2, 'base64');

      return this.calculateTemplateSimilarity(buffer1, buffer2);
    } catch (error) {
      this.logger.error('Fingerprint comparison error:', error);
      return 0;
    }
  }

  private calculateTemplateSimilarity(buffer1: Buffer, buffer2: Buffer): number {
    try {
      const minLength = Math.min(buffer1.length, buffer2.length);
      let matchingBytes = 0;
      let totalBits = minLength * 8;

      for (let i = 0; i < minLength; i++) {
        const xor = buffer1[i] ^ buffer2[i];
        matchingBytes += 8 - this.countSetBits(xor);
      }

      const similarity = (matchingBytes / totalBits) * 100;
      return Math.round(similarity * 100) / 100;
    } catch (error) {
      this.logger.error('Error calculating template similarity:', error);
      return 0;
    }
  }

  private countSetBits(byte: number): number {
    let count = 0;
    while (byte) {
      count += byte & 1;
      byte >>= 1;
    }
    return count;
  }

  async matchFingerprints(template1: string, template2: string, threshold?: number): Promise<boolean> {
    const matchThreshold = threshold || parseFloat(process.env.FINGERPRINT_MATCH_THRESHOLD || '60');
    const similarity = await this.compareFingerprintTemplates(template1, template2);

    this.logger.log(`Fingerprint match similarity: ${similarity}%, threshold: ${matchThreshold}%`);

    return similarity >= matchThreshold;
  }

  async syncFingerprintsToDevice(
    employees: Array<{ id: string; employeeId: string; fingerprintTemplate: string }>,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    this.logger.log(`Starting sync of ${employees.length} fingerprints to device`);

    try {
      await this.ensureConnection();

      for (const employee of employees) {
        try {
          if (!employee.fingerprintTemplate) {
            continue;
          }

          await this.enrollFingerprintOnDevice(
            employee.employeeId,
            employee.fingerprintTemplate,
          );
          success++;

          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          failed++;
          errors.push(`${employee.employeeId}: ${error.message}`);
          this.logger.error(`Failed to sync ${employee.employeeId}:`, error);
        }
      }

      this.logger.log(`Sync completed. Success: ${success}, Failed: ${failed}`);
    } catch (error) {
      this.logger.error('Sync operation failed:', error);
      throw new BadRequestException(`Sync operation failed: ${error.message}`);
    }

    return { success, failed, errors };
  }

  async clearAllDataFromDevice(): Promise<boolean> {
    try {
      await this.ensureConnection();

      this.logger.log('Clearing all data from device');

      await this.device.clearAttendanceLog();

      const users = await this.getAllUsersFromDevice();

      for (const user of users) {
        await this.device.deleteUser(user.uid);
      }

      this.logger.log('Successfully cleared all data from device');

      return true;
    } catch (error) {
      this.logger.error('Failed to clear device data:', error);
      return false;
    }
  }

  async getAttendanceLogs(): Promise<any[]> {
    try {
      await this.ensureConnection();

      const logs = await this.device.getAttendances();

      if (!logs || !logs.data) {
        return [];
      }

      return logs.data.map((log: any) => ({
        userId: log.userId,
        deviceUserId: log.deviceUserId,
        timestamp: log.recordTime,
        type: log.type,
        verifyType: log.verifyType,
      }));
    } catch (error) {
      this.logger.error('Failed to get attendance logs:', error);
      return [];
    }
  }

  async enableRealTimeMonitoring(callback: (data: any) => void): Promise<void> {
    try {
      await this.ensureConnection();

      this.logger.log('Enabling real-time monitoring');

      this.device.on('realtime_log', (data: any) => {
        this.logger.log('Real-time log event:', data);
        callback(data);
      });

      await this.device.enableRealtime();
    } catch (error) {
      this.logger.error('Failed to enable real-time monitoring:', error);
      throw new BadRequestException(`Failed to enable real-time monitoring: ${error.message}`);
    }
  }

  async disableRealTimeMonitoring(): Promise<void> {
    try {
      if (this.device && this.isConnected) {
        await this.device.disableRealtime();
        this.logger.log('Real-time monitoring disabled');
      }
    } catch (error) {
      this.logger.error('Failed to disable real-time monitoring:', error);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; info?: any }> {
    try {
      const connected = await this.connectToDevice();

      if (!connected) {
        return {
          success: false,
          message: 'Failed to connect to device',
        };
      }

      const info = await this.getDeviceInfo();

      return {
        success: true,
        message: 'Successfully connected to device',
        info,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
      };
    }
  }

  async onModuleDestroy() {
    await this.disconnectFromDevice();
  }
}