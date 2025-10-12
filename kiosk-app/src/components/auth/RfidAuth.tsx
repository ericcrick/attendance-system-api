//src/components/auth/RfidAuth.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { CreditCard, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { attendanceApi } from '@/lib/api-client';
import { AuthMethod } from '@/types';

interface RfidAuthProps {
  onSuccess: (data: any) => void;
}

export default function RfidAuth({ onSuccess }: RfidAuthProps) {
  const [rfidInput, setRfidInput] = useState('');
  const [verifiedRfidCard, setVerifiedRfidCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedEmployee, setVerifiedEmployee] = useState<any>(null);
  const [action, setAction] = useState<'clock-in' | 'clock-out' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (loading || verifiedEmployee || document.activeElement === inputRef.current) {
        return;
      }

      if (e.key === 'Enter' && rfidInput.length > 0) {
        handleRfidScan(rfidInput);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setRfidInput((prev) => prev + e.key);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [rfidInput, loading, verifiedEmployee]);

  const handleRfidScan = async (cardId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response: any = await attendanceApi.verify({
        method: AuthMethod.RFID,
        rfidCardId: cardId,
      });

      setVerifiedEmployee(response.employee);
      setVerifiedRfidCard(cardId);
      setRfidInput('');
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'RFID card not recognized');
      setRfidInput('');
      
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (rfidInput.trim()) {
      handleRfidScan(rfidInput.trim());
    }
  };

  const handleClockAction = async (actionType: 'clock-in' | 'clock-out') => {
    if (!verifiedRfidCard) {
      setError('No RFID card verified. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setAction(actionType);

    try {
      const data = {
        employeeId: verifiedEmployee.id,
        method: AuthMethod.RFID,
        rfidCardId: verifiedRfidCard,
        location: process.env.NEXT_PUBLIC_KIOSK_ID,
      };

      console.log(`Attempting ${actionType}:`, data);

      const response =
        actionType === 'clock-in'
          ? await attendanceApi.clockIn(data)
          : await attendanceApi.clockOut(data);

      console.log(`${actionType} success:`, response);

      onSuccess({
        action: actionType,
        employee: verifiedEmployee,
        attendance: response,
      });

      setTimeout(() => {
        setVerifiedEmployee(null);
        setVerifiedRfidCard('');
        setRfidInput('');
        setAction(null);
        setError(null);
      }, 100);
    } catch (err: any) {
      console.error(`${actionType} error:`, err);
      const errorMessage = err.message || `Failed to ${actionType.replace('-', ' ')}`;
      setError(errorMessage);
      
      setTimeout(() => {
        setError(null);
        setVerifiedEmployee(null);
        setVerifiedRfidCard('');
        setAction(null);
      }, 8000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVerifiedEmployee(null);
    setVerifiedRfidCard('');
    setRfidInput('');
    setError(null);
    setAction(null);
  };

  const ErrorDisplay = () => {
    if (!error) return null;
    
    return (
      <div className="max-w-md mx-auto mb-4 p-3 bg-red-50 border border-red-200 rounded shadow-sm">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900 text-sm mb-0.5">Action Failed</p>
            <p className="text-red-700 text-xs">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (verifiedEmployee && !loading) {
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
          <div className="mt-2 inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-medium">
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
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded mb-4 animate-pulse">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          Tap Your RFID Card
        </h3>
        <p className="text-sm text-gray-600">
          Place your card near the reader or enter your card ID below
        </p>
      </div>

      <div className="max-w-md mx-auto mb-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={rfidInput}
            onChange={(e) => setRfidInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            placeholder="Enter RFID Card ID (e.g., RFID-001)"
            className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
            disabled={loading}
          />
          <button
            onClick={handleManualSubmit}
            disabled={loading || !rfidInput.trim()}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>

      <ErrorDisplay />

      {loading && !verifiedEmployee && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Processing...</span>
        </div>
      )}
    </div>
  );
}