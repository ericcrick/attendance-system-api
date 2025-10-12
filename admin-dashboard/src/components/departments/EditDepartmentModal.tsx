// src/components/departments/EditDepartmentModal.tsx
'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { departmentsApi } from '@/lib/api-client';
import { Department } from '@/types';

interface EditDepartmentModalProps {
  department: Department;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDepartmentModal({
  department,
  onClose,
  onSuccess,
}: EditDepartmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: department.name,
    code: department.code,
    description: department.description || '',
    managerName: department.managerName || '',
    managerEmail: department.managerEmail || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await departmentsApi.update(department.id, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg max-w-2xl w-full">
        {/* Header */}
        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Edit Department</h2>
            <p className="text-xs text-slate-500 mt-0.5">{department.name}</p>
          </div>
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
            {/* Department Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Department Code */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Department Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                maxLength={10}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none uppercase"
              />
            </div>

            {/* Manager Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Manager Name
              </label>
              <input
                type="text"
                name="managerName"
                value={formData.managerName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Manager Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Manager Email
              </label>
              <input
                type="email"
                name="managerEmail"
                value={formData.managerEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
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
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Department</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}