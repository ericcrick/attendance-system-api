// // kiosk/src/components/auth/FingerprintAuth.tsx
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Fingerprint, Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
// import { attendanceApi } from '@/lib/api-client';
// import { AuthMethod } from '@/types';

// interface FingerprintAuthProps {
//     onSuccess: (data: any) => void;
// }

// export default function FingerprintAuth({ onSuccess }: FingerprintAuthProps) {
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [verifiedEmployee, setVerifiedEmployee] = useState<any>(null);
//     const [action, setAction] = useState<'clock-in' | 'clock-out' | null>(null);
//     const [scanning, setScanning] = useState(true);
//     const [fingerprintData, setFingerprintData] = useState<string | null>(null);
//     const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
//     const lastScanTimeRef = useRef<number>(0);

//     useEffect(() => {
//         if (!verifiedEmployee) {
//             startFingerprintPolling();
//         }

//         return () => {
//             stopFingerprintPolling();
//         };
//     }, [verifiedEmployee]);

//     // const startFingerprintPolling = () => {
//     //     setScanning(true);

//     //     // Poll backend for fingerprint scans
//     //     pollingIntervalRef.current = setInterval(async () => {
//     //         try {
//     //             // Check if enough time has passed since last scan (prevent duplicate scans)
//     //             const now = Date.now();
//     //             if (now - lastScanTimeRef.current < 3000) {
//     //                 return;
//     //             }

//     //             // In production, this would poll your backend endpoint that reads from ZKTeco device
//     //             // For now, we'll simulate waiting for a scan
//     //             // const response = await fetch('/api/fingerprint/poll');
//     //             // const data = await response.json();

//     //             // For development/testing, you can trigger a scan by typing 'SCAN' in console
//     //             // window.triggerFingerprintScan = (template: string) => handleFingerprintScan(template);

//     //         } catch (error) {
//     //             console.error('Polling error:', error);
//     //         }
//     //     }, 500);
//     // };

//     const startFingerprintPolling = () => {
//         setScanning(true);

//         pollingIntervalRef.current = setInterval(async () => {
//             try {
//                 const now = Date.now();
//                 if (now - lastScanTimeRef.current < 3000) {
//                     return;
//                 }

//                 // Poll backend for new fingerprint scans
//                 const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fingerprint/poll`);
//                 const data = await response.json();

//                 if (data.hasNewScan && data.template) {
//                     handleFingerprintScan(data.template);
//                 }
//             } catch (error) {
//                 console.error('Polling error:', error);
//             }
//         }, 500); // Poll every 500ms
//     };

//     const stopFingerprintPolling = () => {
//         if (pollingIntervalRef.current) {
//             clearInterval(pollingIntervalRef.current);
//             pollingIntervalRef.current = null;
//         }
//         setScanning(false);
//     };

//     const handleFingerprintScan = async (template: string) => {
//         const now = Date.now();
//         if (now - lastScanTimeRef.current < 3000) {
//             console.log('Ignoring duplicate scan');
//             return;
//         }

//         lastScanTimeRef.current = now;
//         stopFingerprintPolling();

//         setLoading(true);
//         setError(null);

//         try {
//             const response: any = await attendanceApi.verify({
//                 method: AuthMethod.FINGERPRINT,
//                 fingerprintTemplate: template,
//             });

//             setVerifiedEmployee(response.employee);
//             setFingerprintData(template);

//         } catch (err: any) {
//             const errorMessage = err.message || 'Fingerprint not recognized';
//             setError(errorMessage);

//             setTimeout(() => {
//                 setError(null);
//                 startFingerprintPolling();
//             }, 3000);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Expose function for testing/backend bridge
//     useEffect(() => {
//         if (typeof window !== 'undefined') {
//             (window as any).triggerFingerprintScan = handleFingerprintScan;
//         }

//         return () => {
//             if (typeof window !== 'undefined') {
//                 delete (window as any).triggerFingerprintScan;
//             }
//         };
//     }, []);

//     const handleClockAction = async (actionType: 'clock-in' | 'clock-out') => {
//         if (!fingerprintData) {
//             setError('No fingerprint data available. Please scan again.');
//             return;
//         }

