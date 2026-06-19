'use client';

import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (profile) {
        router.push('/dashboard');
      } else {
        router.push('/profile/setup');
      }
    }
  }, [isLoading, isAuthenticated, profile, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#010113] p-4 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-[#03045e]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-[#0077b6]/15 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-[#02306d]/40 bg-[#010226]/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#00b4d8]/40">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#03045e] p-2 shadow-lg shadow-[#00b4d8]/10">
            <Activity className="h-8 w-8 text-[#caf0f8]" />
          </div>
          
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Nutri<span className="bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] bg-clip-text text-transparent">count</span>
          </h1>
          <p className="mt-2 text-sm text-[#ade8f4]/60">
            Elevate your wellness with precise nutrition analytics.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-3 rounded-lg bg-[#020338]/60 p-4 border border-[#02306d]/20">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#0077b6]/20 p-1.5 text-[#00b4d8]">
              <Zap className="h-4 w-4" />
            </div>
            <p className="text-xs text-[#e9f9fc]/80 font-medium">Smart AI Calorie & Goal Tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#0077b6]/20 p-1.5 text-[#00b4d8]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <p className="text-xs text-[#e9f9fc]/80 font-medium">Secure Google OAuth & Private Storage</p>
          </div>
        </div>

        {/* Google Login Action */}
        <div className="mt-6">
          <label className="block text-center text-xs font-semibold uppercase tracking-wider text-[#ade8f4]/45 mb-4">
            Sign In with Google
          </label>
          <div className="rounded-xl border border-[#02306d]/30 bg-[#010113]/50 p-4 hover:border-[#00b4d8]/20 transition-colors duration-200">
            <GoogleLoginButton />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] leading-relaxed text-[#ade8f4]/40">
          By signing in, you agree to our <span className="hover:text-[#00b4d8] cursor-pointer underline">Terms of Service</span> and <span className="hover:text-[#00b4d8] cursor-pointer underline">Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
}
