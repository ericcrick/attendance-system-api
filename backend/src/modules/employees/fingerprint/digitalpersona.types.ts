// backend/src/modules/employees/fingerprint/digitalpersona.types.ts

/**
 * Type definitions for Digital Persona SDK
 * Since @digitalpersona/devices doesn't have proper TypeScript types
 */

export enum SampleFormat {
  Raw = 0,
  Intermediate = 1,
  Compressed = 2,
  PngImage = 3,
}

export interface FingerprintSample {
  Data: ArrayBuffer | Uint8Array;
  quality?: number;
}

export interface DeviceInfo {
  name: string;
  vendor: string;
  product: string;
}

export interface AcquisitionEvent {
  samples: FingerprintSample[];
}

export interface QualityEvent {
  quality: number;
}

export interface ErrorEvent {
  error: Error;
}

// Mock implementations for when SDK is not available
export class FingerprintReaderMock {
  static AcquisitionStarted = 'acquisition_started';
  static AcquisitionStopped = 'acquisition_stopped';
  static SamplesAcquired = 'samples_acquired';
  static QualityReported = 'quality_reported';
  static ErrorOccurred = 'error_occurred';

  private events: Map<string, Function[]> = new Map();

  on(event: string, handler: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }

  off() {
    this.events.clear();
  }

  async startAcquisition(_format: SampleFormat): Promise<void> {
    throw new Error('Digital Persona SDK not installed');
  }

  async stopAcquisition(): Promise<void> {
    throw new Error('Digital Persona SDK not installed');
  }

  async createTemplate(_sample: any): Promise<Buffer> {
    throw new Error('Digital Persona SDK not installed');
  }
}

export class DeviceConnectedMock {
  static async request(): Promise<DeviceInfo[]> {
    return [];
  }
}