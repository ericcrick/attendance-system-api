// backend/src/modules/fingerprint/digital-persona.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    IFingerprintService,
    FingerprintDeviceInfo,
    FingerprintScanResult,
} from './fingerprint-service.interface';

@Injectable()
export class DigitalPersonaService implements IFingerprintService {
    private readonly logger = new Logger(DigitalPersonaService.name);
    private readonly serviceUrl: string;
    private isConnected = false;
    private isCapturing = false;
    private captureCallback: ((result: FingerprintScanResult) => void) | null = null;
    private pollingInterval: NodeJS.Timeout | null = null;

    constructor(private configService: ConfigService) {
        const host = this.configService.get('DIGITALPERSONA_HOST', 'localhost');
        const port = this.configService.get('DIGITALPERSONA_PORT', '5000');
        this.serviceUrl = `http://${host}:${port}`;

        this.logger.log(`DigitalPersona Service initialized at ${this.serviceUrl}`);
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

        return true;
    }

    async connectToDevice(): Promise<boolean> {
        try {
            if (this.isConnected) {
                this.logger.log('Already connected to DigitalPersona service');
                return true;
            }

            // Check if Python service is running
            const response = await fetch(`${this.serviceUrl}/health`, {
                signal: AbortSignal.timeout(5000),
            });

            if (!response.ok) {
                throw new Error('Service not responding');
            }

            const data = await response.json();

            if (data.status !== 'running') {
                throw new Error('Service not in running state');
            }

            this.isConnected = true;
            this.logger.log('✓ Connected to DigitalPersona service');
            this.logger.log(`  Reader connected: ${data.reader_connected}`);
            this.logger.log(`  DPFPDD available: ${data.dpfpdd_available}`);

            // Connect to the physical reader
            await this.connectReader();

            return true;
        } catch (error) {
            this.logger.error(`Failed to connect to DigitalPersona service: ${error.message}`);
            this.isConnected = false;
            return false;
        }
    }

    async disconnectFromDevice(): Promise<void> {
        try {
            if (this.isCapturing) {
                await this.stopContinuousCapture();
            }

            if (this.isConnected) {
                await this.disconnectReader();
                this.isConnected = false;
                this.logger.log('Disconnected from DigitalPersona service');
            }
        } catch (error) {
            this.logger.error('Error disconnecting:', error);
        }
    }

    private async connectReader(): Promise<boolean> {
        try {
            const response = await fetch(`${this.serviceUrl}/reader/connect`, {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                this.logger.log('DigitalPersona reader connected');
            }

            return data.success;
        } catch (error) {
            this.logger.error('Failed to connect reader:', error);
            return false;
        }
    }

    private async disconnectReader(): Promise<boolean> {
        try {
            const response = await fetch(`${this.serviceUrl}/reader/disconnect`, {
                method: 'POST',
            });
            const data = await response.json();
            return data.success;
        } catch (error) {
            this.logger.error('Failed to disconnect reader:', error);
            return false;
        }
    }

    async getDeviceInfo(): Promise<FingerprintDeviceInfo> {
        try {
            const response = await fetch(`${this.serviceUrl}/health`);
            const data = await response.json();

            return {
                connected: this.isConnected && data.reader_connected,
                model: 'DigitalPersona U.are.U 4500',
                serialNumber: 'N/A',
                firmware: data.dpfpdd_available ? 'DPFPDD SDK' : 'Mock Mode',
                ip: this.serviceUrl,
            };
        } catch (error) {
            this.logger.error('Failed to get device info:', error);
            return {
                connected: false,
                model: 'DigitalPersona U.are.U 4500',
                ip: this.serviceUrl,
            };
        }
    }

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

            this.logger.log('Capturing fingerprint from DigitalPersona...');

            const response = await fetch(`${this.serviceUrl}/fingerprint/capture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timeout: 30 }),
            });

            if (!response.ok) {
                return {
                    success: false,
                    error: 'Fingerprint capture failed or timeout',
                };
            }

            const data = await response.json();

            if (data.success) {
                this.logger.log('✓ Fingerprint captured successfully');
                return {
                    success: true,
                    template: data.template,
                    quality: 85, // DigitalPersona doesn't provide quality in mock mode
                };
            }

            return {
                success: false,
                error: data.message || 'Capture failed',
            };
        } catch (error) {
            this.logger.error('Capture error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async startContinuousCapture(
        callback: (result: FingerprintScanResult) => void,
    ): Promise<void> {
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

            this.logger.log('Starting continuous fingerprint capture on DigitalPersona...');

            // Start monitoring on Python service
            const response = await fetch(`${this.serviceUrl}/monitoring/start`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to start monitoring on Python service');
            }

            // Start polling for scans
            this.startPolling();

            this.logger.log('✓ Continuous capture started');
        } catch (error) {
            this.isCapturing = false;
            this.logger.error('Failed to start continuous capture:', error);
            throw error;
        }
    }

    private startPolling() {
        this.pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.serviceUrl}/monitoring/poll`);
                const data = await response.json();

                if (data.hasNewScan && data.template && this.captureCallback) {
                    this.captureCallback({
                        success: true,
                        template: data.template,
                        quality: 85,
                    });
                }
            } catch (error) {
                // Silent fail for polling
            }
        }, 500); // Poll every 500ms
    }

    async stopContinuousCapture(): Promise<void> {
        try {
            if (!this.isCapturing) {
                return;
            }

            this.logger.log('Stopping continuous capture...');

            // Stop polling
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }

            // Stop monitoring on Python service
            await fetch(`${this.serviceUrl}/monitoring/stop`, { method: 'POST' });

            this.isCapturing = false;
            this.captureCallback = null;

            this.logger.log('✓ Continuous capture stopped');
        } catch (error) {
            this.logger.error('Error stopping capture:', error);
            this.isCapturing = false;
            this.captureCallback = null;
        }
    }

    async compareFingerprintTemplates(
        template1: string,
        template2: string,
    ): Promise<number> {
        try {
            if (!this.validateFingerprintTemplate(template1) ||
                !this.validateFingerprintTemplate(template2)) {
                throw new BadRequestException('Invalid fingerprint template');
            }

            const response = await fetch(`${this.serviceUrl}/fingerprint/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template1,
                    template2,
                    threshold: 0.65,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Convert similarity (0-1) to percentage
                return data.similarity * 100;
            }

            return 0;
        } catch (error) {
            this.logger.error('Compare error:', error);
            return 0;
        }
    }

    async matchFingerprints(
        template1: string,
        template2: string,
        threshold?: number,
    ): Promise<boolean> {
        const matchThreshold =
            threshold || parseFloat(process.env.FINGERPRINT_MATCH_THRESHOLD || '65');
        const similarity = await this.compareFingerprintTemplates(template1, template2);

        this.logger.log(
            `Fingerprint match similarity: ${similarity}%, threshold: ${matchThreshold}%`,
        );

        return similarity >= matchThreshold;
    }

    async testConnection(): Promise<{
        success: boolean;
        message: string;
        info?: any;
    }> {
        try {
            const connected = await this.connectToDevice();

            if (!connected) {
                return {
                    success: false,
                    message: 'Failed to connect to DigitalPersona service',
                };
            }

            const info = await this.getDeviceInfo();

            return {
                success: true,
                message: 'Successfully connected to DigitalPersona service',
                info,
            };
        } catch (error) {
            return {
                success: false,
                message: `Connection test failed: ${error.message}`,
            };
        }
    }

    getServiceStatus() {
        return {
            connected: this.isConnected,
            capturing: this.isCapturing,
            serviceUrl: this.serviceUrl,
        };
    }
}