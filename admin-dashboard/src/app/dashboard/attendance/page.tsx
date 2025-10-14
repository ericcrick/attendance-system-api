// src/app/dashboard/attendance/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import { attendanceApi, departmentsApi, employeesApi } from '@/lib/api-client';
import { Attendance, AttendanceStatus } from '@/types';

const ITEMS_PER_PAGE = 10;

// Toast component
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

interface Statistics {
  total: number;
  onTime: number;
  late: number;
  completed: number;
  incomplete: number;
  overtime: number;
  onTimePercentage: number;
}

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'today' | 'range'>('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    onTime: 0,
    late: 0,
    completed: 0,
    incomplete: 0,
    overtime: 0,
    onTimePercentage: 0,
  });

  useEffect(() => {
    fetchTodayAttendance();
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterAttendances();
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, attendances]);

  useEffect(() => {
    calculateStatistics();
  }, [filteredAttendances]);

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

  // const fetchDepartments = async () => {
  //   try {
  //     const employees = await employeesApi.getAll();
  //     const uniqueDepts = [...new Set(
  //       (employees as any[])
  //         .map((emp: any) => emp.department)
  //         .filter(Boolean)
  //     )];
  //     setDepartments(uniqueDepts as string[]);
  //   } catch (error) {
  //     console.error('Failed to fetch departments:', error);
  //   }
  // };

  const fetchDepartments = async () => {
    try {
      const data = await departmentsApi.getAll(); // Fetch from actual Department table
      const activeDepts = (data as any[])
        .filter((dept: any) => dept.isActive)
        .map((dept: any) => dept.name);
      setDepartments(activeDepts);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };


  const fetchTodayAttendance = async () => {
    setLoading(true);
    try {
      const data = await attendanceApi.getToday();
      setAttendances(data as Attendance[]);
      setFilteredAttendances(data as Attendance[]);
      setViewMode('today');
    } catch (error: any) {
      console.error('Failed to fetch attendance:', error);
      showToast(error.message || 'Failed to fetch attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDateRangeAttendance = async () => {
    if (!startDate || !endDate) {
      showToast('Please select both start and end dates', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await attendanceApi.getReport(
        startDate,
        endDate,
        departmentFilter !== 'all' ? departmentFilter : undefined
      ) as any;
      setAttendances(data.attendances as Attendance[]);
      setFilteredAttendances(data.attendances as Attendance[]);
      setViewMode('range');
      showToast('Report generated successfully', 'success');
    } catch (error: any) {
      console.error('Failed to fetch attendance report:', error);
      showToast(error.message || 'Failed to fetch attendance report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAttendances = () => {
    let filtered = attendances;

    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.employee?.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.employee?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter((a) => a.employee?.department === departmentFilter);
    }

    setFilteredAttendances(filtered);
  };

  const calculateStatistics = () => {
    const total = filteredAttendances.length;
    const onTime = filteredAttendances.filter((a) => a.status === AttendanceStatus.ON_TIME).length;
    const late = filteredAttendances.filter((a) => a.status === AttendanceStatus.LATE).length;
    const completed = filteredAttendances.filter((a) => a.shiftCompleted).length;
    const incomplete = filteredAttendances.filter((a) => !a.clockOutTime).length;
    const overtime = filteredAttendances.filter((a) => a.overtimeMinutes && a.overtimeMinutes > 0).length;
    const onTimePercentage = total > 0 ? Math.round((onTime / total) * 100) : 0;

    setStatistics({
      total,
      onTime,
      late,
      completed,
      incomplete,
      overtime,
      onTimePercentage,
    });
  };

  const exportToCSV = () => {
    if (filteredAttendances.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Shift',
      'Clock In',
      'Clock Out',
      'Duration (min)',
      'Overtime (min)',
      'Shift Completed',
      'Status',
      'Method',
    ];

    const rows = filteredAttendances.map((a) => [
      a.employee?.employeeId || 'N/A',
      a.employee?.fullName || 'Unknown',
      a.employee?.department || 'N/A',
      a.employee?.shift?.name ? `${a.employee.shift.name} (${a.employee.shift.startTime}-${a.employee.shift.endTime})` : 'N/A',
      new Date(a.clockInTime).toLocaleString(),
      a.clockOutTime ? new Date(a.clockOutTime).toLocaleString() : 'Not clocked out',
      a.workDurationMinutes || '-',
      a.overtimeMinutes || '0',
      a.shiftCompleted ? 'Yes' : 'No',
      a.status,
      a.clockInMethod,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Report exported successfully', 'success');
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.ON_TIME:
        return 'bg-green-100 text-green-700';
      case AttendanceStatus.LATE:
        return 'bg-rose-100 text-rose-700';
      case AttendanceStatus.OVERTIME:
        return 'bg-purple-100 text-purple-700';
      case AttendanceStatus.COMPLETED:
        return 'bg-blue-100 text-blue-700';
      case AttendanceStatus.EARLY_DEPARTURE:
        return 'bg-yellow-100 text-yellow-700';
      case AttendanceStatus.INCOMPLETE:
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.ON_TIME:
        return 'On Time';
      case AttendanceStatus.LATE:
        return 'Late';
      case AttendanceStatus.OVERTIME:
        return 'Overtime';
      case AttendanceStatus.COMPLETED:
        return 'Completed';
      case AttendanceStatus.EARLY_DEPARTURE:
        return 'Early Exit';
      case AttendanceStatus.INCOMPLETE:
        return 'Incomplete';
      default:
        return status;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredAttendances.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAttendances = filteredAttendances.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-slate-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
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
          <h2 className="text-lg font-semibold text-slate-900">Attendance Reports</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            View and export attendance records
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded shadow-sm border border-slate-200 p-3">
        <div className="flex items-center space-x-1.5 mb-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Employee ID or name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchDateRangeAttendance}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Apply Filter
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                fetchTodayAttendance();
                setSearchQuery('');
                setDepartmentFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="w-full px-3 py-2 bg-slate-600 text-white text-sm font-medium rounded hover:bg-slate-700 transition-colors flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">Total</h3>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-semibold text-slate-900">{statistics.total}</p>
        </div>

        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">On Time</h3>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-green-600">{statistics.onTime}</p>
        </div>

        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">Late</h3>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-semibold text-rose-600">{statistics.late}</p>
        </div>

        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">Completed</h3>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-semibold text-blue-600">{statistics.completed}</p>
        </div>

        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">Incomplete</h3>
            <XCircle className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-semibold text-orange-600">{statistics.incomplete}</p>
        </div>

        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">Overtime</h3>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-semibold text-purple-600">{statistics.overtime}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            {viewMode === 'today' ? "Today's Attendance" : 'Attendance Records'}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAttendances.length)} of {filteredAttendances.length} records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Overtime
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Shift Status
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {currentAttendances.length > 0 ? (
                currentAttendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {attendance.employee?.fullName || 'Unknown Employee'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {attendance.employee?.employeeId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900">
                      {attendance.employee?.department || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-xs font-medium text-slate-900">
                          {attendance.employee?.shift?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {attendance.employee?.shift?.startTime && attendance.employee?.shift?.endTime
                            ? `${attendance.employee.shift.startTime} - ${attendance.employee.shift.endTime}`
                            : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-xs text-slate-900">
                          {formatTime(attendance.clockInTime)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(attendance.clockInTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900">
                      {attendance.clockOutTime ? formatTime(attendance.clockOutTime) : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900">
                      {formatDuration(attendance.workDurationMinutes)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {attendance.overtimeMinutes && attendance.overtimeMinutes > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                          +{formatDuration(attendance.overtimeMinutes)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {attendance.clockOutTime ? (
                        attendance.shiftCompleted ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                            ✓ Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                            ⚠ Early Exit
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                          ✗ Incomplete
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(attendance.status)}`}>
                        {getStatusLabel(attendance.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No attendance records found
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
                let pageNum: number;
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
    </div>
  );
}