//         setLoading(true);
//         setError(null);
//         setAction(actionType);

//         try {
//             const data = {
//                 employeeId: verifiedEmployee.employeeId,
//                 method: AuthMethod.FINGERPRINT,
//                 fingerprintTemplate: fingerprintData,
//                 location: process.env.NEXT_PUBLIC_KIOSK_ID || 'KIOSK-001',
//             };

//             const response =
//                 actionType === 'clock-in'
//                     ? await attendanceApi.clockIn(data)
//                     : await attendanceApi.clockOut(data);

//             onSuccess({
//                 action: actionType,
//                 employee: verifiedEmployee,
//                 attendance: response,
//             });

//             setTimeout(() => {
//                 handleReset();
//             }, 100);
//         } catch (err: any) {
//             const errorMessage = err.message || `Failed to ${actionType.replace('-', ' ')}`;
//             setError(errorMessage);
//         } finally {
//             setLoading(false);
//             setAction(null);
//         }
//     };

//     const handleReset = () => {
//         setVerifiedEmployee(null);
//         setFingerprintData(null);
//         setError(null);
//         setAction(null);
//         lastScanTimeRef.current = 0;
//         startFingerprintPolling();
//     };

//     const ErrorDisplay = () => {
//         if (!error) return null;

//         return (
//             <div className="max-w-md mx-auto mb-4 p-3 bg-red-50 border border-red-200 rounded shadow-sm animate-in fade-in duration-200">
//                 <div className="flex items-start space-x-2">
//                     <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                     <div className="flex-1">
//                         <p className="font-semibold text-red-900 text-sm mb-0.5">Recognition Failed</p>
//                         <p className="text-red-700 text-xs leading-relaxed">{error}</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     if (verifiedEmployee) {
//         return (
//             <div className="text-center">
//                 <ErrorDisplay />

//                 <div className="mb-4">
//                     <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded mb-3">
//                         <CheckCircle className="w-7 h-7 text-green-600" />
//                     </div>
//                     <h3 className="text-xl font-semibold text-gray-900 mb-1">
//                         Welcome, {verifiedEmployee.fullName}!
//                     </h3>
//                     <p className="text-sm text-gray-600">
//                         {verifiedEmployee.department} • {verifiedEmployee.position}
//                     </p>
//                     <div className="mt-2 inline-block bg-purple-50 text-purple-700 px-3 py-1 rounded text-xs font-medium">
//                         Shift: {verifiedEmployee.shift.name}
//                     </div>
//                 </div>

//                 <div className="flex gap-3 justify-center">
//                     <button
//                         onClick={() => handleClockAction('clock-in')}
//                         disabled={loading}
//                         className="px-6 py-2.5 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
//                     >
//                         {loading && action === 'clock-in' ? (
//                             <div className="flex items-center space-x-2">
//                                 <Loader2 className="w-4 h-4 animate-spin" />
//                                 <span>Clocking In...</span>
//                             </div>
//                         ) : (
//                             'Clock In'
//                         )}
//                     </button>
//                     <button
//                         onClick={() => handleClockAction('clock-out')}
//                         disabled={loading}
//                         className="px-6 py-2.5 bg-orange-600 text-white text-sm rounded font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
//                     >
//                         {loading && action === 'clock-out' ? (
//                             <div className="flex items-center space-x-2">
//                                 <Loader2 className="w-4 h-4 animate-spin" />
//                                 <span>Clocking Out...</span>
//                             </div>
//                         ) : (
//                             'Clock Out'
//                         )}
//                     </button>
//                 </div>

//                 <button
//                     onClick={handleReset}
//                     disabled={loading}
//                     className="mt-3 text-gray-600 hover:text-gray-900 text-xs font-medium transition-colors disabled:opacity-50"
//                 >
//                     Cancel / Start Over
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="text-center">
//             <ErrorDisplay />

