// // src/modules/employees/fingerprint/zkteco.service.ts
// import { Injectable, BadRequestException } from '@nestjs/common';

// /**
//  * ZKTeco Fingerprint Service
//  * This service handles communication with ZKTeco fingerprint devices
//  * 
//  * Note: For production use, install the ZKTeco SDK:
//  * npm install zklib node-zklib
//  * 
//  * This is a mock implementation. Replace with actual ZKTeco SDK integration.
//  */
// @Injectable()
// export class ZKTecoService {
//   private deviceIp: string;
//   private devicePort: number;

//   constructor() {
//     // Configure from environment variables
//     this.deviceIp = process.env.ZKTECO_DEVICE_IP || '192.168.1.201';
//     this.devicePort = parseInt(process.env.ZKTECO_DEVICE_PORT || '4370');
//   }

//   /**
//    * Validate fingerprint template format
//    */
//   validateFingerprintTemplate(template: string): boolean {
//     if (!template || template.length < 100) {
//       return false;
//     }

//     // Check if it's valid Base64
//     const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
//     return base64Regex.test(template);
//   }

//   /**
//    * Compare two fingerprint templates
//    * Returns similarity score (0-100)
//    */
//   async compareFingerprintTemplates(
//     template1: string,
//     template2: string,
//   ): Promise<number> {
//     try {
//       // Mock implementation - Replace with actual ZKTeco SDK comparison
//       // In production, use ZKTeco's comparison algorithm
      
//       if (!this.validateFingerprintTemplate(template1) || 
//           !this.validateFingerprintTemplate(template2)) {
//         throw new BadRequestException('Invalid fingerprint template');
//       }

//       // Simple comparison for mock - In production, use device SDK
//       if (template1 === template2) {
//         return 100;
//       }

//       // Calculate similarity (mock)
//       const minLength = Math.min(template1.length, template2.length);
//       let matches = 0;
      
//       for (let i = 0; i < minLength; i++) {
//         if (template1[i] === template2[i]) {
//           matches++;
//         }
//       }

//       return (matches / minLength) * 100;
//     } catch (error) {
//       console.error('Fingerprint comparison error:', error);
//       return 0;
//     }
//   }

//   /**
//    * Check if fingerprint templates match
//    * Threshold: 60% similarity
//    */
//   async matchFingerprints(
//     template1: string,
//     template2: string,
//     threshold: number = 60,
//   ): Promise<boolean> {
//     const similarity = await this.compareFingerprintTemplates(template1, template2);
//     return similarity >= threshold;
//   }

//   /**
//    * Connect to ZKTeco device
//    * For production: Implement actual device connection
//    */
//   async connectToDevice(): Promise<boolean> {
//     try {
//       console.log(`Connecting to ZKTeco device at ${this.deviceIp}:${this.devicePort}`);
      
//       // Mock connection - Replace with actual ZKTeco SDK connection
//       // Example with zklib:
//       // const ZKLib = require('zklib');
//       // const device = new ZKLib(this.deviceIp, this.devicePort);
//       // await device.connect();
      
//       return true;
//     } catch (error) {
//       console.error('Failed to connect to ZKTeco device:', error);
//       return false;
//     }
//   }

//   /**
//    * Enroll fingerprint on device
//    * Returns device user ID
//    */
//   async enrollFingerprintOnDevice(
//     employeeId: string,
//     fingerprintTemplate: string,
//   ): Promise<string> {
//     try {
//       // Mock implementation - Replace with actual device enrollment
//       // In production, send template to device and get device user ID
      
//       const deviceUserId = `DEV-${Date.now()}`;
//       console.log(`Enrolled fingerprint for ${employeeId} with device ID: ${deviceUserId}`);
      
//       return deviceUserId;
//     } catch (error) {
//       console.error('Device enrollment error:', error);
//       throw new BadRequestException('Failed to enroll fingerprint on device');
//     }
//   }

//   /**
//    * Delete fingerprint from device
//    */
//   async deleteFingerprintFromDevice(deviceUserId: string): Promise<boolean> {
//     try {
//       // Mock implementation - Replace with actual device deletion
//       console.log(`Deleted fingerprint with device ID: ${deviceUserId}`);
//       return true;
//     } catch (error) {
//       console.error('Device deletion error:', error);
//       return false;
//     }
//   }

