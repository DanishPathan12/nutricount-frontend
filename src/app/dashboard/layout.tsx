'use client';

import { useAuth } from '@/providers/auth-provider';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Activity, LogOut, LayoutDashboard, ShieldAlert, MessageSquare, Apple } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const profile = useAppSelector((state) => state.user.profile);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#010113] text-[#e9f9fc]">
        {/* Navigation */}
        <nav className="border-b border-[#02306d]/40 bg-[#010226]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#00b4d8] to-[#03045e] p-1.5 shadow-md shadow-[#00b4d8]/10">
                  <Activity className="h-5 w-5 text-white animate-pulse" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Nutri<span className="text-[#00b4d8]">count</span>
                </span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition duration-150 border ${pathname === '/dashboard'
                    ? 'text-white bg-[#02306d]/40 border-[#00b4d8]/30 shadow-md shadow-[#00b4d8]/5'
                    : 'text-[#ade8f4]/60 border-transparent hover:text-white hover:bg-[#02306d]/20'
                    }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/chat"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition duration-150 border ${pathname === '/dashboard/chat'
                    ? 'text-white bg-[#02306d]/40 border-[#00b4d8]/30 shadow-md shadow-[#00b4d8]/5'
                    : 'text-[#ade8f4]/60 border-transparent hover:text-white hover:bg-[#02306d]/20'
                    }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Fitness Chat
                </Link>
                <Link
                  href="/dashboard/calorie-estimator"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition duration-150 border ${pathname === '/dashboard/calorie-estimator'
                    ? 'text-white bg-[#02306d]/40 border-[#00b4d8]/30 shadow-md shadow-[#00b4d8]/5'
                    : 'text-[#ade8f4]/60 border-transparent hover:text-white hover:bg-[#02306d]/20'
                    }`}
                >
                  <Apple className="h-3.5 w-3.5" />
                  Calorie Estimator
                </Link>
                {profile?.role === "admin" && <Link
                  href="/dashboard/admin"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition duration-150 border ${pathname === '/dashboard/admin'
                    ? 'text-white bg-[#02306d]/40 border-[#00b4d8]/30 shadow-md shadow-[#00b4d8]/5'
                    : 'text-[#ade8f4]/60 border-transparent hover:text-white hover:bg-[#02306d]/20'
                    }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Admin Panel
                </Link>}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-8 w-8 rounded-full border border-[#00b4d8]/40 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#00b4d8]/40 bg-[#02306d]/40 shadow-sm">
                      <span className="text-xs font-bold text-white uppercase">
                        {user?.name ? user.name.charAt(0) : 'U'}
                      </span>
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white">{user?.name}</p>
                    <p className="text-[10px] text-[#ade8f4]/60">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-xl border border-[#02306d]/40 bg-[#010113] px-3.5 py-1.5 text-xs font-bold text-[#ade8f4]/80 hover:text-white hover:border-[#00b4d8]/50 transition duration-150"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile navigation links */}
          <div className="md:hidden flex justify-around border-t border-[#02306d]/20 py-2 bg-[#010226]/50">
            <Link
              href="/dashboard"
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg transition ${pathname === '/dashboard'
                ? 'text-white bg-[#02306d]/40'
                : 'text-[#ade8f4]/60'
                }`}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/chat"
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg transition ${pathname === '/dashboard/chat'
                ? 'text-white bg-[#02306d]/40'
                : 'text-[#ade8f4]/60'
                }`}
            >
              Fitness Chat
            </Link>
            <Link
              href="/dashboard/calorie-estimator"
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg transition ${pathname === '/dashboard/calorie-estimator'
                ? 'text-white bg-[#02306d]/40'
                : 'text-[#ade8f4]/60'
                }`}
            >
              Calorie Estimator
            </Link>
            {<Link
              href="/dashboard/admin"
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg transition ${pathname === '/dashboard/admin'
                ? 'text-white bg-[#02306d]/40'
                : 'text-[#ade8f4]/60'
                }`}
            >
              Admin Panel
            </Link>}
          </div>
        </nav>

        {children}
      </div>
    </ProtectedRoute>
  );
}
