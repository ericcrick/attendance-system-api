'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', href: '/dashboard/employees', icon: Users },
  { name: 'Departments', href: '/dashboard/departments', icon: Building2 }, // Add this
  { name: 'Leaves', href: '/dashboard/leaves', icon: Calendar }, // Add this
  { name: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { name: 'Shifts', href: '/dashboard/shifts', icon: Calendar },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-base text-slate-900">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-slate-200 p-3">
            <div className="flex items-center space-x-2.5 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-56">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-14 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 lg:ml-0 ml-3">
            <h1 className="text-base font-semibold text-slate-900">
              {navigation.find((item) => item.href === pathname)?.name ||
                'Dashboard'}
            </h1>
          </div>
          <div className="text-xs text-slate-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}