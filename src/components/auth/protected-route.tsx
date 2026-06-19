'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, profile, profileLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !profileLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!profile && pathname !== '/profile/setup') {
        router.push('/profile/setup');
      } else if (profile && pathname === '/profile/setup') {
        router.push('/dashboard');
      }
    }
  }, [isLoading, profileLoading, isAuthenticated, profile, pathname, router]);

  if (isLoading || profileLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#010113] text-[#e9f9fc]">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-french_blue-500 border-t-[#00b4d8]" />
          <div className="absolute h-10 w-10 animate-ping rounded-full bg-[#0077b6]/20" />
        </div>
        <p className="mt-6 text-sm font-medium tracking-wide text-[#ade8f4]">Loading your session...</p>
      </div>
    );
  }

  // Prevent flash of page content if state is unaligned with route permissions
  if (!isAuthenticated) return null;
  if (!profile && pathname !== '/profile/setup') return null;
  if (profile && pathname === '/profile/setup') return null;

  return <>{children}</>;
};
