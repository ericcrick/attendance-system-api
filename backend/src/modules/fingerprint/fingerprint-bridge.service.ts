// backend/src/modules/fingerprint/fingerprint-bridge.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { FingerprintScanResult } from './fingerprint-service.interface';
import { FingerprintDeviceType, FingerprintServiceFactory } from './fingerprint-device.factory';

@Injectable()
export class FingerprintBridgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FingerprintBridgeService.name);
  private isMonitoring = false;
  private latestScan: { template: string; timestamp: number; quality?: number } | null = null;
  private scanHistory: Array<{ template: string; timestamp: number; quality?: number }> = [];
  private maxHistorySize = 10;

  constructor(private readonly fingerprintFactory: FingerprintServiceFactory) { }

  async onModuleInit() {
    // Auto-start monitoring if configured
    const autoStart = process.env.FINGERPRINT_AUTO_START_MONITORING === 'true';
    if (autoStart) {
      await this.startMonitoring();
    }
  }

  async onModuleDestroy() {
    await this.stopMonitoring();
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      this.logger.log('Fingerprint monitoring already active');
      return { success: true, message: 'Already monitoring' };
    }

    this.logger.log('Starting fingerprint monitoring...');

    try {
      const service = this.fingerprintFactory.getService();
      const deviceType = this.fingerprintFactory.getCurrentDeviceType();

      // Connect to device
      const connected = await service.connectToDevice();
      if (!connected) {
        throw new Error('Failed to connect to fingerprint device');
      }

      // Start continuous capture
      await service.startContinuousCapture((result: FingerprintScanResult) => {
        this.handleFingerprintScan(result);
      });

      this.isMonitoring = true;
      this.logger.log(`✓ Fingerprint monitoring started successfully with ${deviceType}`);

      return { success: true, message: `Monitoring started with ${deviceType}` };
    } catch (error) {
      this.logger.error('Failed to start fingerprint monitoring:', error);
      this.isMonitoring = false;
      return {
        success: false,
        message: error.message || 'Failed to start monitoring',
      };
    }
  }

  async stopMonitoring() {
    if (!this.isMonitoring) {
      return { success: true, message: 'Not monitoring' };
    }

    this.logger.log('Stopping fingerprint monitoring...');

    try {
      const service = this.fingerprintFactory.getService();
      await service.stopContinuousCapture();

      this.isMonitoring = false;
      this.latestScan = null;
      this.scanHistory = [];

      this.logger.log('✓ Fingerprint monitoring stopped');

      return { success: true, message: 'Monitoring stopped' };
    } catch (error) {
      this.logger.error('Error stopping fingerprint monitoring:', error);
      return {
        success: false,
        message: error.message || 'Failed to stop monitoring',
      };
    }
  }

  private handleFingerprintScan(result: FingerprintScanResult) {
    if (!result.success || !result.template) {
      this.logger.warn('Fingerprint scan failed:', result.error);
      return;
    }

    this.logger.log('Fingerprint scan successful', {
      quality: result.quality,
      templateLength: result.template.length,
    });

    const scanData = {
      template: result.template,
      timestamp: Date.now(),
      quality: result.quality,
    };

    // Store the latest scan
    this.latestScan = scanData;

    // Add to history
    this.scanHistory.unshift(scanData);
    if (this.scanHistory.length > this.maxHistorySize) {
      this.scanHistory.pop();
    }

    // Auto-clear after 5 seconds
    setTimeout(() => {
      if (this.latestScan && this.latestScan.timestamp === scanData.timestamp) {
        this.latestScan = null;
      }
    }, 5000);
  }

  getLatestScan(): { template: string; timestamp: number; quality?: number } | null {
    const scan = this.latestScan;

    if (scan) {
      this.latestScan = null; // Clear after retrieval
    }

    return scan;
  }

  getScanHistory() {
    return this.scanHistory;
  }

  getMonitoringStatus() {
    const deviceType = this.fingerprintFactory.getCurrentDeviceType();

    return {
      monitoring: this.isMonitoring,
      deviceType: deviceType,
      latestScanAge: this.latestScan ? Date.now() - this.latestScan.timestamp : null,
      historyCount: this.scanHistory.length,
    };
  }

  async switchDevice(deviceType: string) {
    try {
      const wasMonitoring = this.isMonitoring;

      // Stop current monitoring
      if (wasMonitoring) {
        await this.stopMonitoring();
      }

      // Switch device
      const type = deviceType.toUpperCase() === 'ZKTECO'
        ? FingerprintDeviceType.ZKTECO
        : FingerprintDeviceType.DIGITAL_PERSONA;

      await this.fingerprintFactory.switchDevice(type);

      // Restart monitoring if it was active
      if (wasMonitoring) {
        await this.startMonitoring();
      }

      return {
        success: true,
        message: `Switched to ${type}`,
        deviceType: type,
      };
    } catch (error) {
      this.logger.error('Error switching device:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getAllDevicesInfo() {
    return await this.fingerprintFactory.getAllDevicesInfo();
  }

  simulateScan(template: string) {
    this.logger.log('Simulating fingerprint scan for testing');
    this.handleFingerprintScan({
      success: true,
      template: template,
      quality: 85,
    });
  }
}