//             <div className="mb-6">
//                 <div className={`inline-flex items-center justify-center w-16 h-16 rounded mb-4 transition-all ${scanning ? 'bg-purple-100 animate-pulse' : 'bg-purple-50'
//                     }`}>
//                     <Fingerprint className={`w-8 h-8 transition-colors ${scanning ? 'text-purple-600' : 'text-purple-400'
//                         }`} />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-1">
//                     {loading ? 'Verifying Fingerprint...' : 'Place Finger on Scanner'}
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                     {loading
//                         ? 'Please wait while we identify you'
//                         : 'Position your enrolled finger on the fingerprint sensor'}
//                 </p>
//             </div>

//             {scanning && !loading && (
//                 <div className="max-w-md mx-auto mb-4">
//                     <div className="flex items-center justify-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded">
//                         <div className="relative">
//                             <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
//                             <div className="absolute inset-0 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
//                         </div>
//                         <span className="text-sm font-medium text-purple-700">
//                             Scanner Ready - Waiting for fingerprint...
//                         </span>
//                     </div>
//                 </div>
//             )}

//             {loading && (
//                 <div className="max-w-md mx-auto mb-4 flex items-center justify-center space-x-2 text-gray-600">
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     <span className="text-sm font-medium">Processing fingerprint...</span>
//                 </div>
//             )}

//             {!loading && !error && (
//                 <div className="max-w-md mx-auto p-4 bg-blue-50 border border-blue-200 rounded">
//                     <h4 className="font-medium text-blue-900 text-sm mb-2 flex items-center justify-center space-x-1.5">
//                         <Fingerprint className="w-4 h-4" />
//                         <span>Quick Tips:</span>
//                     </h4>
//                     <ul className="text-xs text-blue-800 space-y-1 text-left">
//                         <li>• Ensure your finger is clean and dry</li>
//                         <li>• Place finger firmly on the scanner</li>
//                         <li>• Use the same finger you enrolled with</li>
//                         <li>• Wait for verification before lifting finger</li>
//                     </ul>
//                 </div>
//             )}

//             {error && (
//                 <button
//                     onClick={() => {
//                         setError(null);
//                         startFingerprintPolling();
//                     }}
//                     className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm rounded font-medium hover:bg-purple-700 transition-colors"
//                 >
//                     <RefreshCw className="w-4 h-4" />
//                     <span>Try Again</span>
//                 </button>
//             )}

//             {/* Development Helper */}
//             {process.env.NODE_ENV === 'development' && (
//                 <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
//                     <p className="text-xs text-yellow-800 mb-2 font-medium">
//                         🔧 Development Mode - Testing Helper
//                     </p>
//                     <p className="text-xs text-yellow-700 mb-2">
//                         In console, run: <code className="bg-yellow-100 px-1 rounded">window.triggerFingerprintScan("your-base64-template")</code>
//                     </p>
//                     <button
//                         onClick={() => {
//                             // Mock fingerprint for testing
//                             const mockTemplate = btoa('MOCK_FINGERPRINT_' + Date.now());
//                             handleFingerprintScan(mockTemplate);
//                         }}
//                         className="text-xs px-3 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
//                     >
//                         Simulate Fingerprint Scan (Test)
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }





// kiosk/src/components/auth/FingerprintAuth.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Fingerprint, Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { attendanceApi } from '@/lib/api-client';
import { AuthMethod } from '@/types';
import { getFingerprintService } from '@/lib/fingerprint-service';

interface FingerprintAuthProps {
    onSuccess: (data: any) => void;
}

