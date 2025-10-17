// components/FingerprintServiceCheck.tsx
'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

export default function FingerprintServiceCheck() {
    const [serviceStatus, setServiceStatus] = useState<'checking' | 'running' | 'not-running'>('checking');

    useEffect(() => {
        checkService();
    }, []);

    const checkService = async () => {
        try {
            // Try to connect to the DigitalPersona endpoint
            const response = await fetch('https://127.0.0.1:52181/get_connection', {
                method: 'GET',
                mode: 'no-cors', // This will give us an opaque response but we can check if it succeeded
            });
            setServiceStatus('running');
        } catch (error) {
            setServiceStatus('not-running');
        }
    };

    if (serviceStatus === 'checking') {
        return null;
    }

    if (serviceStatus === 'not-running') {
        return (
            <div className="fixed top-4 right-4 bg-amber-50 border-2 border-amber-300 rounded shadow-lg p-4 max-w-md z-50">
                <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 mb-1">
                            DigitalPersona Service Not Running
                        </h3>
                        <p className="text-sm text-amber-800 mb-3">
                            The fingerprint service is not accessible. Please:
                        </p>
                        <ol className="text-xs text-amber-800 space-y-1 mb-3 list-decimal list-inside">
                            <li>Install DigitalPersona Lite Client</li>
                            <li>Ensure the service is running (check Windows Services)</li>
                            <li>Connect your fingerprint reader</li>
                            <li>Refresh this page</li>
                        </ol>
                        <a
                            href="https://crossmatch.hid.gl/lite-client/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-amber-700 hover:text-amber-900 font-medium"
                        >
                            <ExternalLink className="w-3 h-3" />
                            <span>Download DigitalPersona Lite Client</span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-300 rounded p-3 z-50">
            <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                    Fingerprint Service Active
                </span>
            </div>
        </div>
    );
}