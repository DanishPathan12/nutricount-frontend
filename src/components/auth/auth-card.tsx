'use client';

import { useState, useEffect } from 'react';
import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { OtpAuthForm } from '@/components/auth/otp-auth-form';
import { useAuth } from '@/providers/auth-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity } from 'lucide-react';

interface AuthCardProps {
  initialMode?: 'signin' | 'signup';
}

export function AuthCard({ initialMode = 'signin' }: AuthCardProps) {
  const searchParams = useSearchParams();
  const queryMode = searchParams.get('mode') === 'signup' ? 'signup' : initialMode;
  const [mode, setMode] = useState<'signin' | 'signup'>(queryMode);
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

      <div className="relative w-full max-w-md space-y-6 rounded-2xl border border-[#02306d]/40 bg-[#010226]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#00b4d8]/40">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#03045e] p-2 shadow-lg shadow-[#00b4d8]/10">
            <Activity className="h-6 w-6 text-[#caf0f8]" />
          </div>
          
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Nutri<span className="bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] bg-clip-text text-transparent">count</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#ade8f4]/60">
            Elevate your wellness with precise nutrition analytics.
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex rounded-xl bg-[#010113]/80 p-1 border border-[#02306d]/40">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${
              mode === 'signin'
                ? 'bg-[#0077b6]/30 text-white shadow-sm border border-[#00b4d8]/40'
                : 'text-[#ade8f4]/50 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${
              mode === 'signup'
                ? 'bg-[#0077b6]/30 text-white shadow-sm border border-[#00b4d8]/40'
                : 'text-[#ade8f4]/50 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google OAuth Option */}
        <div className="space-y-2">
          <label className="block text-center text-[11px] font-semibold uppercase tracking-wider text-[#ade8f4]/45">
            {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
          </label>
          <div className="rounded-xl border border-[#02306d]/30 bg-[#010113]/50 p-3 hover:border-[#00b4d8]/20 transition-colors duration-200">
            <GoogleLoginButton />
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#02306d]/40" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#010226] px-3 font-medium tracking-wider text-[#ade8f4]/50">
              Or continue with OTP
            </span>
          </div>
        </div>

        {/* Email OTP Auth Form */}
        <OtpAuthForm mode={mode} onModeChange={setMode} />

        {/* Bottom Switcher */}
        <div className="text-center pt-2 border-t border-[#02306d]/30">
          {mode === 'signin' ? (
            <p className="text-xs text-[#ade8f4]/60">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-semibold text-[#00b4d8] hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#ade8f4]/60">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-semibold text-[#00b4d8] hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="text-center text-[10px] leading-relaxed text-[#ade8f4]/40">
          By signing in, you agree to our{' '}
          <span className="hover:text-[#00b4d8] cursor-pointer underline">Terms of Service</span> and{' '}
          <span className="hover:text-[#00b4d8] cursor-pointer underline">Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
}