export default function FingerprintAuth({ onSuccess }: FingerprintAuthProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verifiedEmployee, setVerifiedEmployee] = useState<any>(null);
    const [action, setAction] = useState<'clock-in' | 'clock-out' | null>(null);
    const [scanning, setScanning] = useState(false);
    const [fingerprintData, setFingerprintData] = useState<string | null>(null);
    const [deviceConnected, setDeviceConnected] = useState(false);
    const [status, setStatus] = useState<string>('Initializing...');
    const [quality, setQuality] = useState<string>('');

    const fingerprintService = getFingerprintService();

    useEffect(() => {
        // Wait for window to be fully loaded
        const initTimer = setTimeout(() => {
            initializeScanner();
        }, 2000); // Give SDK time to load

        return () => {
            clearTimeout(initTimer);
            cleanup();
        };
    }, []);

    const initializeScanner = async () => {
        try {
            setStatus('Connecting to fingerprint service...');
            console.log('🔄 Initializing fingerprint scanner...');
            
            const initialized = await fingerprintService.initialize();
            if (!initialized) {
                throw new Error('Failed to initialize SDK');
            }

            console.log('✅ SDK initialized, checking for devices...');
            setStatus('Checking for fingerprint reader...');

            // Check for devices
            const devices = await fingerprintService.enumerateDevices();
            console.log('📱 Devices found:', devices.length);

            if (devices.length > 0) {
                setDeviceConnected(true);
                setStatus('Scanner ready - Place your finger to authenticate');
                console.log('✅ Scanner ready');
                
                // Auto-start scanning
                if (!verifiedEmployee) {
                    setTimeout(() => startScanning(), 500);
                }
            } else {
                setStatus('No fingerprint reader detected');
                setError('Please connect your fingerprint reader and refresh the page');
            }
        } catch (err: any) {
            console.error('❌ Initialization error:', err);
            setError(err.message || 'Failed to connect to fingerprint service');
            setStatus('Connection failed');
        }
    };

    const cleanup = async () => {
        try {
            if (scanning) {
                await fingerprintService.stopAcquisition();
            }
        } catch (err) {
            console.error('Cleanup error:', err);
        }
    };

    const startScanning = async () => {
        if (scanning || !deviceConnected || verifiedEmployee) {
            console.log('Cannot start scanning:', { scanning, deviceConnected, hasEmployee: !!verifiedEmployee });
            return;
        }

        setScanning(true);
        setError(null);
        setQuality('');
        setStatus('Place your finger on the scanner...');
        console.log('🔄 Starting fingerprint acquisition...');

        try {
            await fingerprintService.startAcquisition(
                (samples) => handleSampleAcquired(samples),
                (qualityCode) => {
                    const qualityText = fingerprintService.getQualityText(qualityCode);
                    setQuality(qualityText);
                    console.log('📊 Quality:', qualityText);
                    
                    if (qualityCode === 0) {
                        setStatus('Good quality - Processing...');
                    } else {
                        setStatus(`Quality: ${qualityText} - Please adjust finger`);
                    }
                }
            );
            console.log('✅ Acquisition started successfully');
        } catch (err: any) {
            console.error('❌ Failed to start acquisition:', err);
            setError(err.message || 'Failed to start fingerprint capture');
            setScanning(false);
            setStatus('Failed to start scanner');
        }
    };

    const handleSampleAcquired = useCallback(async (samples: string) => {
        console.log('✅ Fingerprint sample acquired!');
        
        try {
            // Stop scanning immediately
            await fingerprintService.stopAcquisition();
            setScanning(false);
            setStatus('Processing fingerprint...');
            setLoading(true);
            
            // Extract template
            const template = fingerprintService.extractTemplateFromSamples(samples);
            console.log('✅ Template extracted, length:', template.length);
            setFingerprintData(template);

            // Verify with backend
            setStatus('Verifying identity...');
            const response: any = await attendanceApi.verify({
                method: AuthMethod.FINGERPRINT,
                fingerprintTemplate: template,
            });

            console.log('✅ Employee verified:', response.employee.fullName);
            setVerifiedEmployee(response.employee);
            setStatus('Identity verified!');
        } catch (err: any) {
            console.error('❌ Verification failed:', err);
            const errorMessage = err.message || 'Fingerprint not recognized';
            setError(errorMessage);
            setStatus('Verification failed');

            // Retry after delay
            setTimeout(() => {
                setError(null);
                startScanning();
            }, 3000);
        } finally {
            setLoading(false);
        }
    }, [fingerprintService]);

    const handleClockAction = async (actionType: 'clock-in' | 'clock-out') => {
        if (!fingerprintData) {
            setError('No fingerprint data available. Please scan again.');
            return;
        }

        setLoading(true);
        setError(null);
        setAction(actionType);

        try {
            const data = {
                employeeId: verifiedEmployee.employeeId,
                method: AuthMethod.FINGERPRINT,
                fingerprintTemplate: fingerprintData,
                location: process.env.NEXT_PUBLIC_KIOSK_ID || 'KIOSK-001',
            };

            const response =
                actionType === 'clock-in'
                    ? await attendanceApi.clockIn(data)
                    : await attendanceApi.clockOut(data);

            onSuccess({
                action: actionType,
                employee: verifiedEmployee,
                attendance: response,
            });

            setTimeout(() => {
                handleReset();
            }, 100);
        } catch (err: any) {
            const errorMessage = err.message || `Failed to ${actionType.replace('-', ' ')}`;
            setError(errorMessage);
        } finally {
            setLoading(false);
            setAction(null);
        }
    };

    const handleReset = async () => {
        setVerifiedEmployee(null);
        setFingerprintData(null);
        setError(null);
        setAction(null);
        setQuality('');
        setStatus('Place your finger to authenticate');
        startScanning();
    };

    const ErrorDisplay = () => {
        if (!error) return null;

        return (
            <div className="max-w-md mx-auto mb-4 p-3 bg-red-50 border border-red-200 rounded shadow-sm animate-in fade-in duration-200">
                <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-red-900 text-sm mb-0.5">Recognition Failed</p>
                        <p className="text-red-700 text-xs leading-relaxed">{error}</p>
                    </div>
                </div>
            </div>
        );
    };

    if (verifiedEmployee) {
        return (
            <div className="text-center">
                <ErrorDisplay />

                <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded mb-3">
                        <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        Welcome, {verifiedEmployee.fullName}!
                    </h3>
                    <p className="text-sm text-gray-600">
                        {verifiedEmployee.department} • {verifiedEmployee.position}
                    </p>
                    <div className="mt-2 inline-block bg-purple-50 text-purple-700 px-3 py-1 rounded text-xs font-medium">
                        Shift: {verifiedEmployee.shift.name}
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => handleClockAction('clock-in')}
                        disabled={loading}
                        className="px-6 py-2.5 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {loading && action === 'clock-in' ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Clocking In...</span>
                            </div>
                        ) : (
                            'Clock In'
                        )}
                    </button>
                    <button
                        onClick={() => handleClockAction('clock-out')}
                        disabled={loading}
                        className="px-6 py-2.5 bg-orange-600 text-white text-sm rounded font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {loading && action === 'clock-out' ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Clocking Out...</span>
                            </div>
                        ) : (
                            'Clock Out'
                        )}
                    </button>
                </div>

                <button
                    onClick={handleReset}
                    disabled={loading}
                    className="mt-3 text-gray-600 hover:text-gray-900 text-xs font-medium transition-colors disabled:opacity-50"
                >
                    Cancel / Start Over
                </button>
            </div>
        );
    }

    return (
        <div className="text-center">
            <ErrorDisplay />

            <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded mb-4 transition-all ${
                    scanning ? 'bg-purple-100 animate-pulse' : 'bg-purple-50'
                }`}>
                    <Fingerprint className={`w-8 h-8 transition-colors ${
                        scanning ? 'text-purple-600' : 'text-purple-400'
                    }`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {status}
                </h3>
                {quality && (
                    <p className={`text-sm mt-1 ${
                        quality === 'Good' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                        Quality: {quality}
                    </p>
                )}
            </div>

            {scanning && !loading && deviceConnected && (
                <div className="max-w-md mx-auto mb-4">
                    <div className="flex items-center justify-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded">
                        <div className="relative">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            <div className="absolute inset-0 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                        </div>
                        <span className="text-sm font-medium text-purple-700">
                            Scanner Active - Waiting for fingerprint...
                        </span>
                    </div>
                </div>
            )}

            {loading && (
                <div className="max-w-md mx-auto mb-4 flex items-center justify-center space-x-2 text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Processing fingerprint...</span>
                </div>
            )}

            {!loading && !scanning && deviceConnected && !verifiedEmployee && (
                <button
                    onClick={startScanning}
                    className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm rounded font-medium hover:bg-purple-700 transition-colors"
                >
                    <Fingerprint className="w-4 h-4" />
                    <span>Start Scanning</span>
                </button>
            )}

            {error && !loading && (
                <button
                    onClick={() => {
                        setError(null);
                        startScanning();
                    }}
                    className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm rounded font-medium hover:bg-purple-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                </button>
            )}
        </div>
    );
}