//   /**
//    * Sync all fingerprints to device
//    */
//   async syncFingerprintsToDevice(
//     employees: Array<{ id: string; fingerprintTemplate: string }>,
//   ): Promise<{ success: number; failed: number }> {
//     let success = 0;
//     let failed = 0;

//     for (const employee of employees) {
//       try {
//         await this.enrollFingerprintOnDevice(employee.id, employee.fingerprintTemplate);
//         success++;
//       } catch (error) {
//         failed++;
//       }
//     }

//     return { success, failed };
//   }

//   /**
//    * Get device status and information
//    */
//   async getDeviceInfo(): Promise<any> {
//     try {
//       return {
//         ip: this.deviceIp,
//         port: this.devicePort,
//         connected: true,
//         model: 'ZKTeco K40',
//         firmware: '6.60',
//         users: 0,
//         capacity: 3000,
//       };
//     } catch (error) {
//       console.error('Failed to get device info:', error);
//       return null;
//     }
//   }
// }





// src/modules/employees/fingerprint/zkteco.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as ZKLib from 'zklib';

/**
 * Production-Ready ZKTeco Fingerprint Service
 * Handles communication with ZKTeco fingerprint devices using zklib
 * 
 * Installation: npm install zklib
 * 
 * Supported Devices:
 * - ZKTeco K40
 * - ZKTeco K50
 * - ZKTeco F18
 * - ZKTeco TFT Series
 * - ZKTeco U160
 * - Most ZKTeco devices with TCP/IP connectivity
 */
@Injectable()
export class ZKTecoService {
  private readonly logger = new Logger(ZKTecoService.name);
  private deviceIp: string;
  private devicePort: number;
  private devicePassword: string;
  private device: any = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  constructor() {
    // Load configuration from environment variables
    this.deviceIp = process.env.ZKTECO_DEVICE_IP || '192.168.1.201';
    this.devicePort = parseInt(process.env.ZKTECO_DEVICE_PORT || '4370');
    this.devicePassword = process.env.ZKTECO_DEVICE_PASSWORD || '';
    
    this.logger.log(`ZKTeco Service initialized for device at ${this.deviceIp}:${this.devicePort}`);
  }

  /**
   * Validate fingerprint template format
   * ZKTeco templates are typically 512-2048 bytes in Base64 format
   */
  validateFingerprintTemplate(template: string): boolean {
    if (!template || template.length < 100) {
      this.logger.warn('Fingerprint template too short');
      return false;
    }

    // Check if it's valid Base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(template)) {
      this.logger.warn('Invalid Base64 format for fingerprint template');
      return false;
    }

    // ZKTeco templates are typically 512-2048 bytes
    // Base64 encoding increases size by ~33%
    const estimatedByteSize = (template.length * 3) / 4;
    if (estimatedByteSize < 400 || estimatedByteSize > 3000) {
      this.logger.warn(`Fingerprint template size out of range: ${estimatedByteSize} bytes`);
      return false;
    }

