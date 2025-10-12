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
} from 'lucide-react';
import { attendanceApi, employeesApi } from '@/lib/api-client';
import { Attendance } from '@/types';

const ITEMS_PER_PAGE = 10;

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
  const [statistics, setStatistics] = useState({
    total: 0,
    onTime: 0,
    late: 0,
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

  const fetchDepartments = async () => {
    try {
      const employees: any = await employeesApi.getAll();
      const uniqueDepts = [...new Set(employees.map((emp: any) => emp.department))];
      setDepartments(uniqueDepts as any);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    setLoading(true);
    try {
      const data: any = await attendanceApi.getToday();
      setAttendances(data);
      setFilteredAttendances(data);
      setViewMode('today');
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDateRangeAttendance = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const data: any = await attendanceApi.getReport(
        startDate,
        endDate,
        departmentFilter !== 'all' ? departmentFilter : undefined
      );
      setAttendances(data.attendances);
      setFilteredAttendances(data.attendances);
      setViewMode('range');
    } catch (error) {
      console.error('Failed to fetch attendance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAttendances = () => {
    let filtered = attendances;

    // Search by employee ID or name
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.employee.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter((a) => a.employee.department === departmentFilter);
    }

    setFilteredAttendances(filtered);
  };

  const calculateStatistics = () => {
    const total = filteredAttendances.length;
    const onTime = filteredAttendances.filter((a) => a.status === 'ON_TIME').length;
    const late = filteredAttendances.filter((a) => a.status === 'LATE').length;
    const onTimePercentage = total > 0 ? Math.round((onTime / total) * 100) : 0;

    setStatistics({
      total,
      onTime,
      late,
      onTimePercentage,
    });
  };

  const exportToCSV = () => {
    if (filteredAttendances.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Clock In',
      'Clock Out',
      'Duration (min)',
      'Status',
      'Method',
    ];

    const rows = filteredAttendances.map((a) => [
      a.employee.employeeId,
      a.employee.fullName,
      a.employee.department,
      new Date(a.clockInTime).toLocaleString(),
      a.clockOutTime ? new Date(a.clockOutTime).toLocaleString() : 'Not yet',
      a.workDurationMinutes || '-',
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
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
          {/* Start Date */}
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

          {/* End Date */}
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

          {/* Department Filter */}
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

          {/* Search */}
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

          {/* Apply Filter Button */}
          <div className="flex items-end">
            <button
              onClick={fetchDateRangeAttendance}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Apply Filter
            </button>
          </div>

          {/* Today Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                fetchTodayAttendance();
                setSearchQuery('');
                setDepartmentFilter('all');
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-medium text-slate-600">Total Records</h3>
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
            <h3 className="text-xs font-medium text-slate-600">On-Time Rate</h3>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-semibold text-slate-900">
            {statistics.onTimePercentage}%
          </p>
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
                  Clock In
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Method
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
                          {attendance.employee.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {attendance.employee.employeeId}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900">
                      {attendance.employee.department}
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
                      {attendance.clockOutTime
                        ? formatTime(attendance.clockOutTime)
                        : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900">
                      {formatDuration(attendance.workDurationMinutes)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          attendance.status === 'ON_TIME'
                            ? 'bg-green-100 text-green-700'
                            : attendance.status === 'LATE'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {attendance.status === 'ON_TIME'
                          ? 'On Time'
                          : attendance.status === 'LATE'
                          ? 'Late'
                          : attendance.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {attendance.clockInMethod}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
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
                    className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
                      currentPage === pageNum
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