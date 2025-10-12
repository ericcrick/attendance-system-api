'use client';

import { useEffect, useState } from 'react';
import { Users, Clock, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import { employeesApi, attendanceApi, shiftsApi } from '@/lib/api-client';
import { Employee, Attendance } from '@/types';
import Link from 'next/link';

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-slate-600">Loading dashboard...</p>
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
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Currently Present',
      value: stats.currentlyPresent,
      subtitle: 'Clocked in today',
      icon: UserCheck,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'On Time Today',
      value: stats.todayOnTime,
      subtitle: `${stats.todayLate} late arrivals`,
      icon: Clock,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Total Shifts',
      value: stats.totalShifts,
      subtitle: 'Active schedules',
      icon: Calendar,
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-700',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded shadow-sm p-6 text-white">
        <h2 className="text-xl font-semibold mb-1">Welcome to Dashboard</h2>
        <p className="text-sm text-blue-100">
          Here's an overview of your attendance system today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded shadow-sm border border-slate-200 p-4 hover:shadow transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.bgColor} p-2 rounded`}>
                  <Icon className={`w-4 h-4 ${stat.textColor}`} />
                </div>
              </div>
              <h3 className="text-slate-600 text-xs font-medium mb-1">
                {stat.title}
              </h3>
              <div className="flex items-baseline space-x-1.5">
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Attendance */}
        <div className="bg-white rounded shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Recent Attendance</span>
            </h3>
          </div>
          <div className="p-4">
            {recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((attendance) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {attendance.employee.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {attendance.employee.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-900">
                        {formatTime(attendance.clockInTime)}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${attendance.status === 'ON_TIME'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-rose-100 text-rose-700'
                          }`}
                      >
                        {attendance.status === 'ON_TIME' ? 'On Time' : 'Late'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No attendance records today</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Today's Summary</span>
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {/* Attendance Rate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-600">
                    Attendance Rate
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {stats.activeEmployees > 0
                      ? Math.round(
                        (stats.currentlyPresent / stats.activeEmployees) * 100
                      )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${stats.activeEmployees > 0
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
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-600">
                    On-Time Rate
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
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
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-green-600 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${stats.todayOnTime + stats.todayLate > 0
                        ? (stats.todayOnTime /
                          (stats.todayOnTime + stats.todayLate)) *
                        100
                        : 0
                        }%`,
                    }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-medium text-slate-900 mb-2">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/dashboard/employees"
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 transition-colors text-center"
                  >
                    View Employees
                  </Link>

                  <Link
                    href="/dashboard/attendance"
                    className="px-3 py-2 bg-green-50 text-green-600 rounded text-xs font-medium hover:bg-green-100 transition-colors text-center"
                  >
                    View Reports
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}