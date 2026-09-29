'use client';

import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/auth-card';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#010113]" />}>
      <AuthCard initialMode="signup" />
    </Suspense>
  );
}
