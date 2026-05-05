'use client';

import { useState } from 'react';

const countryCodes = [
  { code: '+973', country: 'BH', flag: '🇧🇭' },
  { code: '+966', country: 'SA', flag: '🇸🇦' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+974', country: 'QA', flag: '🇶🇦' },
  { code: '+965', country: 'KW', flag: '🇰🇼' },
  { code: '+968', country: 'OM', flag: '🇴🇲' },
];

interface Props {
  phone: string;
  countryCode: string;
  onPhoneChange: (v: string) => void;
  onCountryCodeChange: (v: string) => void;
  onSuccess: (devOtp?: string) => void;
}

export function PhoneStep({ phone, countryCode, onPhoneChange, onCountryCodeChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || phone.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      onSuccess(data.devOtp);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selected = countryCodes.find(c => c.code === countryCode) || countryCodes[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            className="w-28 rounded-xl border border-gray-200 px-3 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {countryCodes.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
            ))}
          </select>
          <input
            type="tel"
            placeholder="33001234"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !phone}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        We'll send a 6-digit code to verify your number
      </p>
    </form>
  );
}
