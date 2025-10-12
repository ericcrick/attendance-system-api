// src/components/leaves/CreateLeaveModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { leavesApi, employeesApi } from '@/lib/api-client';
import { LeaveType, Employee } from '@/types';

interface CreateLeaveModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateLeaveModal({
  onClose,
  onSuccess,
}: CreateLeaveModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: LeaveType.ANNUAL,
    startDate: '',
    endDate: '',
    daysCount: 1,
    reason: '',
    attachmentUrl: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    calculateDays();
  }, [formData.startDate, formData.endDate]);

  const fetchEmployees = async () => {
    try {
      const data: any = await employeesApi.getAll();
      setEmployees(data.filter((emp: Employee) => emp.status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData({ ...formData, daysCount: diffDays });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await leavesApi.create(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Request Leave
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Employee */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Employee *
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.employeeId}>
                    {employee.fullName} ({employee.employeeId}) - {employee.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Leave Type */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Leave Type *
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value={LeaveType.ANNUAL}>Annual Leave</option>
                <option value={LeaveType.SICK}>Sick Leave</option>
                <option value={LeaveType.PERSONAL}>Personal Leave</option>
                <option value={LeaveType.MATERNITY}>Maternity Leave</option>
                <option value={LeaveType.PATERNITY}>Paternity Leave</option>
                <option value={LeaveType.UNPAID}>Unpaid Leave</option>
                <option value={LeaveType.OTHER}>Other</option>
              </select>
            </div>

            {/* Days Count */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Number of Days
              </label>
              <input
                type="number"
                name="daysCount"
                value={formData.daysCount}
                readOnly
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-slate-50 text-slate-600"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Reason */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reason *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Please provide a reason for your leave request"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Attachment URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Attachment URL (Optional)
              </label>
              <input
                type="url"
                name="attachmentUrl"
                value={formData.attachmentUrl}
                onChange={handleChange}
                placeholder="https://example.com/document.pdf"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-0.5">
                For sick leave or other cases requiring documentation
              </p>
            </div>
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
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}