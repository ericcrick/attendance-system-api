// src/app/dashboard/leaves/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { leavesApi } from '@/lib/api-client';
import { Leave, LeaveStatus, LeaveType } from '@/types';
import CreateLeaveModal from '@/components/leaves/CreateLeaveModal';
import EditLeaveModal from '@/components/leaves/EditLeaveModal';
import ReviewLeaveModal from '@/components/leaves/ReviewLeaveModal';

const ITEMS_PER_PAGE = 10;

// Toast notification component
const Toast = ({
  message,
  type,
  onClose
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) => (
  <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-5 duration-300">
    <div className={`flex items-center space-x-2 px-4 py-3 rounded shadow-lg ${type === 'success'
        ? 'bg-green-600 text-white'
        : 'bg-rose-600 text-white'
      }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white/80 hover:text-white"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    filterLeaves();
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, leaves]);

  useEffect(() => {
    calculateStatistics();
  }, [filteredLeaves]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data: any = await leavesApi.getAll();
      setLeaves(data);
      setFilteredLeaves(data);
    } catch (error: any) {
      console.error('Failed to fetch leaves:', error);
      showToast(error.message || 'Failed to fetch leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterLeaves = () => {
    let filtered = leaves;

    // Search by employee name or ID
    if (searchQuery) {
      filtered = filtered.filter(
        (leave) =>
          leave.employee?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          leave.employee?.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((leave) => leave.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((leave) => leave.leaveType === typeFilter);
    }

    setFilteredLeaves(filtered);
  };

  const calculateStatistics = () => {
    setStatistics({
      total: filteredLeaves.length,
      pending: filteredLeaves.filter((l) => l.status === LeaveStatus.PENDING).length,
      approved: filteredLeaves.filter((l) => l.status === LeaveStatus.APPROVED).length,
      rejected: filteredLeaves.filter((l) => l.status === LeaveStatus.REJECTED).length,
    });
  };

  const handleEdit = (leave: Leave) => {
    setSelectedLeave(leave);
    setShowEditModal(true);
  };

  const handleReview = (leave: Leave) => {
    setSelectedLeave(leave);
    setShowReviewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      try {
        await leavesApi.delete(id);
        showToast('Leave request deleted successfully', 'success');
        fetchLeaves();
      } catch (error: any) {
        showToast(error.message || 'Failed to delete leave', 'error');
      }
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    showToast('Leave request created successfully', 'success');
    fetchLeaves();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedLeave(null);
    showToast('Leave request updated successfully', 'success');
    fetchLeaves();
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedLeave(null);
    showToast('Leave request reviewed successfully', 'success');
    fetchLeaves();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700';
      case LeaveStatus.APPROVED:
        return 'bg-green-100 text-green-700';
      case LeaveStatus.REJECTED:
        return 'bg-rose-100 text-rose-700';
      case LeaveStatus.CANCELLED:
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeColor = (type: LeaveType) => {
    switch (type) {
      case LeaveType.ANNUAL:
        return 'bg-blue-100 text-blue-700';
      case LeaveType.SICK:
        return 'bg-rose-100 text-rose-700';
      case LeaveType.PERSONAL:
        return 'bg-slate-100 text-slate-700';
      case LeaveType.MATERNITY:
      case LeaveType.PATERNITY:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeaves = filteredLeaves.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-slate-600">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Leave Management</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage employee leave requests
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Request Leave</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">Total Requests</h3>
            <Calendar className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-semibold text-slate-900">{statistics.total}</p>
        </div>

        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">Pending</h3>
            <Clock className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-semibold text-yellow-600">{statistics.pending}</p>
        </div>

        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">Approved</h3>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-green-600">{statistics.approved}</p>
        </div>

        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">Rejected</h3>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-semibold text-rose-600">{statistics.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded shadow-sm border border-slate-200 p-3">
        <div className="flex items-center space-x-1.5 mb-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Employee name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value={LeaveStatus.PENDING}>Pending</option>
              <option value={LeaveStatus.APPROVED}>Approved</option>
              <option value={LeaveStatus.REJECTED}>Rejected</option>
              <option value={LeaveStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Leave Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value={LeaveType.ANNUAL}>Annual</option>
              <option value={LeaveType.SICK}>Sick</option>
              <option value={LeaveType.PERSONAL}>Personal</option>
              <option value={LeaveType.MATERNITY}>Maternity</option>
              <option value={LeaveType.PATERNITY}>Paternity</option>
              <option value={LeaveType.UNPAID}>Unpaid</option>
              <option value={LeaveType.OTHER}>Other</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="w-full px-3 py-2 bg-slate-600 text-white text-sm font-medium rounded hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredLeaves.length)} of {filteredLeaves.length} requests
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {currentLeaves.length > 0 ? (
                currentLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {leave.employee?.fullName || 'Unknown'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {leave.employee?.employeeId || 'N/A'} • {leave.employee?.department || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(leave.leaveType)}`}>
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900">
                      {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-slate-900">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex items-center justify-end space-x-1.5">
                        {leave.status === LeaveStatus.PENDING && (
                          <>
                            <button
                              onClick={() => handleReview(leave)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Review"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(leave)}
                              className="text-slate-600 hover:text-slate-900"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(leave.id)}
                          className="text-rose-600 hover:text-rose-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No leave requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateLeaveModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedLeave && (
        <EditLeaveModal
          leave={selectedLeave}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLeave(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {showReviewModal && selectedLeave && (
        <ReviewLeaveModal
          leave={selectedLeave}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedLeave(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}