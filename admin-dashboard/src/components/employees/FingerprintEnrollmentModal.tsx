// // admin-dashboard/src/components/employees/FingerprintEnrollmentModal.tsx

// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { X, Fingerprint, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
// import { employeesApi } from '@/lib/api-client';
// import { Employee } from '@/types';
// import { getFingerprintService } from '@/lib/fingerprint-service';

// interface FingerprintEnrollmentModalProps {
//   employee: Employee;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function FingerprintEnrollmentModal({
//   employee,
//   onClose,
//   onSuccess,
// }: FingerprintEnrollmentModalProps) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [status, setStatus] = useState<string>('Initializing...');
//   const [scanCount, setScanCount] = useState(0);
//   const [isScanning, setIsScanning] = useState(false);
//   const [deviceConnected, setDeviceConnected] = useState(false);
//   const [fingerprintTemplates, setFingerprintTemplates] = useState<string[]>([]);
//   const [quality, setQuality] = useState<string>('');

//   const fingerprintService = getFingerprintService();

//   useEffect(() => {
//     // Give SDK time to load
//     const timer = setTimeout(() => {
//       initializeFingerprintScanner();
//     }, 1000);

//     return () => {
//       clearTimeout(timer);
//       cleanup();
//     };
//   }, []);

//   const initializeFingerprintScanner = async () => {
//     try {
//       setStatus('Connecting to fingerprint scanner...');
//       console.log('🔄 [Enrollment] Initializing fingerprint scanner...');

//       const initialized = await fingerprintService.initialize();
//       if (!initialized) {
//         throw new Error('Failed to initialize fingerprint SDK');
//       }

//       console.log('✅ [Enrollment] SDK initialized');

//       // Check for connected devices
//       const devices = await fingerprintService.enumerateDevices();
//       console.log('📱 [Enrollment] Devices found:', devices.length);

//       if (devices.length > 0) {
//         setDeviceConnected(true);
//         setStatus('Scanner ready. Click "Start Scan" to begin enrollment');
//         console.log('✅ [Enrollment] Scanner ready');

//         // Get device info for logging
//         const deviceInfo = await fingerprintService.getDeviceInfo(devices[0]);
//         console.log('📱 [Enrollment] Device info:', deviceInfo);
//       } else {
//         setStatus('No scanner detected. Please connect your fingerprint reader.');
//         setError('No fingerprint reader detected. Please connect the device and try again.');
//       }
//     } catch (err: any) {
//       console.error('❌ [Enrollment] Initialization error:', err);
//       setError(err.message || 'Failed to connect to fingerprint scanner');
//       setStatus('Failed to connect to scanner');
//     }
//   };

//   const cleanup = async () => {
//     try {
//       if (isScanning) {
//         console.log('🧹 [Enrollment] Cleaning up - stopping acquisition');
//         await fingerprintService.stopAcquisition();
//       }
//     } catch (err) {
//       console.error('❌ [Enrollment] Cleanup error:', err);
//     }
//   };

//   const startScanning = async () => {
//     if (isScanning || scanCount >= 3 || !deviceConnected) {
//       console.log('⚠️ [Enrollment] Cannot start scan:', { isScanning, scanCount, deviceConnected });
//       return;
//     }

//     setIsScanning(true);
//     setError('');
//     setQuality('');
//     setStatus(`Scanning ${scanCount + 1}/3 - Please place your finger on the scanner`);
//     console.log(`🔄 [Enrollment] Starting scan ${scanCount + 1}/3...`);

//     try {
//       await fingerprintService.startAcquisition(
//         (samples) => handleSampleAcquired(samples),
//         (qualityCode) => {
//           const qualityText = fingerprintService.getQualityText(qualityCode);
//           setQuality(qualityText);
//           console.log('📊 [Enrollment] Quality:', qualityText);

//           if (qualityCode !== 0) {
//             setStatus(`Quality: ${qualityText} - Please adjust finger placement`);
//           } else {
//             setStatus(`Good quality - Hold still...`);
//           }
//         }
//       );
//       console.log('✅ [Enrollment] Acquisition started');
//     } catch (err: any) {
//       console.error('❌ [Enrollment] Scan error:', err);
//       setError(err.message || 'Failed to capture fingerprint. Please try again.');
//       setIsScanning(false);
//       setStatus('Scan failed - Click "Start Scan" to retry');
//     }
//   };

