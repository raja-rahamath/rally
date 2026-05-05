'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  phone: string;
  countryCode: string;
  onBack: () => void;
}

export function OtpStep({ phone, countryCode, onBack }: Props) {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleChange(index: number, value: string) {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(d => d) && value) {
      verifyOtp(newOtp.join(''));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtp(digits);
      verifyOtp(pasted);
    }
  }

  async function verifyOtp(code: string) {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode, otp: code }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      if (data.isNewCustomer) {
        router.push('/complete-profile');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setResendTimer(30);
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode }),
      });
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Enter the 6-digit code sent to
        </p>
        <p className="font-medium text-gray-900 mt-1">
          {countryCode} {phone}
        </p>
        <button onClick={onBack} className="text-sm text-blue-600 mt-1 hover:underline">
          Change number
        </button>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition"
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg text-center">{error}</p>
      )}

      {loading && (
        <p className="text-sm text-gray-500 text-center">Verifying...</p>
      )}

      {/* Resend */}
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-400">Resend code in {resendTimer}s</p>
        ) : (
          <button onClick={resendOtp} className="text-sm text-blue-600 font-medium hover:underline">
            Resend code
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Check your console for the OTP (dev mode)
      </p>
    </div>
  );
}
