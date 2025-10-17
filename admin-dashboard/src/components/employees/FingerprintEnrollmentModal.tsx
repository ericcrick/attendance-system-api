//admin-dashboard/src/components/employees/FingerprintEnrollmentModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, Fingerprint, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { employeesApi } from '@/lib/api-client';
import { Employee } from '@/types';

interface FingerprintEnrollmentModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FingerprintEnrollmentModal({
  employee,
  onClose,
  onSuccess,
}: FingerprintEnrollmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<string>('Place finger on scanner');
  const [fingerprintData, setFingerprintData] = useState<string>('');
  const [scanCount, setScanCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Initialize connection to fingerprint device
    initializeFingerprintScanner();

    return () => {
      // Cleanup
      disconnectScanner();
    };
  }, []);

  const initializeFingerprintScanner = async () => {
    try {
      setStatus('Connecting to fingerprint scanner...');
      
      // In production, this would connect to your ZKTeco device via:
      // 1. Backend API endpoint that communicates with the device
      // 2. WebSerial API if the device supports it
      // 3. Desktop application bridge
      
      // Mock initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('Scanner ready. Place your finger on the sensor');
    } catch (err) {
      setError('Failed to connect to fingerprint scanner. Please ensure the device is connected.');
    }
  };

  const disconnectScanner = () => {
    // Cleanup scanner connection
  };

  const startScanning = async () => {
    if (isScanning || scanCount >= 3) return;

    setIsScanning(true);
    setError('');
    setStatus('Scanning fingerprint... Please hold still');

    try {
      // In production, call your backend API that interfaces with ZKTeco device
      // const response = await fetch('/api/fingerprint/capture', { method: 'POST' });
      // const { template } = await response.json();

      // Mock fingerprint capture
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock fingerprint template (Base64 encoded)
      const mockTemplate = generateMockFingerprintTemplate();
      
      setScanCount(prev => prev + 1);
      setFingerprintData(mockTemplate);
      
      if (scanCount + 1 < 3) {
        setStatus(`Scan ${scanCount + 1}/3 complete. Please scan again to verify`);
        setIsScanning(false);
      } else {
        setStatus('All scans complete. Enrolling fingerprint...');
        await enrollFingerprint(mockTemplate);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to capture fingerprint. Please try again.');
      setIsScanning(false);
    }
  };

  const generateMockFingerprintTemplate = (): string => {
    // Mock function - In production, this comes from ZKTeco device
    const randomBytes = new Uint8Array(512);
    crypto.getRandomValues(randomBytes);
    return btoa(String.fromCharCode(...randomBytes));
  };

  const enrollFingerprint = async (template: string) => {
    setLoading(true);

    try {
      await employeesApi.assignFingerprint(employee.id, {
        fingerprintTemplate: template,
      });

      setSuccess(true);
      setStatus('Fingerprint enrolled successfully!');

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to enroll fingerprint');
      setScanCount(0);
      setFingerprintData('');
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    if (!isScanning && !loading) {
      onClose();
    }
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
              Fingerprint has been successfully enrolled for {employee.fullName}
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
            <p className="text-xs text-slate-500 mt-0.5">{employee.fullName}</p>
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

          {/* Fingerprint Scanner Visual */}
          <div className="mb-6 flex flex-col items-center">
            <div className={`relative w-40 h-40 rounded-full flex items-center justify-center mb-4 transition-all ${
              isScanning 
                ? 'bg-blue-100 animate-pulse' 
                : scanCount > 0 
                ? 'bg-green-100' 
                : 'bg-slate-100'
            }`}>
              <Fingerprint className={`w-20 h-20 ${
                isScanning 
                  ? 'text-blue-600' 
                  : scanCount > 0 
                  ? 'text-green-600' 
                  : 'text-slate-400'
              }`} />
              
              {isScanning && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              )}
            </div>

            <p className="text-sm font-medium text-slate-700 text-center mb-2">
              {status}
            </p>

            {/* Scan Progress */}
            <div className="flex space-x-2 mb-4">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-3 h-3 rounded-full ${
                    scanCount >= num ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h4 className="text-xs font-medium text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Ensure your finger is clean and dry</li>
              <li>• Place your finger firmly on the scanner</li>
              <li>• Hold still until the scan is complete</li>
              <li>• You will need to scan 3 times for verification</li>
              <li>• Use the same finger for all scans</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleClose}
              disabled={isScanning || loading}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={startScanning}
              disabled={isScanning || loading || scanCount >= 3}
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
                    {scanCount === 0 ? 'Start Scan' : scanCount < 3 ? `Scan Again (${scanCount}/3)` : 'Complete'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}