//   const handleSampleAcquired = useCallback(async (samples: string) => {
//     console.log('✅ [Enrollment] Sample acquired!');

//     try {
//       // Stop acquisition immediately
//       await fingerprintService.stopAcquisition();
//       console.log('⏹️ [Enrollment] Acquisition stopped');

//       // Extract template from samples
//       const template = fingerprintService.extractTemplateFromSamples(samples);
//       console.log('✅ [Enrollment] Template extracted, length:', template.length);

//       // Store template
//       const templates = [...fingerprintTemplates, template];
//       setFingerprintTemplates(templates);

//       const newScanCount = scanCount + 1;
//       setScanCount(newScanCount);
//       setIsScanning(false);

//       if (newScanCount < 3) {
//         setStatus(`Scan ${newScanCount}/3 complete. Click "Scan Again" to continue`);
//         setQuality('Good - Sample captured successfully ✓');
//         console.log(`✅ [Enrollment] ${newScanCount}/3 scans completed`);
//       } else {
//         setStatus('All scans complete. Enrolling fingerprint...');
//         setQuality('');
//         console.log('✅ [Enrollment] All 3 scans completed, enrolling...');
//         // Use the last template for enrollment (you could also average/combine them)
//         await enrollFingerprint(template);
//       }
//     } catch (err: any) {
//       console.error('❌ [Enrollment] Sample processing error:', err);
//       setError(err.message || 'Failed to process fingerprint sample');
//       setIsScanning(false);
//       setStatus('Processing failed - Click "Start Scan" to retry');
//     }
//   }, [scanCount, fingerprintTemplates, fingerprintService]);

//   const enrollFingerprint = async (template: string) => {
//     setLoading(true);
//     console.log('🔄 [Enrollment] Enrolling fingerprint for employee:', employee.employeeId);

//     try {
//       await employeesApi.assignFingerprint(employee.id, {
//         fingerprintTemplate: template,
//       });

//       console.log('✅ [Enrollment] Fingerprint enrolled successfully!');
//       setSuccess(true);
//       setStatus('Fingerprint enrolled successfully!');

//       setTimeout(() => {
//         onSuccess();
//       }, 2000);
//     } catch (err: any) {
//       console.error('❌ [Enrollment] Enrollment error:', err);
//       setError(err.message || 'Failed to enroll fingerprint');
//       setStatus('Enrollment failed');
//       setScanCount(0);
//       setFingerprintTemplates([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = async () => {
//     console.log('🔄 [Enrollment] Resetting enrollment...');
//     if (isScanning) {
//       await fingerprintService.stopAcquisition();
//     }
//     setScanCount(0);
//     setFingerprintTemplates([]);
//     setError('');
//     setQuality('');
//     setIsScanning(false);
//     setStatus('Click "Start Scan" to begin enrollment');
//   };

//   const handleClose = async () => {
//     if (!isScanning && !loading) {
//       await cleanup();
//       onClose();
//     }
//   };

//   if (success) {
//     return (
//       <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded shadow-lg max-w-md w-full p-6">
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
//               <CheckCircle className="w-8 h-8 text-green-600" />
//             </div>
//             <h3 className="text-lg font-semibold text-slate-900 mb-1">
//               Enrollment Successful!
//             </h3>
//             <p className="text-sm text-slate-600">
//               Fingerprint has been successfully enrolled for {employee.fullName}
//             </p>
//             <div className="mt-3 text-xs text-slate-500">
//               Template length: {fingerprintTemplates[0]?.length || 0} characters
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded shadow-lg max-w-lg w-full">
//         <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
//           <div>
//             <h2 className="text-base font-semibold text-slate-900">Enroll Fingerprint</h2>
//             <p className="text-xs text-slate-500 mt-0.5">{employee.fullName} ({employee.employeeId})</p>
//           </div>
//           <button 
//             onClick={handleClose}
//             disabled={isScanning || loading}
//             className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="p-6">
//           {error && (
//             <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-800 flex items-start space-x-2">
//               <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
//               <span>{error}</span>
//             </div>
//           )}

