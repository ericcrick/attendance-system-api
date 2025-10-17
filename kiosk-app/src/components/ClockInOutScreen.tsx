// kiosk/src/components/ClockInOutScreen.tsx
'use client';

import { useState } from 'react';
import { CreditCard, Hash, Camera, Fingerprint } from 'lucide-react';
import RfidAuth from './auth/RfidAuth';
import PinAuth from './auth/PinAuth';
import FacialAuth from './auth/FacialAuth';
import FingerprintAuth from './auth/FingerprintAuth';
import SuccessModal from './SuccessModal';

type AuthMethodType = 'RFID' | 'PIN' | 'FACIAL' | 'FINGERPRINT';

export default function ClockInOutScreen() {
    const [selectedMethod, setSelectedMethod] = useState<AuthMethodType>('RFID');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    const handleSuccess = (data: any) => {
        setSuccessData(data);
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            setSuccessData(null);
        }, 3000);
    };

    const authMethods = [
        {
            id: 'RFID' as AuthMethodType,
            name: 'RFID Card',
            icon: CreditCard,
            description: 'Tap card',
            color: 'blue',
        },
        {
            id: 'FINGERPRINT' as AuthMethodType,
            name: 'Fingerprint',
            icon: Fingerprint,
            description: 'Scan finger',
            color: 'purple',
        },
        {
            id: 'PIN' as AuthMethodType,
            name: 'PIN Code',
            icon: Hash,
            description: 'Enter PIN',
            color: 'green',
        },
        {
            id: 'FACIAL' as AuthMethodType,
            name: 'Face Scan',
            icon: Camera,
            description: 'Scan face',
            color: 'indigo',
        },
    ];

    const getColorClasses = (method: typeof authMethods[0], isSelected: boolean) => {
        const colors = {
            blue: {
                selected: 'border-blue-500 bg-blue-50',
                icon: 'bg-blue-100 text-blue-600',
                iconInactive: 'bg-gray-100 text-gray-600',
            },
            purple: {
                selected: 'border-purple-500 bg-purple-50',
                icon: 'bg-purple-100 text-purple-600',
                iconInactive: 'bg-gray-100 text-gray-600',
            },
            green: {
                selected: 'border-green-500 bg-green-50',
                icon: 'bg-green-100 text-green-600',
                iconInactive: 'bg-gray-100 text-gray-600',
            },
            indigo: {
                selected: 'border-indigo-500 bg-indigo-50',
                icon: 'bg-indigo-100 text-indigo-600',
                iconInactive: 'bg-gray-100 text-gray-600',
            },
        };

        return colors[method.color as keyof typeof colors];
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Welcome Message */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    Welcome to Attendance System
                </h2>
                <p className="text-sm text-gray-600">
                    Select your preferred authentication method
                </p>
            </div>

            {/* Authentication Method Selection */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {authMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    const colorClasses = getColorClasses(method, isSelected);

                    return (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                isSelected
                                    ? `${colorClasses.selected} shadow-md scale-105`
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                            <div className="flex flex-col items-center space-y-2">
                                <div
                                    className={`p-3 rounded-lg transition-colors ${
                                        isSelected
                                            ? colorClasses.icon
                                            : colorClasses.iconInactive
                                    }`}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-sm text-gray-900">
                                        {method.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {method.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Authentication Component */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[400px]">
                {selectedMethod === 'RFID' && (
                    <RfidAuth onSuccess={handleSuccess} />
                )}
                {selectedMethod === 'FINGERPRINT' && (
                    <FingerprintAuth onSuccess={handleSuccess} />
                )}
                {selectedMethod === 'PIN' && (
                    <PinAuth onSuccess={handleSuccess} />
                )}
                {selectedMethod === 'FACIAL' && (
                    <FacialAuth onSuccess={handleSuccess} />
                )}
            </div>

            {/* Success Modal */}
            {showSuccess && successData && (
                <SuccessModal
                    data={successData}
                    onClose={() => setShowSuccess(false)}
                />
            )}
        </div>
    );
}