// kiosk/src/lib/fingerprint-bridge.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface FingerprintScanEvent {
    hasNewScan: boolean;
    template?: string;
    timestamp?: number;
    quality?: number;
}

export class FingerprintBridge {
    private eventSource: EventSource | null = null;
    private pollingInterval: NodeJS.Timeout | null = null;
    private onScanCallback: ((event: FingerprintScanEvent) => void) | null = null;
    private useSSE: boolean = true;

    /**
     * Start listening for fingerprint scans
     * @param useSSE - Use Server-Sent Events (true) or polling (false)
     */
    startListening(
        callback: (event: FingerprintScanEvent) => void,
        useSSE: boolean = true
    ) {
        this.onScanCallback = callback;
        this.useSSE = useSSE;

        if (useSSE) {
            this.startSSE();
        } else {
            this.startPolling();
        }
    }

    /**
     * Stop listening
     */
    stopListening() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        this.onScanCallback = null;
    }

    /**
     * Start Server-Sent Events listening
     */
    private startSSE() {
        try {
            this.eventSource = new EventSource(`${API_URL}/fingerprint/stream`);

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.hasNewScan && this.onScanCallback) {
                        this.onScanCallback(data);
                    }
                } catch (error) {
                    console.error('Error parsing SSE data:', error);
                }
            };

            this.eventSource.onerror = (error) => {
                console.error('SSE connection error:', error);
                // Fallback to polling
                this.eventSource?.close();
                console.log('Falling back to polling method...');
                this.startPolling();
            };

            console.log('✓ SSE connection established for fingerprint monitoring');
        } catch (error) {
            console.error('Failed to start SSE:', error);
            this.startPolling();
        }
    }

    /**
     * Start polling for scans
     */
    private startPolling() {
        if (this.pollingInterval) return;

        this.pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(`${API_URL}/fingerprint/poll`);
                const data: FingerprintScanEvent = await response.json();

                if (data.hasNewScan && this.onScanCallback) {
                    this.onScanCallback(data);
                }
            } catch (error:any) {
                console.error('Polling error:', error);
            }
        }, 500); // Poll every 500ms

        console.log('✓ Polling started for fingerprint monitoring');
    }

    /**
     * Get device status
     */
    async getStatus() {
        try {
            const response = await fetch(`${API_URL}/fingerprint/status`);
            return await response.json();
        } catch (error) {
            console?.error('Failed to get status:', error);
            return null;
        }
    }

    /**
     * Get all devices info
     */
    async getDevices() {
        try {
            const response = await fetch(`${API_URL}/fingerprint/devices`);
            return await response.json();
        } catch (error) {
            console?.error('Failed to get devices:', error);
            return null;
        }
    }

    /**
     * Start monitoring on backend
     */
    async startMonitoring() {
        try {
            const response = await fetch(`${API_URL}/fingerprint/start-monitoring`, {
                method: 'POST',
            });
            return await response.json();
        } catch (error: any) {
            console.error('Failed to start monitoring:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Stop monitoring on backend
     */
    async stopMonitoring() {
        try {
            const response = await fetch(`${API_URL}/fingerprint/stop-monitoring`, {
                method: 'POST',
            });
            return await response.json();
        } catch (error: any) {
            console.error('Failed to stop monitoring:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Switch device
     */
    async switchDevice(deviceType: 'ZKTECO' | 'DIGITAL_PERSONA') {
        try {
            const response = await fetch(`${API_URL}/fingerprint/switch-device`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deviceType }),
            });
            return await response.json();
        } catch (error: any) {
            console.error('Failed to switch device:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Simulate scan (for testing)
     */
    async simulateScan(template: string) {
        try {
            const response = await fetch(`${API_URL}/fingerprint/simulate-scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ template }),
            });
            return await response.json();
        } catch (error: any) {
            console.error('Failed to simulate scan:', error);
            return { success: false, message: error.message };
        }
    }
}

// Export singleton instance
export const fingerprintBridge = new FingerprintBridge();