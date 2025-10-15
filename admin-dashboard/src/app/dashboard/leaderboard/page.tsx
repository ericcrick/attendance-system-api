// src/app/dashboard/leaderboard/page.tsx
'use client';

import { JSX, useEffect, useState } from 'react';
import {
    Trophy,
    Medal,
    TrendingUp,
    TrendingDown,
    Calendar,
    Users,
    Target,
    Award,
    Clock,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    XCircle,
    ChevronDown,
} from 'lucide-react';
import { attendanceApi } from '@/lib/api-client';
import {
    LeaderboardData,
    EmployeePerformance,
    TimePeriod,
    CustomPeriod,
    LeaderboardStatistics,
} from '@/types/leaderboard';

// Toast component
const Toast = ({
    message,
    type,
    onClose,
}: {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}) => (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-5 duration-300">
        <div
            className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-600 text-white' : 'bg-rose-600 text-white'
                }`}
        >
            {type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
            ) : (
                <XCircle className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
                <XCircle className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
);

export default function LeaderboardPage() {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<TimePeriod>(TimePeriod.MONTHLY);
    const [customPeriod, setCustomPeriod] = useState<CustomPeriod>(CustomPeriod.LAST_30_DAYS);
    const [showCustom, setShowCustom] = useState<boolean>(false);
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
        null
    );

    useEffect(() => {
        fetchLeaderboard();
    }, [period, customPeriod]);

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

    const getCustomDates = (): { startDate: string; endDate: string } | null => {
        const now = new Date();
        const endDate = new Date(now);
        let startDate = new Date(now);

        switch (customPeriod) {
            case CustomPeriod.LAST_7_DAYS:
                startDate.setDate(now.getDate() - 7);
                break;
            case CustomPeriod.LAST_14_DAYS:
                startDate.setDate(now.getDate() - 14);
                break;
            case CustomPeriod.LAST_30_DAYS:
                startDate.setDate(now.getDate() - 30);
                break;
            case CustomPeriod.LAST_60_DAYS:
                startDate.setDate(now.getDate() - 60);
                break;
            case CustomPeriod.LAST_90_DAYS:
                startDate.setDate(now.getDate() - 90);
                break;
            case CustomPeriod.CUSTOM_RANGE:
                if (!customStartDate || !customEndDate) {
                    return null;
                }
                return {
                    startDate: customStartDate,
                    endDate: customEndDate,
                };
            default:
                startDate.setDate(now.getDate() - 30);
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        };
    };

    const fetchLeaderboard = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            let queryParams = `period=${period}`;

            if (period === TimePeriod.CUSTOM) {
                const dates = getCustomDates();
                if (!dates) {
                    showToast('Please select both start and end dates', 'error');
                    setLoading(false);
                    return;
                }
                queryParams += `&startDate=${dates.startDate}&endDate=${dates.endDate}`;
            }

            const result = (await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/attendance/leaderboard?${queryParams}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            ).then(res => res.json())) as LeaderboardData;

            setData(result);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch leaderboard data';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 60) return 'text-orange-600';
        return 'text-rose-600';
    };

    const getScoreBgColor = (score: number): string => {
        if (score >= 90)
            return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
        if (score >= 80) return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200';
        if (score >= 70)
            return 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200';
        if (score >= 60)
            return 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200';
        return 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200';
    };

    const getRankIcon = (rank: number): JSX.Element => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
        return <span className="text-sm font-bold text-slate-600">#{rank}</span>;
    };

    const formatPeriod = (period: TimePeriod): string => {
        switch (period) {
            case TimePeriod.WEEKLY:
                return 'Last 7 Days';
            case TimePeriod.MONTHLY:
                return 'Last 30 Days';
            case TimePeriod.YEARLY:
                return 'Last 365 Days';
            case TimePeriod.CUSTOM:
                return 'Custom Period';
            default:
                return period;
        }
    };

    const formatCustomPeriod = (period: CustomPeriod): string => {
        switch (period) {
            case CustomPeriod.LAST_7_DAYS:
                return 'Last 7 Days';
            case CustomPeriod.LAST_14_DAYS:
                return 'Last 14 Days';
            case CustomPeriod.LAST_30_DAYS:
                return 'Last 30 Days';
            case CustomPeriod.LAST_60_DAYS:
                return 'Last 2 Months';
            case CustomPeriod.LAST_90_DAYS:
                return 'Last 3 Months';
            case CustomPeriod.CUSTOM_RANGE:
                return 'Custom Range';
            default:
                return period;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-xs text-slate-600">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="space-y-4">
                {toast && (
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                )}
                <div className="text-center py-12">
                    <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                    <p className="text-slate-900 font-semibold text-sm mb-1">Failed to load leaderboard</p>
                    <p className="text-slate-600 text-xs mb-3">{error || 'Unknown error occurred'}</p>
                    <button
                        onClick={fetchLeaderboard}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Try Again</span>
                    </button>
                </div>
            </div>
        );
    }

    const statistics: LeaderboardStatistics = data.statistics || {
        averageAttendanceRate: 0,
        averageOnTimeRate: 0,
        averageCompletionRate: 0,
        totalEmployees: 0,
        excellentPerformers: 0,
        goodPerformers: 0,
        poorPerformers: 0,
    };

    return (
        <div className="space-y-4">
            {/* Toast */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                        <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Performance Leaderboard</h2>
                        <p className="text-xs text-slate-600">Track and celebrate top performers</p>
                    </div>
                </div>

                <button
                    onClick={fetchLeaderboard}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    title="Refresh"
                >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-xs font-medium text-slate-700">Refresh</span>
                </button>
            </div>

            {/* Period Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <h3 className="text-xs font-semibold text-slate-900">Time Period</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                    {[TimePeriod.WEEKLY, TimePeriod.MONTHLY, TimePeriod.YEARLY, TimePeriod.CUSTOM].map((p) => (
                        <button
                            key={p}
                            onClick={() => {
                                setPeriod(p);
                                if (p === TimePeriod.CUSTOM) {
                                    setShowCustom(true);
                                } else {
                                    setShowCustom(false);
                                }
                            }}
                            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${period === p
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {formatPeriod(p)}
                        </button>
                    ))}
                </div>

                {/* Custom Period Options */}
                {period === TimePeriod.CUSTOM && showCustom && (
                    <div className="border-t border-slate-200 pt-3 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                CustomPeriod.LAST_7_DAYS,
                                CustomPeriod.LAST_14_DAYS,
                                CustomPeriod.LAST_30_DAYS,
                                CustomPeriod.LAST_60_DAYS,
                                CustomPeriod.LAST_90_DAYS,
                                CustomPeriod.CUSTOM_RANGE,
                            ].map((cp) => (
                                <button
                                    key={cp}
                                    onClick={() => setCustomPeriod(cp)}
                                    className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all ${customPeriod === cp
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {formatCustomPeriod(cp)}
                                </button>
                            ))}
                        </div>

                        {customPeriod === CustomPeriod.CUSTOM_RANGE && (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={fetchLeaderboard}
                            className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply Custom Period
                        </button>
                    </div>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
                    <div className="flex items-center justify-between mb-1.5">
                        <Users className="w-6 h-6 opacity-80" />
                        <span className="text-2xl font-bold">{statistics.totalEmployees}</span>
                    </div>
                    <p className="text-xs opacity-90">Total Employees</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md p-4 text-white">
                    <div className="flex items-center justify-between mb-1.5">
                        <Award className="w-6 h-6 opacity-80" />
                        <span className="text-2xl font-bold">{statistics.excellentPerformers}</span>
                    </div>
                    <p className="text-xs opacity-90">Excellent (90%+)</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-md p-4 text-white">
                    <div className="flex items-center justify-between mb-1.5">
                        <Target className="w-6 h-6 opacity-80" />
                        <span className="text-2xl font-bold">{statistics.goodPerformers}</span>
                    </div>
                    <p className="text-xs opacity-90">Good (70-89%)</p>
                </div>

                <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg shadow-md p-4 text-white">
                    <div className="flex items-center justify-between mb-1.5">
                        <AlertTriangle className="w-6 h-6 opacity-80" />
                        <span className="text-2xl font-bold">{statistics.poorPerformers}</span>
                    </div>
                    <p className="text-xs opacity-90">Needs Improvement</p>
                </div>
            </div>

            {/* Average Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Avg Attendance</p>
                            <p className="text-lg font-bold text-slate-900">
                                {statistics.averageAttendanceRate.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                            <Clock className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Avg On-Time</p>
                            <p className="text-lg font-bold text-slate-900">
                                {statistics.averageOnTimeRate.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                            <Target className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Avg Completion</p>
                            <p className="text-lg font-bold text-slate-900">
                                {statistics.averageCompletionRate.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="border-b border-slate-200">
                    <div className="flex space-x-1 p-2">
                        <button
                            onClick={() => setActiveTab('top')}
                            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'top'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            <div className="flex items-center justify-center space-x-1.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Top Performers ({data.topPerformers.length})</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('bottom')}
                            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'bottom'
                                    ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            <div className="flex items-center justify-center space-x-1.5">
                                <TrendingDown className="w-3.5 h-3.5" />
                                <span>Needs Improvement ({data.bottomPerformers.length})</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {activeTab === 'top' && (
                        <>
                            {data.topPerformers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {data.topPerformers.map((performer: EmployeePerformance) => (
                                        <PerformerCard
                                            key={performer.employeeId}
                                            performer={performer}
                                            getScoreBgColor={getScoreBgColor}
                                            getRankIcon={getRankIcon}
                                            getScoreColor={getScoreColor}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No top performers data available for this period" />
                            )}
                        </>
                    )}

                    {activeTab === 'bottom' && (
                        <>
                            {data.bottomPerformers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {data.bottomPerformers.map((performer: EmployeePerformance) => (
                                        <BottomPerformerCard
                                            key={performer.employeeId}
                                            performer={performer}
                                            getScoreBgColor={getScoreBgColor}
                                            getScoreColor={getScoreColor}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No performance improvement data available for this period" />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Performer Card Component
const PerformerCard = ({
  performer,
  getScoreBgColor,
  getRankIcon,
  getScoreColor,
}: {
  performer: EmployeePerformance;
  getScoreBgColor: (score: number) => string;
  getRankIcon: (rank: number) => JSX.Element;
  getScoreColor: (score: number) => string;
}) => (
  <div
    className={`rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-300 p-4 ${getScoreBgColor(
      performer.score
    )}`}
  >
    {/* Header with avatar and rank */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">
          {performer.photoUrl ? (
            <img
              src={performer.photoUrl}
              alt={performer.employeeName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
              {performer.employeeName.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {performer.employeeName}
          </h3>
          <p className="text-xs text-slate-600 truncate">{performer.position}</p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-2">{getRankIcon(performer.rank)}</div>
    </div>

    {/* Score section */}
    <div className="mb-3">
      <div className="flex items-end justify-between mb-1">
        <span className="text-xs text-slate-600">Performance Score</span>
        <span className={`text-xl font-bold ${getScoreColor(performer.score)}`}>
          {performer.score}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            performer.score >= 90
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : performer.score >= 80
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
              : performer.score >= 70
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
              : 'bg-gradient-to-r from-orange-500 to-rose-500'
          }`}
          style={{ width: `${performer.score}%` }}
        ></div>
      </div>
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
        <p className="text-xs text-slate-600 mb-0.5">Attendance</p>
        <p className="text-xs font-bold text-slate-900">{performer.attendanceRate}%</p>
      </div>
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
        <p className="text-xs text-slate-600 mb-0.5">On Time</p>
        <p className="text-xs font-bold text-slate-900">{performer.onTimeRate}%</p>
      </div>
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
        <p className="text-xs text-slate-600 mb-0.5">Completed</p>
        <p className="text-xs font-bold text-slate-900">
          {performer.completedShifts}/{performer.attendedDays}
        </p>
      </div>
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
        <p className="text-xs text-slate-600 mb-0.5">Overtime</p>
        <p className="text-xs font-bold text-slate-900">{performer.overtimeHours}h</p>
      </div>
    </div>

    {/* Footer with department and days - Fixed layout */}
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/60 backdrop-blur-sm text-slate-700 truncate">
        {performer.department}
      </span>
      <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0">
        {performer.attendedDays}/{performer.totalDays} days
      </span>
    </div>
  </div>
);

