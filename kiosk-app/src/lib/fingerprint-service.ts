// lib/fingerprint-service.ts

export class FingerprintService {
    private sdk: any = null;
    private isInitialized = false;
    private currentDeviceId: string = '';

    async initialize(): Promise<boolean> {
        if (this.isInitialized && this.sdk) return true;

        return new Promise((resolve) => {
            // Wait a bit for scripts to fully load
            setTimeout(() => {
                try {
                    if (typeof window === 'undefined' || !window.Fingerprint) {
                        console.error('Fingerprint SDK not available');
                        resolve(false);
                        return;
                    }

                    console.log('Initializing Fingerprint WebApi...');
                    this.sdk = new window.Fingerprint.WebApi();

                    // Set up basic event handlers
                    this.sdk.onCommunicationFailed = () => {
                        console.error('⚠️ Communication with DigitalPersona service failed!');
                        console.error('Please ensure:');
                        console.error('1. DigitalPersona Lite Client is installed');
                        console.error('2. The service is running (check Windows Services)');
                        console.error('3. The fingerprint reader is connected');
                    };

                    this.isInitialized = true;
                    console.log('✅ Fingerprint SDK initialized successfully');
                    resolve(true);
                } catch (error) {
                    console.error('❌ Failed to initialize Fingerprint SDK:', error);
                    resolve(false);
                }
            }, 1000); // Give scripts time to load
        });
    }

    async enumerateDevices(): Promise<string[]> {
        if (!this.sdk) {
            throw new Error('SDK not initialized. Call initialize() first.');
        }

        console.log('Enumerating fingerprint devices...');
        const devices = await this.sdk.enumerateDevices();
        console.log('Found devices:', devices);

        if (devices && devices.length > 0) {
            this.currentDeviceId = devices[0];
        }

        return devices;
    }

    async getDeviceInfo(deviceUid: string): Promise<any> {
        if (!this.sdk) throw new Error('SDK not initialized');
        return this.sdk.getDeviceInfo(deviceUid);
    }

    async startAcquisition(
        onSampleAcquired: (samples: string) => void,
        onQualityReported: (quality: number) => void,
        deviceUid?: string
    ): Promise<void> {
        if (!this.sdk) throw new Error('SDK not initialized');

        console.log('Starting fingerprint acquisition...');

        this.sdk.onSamplesAcquired = (event: any) => {
            console.log('✅ Sample acquired!');
            onSampleAcquired(event.samples);
        };

        this.sdk.onQualityReported = (event: any) => {
            console.log('Quality:', this.getQualityText(event.quality));
            onQualityReported(event.quality);
        };

        this.sdk.onDeviceConnected = (event: any) => {
            console.log('✅ Device connected:', event.deviceUid);
        };

        this.sdk.onDeviceDisconnected = (event: any) => {
            console.log('⚠️ Device disconnected:', event.deviceUid);
        };

        // Use Intermediate format for templates
        const format = window.Fingerprint.SampleFormat.Intermediate;
        const device = deviceUid || this.currentDeviceId || '';

        console.log('Starting acquisition with format:', format, 'device:', device);

        return this.sdk.startAcquisition(format, device);
    }

    async stopAcquisition(deviceUid?: string): Promise<void> {
        if (!this.sdk) throw new Error('SDK not initialized');

        console.log('Stopping acquisition...');
        const device = deviceUid || this.currentDeviceId || '';
        return this.sdk.stopAcquisition(device);
    }

    extractTemplateFromSamples(samplesJson: string): string {
        try {
            console.log('Extracting template from samples...');
            const samples = JSON.parse(samplesJson);

            if (!Array.isArray(samples) || samples.length === 0) {
                throw new Error('Invalid samples format');
            }

            const firstSample = samples[0];
            console.log('Sample type:', typeof firstSample);

            if (typeof firstSample === 'object' && firstSample.Data) {
                // Check what kind of data we’re dealing with
                const formatHint = firstSample.Format || 'Unknown';
                console.log('Sample format:', formatHint);

                // For Intermediate, don't double-decode
                const sampleData = window.Fingerprint.b64UrlTo64(firstSample.Data);

                // Try parsing only if it's valid JSON
                try {
                    const maybeJson = window.Fingerprint.b64UrlToUtf8(sampleData);
                    const decoded = JSON.parse(maybeJson);
                    if (decoded.Data) {
                        const template = window.Fingerprint.b64UrlTo64(decoded.Data);
                        console.log('✅ Extracted template (decoded JSON)');
                        return template;
                    }
                } catch {
                    console.log('ℹ️ Intermediate format detected, using raw base64.');
                }

                console.log('✅ Extracted raw template');
                return sampleData;
            }

            // PNG image case
            const template = window.Fingerprint.b64UrlTo64(firstSample);
            console.log('✅ Template extracted (PNG), length:', template.length);
            return template;
        } catch (error) {
            console.error('❌ Failed to extract template:', error);
            throw error;
        }
    }


    getQualityText(quality: number): string {
        const qualityMap: { [key: number]: string } = {
            0: 'Good',
            1: 'No Image',
            2: 'Too Light',
            3: 'Too Dark',
            4: 'Too Noisy',
            5: 'Low Contrast',
            6: 'Not Enough Features',
            7: 'Not Centered',
            8: 'Not A Finger',
        };
        return qualityMap[quality] || 'Unknown';
    }

    // Simple match function - just compares base64 strings
    // In production, you'd use a proper matching algorithm
    matchTemplates(template1: string, template2: string): boolean {
        return template1 === template2;
    }
}

// Singleton instance
let instance: FingerprintService | null = null;

export function getFingerprintService(): FingerprintService {
    if (!instance) {
        instance = new FingerprintService();
    }
    return instance;
}