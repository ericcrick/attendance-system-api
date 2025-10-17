//admin-dashboard/src/app/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded mb-3">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">
            Attendance System
          </h1>
          <p className="text-sm text-slate-600">
            Admin Dashboard Login
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-rose-900">Login Failed</p>
                  <p className="text-xs text-rose-700">{error}</p>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Default Credentials Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs font-medium text-blue-900 mb-1.5">
              Default Credentials:
            </p>
            <div className="text-xs text-blue-700 space-y-0.5">
              <p><strong>Username:</strong> admin</p>
              <p><strong>Password:</strong> Admin@123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-4">
          © 2025 Attendance System. All rights reserved.
        </p>
      </div>
    </div>
  );
}