//           {/* Device Status */}
//           {!deviceConnected && !error && (
//             <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 flex items-start space-x-2">
//               <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
//               <div>
//                 <p className="font-medium">Scanner Not Connected</p>
//                 <p className="text-xs mt-1">
//                   Please ensure your fingerprint reader is connected and the DigitalPersona service is running.
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Fingerprint Scanner Visual */}
//           <div className="mb-6 flex flex-col items-center">
//             <div className={`relative w-40 h-40 rounded-full flex items-center justify-center mb-4 transition-all ${
//               isScanning 
//                 ? 'bg-blue-100 animate-pulse' 
//                 : scanCount > 0 
//                 ? 'bg-green-100' 
//                 : deviceConnected
//                 ? 'bg-slate-100'
//                 : 'bg-gray-100'
//             }`}>
//               <Fingerprint className={`w-20 h-20 ${
//                 isScanning 
//                   ? 'text-blue-600' 
//                   : scanCount > 0 
//                   ? 'text-green-600' 
//                   : deviceConnected
//                   ? 'text-slate-400'
//                   : 'text-gray-300'
//               }`} />

//               {isScanning && (
//                 <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
//               )}
//             </div>

//             <p className="text-sm font-medium text-slate-700 text-center mb-2">
//               {status}
//             </p>

//             {quality && (
//               <p className={`text-xs text-center ${
//                 quality.includes('Good') || quality.includes('✓') ? 'text-green-600' : 'text-amber-600'
//               }`}>
//                 {quality}
//               </p>
//             )}

//             {/* Scan Progress */}
//             <div className="flex space-x-2 mt-4">
//               {[1, 2, 3].map((num) => (
//                 <div
//                   key={num}
//                   className={`w-3 h-3 rounded-full transition-colors ${
//                     scanCount >= num ? 'bg-green-500' : 'bg-slate-200'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Instructions */}
//           <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
//             <h4 className="text-xs font-medium text-blue-900 mb-2">Instructions:</h4>
//             <ul className="text-xs text-blue-800 space-y-1">
//               <li>• Ensure your finger is clean and dry</li>
//               <li>• Place your finger firmly on the scanner</li>
//               <li>• Hold still until the scan is complete</li>
//               <li>• You will need to scan 3 times for verification</li>
//               <li>• Use the same finger for all scans</li>
//             </ul>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-between items-center space-x-2">
//             <button
//               onClick={handleReset}
//               disabled={isScanning || loading || scanCount === 0}
//               className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//             >
//               <RefreshCw className="w-4 h-4" />
//               <span>Reset</span>
//             </button>

//             <div className="flex space-x-2">
//               <button
//                 onClick={handleClose}
//                 disabled={isScanning || loading}
//                 className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={startScanning}
//                 disabled={isScanning || loading || scanCount >= 3 || !deviceConnected}
//                 className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center space-x-2"
//               >
//                 {isScanning || loading ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     <span>{loading ? 'Enrolling...' : 'Scanning...'}</span>
//                   </>
//                 ) : (
//                   <>
//                     <Fingerprint className="w-4 h-4" />
//                     <span>
//                       {scanCount === 0 ? 'Start Scan' : scanCount < 3 ? `Scan Again (${scanCount}/3)` : 'Complete'}
//                     </span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// admin-dashboard/src/components/employees/FingerprintEnrollmentModal.tsx
// admin-dashboard/src/components/employees/FingerprintEnrollmentModal.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Fingerprint, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { employeesApi } from '@/lib/api-client';
import { Employee } from '@/types';
import { getFingerprintService } from '@/lib/fingerprint-service';

interface FingerprintEnrollmentModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
}

interface ScanResult {
  template: string;
  quality: number; // 0 = Good, 1-8 = Various issues
  templateLength: number;
}

