'use client';

import { useState } from 'react';
import { User, Lock, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api-client';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h3>
            <p className="text-sm text-gray-600">
              Your account details
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={user?.firstName || ''}
                disabled
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={user?.lastName || ''}
                disabled
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user?.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Lock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Change Password
            </h3>
            <p className="text-sm text-gray-600">
              Update your password to keep your account secure
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordInputChange}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordInputChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Change Password</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Information
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Version:</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Last Login:</span>
            <span className="font-medium text-gray-900">
              {user?.lastLogin
                ? new Date(user.lastLogin).toLocaleString()
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Account Created:</span>
            <span className="font-medium text-gray-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">API Status:</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}