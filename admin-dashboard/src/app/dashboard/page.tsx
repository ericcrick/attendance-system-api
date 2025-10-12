'use client';

import { useEffect, useState } from 'react';
import { Users, Clock, UserCheck, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { employeesApi, attendanceApi, shiftsApi } from '@/lib/api-client';
import { Employee, Attendance } from '@/types';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  currentlyPresent: number;
  todayOnTime: number;
  todayLate: number;
  totalShifts: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    currentlyPresent: 0,
    todayOnTime: 0,
    todayLate: 0,
    totalShifts: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesData, employeeStats, currentlyPresent, todayAttendance, shifts]: any = await Promise.all([
        employeesApi.getAll(),
        employeesApi.getStatistics(),
        attendanceApi.getCurrentlyPresent(),
        attendanceApi.getToday(),
        shiftsApi.getAll(),
      ]);

      const onTime = todayAttendance.filter((a: Attendance) => a.status === 'ON_TIME').length;
      const late = todayAttendance.filter((a: Attendance) => a.status === 'LATE').length;

      setStats({
        totalEmployees: employeesData.length,
        activeEmployees: employeeStats.byStatus.active,
        currentlyPresent: currentlyPresent.length,
        todayOnTime: onTime,
        todayLate: late,
        totalShifts: shifts.length,
      });

      setRecentAttendance(todayAttendance.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      subtitle: `${stats.activeEmployees} active`,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Currently Present',
      value: stats.currentlyPresent,
      subtitle: 'Clocked in today',
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'On Time Today',
      value: stats.todayOnTime,
      subtitle: `${stats.todayLate} late arrivals`,
      icon: Clock,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Total Shifts',
      value: stats.totalShifts,
      subtitle: 'Active schedules',
      icon: Calendar,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to Dashboard</h2>
        <p className="text-blue-100">
          Here's an overview of your attendance system today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Recent Attendance</span>
            </h3>
          </div>
          <div className="p-6">
            {recentAttendance.length > 0 ? (
              <div className="space-y-4">
                {recentAttendance.map((attendance) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {attendance.employee.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {attendance.employee.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatTime(attendance.clockInTime)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          attendance.status === 'ON_TIME'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {attendance.status === 'ON_TIME' ? 'On Time' : 'Late'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No attendance records today</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Today's Summary</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Attendance Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Attendance Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.activeEmployees > 0
                      ? Math.round(
                          (stats.currentlyPresent / stats.activeEmployees) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        stats.activeEmployees > 0
                          ? (stats.currentlyPresent / stats.activeEmployees) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* On-Time Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    On-Time Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.todayOnTime + stats.todayLate > 0
                      ? Math.round(
                          (stats.todayOnTime /
                            (stats.todayOnTime + stats.todayLate)) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        stats.todayOnTime + stats.todayLate > 0
                          ? (stats.todayOnTime /
                              (stats.todayOnTime + stats.todayLate)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Department Breakdown - Placeholder */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/dashboard/employees"
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors text-center"
                  >
                    View Employees
                  </a>
                  <a
                    href="/dashboard/attendance"
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors text-center"
                  >
                    View Reports
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}