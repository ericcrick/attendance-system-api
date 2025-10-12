// src/components/leaves/ReviewLeaveModal.tsx
'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { leavesApi } from '@/lib/api-client';
import { Leave, LeaveStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewLeaveModalProps {
    leave: Leave;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReviewLeaveModal({
    leave,
    onClose,
    onSuccess,
}: ReviewLeaveModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        status: LeaveStatus.APPROVED,
        reviewComments: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await leavesApi.review(leave.id, {
                ...formData,
                reviewedBy: user?.id || '',
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to review leave request');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-lg max-w-lg w-full">
                {/* Header */}
                <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900">Review Leave Request</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Leave Details */}
                <div className="p-4 space-y-3 border-b border-slate-200">
                    <div className="bg-slate-50 rounded p-3">
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">Leave Details</h3>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Employee:</span>
                                <span className="font-medium text-slate-900">
                                    {leave.employee.fullName} ({leave.employee.employeeId})
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Department:</span>
                                <span className="font-medium text-slate-900">{leave.employee.department}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Leave Type:</span>
                                <span className="font-medium text-slate-900">{leave.leaveType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Duration:</span>
                                <span className="font-medium text-slate-900">
                                    {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Dates:</span>
                                <span className="font-medium text-slate-900">
                                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Reason
                        </label>
                        <p className="text-sm text-slate-900 bg-slate-50 rounded p-2">
                            {leave.reason}
                        </p>
                    </div>

                    {leave.attachmentUrl && (
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Attachment
                            </label>
                            <a
                                href={leave.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 underline"
                            >
                                View Attachment
                            </a>
                        </div>
                    )}
                </div>

                {/* Review Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-800">
                            {error}
                        </div>
                    )}

                    {/* Decision */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">
                            Decision *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, status: LeaveStatus.APPROVED })}
                                className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${formData.status === LeaveStatus.APPROVED
                                    ? 'bg-green-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, status: LeaveStatus.REJECTED })}
                                className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${formData.status === LeaveStatus.REJECTED
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                            </button>
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Comments (Optional)
                        </label>
                        <textarea
                            name="reviewComments"
                            value={formData.reviewComments}
                            onChange={(e) => setFormData({ ...formData, reviewComments: e.target.value })}
                            rows={3}
                            placeholder="Add any comments about your decision"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-3 py-2 text-white text-sm font-medium rounded disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5 ${formData.status === LeaveStatus.APPROVED
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>Submit Review</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}