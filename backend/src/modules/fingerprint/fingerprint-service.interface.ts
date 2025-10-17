// backend/src/modules/fingerprint/fingerprint-service.interface.ts

export interface FingerprintDeviceInfo {
  connected: boolean;
  model: string;
  manufacturer?: string;
  serialNumber?: string;
  firmware?: string;
  sdkVersion?: string;
  status?: string;
  ip?: string;
  port?: number;
}

export interface FingerprintTemplate {
  template: string; // Base64 encoded
  quality?: number;
  size?: number;
  format?: string;
}

export interface FingerprintScanResult {
  success: boolean;
  template?: string;
  quality?: number;
  error?: string;
  timestamp?: Date;
}

export interface FingerprintMatchResult {
  matched: boolean;
  score: number; // 0-100 similarity score
  threshold: number;
}

export abstract class IFingerprintService {
  /**
   * Validate if a fingerprint template is valid
   */
  abstract validateFingerprintTemplate(template: string): boolean;

  /**
   * Compare two fingerprint templates and return similarity score
   */
  abstract compareFingerprintTemplates(
    template1: string,
    template2: string,
  ): Promise<number>;

  /**
   * Match two fingerprints against a threshold
   */
  abstract matchFingerprints(
    template1: string,
    template2: string,
    threshold?: number,
  ): Promise<boolean>;

  /**
   * Get detailed match result with score
   */
  abstract matchFingerprintsWithScore(
    template1: string,
    template2: string,
    threshold?: number,
  ): Promise<FingerprintMatchResult>;

  /**
   * Connect to fingerprint device
   */
  abstract connectToDevice(): Promise<boolean>;

  /**
   * Disconnect from device
   */
  abstract disconnectFromDevice(): Promise<void>;

  /**
   * Get device information
   */
  abstract getDeviceInfo(): Promise<FingerprintDeviceInfo>;

  /**
   * Test device connection
   */
  abstract testConnection(): Promise<{
    success: boolean;
    message: string;
    info?: any;
  }>;

  /**
   * Enroll fingerprint on device (for devices that store templates)
   */
  abstract enrollFingerprintOnDevice(
    employeeId: string,
    template: string,
  ): Promise<string>;

  /**
   * Delete fingerprint from device
   */
  abstract deleteFingerprintFromDevice(deviceUserId: string): Promise<void>;

  /**
   * Sync multiple fingerprints to device
   */
  abstract syncFingerprintsToDevice(
    fingerprints: Array<{
      id: string;
      employeeId: string;
      fingerprintTemplate: string;
    }>,
  ): Promise<{ success: number; failed: number }>;

  /**
   * Extract quality score from template if available
   */
  abstract extractQuality(template: string): number;

  /**
   * Normalize template format
   */
  abstract normalizeTemplate(template: string): string;
}