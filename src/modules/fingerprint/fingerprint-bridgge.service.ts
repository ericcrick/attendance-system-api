// backend/src/modules/fingerprint/fingerprint-bridge.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ZKTecoService } from '../employees/fingerprint/zkteco.service';

/**
 * Fingerprint Bridge Service
 * Monitors ZKTeco device for real-time fingerprint scans
 */
@Injectable()
export class FingerprintBridgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FingerprintBridgeService.name);
  private isMonitoring = false;
  private latestScan: { template: string; timestamp: number; userId?: string } | null = null;
  private scanHistory: Array<{ template: string; timestamp: number }> = [];
  private maxHistorySize = 10;

  constructor(private readonly zkTecoService: ZKTecoService) {}

  async onModuleInit() {
    // Auto-start monitoring when module initializes
    // Comment this out if you want manual control
    // await this.startMonitoring();
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
      // Enable real-time monitoring on ZKTeco device
      await this.zkTecoService.enableRealTimeMonitoring((data) => {
        this.handleFingerprintScan(data);
      });

      this.isMonitoring = true;
      this.logger.log('✓ Fingerprint monitoring started successfully');
      
      return { success: true, message: 'Monitoring started' };
    } catch (error) {
      this.logger.error('Failed to start fingerprint monitoring:', error);
      this.isMonitoring = false;
      return { 
        success: false, 
        message: error.message || 'Failed to start monitoring' 
      };
    }
  }

  async stopMonitoring() {
    if (!this.isMonitoring) {
      return { success: true, message: 'Not monitoring' };
    }

    this.logger.log('Stopping fingerprint monitoring...');

    try {
      await this.zkTecoService.disableRealTimeMonitoring();
      this.isMonitoring = false;
      this.latestScan = null;
      this.scanHistory = [];
      this.logger.log('✓ Fingerprint monitoring stopped');
      
      return { success: true, message: 'Monitoring stopped' };
    } catch (error) {
      this.logger.error('Error stopping fingerprint monitoring:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to stop monitoring' 
      };
    }
  }

  private handleFingerprintScan(data: any) {
    this.logger.log('Fingerprint scan detected:', {
      userId: data.userId,
      timestamp: new Date(),
    });

    const scanData = {
      template: data.template,
      timestamp: Date.now(),
      userId: data.userId,
    };

    // Store the latest scan
    this.latestScan = scanData;

    // Add to history
    this.scanHistory.unshift(scanData);
    if (this.scanHistory.length > this.maxHistorySize) {
      this.scanHistory.pop();
    }

    // Auto-clear after 5 seconds to prevent stale scans
    setTimeout(() => {
      if (
        this.latestScan &&
        this.latestScan.timestamp === scanData.timestamp
      ) {
        this.latestScan = null;
      }
    }, 5000);
  }

  /**
   * Poll for latest fingerprint scan
   * Used by kiosk frontend
   */
  getLatestScan(): { template: string; timestamp: number; userId?: string } | null {
    const scan = this.latestScan;

    // Clear after retrieval to prevent duplicate processing
    if (scan) {
      this.latestScan = null;
    }

    return scan;
  }

  /**
   * Get scan history (for debugging)
   */
  getScanHistory() {
    return this.scanHistory;
  }

  getMonitoringStatus() {
    return {
      monitoring: this.isMonitoring,
      latestScanAge: this.latestScan
        ? Date.now() - this.latestScan.timestamp
        : null,
      historyCount: this.scanHistory.length,
    };
  }

  /**
   * Manually add a fingerprint scan (for testing)
   */
  simulateScan(template: string, userId?: string) {
    this.logger.log('Simulating fingerprint scan for testing');
    this.handleFingerprintScan({
      template,
      userId: userId || 'TEST_USER',
      timestamp: new Date(),
    });
  }
}