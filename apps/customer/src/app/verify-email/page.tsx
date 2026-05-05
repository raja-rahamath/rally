'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'pending' | 'verified' | 'error'>('pending');
  const [resendTimer, setResendTimer] = useState(60);
  const [devCode, setDevCode] = useState('');

  useEffect(() => {
    fetchEmail();
    const timer = setInterval(() => {
      setResendTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll for verification status
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/email/status');
        const data = await res.json();
        if (data.verified) {
          setStatus('verified');
          clearInterval(poll);
          setTimeout(() => router.push('/dashboard'), 1500);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, [router]);

  async function fetchEmail() {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      setEmail(data.customer?.email || '');
    } catch {}
  }

  async function resendEmail() {
    setResendTimer(60);
    try {
      const res = await fetch('/api/email/send-verification', { method: 'POST' });
      const data = await res.json();
      if (data.devCode) setDevCode(data.devCode);
    } catch {}
  }

  async function verifyWithCode() {
    if (!devCode) return;
    try {
      const res = await fetch('/api/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: devCode }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('verified');
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    } catch {}
  }

  if (status === 'verified') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <span className="text-green-600 text-3xl">✓</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Email Verified!</h1>
        <p className="text-gray-500 mt-2">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      {/* Email icon */}
      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
        <span className="text-3xl">📧</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 text-center">Verify your email</h1>
      <p className="text-gray-500 mt-2 text-center">
        We've sent a verification email to
      </p>
      <p className="font-medium text-gray-900 mt-1">{email}</p>

      <p className="text-sm text-gray-400 mt-4 text-center">
        Click the link in the email to verify your account.
        You need to verify before you can upload receipts and earn points.
      </p>

      {/* Dev mode: show code */}
      {devCode && (
        <div className="mt-4 w-full bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium text-center">DEV MODE - Verification Code</p>
          <p className="text-2xl font-mono font-bold text-amber-800 text-center tracking-widest mt-1">{devCode}</p>
          <button
            onClick={verifyWithCode}
            className="w-full mt-2 bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700"
          >
            Verify Now (Dev)
          </button>
        </div>
      )}

      {/* Resend */}
      <div className="mt-6">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-400">Resend in {resendTimer}s</p>
        ) : (
          <button onClick={resendEmail} className="text-sm text-blue-600 font-medium hover:underline">
            Resend verification email
          </button>
        )}
      </div>

      {/* Skip hint */}
      <p className="text-xs text-gray-300 mt-8 text-center">
        Having trouble? Contact support for assistance.
      </p>
    </div>
  );
}
