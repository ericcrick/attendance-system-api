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
} from 'lucide-react';
import { attendanceApi } from '@/lib/api-client';
import { Attendance } from '@/types';

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'today' | 'range'>('today');
  const [statistics, setStatistics] = useState({
    total: 0,
    onTime: 0,
    late: 0,
    onTimePercentage: 0,
  });

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  useEffect(() => {
    calculateStatistics();
  }, [filteredAttendances]);

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
      const data: any = await attendanceApi.getReport(startDate, endDate);
      setAttendances(data.attendances);
      setFilteredAttendances(data.attendances);
      setViewMode('range');
    } catch (error) {
      console.error('Failed to fetch attendance report:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Reports</h2>
          <p className="text-gray-600 mt-1">
            View and export attendance records
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchDateRangeAttendance}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filter
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchTodayAttendance}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Today</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Records</h3>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{statistics.total}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">On Time</h3>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{statistics.onTime}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Late</h3>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{statistics.late}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">On-Time Rate</h3>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {statistics.onTimePercentage}%
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === 'today' ? "Today's Attendance" : 'Attendance Records'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAttendances.length} records found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendances.length > 0 ? (
                filteredAttendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {attendance.employee.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {attendance.employee.employeeId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatTime(attendance.clockInTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(attendance.clockInTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.clockOutTime
                        ? formatTime(attendance.clockOutTime)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(attendance.workDurationMinutes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          attendance.status === 'ON_TIME'
                            ? 'bg-green-100 text-green-800'
                            : attendance.status === 'LATE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {attendance.status === 'ON_TIME'
                          ? 'On Time'
                          : attendance.status === 'LATE'
                          ? 'Late'
                          : attendance.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {attendance.clockInMethod}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}