// backend/src/modules/fingerprint/fingerprint-service.interface.ts

export interface FingerprintDeviceInfo {
  connected: boolean;
  model: string;
  serialNumber?: string;
  firmware?: string;
  ip?: string;
  port?: number;
}

export interface FingerprintTemplate {
  template: string; // Base64 encoded
  quality?: number;
  size?: number;
}

export interface FingerprintScanResult {
  success: boolean;
  template?: string;
  quality?: number;
  error?: string;
}

export abstract class IFingerprintService {
  abstract validateFingerprintTemplate(template: string): boolean;
  abstract compareFingerprintTemplates(template1: string, template2: string): Promise<number>;
  abstract matchFingerprints(template1: string, template2: string, threshold?: number): Promise<boolean>;
  abstract connectToDevice(): Promise<boolean>;
  abstract disconnectFromDevice(): Promise<void>;
  abstract getDeviceInfo(): Promise<FingerprintDeviceInfo>;
  abstract captureFingerprintTemplate(): Promise<FingerprintScanResult>;
  abstract startContinuousCapture(callback: (result: FingerprintScanResult) => void): Promise<void>;
  abstract stopContinuousCapture(): Promise<void>;
  abstract testConnection(): Promise<{ success: boolean; message: string; info?: any }>;
}