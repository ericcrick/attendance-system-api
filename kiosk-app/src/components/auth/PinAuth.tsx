//src/components/auth/PinAuth.tsx

'use client';

import { useState } from 'react';
import { Hash, Loader2, CheckCircle, XCircle, Delete, AlertTriangle } from 'lucide-react';
import { attendanceApi } from '@/lib/api-client';
import { AuthMethod } from '@/types';

interface PinAuthProps {
  onSuccess: (data: any) => void;
}

export default function PinAuth({ onSuccess }: PinAuthProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [verifiedPin, setVerifiedPin] = useState('');
  const [verifiedEmployeeId, setVerifiedEmployeeId] = useState('');
  const [step, setStep] = useState<'employee-id' | 'pin'>('employee-id');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedEmployee, setVerifiedEmployee] = useState<any>(null);
  const [action, setAction] = useState<'clock-in' | 'clock-out' | null>(null);

  const handleEmployeeIdSubmit = () => {
    if (employeeId.trim()) {
      setStep('pin');
      setError(null);
    }
  };

  const handlePinInput = (value: string) => {
    if (pin.length < 6) {
      setPin(pin + value);
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handlePinSubmit = async () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: any = await attendanceApi.verify({
        method: AuthMethod.PIN,
        employeeId: employeeId,
        pinCode: pin,
      });

      setVerifiedEmployee(response.employee);
      setVerifiedPin(pin);
      setVerifiedEmployeeId(employeeId);
      setPin('');
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Invalid employee ID or PIN');
      setPin('');
      
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleClockAction = async (actionType: 'clock-in' | 'clock-out') => {
    if (!verifiedPin || !verifiedEmployeeId) {
      setError('No PIN verified. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setAction(actionType);

    try {
      const data = {
        employeeId: verifiedEmployee.employeeId,
        method: AuthMethod.PIN,
        pinCode: verifiedPin,
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
        setVerifiedPin('');
        setVerifiedEmployeeId('');
        setEmployeeId('');
        setPin('');
        setStep('employee-id');
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
        setVerifiedPin('');
        setVerifiedEmployeeId('');
        setAction(null);
      }, 8000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmployeeId('');
    setPin('');
    setVerifiedPin('');
    setVerifiedEmployeeId('');
    setStep('employee-id');
    setError(null);
    setVerifiedEmployee(null);
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
          <div className="mt-2 inline-block bg-green-50 text-green-700 px-3 py-1 rounded text-xs font-medium">
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded mb-4">
          <Hash className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {step === 'employee-id' ? 'Enter Employee ID' : 'Enter Your PIN'}
        </h3>
        <p className="text-sm text-gray-600">
          {step === 'employee-id'
            ? 'Enter your employee ID to continue'
            : 'Enter your 4-6 digit PIN code'}
        </p>
      </div>

      <ErrorDisplay />

      <div className="max-w-md mx-auto">
        {step === 'employee-id' ? (
          <div className="mb-4">
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEmployeeIdSubmit()}
              placeholder="Employee ID (e.g., EMP-001)"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-center transition-colors"
              autoFocus
            />
            <button
              onClick={handleEmployeeIdSubmit}
              disabled={!employeeId.trim()}
              className="w-full mt-3 px-4 py-3 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-center space-x-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded border flex items-center justify-center text-lg font-bold transition-all ${
                    i < pin.length
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-gray-50 text-gray-400'
                  }`}
                >
                  {i < pin.length ? '•' : ''}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  disabled={loading || pin.length >= 6}
                  className="h-12 bg-gray-100 hover:bg-gray-200 rounded text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleReset}
                className="h-12 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => handlePinInput('0')}
                disabled={loading || pin.length >= 6}
                className="h-12 bg-gray-100 hover:bg-gray-200 rounded text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                0
              </button>
              <button
                onClick={handlePinDelete}
                disabled={loading || pin.length === 0}
                className="h-12 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handlePinSubmit}
              disabled={loading || pin.length < 4}
              className="w-full px-4 py-3 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </>
        )}
      </div>

      {loading && !verifiedEmployee && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Processing...</span>
        </div>
      )}
    </div>
  );
}