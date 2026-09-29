'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Mail, User, KeyRound, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface OtpAuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange?: (mode: 'signin' | 'signup') => void;
}

export const OtpAuthForm: React.FC<OtpAuthFormProps> = ({ mode, onModeChange }) => {
  const { sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset form when mode switches
  useEffect(() => {
    setStep('input');
    setError(null);
    setSuccessMessage(null);
    setOtp(['', '', '', '', '', '']);
  }, [mode]);

  // Handle resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Focus first OTP input when step changes to 'otp'
  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setIsLoading(true);
    try {
      const purpose = mode === 'signin' ? 'login' : 'signup';
      const res = await sendOtp(trimmedEmail, purpose);
      setSuccessMessage(res.message || 'Verification code sent to your email.');
      setStep('otp');
      setResendCooldown(60); // 60s cooldown
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to send verification code.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const purpose = mode === 'signin' ? 'login' : 'signup';
      const res = await sendOtp(email.trim().toLowerCase(), purpose);
      setSuccessMessage(res.message || 'New verification code sent!');
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to resend code.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handles pasting or multiple chars
      handlePasteValue(value);
      return;
    }

    // Only allow single digit
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    // Auto-advance
    if (cleaned && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if last digit filled
    if (cleaned && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteValue = (pasted: string) => {
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = digits[i] || '';
    }
    setOtp(newOtp);

    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (digits.length === 6) {
      handleVerifyOtp(digits);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), code, mode === 'signup' ? name.trim() : undefined);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Invalid or expired verification code.';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-200 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span className="flex-1 leading-relaxed">{error}</span>
        </div>
      )}

      {successMessage && !error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-200 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <span className="flex-1 leading-relaxed">{successMessage}</span>
        </div>
      )}

      {step === 'input' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#ade8f4]/80">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-[#00b4d8]" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-[#02306d]/60 bg-[#010113]/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#ade8f4]/30 outline-none transition-all duration-200 focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#ade8f4]/80">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-[#00b4d8]" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#02306d]/60 bg-[#010113]/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#ade8f4]/30 outline-none transition-all duration-200 focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-[#00b4d8]/15 transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#0077b6]/20 text-[#00b4d8] mb-2">
              <KeyRound className="h-5 w-5" />
            </div>
            <p className="text-xs text-[#ade8f4]/70">
              We sent a 6-digit verification code to
            </p>
            <p className="text-xs font-semibold text-white mt-0.5">{email}</p>
            <button
              type="button"
              onClick={() => setStep('input')}
              className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#00b4d8] hover:underline"
            >
              <ArrowLeft className="h-3 w-3" /> Edit email
            </button>
          </div>

          {/* 6 Digit Inputs */}
          <div className="flex justify-center gap-2 sm:gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => {
                  e.preventDefault();
                  handlePasteValue(e.clipboardData.getData('text'));
                }}
                className="h-12 w-11 rounded-xl border border-[#02306d]/80 bg-[#010113]/80 text-center text-lg font-bold text-white outline-none transition-all duration-150 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/40 sm:h-12 sm:w-12"
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => handleVerifyOtp()}
            disabled={isLoading || otp.join('').length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-[#00b4d8]/15 transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : mode === 'signup' ? (
              'Verify & Create Account'
            ) : (
              'Verify & Sign In'
            )}
          </button>

          {/* Resend Option */}
          <div className="text-center">
            {resendCooldown > 0 ? (
              <span className="text-xs text-[#ade8f4]/50">
                Resend code in <strong className="text-[#00b4d8]">{resendCooldown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00b4d8] transition-colors hover:text-[#90e0ef] disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Resend verification code
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
