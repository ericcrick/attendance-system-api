// kiosk/src/components/SDKLoadingWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface SDKLoadingWrapperProps {
  children: React.ReactNode;
}

export default function SDKLoadingWrapper({ children }: SDKLoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSDK = () => {
      if (typeof window === 'undefined') return;

      if (window.Fingerprint && window.WebSdk) {
        setIsLoading(false);
        setError(null);
      } else {
        // Check again after a delay
        setTimeout(checkSDK, 100);
      }
    };

    // Start checking
    checkSDK();

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError('Failed to load DigitalPersona SDK. Please refresh the page.');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading fingerprint SDK...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">SDK Loading Error</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}