export default function FingerprintEnrollmentModal({
  employee,
  onClose,
  onSuccess,
}: FingerprintEnrollmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<string>('Initializing...');
  const [scanCount, setScanCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);

  // Use ref to capture quality immediately when reported
  const lastQualityRef = useRef<number>(0);

  const fingerprintService = getFingerprintService();

  const REQUIRED_SCANS = 3;
  const MIN_TEMPLATE_LENGTH = 200;

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeFingerprintScanner();
    }, 1000);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, []);

  const initializeFingerprintScanner = async () => {
    try {
      setStatus('Connecting to scanner...');
      console.log('🔄 [Enrollment] Initializing...');

      const initialized = await fingerprintService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize fingerprint SDK');
      }

      const devices = await fingerprintService.enumerateDevices();
      console.log('📱 [Enrollment] Devices found:', devices.length);

      if (devices.length > 0) {
        setDeviceConnected(true);
        setStatus('Ready. Click "Start Scan"');
        console.log('✅ [Enrollment] Scanner ready');
      } else {
        setStatus('No scanner detected');
        setError('No fingerprint reader detected. Please connect and try again.');
      }
    } catch (err: any) {
      console.error('❌ [Enrollment] Init error:', err);
      setError(err.message || 'Failed to connect to scanner');
      setStatus('Connection failed');
    }
  };

  const cleanup = async () => {
    try {
      if (isScanning) {
        await fingerprintService.stopAcquisition();
      }
    } catch (err) {
      console.error('❌ [Enrollment] Cleanup error:', err);
    }
  };

  const startScanning = async () => {
    if (isScanning || scanCount >= REQUIRED_SCANS || !deviceConnected) {
      return;
    }

    setIsScanning(true);
    setError('');
    lastQualityRef.current = 0; // Reset quality
    setStatus(`Scanning ${scanCount + 1}/${REQUIRED_SCANS} - Place finger on scanner`);
    console.log(`🔄 [Enrollment] Starting scan ${scanCount + 1}/${REQUIRED_SCANS}...`);

    try {
      await fingerprintService.startAcquisition(
        (samples) => handleSampleAcquired(samples),
        (qualityCode) => {
          // Store quality immediately in ref
          lastQualityRef.current = qualityCode;
          const qualityText = fingerprintService.getQualityText(qualityCode);
          console.log(`📊 [Enrollment] Quality: ${qualityText} (${qualityCode})`);

          if (qualityCode === 0) {
            setStatus('Good quality - Hold still...');
          } else {
            setStatus(`${qualityText} - Adjust finger`);
          }
        }
      );
      console.log('✅ [Enrollment] Acquisition started');
    } catch (err: any) {
      console.error('❌ [Enrollment] Scan error:', err);
      setError(err.message || 'Scan failed. Try again.');
      setIsScanning(false);
      setStatus('Scan failed - Click "Start Scan"');
    }
  };

  const handleSampleAcquired = useCallback(async (samples: string) => {
    console.log('✅ [Enrollment] Sample acquired!');

    try {
      await fingerprintService.stopAcquisition();
      console.log('⏹️ [Enrollment] Stopped');

      const template = fingerprintService.extractTemplateFromSamples(samples);
      console.log('✅ [Enrollment] Template:', template.length, 'chars');

      // Get quality from ref
      const quality = lastQualityRef.current;
      console.log(`📊 [Enrollment] Final quality: ${quality}`);

      // Validate template
      if (template.length < MIN_TEMPLATE_LENGTH) {
        console.warn(`⚠️ [Enrollment] Template too short: ${template.length}`);
        setError(`Poor quality scan. Try again.`);
        setIsScanning(false);
        setStatus(`Scan failed - Click "Start Scan"`);
        return;
      }

      // Check quality (0 = Good, 1-8 = Issues)
      if (quality > 0) {
        const qualityText = fingerprintService.getQualityText(quality);
        console.warn(`⚠️ [Enrollment] Poor quality: ${qualityText}`);
        setError(`Quality issue: ${qualityText}. Clean finger and try again.`);
        setIsScanning(false);
        setStatus(`Scan failed - Try again`);
        return;
      }

      // Store scan
      const scanResult: ScanResult = {
        template,
        quality,
        templateLength: template.length,
      };

      const updatedResults = [...scanResults, scanResult];
      setScanResults(updatedResults);

      const newScanCount = scanCount + 1;
      setScanCount(newScanCount);
      setIsScanning(false);

      console.log(`✅ [Enrollment] Scan ${newScanCount}/${REQUIRED_SCANS} - ${template.length} chars`);

      if (newScanCount < REQUIRED_SCANS) {
        setStatus(`Scan ${newScanCount}/${REQUIRED_SCANS} done. Click "Scan Again"`);
      } else {
        setStatus('Processing...');
        console.log('✅ [Enrollment] All scans complete');

        // Select longest template (best quality usually has most features)
        const best = updatedResults.reduce((prev, current) =>
          current.templateLength > prev.templateLength ? current : prev
        );

        console.log(`⭐ [Enrollment] Best template: ${best.templateLength} chars`);
        await enrollFingerprint(best.template);
      }
    } catch (err: any) {
      console.error('❌ [Enrollment] Error:', err);
      setError(err.message || 'Processing failed');
      setIsScanning(false);
      setStatus('Failed - Try again');
    }
  }, [scanCount, scanResults, fingerprintService]);

  const enrollFingerprint = async (template: string) => {
    setLoading(true);
    console.log('🔄 [Enrollment] Enrolling for:', employee.employeeId);

    try {
      await employeesApi.assignFingerprint(employee.id, {
        fingerprintTemplate: template,
      });

      console.log('✅ [Enrollment] Success!');
      setSuccess(true);
      setStatus('Enrolled successfully!');

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('❌ [Enrollment] Enrollment error:', err);
      setError(err.message || 'Enrollment failed');
      setStatus('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    console.log('🔄 [Enrollment] Resetting...');
    if (isScanning) {
      await fingerprintService.stopAcquisition();
    }
    setScanCount(0);
    setScanResults([]);
    setError('');
    setIsScanning(false);
    lastQualityRef.current = 0;
    setStatus('Click "Start Scan"');
  };

  const handleClose = async () => {
    if (!isScanning && !loading) {
      await cleanup();
      onClose();
    }
  };

  /**
   * Get color based on quality
   * 0 = Green (Good)
   * 1-3 = Yellow (Semi-good, might work)
   * 4+ = Red (Bad, reject)
   */
  const getQualityColor = (quality: number): string => {
    if (quality === 0) return 'bg-green-500';
    if (quality <= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Enrollment Successful!
            </h3>
            <p className="text-sm text-slate-600">
              Fingerprint enrolled for {employee.fullName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg max-w-lg w-full">
        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Enroll Fingerprint</h2>
            <p className="text-xs text-slate-500 mt-0.5">{employee.fullName} ({employee.employeeId})</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isScanning || loading}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!deviceConnected && !error && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Scanner Not Connected</p>
                <p className="text-xs mt-1">
                  Connect your fingerprint reader and ensure DigitalPersona service is running.
                </p>
              </div>
            </div>
          )}

          {/* Scanner Visual */}
          <div className="mb-6 flex flex-col items-center">
            <div className={`relative w-40 h-40 rounded-full flex items-center justify-center mb-4 transition-all ${isScanning
              ? 'bg-blue-100 animate-pulse'
              : scanCount > 0
                ? 'bg-green-100'
                : deviceConnected
                  ? 'bg-slate-100'
                  : 'bg-gray-100'
              }`}>
              <Fingerprint className={`w-20 h-20 ${isScanning
                ? 'text-blue-600'
                : scanCount > 0
                  ? 'text-green-600'
                  : deviceConnected
                    ? 'text-slate-400'
                    : 'text-gray-300'
                }`} />

              {isScanning && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              )}
            </div>

            <p className="text-sm font-medium text-slate-700 text-center mb-4">
              {status}
            </p>

            {/* Simple Color Indicators */}
            <div className="flex items-center space-x-3">
              {[0, 1, 2].map((index) => {
                const scan = scanResults[index];
                const isComplete = scanCount > index;

                return (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${isComplete
                      ? `${getQualityColor(scan.quality)} text-white shadow-md`
                      : 'bg-slate-200 text-slate-400'
                      }`}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>

            {/* Simple legend */}
            {scanCount > 0 && (
              <div className="mt-4 flex items-center space-x-4 text-xs text-slate-600">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Good</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>OK</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Poor</span>
                </div>
              </div>
            )}
          </div>

          {/* Simple Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <p className="text-xs text-blue-800">
              <strong>Tips:</strong> Clean & dry finger • Center on scanner • Hold still • Use same finger for all 3 scans
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center space-x-2">
            <button
              onClick={handleReset}
              disabled={isScanning || loading || scanCount === 0}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={handleClose}
                disabled={isScanning || loading}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={startScanning}
                disabled={isScanning || loading || scanCount >= REQUIRED_SCANS || !deviceConnected}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isScanning || loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loading ? 'Enrolling...' : 'Scanning...'}</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>
                      {scanCount === 0
                        ? 'Start Scan'
                        : scanCount < REQUIRED_SCANS
                          ? `Scan ${scanCount + 1}/3`
                          : 'Complete'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}