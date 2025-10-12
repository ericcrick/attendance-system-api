'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { shiftsApi } from '@/lib/api-client';
import { Shift } from '@/types';
import CreateShiftModal from '@/components/shifts/CreateShiftModal';
import EditShiftModal from '@/components/shifts/EditShiftModal';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const data: any = await shiftsApi.getAll();
      setShifts(data);
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this shift? This will affect all assigned employees.')) {
      try {
        await shiftsApi.delete(id);
        fetchShifts();
      } catch (error: any) {
        alert(error.message || 'Failed to delete shift. Make sure no employees are assigned to this shift.');
      }
    }
  };

  const handleToggleStatus = async (shift: Shift) => {
    try {
      await shiftsApi.toggle(shift.id);
      fetchShifts();
    } catch (error: any) {
      alert(error.message || 'Failed to toggle shift status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shifts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shift Management</h2>
          <p className="text-gray-600 mt-1">
            Manage work shifts and schedules
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Shift</span>
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Color Header */}
            <div
              className="h-2"
              style={{ backgroundColor: shift.colorCode || '#3B82F6' }}
            />

            <div className="p-6">
              {/* Shift Name & Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {shift.name}
                  </h3>
                  {shift.description && (
                    <p className="text-sm text-gray-600">{shift.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleToggleStatus(shift)}
                  className={`${
                    shift.isActive
                      ? 'text-green-600 hover:text-green-700'
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                  title={shift.isActive ? 'Active' : 'Inactive'}
                >
                  {shift.isActive ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>

              {/* Time Range */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Working Hours
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {shift.startTime}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {shift.endTime}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Grace Period:</span>
                  <span className="font-medium text-gray-900">
                    {shift.gracePeriodMinutes} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shift.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {shift.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(shift)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="font-medium">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(shift.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {shifts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No shifts created yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first shift
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateShiftModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchShifts();
          }}
        />
      )}

      {showEditModal && selectedShift && (
        <EditShiftModal
          shift={selectedShift}
          onClose={() => {
            setShowEditModal(false);
            setSelectedShift(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedShift(null);
            fetchShifts();
          }}
        />
      )}
    </div>
  );
}