    return true;
  }

  /**
   * Connect to ZKTeco device
   */
  async connectToDevice(): Promise<boolean> {
    try {
      if (this.isConnected && this.device) {
        this.logger.log('Already connected to device');
        return true;
      }

      this.logger.log(`Attempting to connect to ZKTeco device at ${this.deviceIp}:${this.devicePort}`);

      // Create new device instance
      this.device = new ZKLib(this.deviceIp, this.devicePort, 10000, 4000);

      // Connect to device
      await this.device.createSocket();
      this.isConnected = true;
      this.reconnectAttempts = 0;

      this.logger.log('Successfully connected to ZKTeco device');

      // Get device info for verification
      const info = await this.getDeviceInfo();
      this.logger.log(`Device Info: ${JSON.stringify(info)}`);

      return true;
    } catch (error) {
      this.isConnected = false;
      this.logger.error(`Failed to connect to ZKTeco device: ${error.message}`, error.stack);
      
      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.logger.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.connectToDevice();
      }
      
      return false;
    }
  }

  /**
   * Disconnect from device
   */
  async disconnectFromDevice(): Promise<void> {
    try {
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

  /**
   * Ensure device connection
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      const connected = await this.connectToDevice();
      if (!connected) {
        throw new BadRequestException('Unable to connect to fingerprint device');
      }
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<any> {
    try {
      await this.ensureConnection();

      const info = await this.device.getInfo();
      const version = await this.device.getVersion();
      const platform = await this.device.getPlatform();
      
      // Get user count
      const users = await this.device.getUsers();
      const userCount = users ? users.data.length : 0;

      return {
        ip: this.deviceIp,
        port: this.devicePort,
        connected: this.isConnected,
        serialNumber: info?.serialNumber || 'Unknown',
        model: platform || 'ZKTeco',
        firmware: version || 'Unknown',
        users: userCount,
        platform: platform,
        deviceName: info?.deviceName || 'Unknown',
        lastConnection: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get device info:', error);
      return {
        ip: this.deviceIp,
        port: this.devicePort,
        connected: false,
        error: error.message,
      };
    }
  }

  /**
   * Enroll fingerprint on device
   * Returns device user ID
   */
  async enrollFingerprintOnDevice(
    employeeId: string,
    fingerprintTemplate: string,
  ): Promise<string> {
    try {
      await this.ensureConnection();

      if (!this.validateFingerprintTemplate(fingerprintTemplate)) {
        throw new BadRequestException('Invalid fingerprint template');
      }

      // Convert Base64 template to Buffer
      const templateBuffer = Buffer.from(fingerprintTemplate, 'base64');

      // Generate unique device user ID
      // ZKTeco devices typically use numeric IDs
      const timestamp = Date.now();
      const deviceUserId = (timestamp % 1000000).toString();

      this.logger.log(`Enrolling fingerprint for employee ${employeeId} with device ID ${deviceUserId}`);

      // Set user data on device
      const userData = {
        uid: parseInt(deviceUserId),
        userId: employeeId,
        name: employeeId,
        password: '',
        role: 0, // Regular user
        cardno: 0,
      };

      await this.device.setUser(userData);

      // Store fingerprint template
      // Note: Different ZKTeco models have different template formats
      // This is a general approach - may need adjustment for specific models
      const templateData = {
        uid: parseInt(deviceUserId),
        fid: 0, // Fingerprint index (0-9, device supports up to 10 prints per user)
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

  /**
   * Delete fingerprint from device
   */
  async deleteFingerprintFromDevice(deviceUserId: string): Promise<boolean> {
    try {
      await this.ensureConnection();

      this.logger.log(`Deleting fingerprint with device ID: ${deviceUserId}`);

      // Delete user and all associated templates
      await this.device.deleteUser(parseInt(deviceUserId));

      this.logger.log(`Successfully deleted fingerprint for device ID ${deviceUserId}`);

      return true;
    } catch (error) {
      this.logger.error(`Device deletion error for ${deviceUserId}:`, error);
      return false;
    }
  }

  /**
   * Get all users from device
   */
  async getAllUsersFromDevice(): Promise<any[]> {
    try {
      await this.ensureConnection();

      const users = await this.device.getUsers();
      
      if (!users || !users.data) {
        return [];
      }

      return users.data;
    } catch (error) {
      this.logger.error('Failed to get users from device:', error);
      return [];
    }
  }

  /**
   * Get all fingerprint templates from device
   */
  async getAllTemplatesFromDevice(): Promise<any[]> {
    try {
      await this.ensureConnection();

      const templates = await this.device.getTemplates();
      
      if (!templates || !templates.data) {
        return [];
      }

      return templates.data;
    } catch (error) {
      this.logger.error('Failed to get templates from device:', error);
      return [];
    }
  }

  /**
   * Verify fingerprint against device
   * Returns the matched user ID if found
   */
  async verifyFingerprintOnDevice(fingerprintTemplate: string): Promise<string | null> {
    try {
      await this.ensureConnection();

      if (!this.validateFingerprintTemplate(fingerprintTemplate)) {
        throw new BadRequestException('Invalid fingerprint template');
      }

      // Get all templates from device
      const deviceTemplates = await this.getAllTemplatesFromDevice();

      // Convert input template to Buffer
      const inputBuffer = Buffer.from(fingerprintTemplate, 'base64');

      // Compare with each template
      for (const template of deviceTemplates) {
        const deviceBuffer = template.template;
        
        // Calculate similarity
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

  /**
   * Compare two fingerprint templates
   * Returns similarity score (0-100)
   */
  async compareFingerprintTemplates(
    template1: string,
    template2: string,
  ): Promise<number> {
    try {
      if (!this.validateFingerprintTemplate(template1) || 
          !this.validateFingerprintTemplate(template2)) {
        throw new BadRequestException('Invalid fingerprint template');
      }

      // Exact match check
      if (template1 === template2) {
        return 100;
      }

      // Convert to Buffers
      const buffer1 = Buffer.from(template1, 'base64');
      const buffer2 = Buffer.from(template2, 'base64');

      // Calculate similarity
      return this.calculateTemplateSimilarity(buffer1, buffer2);
    } catch (error) {
      this.logger.error('Fingerprint comparison error:', error);
      return 0;
    }
  }

  /**
   * Calculate similarity between two fingerprint template buffers
   * Uses Hamming distance for binary comparison
   */
  private calculateTemplateSimilarity(buffer1: Buffer, buffer2: Buffer): number {
    try {
      const minLength = Math.min(buffer1.length, buffer2.length);
      let matchingBytes = 0;
      let totalBits = minLength * 8;

      // Calculate Hamming distance at byte level
      for (let i = 0; i < minLength; i++) {
        const xor = buffer1[i] ^ buffer2[i];
        // Count matching bits (bits that are 0 after XOR)
        matchingBytes += 8 - this.countSetBits(xor);
      }

      // Calculate similarity percentage
      const similarity = (matchingBytes / totalBits) * 100;

      return Math.round(similarity * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      this.logger.error('Error calculating template similarity:', error);
      return 0;
    }
  }

  /**
   * Count number of set bits in a byte
   */
  private countSetBits(byte: number): number {
    let count = 0;
    while (byte) {
      count += byte & 1;
      byte >>= 1;
    }
    return count;
  }

  /**
   * Check if fingerprint templates match
   */
  async matchFingerprints(
    template1: string,
    template2: string,
    threshold?: number,
  ): Promise<boolean> {
    const matchThreshold = threshold || parseFloat(process.env.FINGERPRINT_MATCH_THRESHOLD || '60');
    const similarity = await this.compareFingerprintTemplates(template1, template2);
    
    this.logger.log(`Fingerprint match similarity: ${similarity}%, threshold: ${matchThreshold}%`);
    
    return similarity >= matchThreshold;
  }

  /**
   * Sync all enrolled fingerprints to device
   */
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
          
          // Small delay to prevent overwhelming the device
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

  /**
   * Clear all users and templates from device
   */
  async clearAllDataFromDevice(): Promise<boolean> {
    try {
      await this.ensureConnection();

      this.logger.log('Clearing all data from device');

      await this.device.clearAttendanceLog();
      
      // Get all users and delete them
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

  /**
   * Get real-time attendance logs from device
   */
  async getAttendanceLogs(): Promise<any[]> {
    try {
      await this.ensureConnection();

      const logs = await this.device.getAttendances();
      
      if (!logs || !logs.data) {
        return [];
      }

      return logs.data.map(log => ({
        userId: log.userId,
        deviceUserId: log.deviceUserId,
        timestamp: log.recordTime,
        type: log.type, // 0: Check In, 1: Check Out, etc.
        verifyType: log.verifyType, // 1: Fingerprint, 15: Face, etc.
      }));
    } catch (error) {
      this.logger.error('Failed to get attendance logs:', error);
      return [];
    }
  }

  /**
   * Enable real-time event monitoring
   * This will emit events when someone uses the device
   */
  async enableRealTimeMonitoring(callback: (data: any) => void): Promise<void> {
    try {
      await this.ensureConnection();

      this.logger.log('Enabling real-time monitoring');

      // Listen for real-time log events
      this.device.on('realtime_log', (data: any) => {
        this.logger.log('Real-time log event:', data);
        callback(data);
      });

      // Enable real-time mode on device
      await this.device.enableRealtime();
    } catch (error) {
      this.logger.error('Failed to enable real-time monitoring:', error);
      throw new BadRequestException(`Failed to enable real-time monitoring: ${error.message}`);
    }
  }

  /**
   * Disable real-time monitoring
   */
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

  /**
   * Test device connection
   */
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

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    await this.disconnectFromDevice();
  }
}