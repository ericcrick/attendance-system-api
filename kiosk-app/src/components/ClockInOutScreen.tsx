//src/components/ClockInOutScreen.tsx

'use client';

import { useState } from 'react';
import { CreditCard, Hash, Camera } from 'lucide-react';
import RfidAuth from './auth/RfidAuth';
import PinAuth from './auth/PinAuth';
import FacialAuth from './auth/FacialAuth';
import SuccessModal from './SuccessModal';

type AuthMethodType = 'RFID' | 'PIN' | 'FACIAL';

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
            description: 'Tap your card',
            color: 'blue',
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
            name: 'Face Recognition',
            icon: Camera,
            description: 'Scan face',
            color: 'blue',
        },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Welcome Message */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    Welcome! Clock In or Out
                </h2>
                <p className="text-sm text-gray-600">
                    Choose your authentication method below
                </p>
            </div>

            {/* Authentication Method Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {authMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;

                    return (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-4 rounded border transition-all duration-200 ${
                                isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                            <div className="flex flex-col items-center space-y-2">
                                <div
                                    className={`p-2.5 rounded ${
                                        isSelected
                                            ? 'bg-blue-100'
                                            : 'bg-gray-100'
                                    }`}
                                >
                                    <Icon
                                        className={`w-5 h-5 ${
                                            isSelected
                                                ? 'text-blue-600'
                                                : 'text-gray-600'
                                        }`}
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-medium text-sm text-gray-900">
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
            <div className="bg-white rounded border border-gray-200 shadow-sm p-6">
                {selectedMethod === 'RFID' && (
                    <RfidAuth onSuccess={handleSuccess} />
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