//src/components/SuccessModal.tsx

'use client';

import { CheckCircle, X, Clock } from 'lucide-react';

interface SuccessModalProps {
  data: {
    action: 'clock-in' | 'clock-out';
    employee: any;
    attendance: any;
  };
  onClose: () => void;
}

export default function SuccessModal({ data, onClose }: SuccessModalProps) {
  const { action, employee, attendance } = data;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const isClockIn = action === 'clock-in';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded ${
              isClockIn ? 'bg-green-100' : 'bg-orange-100'
            }`}
          >
            <CheckCircle
              className={`w-9 h-9 ${
                isClockIn ? 'text-green-600' : 'text-orange-600'
              }`}
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-1">
          {isClockIn ? 'Clocked In Successfully!' : 'Clocked Out Successfully!'}
        </h2>

        {/* Employee Info */}
        <div className="text-center mb-4">
          <p className="text-lg font-medium text-gray-800">
            {employee.fullName}
          </p>
          <p className="text-sm text-gray-600">
            {employee.department} • {employee.position}
          </p>
        </div>

        {/* Time & Status */}
        <div className="bg-gray-50 rounded p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm font-medium">Time:</span>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-base font-semibold text-gray-900">
                {formatTime(
                  isClockIn ? attendance.clockInTime : attendance.clockOutTime
                )}
              </span>
            </div>
          </div>

          {isClockIn && attendance.status && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm font-medium">Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  attendance.status === 'ON_TIME'
                    ? 'bg-green-100 text-green-800'
                    : attendance.status === 'LATE'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {attendance.status === 'ON_TIME'
                  ? 'On Time'
                  : attendance.status === 'LATE'
                  ? 'Late'
                  : attendance.status}
              </span>
            </div>
          )}

          {!isClockIn && attendance.workDurationMinutes && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm font-medium">Work Duration:</span>
              <span className="text-base font-semibold text-gray-900">
                {Math.floor(attendance.workDurationMinutes / 60)}h{' '}
                {attendance.workDurationMinutes % 60}m
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm font-medium">Method:</span>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
              {isClockIn
                ? attendance.clockInMethod
                : attendance.clockOutMethod}
            </span>
          </div>

          {attendance.clockInLocation && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm font-medium">Location:</span>
              <span className="text-gray-900 text-sm font-medium">
                {isClockIn
                  ? attendance.clockInLocation
                  : attendance.clockOutLocation}
              </span>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isClockIn
              ? 'Have a productive day!'
              : 'Thank you for your hard work today!'}
          </p>
        </div>
      </div>
    </div>
  );
}