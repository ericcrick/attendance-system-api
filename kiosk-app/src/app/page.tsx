//src/app/page.tsx

'use client';

import { useState } from 'react';
import { Clock, UserCheck, UserX, Wifi, WifiOff } from 'lucide-react';
import ClockInOutScreen from '@/components/ClockInOutScreen';
import CurrentTime from '@/components/CurrentTime';

export default function Home() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  37 Mil Hosp Attendance
                </h1>
                <p className="text-xs text-gray-500">
                  {process.env.NEXT_PUBLIC_KIOSK_ID || 'KIOSK-01'}
                </p>
              </div>
            </div>

            {/* Current Time & Status */}
            <div className="flex items-center space-x-4">
              <CurrentTime />

              {/* Online Status */}
              <div className="flex items-center space-x-1.5">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-medium text-red-600">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <ClockInOutScreen />
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
            <div className="flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-green-500" />
              <span>Clock In</span>
            </div>
            <div className="w-px h-3 bg-gray-300" />
            <div className="flex items-center space-x-1.5">
              <UserX className="w-3.5 h-3.5 text-orange-500" />
              <span>Clock Out</span>
            </div>
            <div className="w-px h-3 bg-gray-300" />
            <span>© 2025 Attendance System</span>
          </div>
        </div>
      </footer>
    </main>
  );
}