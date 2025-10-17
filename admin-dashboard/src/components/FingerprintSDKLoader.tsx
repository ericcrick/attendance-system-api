// kiosk-app/src/components/FingerprintSDKLoader.tsx


'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface FingerprintSDKLoaderProps {
    children: React.ReactNode;
}

export default function FingerprintSDKLoader({ children }: FingerprintSDKLoaderProps) {
    const [es6Loaded, setEs6Loaded] = useState(false);
    const [websdkLoaded, setWebsdkLoaded] = useState(false);
    const [fpsdkLoaded, setFpsdkLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Log loading progress for debugging
    useEffect(() => {
        console.log(
            `[SDK Loader] Status → ES6: ${es6Loaded}, WebSDK: ${websdkLoaded}, FingerprintSDK: ${fpsdkLoaded}`
        );
    }, [es6Loaded, websdkLoaded, fpsdkLoaded]);

    return (
        <>
            {/* Step 1: Load ES6 Shim */}
            <Script
                src="/fingerprint-sdk/es6-shim.js"
                strategy="afterInteractive"
                onLoad={() => {
                    console.log('[SDK Loader] ✅ ES6 Shim loaded successfully');
                    setEs6Loaded(true);
                }}
                onError={(e) => {
                    console.warn('[SDK Loader] ⚠️ ES6 Shim failed to load, continuing anyway', e);
                    setEs6Loaded(true);
                }}
                onReady={() => console.log('[SDK Loader] 🟢 ES6 ready event fired')}
            />


            {/* Step 2: Load WebSDK after ES6 */}
            {es6Loaded && (
                <Script
                    src="/fingerprint-sdk/websdk.client.bundle.min.js"
                    strategy="afterInteractive"
                    onLoad={() => {
                        console.log('[SDK Loader] ✅ WebSDK loaded');
                        setWebsdkLoaded(true);
                    }}
                    onError={(e) => {
                        console.error('[SDK Loader] ❌ Failed to load WebSDK:', e);
                        setError('Failed to load WebSDK');
                    }}
                />
            )}

            {/* Step 3: Load Fingerprint SDK after WebSDK */}
            {websdkLoaded && (
                <Script
                    src="/fingerprint-sdk/fingerprint.sdk.min.js"
                    strategy="afterInteractive"
                    onLoad={() => {
                        console.log('[SDK Loader] ✅ Fingerprint SDK loaded');
                        setFpsdkLoaded(true);
                    }}
                    onError={(e) => {
                        console.error('[SDK Loader] ❌ Failed to load Fingerprint SDK:', e);
                        setError('Failed to load Fingerprint SDK');
                    }}
                />
            )}

            {/* Optional loading overlay */}
            {!fpsdkLoaded && !error && (
                <div className="fixed top-4 right-4 bg-blue-50 border border-blue-200 rounded p-4 max-w-md shadow z-50">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                        Loading Fingerprint SDK...
                    </p>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        <p className="text-xs text-blue-700">
                            {!es6Loaded
                                ? 'Loading ES6 Shim...'
                                : !websdkLoaded
                                    ? 'Loading WebSDK...'
                                    : 'Loading Fingerprint SDK...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Error overlay */}
            {error && (
                <div className="fixed top-4 right-4 bg-red-50 border border-red-300 rounded p-4 max-w-md shadow z-50">
                    <p className="text-sm font-semibold text-red-800">Fingerprint SDK Load Error</p>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                    <p className="text-xs text-red-600 mt-1">
                        Check that the files exist in <code>/public/fingerprint-sdk/</code> and restart your dev server.
                    </p>
                </div>
            )}

            {/* Render children only when SDK fully loaded */}
            {fpsdkLoaded ? children : null}
        </>
    );
}
