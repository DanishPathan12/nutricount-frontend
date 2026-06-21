'use client';

import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Zap, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticated, isLoading, profile, sendOtp, verifyOtp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (profile) {
        router.push('/dashboard');
      } else {
        router.push('/profile/setup');
      }
    }
  }, [isLoading, isAuthenticated, profile, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await sendOtp(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || code.length !== 6) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await verifyOtp(email, code);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <p className="text-xs text-[#e9f9fc]/80 font-medium">Secure OTP Login & Private Storage</p>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="space-y-6">
          {step === 'email' ? (
            <>
              {/* Google Login Action */}
              <div>
                <label className="block text-center text-xs font-semibold uppercase tracking-wider text-[#ade8f4]/45 mb-3">
                  Sign In with Google
                </label>
                <div className="rounded-xl border border-[#02306d]/30 bg-[#010113]/50 p-4 hover:border-[#00b4d8]/20 transition-colors duration-200">
                  <GoogleLoginButton />
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#02306d]/30"></div>
                <span className="flex-shrink mx-4 text-[#ade8f4]/40 text-xs font-medium uppercase">or</span>
                <div className="flex-grow border-t border-[#02306d]/30"></div>
              </div>

              {/* Email OTP Request */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#ade8f4]/45">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#02306d]/40 bg-[#010113]/50 pl-10 pr-4 py-3 text-sm text-white placeholder-[#ade8f4]/30 outline-none transition-all duration-200 focus:border-[#00b4d8]/60 focus:ring-1 focus:ring-[#00b4d8]/60"
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#ade8f4]/40" />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-medium text-rose-500 bg-rose-500/10 rounded-lg p-2 border border-rose-500/20">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] py-3 text-sm font-semibold text-white shadow-lg shadow-[#00b4d8]/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* OTP Verification Step */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="code" className="block text-xs font-semibold uppercase tracking-wider text-[#ade8f4]/45">
                    Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setError(null);
                      setCode('');
                    }}
                    className="flex items-center gap-1 text-xs text-[#00b4d8] hover:underline"
                  >
                    <ArrowLeft className="h-3 w-3" /> Edit Email
                  </button>
                </div>
                
                <p className="text-xs text-[#ade8f4]/60">
                  We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
                </p>

                <input
                  id="code"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-xl border border-[#02306d]/40 bg-[#010113]/50 px-4 py-3 text-center text-xl font-mono tracking-[0.5em] text-white placeholder-[#ade8f4]/30 outline-none transition-all duration-200 focus:border-[#00b4d8]/60 focus:ring-1 focus:ring-[#00b4d8]/60"
                />
              </div>

              {error && (
                <p className="text-xs font-medium text-rose-500 bg-rose-500/10 rounded-lg p-2 border border-rose-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || code.length !== 6}
                className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] py-3 text-sm font-semibold text-white shadow-lg shadow-[#00b4d8]/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Verify & Sign In'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] leading-relaxed text-[#ade8f4]/40">
          By signing in, you agree to our <span className="hover:text-[#00b4d8] cursor-pointer underline">Terms of Service</span> and <span className="hover:text-[#00b4d8] cursor-pointer underline">Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
}