//BottomPerformerCard component
const BottomPerformerCard = ({
  performer,
  getScoreBgColor,
  getScoreColor,
}: {
  performer: EmployeePerformance;
  getScoreBgColor: (score: number) => string;
  getScoreColor: (score: number) => string;
}) => (
  <div
    className={`rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-300 p-4 ${getScoreBgColor(
      performer.score
    )}`}
  >
    {/* Header with avatar and rank */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">
          {performer.photoUrl ? (
            <img
              src={performer.photoUrl}
              alt={performer.employeeName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
              {performer.employeeName.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {performer.employeeName}
          </h3>
          <p className="text-xs text-slate-600 truncate">{performer.position}</p>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-600 flex-shrink-0 ml-2">
        #{performer.rank}
      </span>
    </div>

    {/* Score section */}
    <div className="mb-3">
      <div className="flex items-end justify-between mb-1">
        <span className="text-xs text-slate-600">Performance Score</span>
        <span className={`text-xl font-bold ${getScoreColor(performer.score)}`}>
          {performer.score}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500"
          style={{ width: `${performer.score}%` }}
        ></div>
      </div>
    </div>

    {/* Issues section */}
    <div className="space-y-1.5 mb-3">
      {performer.attendanceRate < 80 && (
        <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 rounded-lg p-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="flex-1">Low attendance: {performer.attendanceRate}%</span>
        </div>
      )}
      {performer.lateDays > performer.onTimeDays && (
        <div className="flex items-start space-x-1.5 text-xs text-orange-700 bg-orange-50 rounded-lg p-1.5">
          <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="flex-1">Frequent late arrivals: {performer.lateDays} days</span>
        </div>
      )}
      {performer.absentDays > 3 && (
        <div className="flex items-start space-x-1.5 text-xs text-red-700 bg-red-50 rounded-lg p-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="flex-1">High absences: {performer.absentDays} days</span>
        </div>
      )}
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
        <p className="text-xs text-slate-600 mb-0.5">Attendance</p>
        <p className="text-xs font-bold text-slate-900">{performer.attendanceRate}%</p>
      </div>
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
        <p className="text-xs text-slate-600 mb-0.5">On Time</p>
        <p className="text-xs font-bold text-slate-900">{performer.onTimeRate}%</p>
      </div>
    </div>

    {/* Footer with department and days - Fixed layout */}
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/60 backdrop-blur-sm text-slate-700 truncate">
        {performer.department}
      </span>
      <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0">
        {performer.attendedDays}/{performer.totalDays} days
      </span>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500 text-xs">{message}</p>
    </div>
);