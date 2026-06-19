'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/providers/auth-provider';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-indigo-600">Nutricount</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.avatarUrl || ''}
                    alt={user?.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-4 text-gray-600">
              Welcome back, {user?.name}! You are successfully logged in via Google.
            </p>
            
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-medium text-gray-900">Profile Info</h3>
                <dl className="mt-4 space-y-2">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase">Email</dt>
                    <dd className="text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase">User ID</dt>
                    <dd className="text-sm text-gray-900 font-mono">{user?.id}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
