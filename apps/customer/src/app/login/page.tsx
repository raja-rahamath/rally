'use client';

import { useState } from 'react';
import { PhoneStep } from './phone-step';
import { OtpStep } from './otp-step';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+973');
  const [devOtp, setDevOtp] = useState('');

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-md mx-auto">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-4">
          <span className="text-white font-bold text-2xl">R</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Al Jazeera Rewards</h1>
        <p className="text-gray-500 mt-1">Sign in or create your account</p>
      </div>

      {step === 'phone' ? (
        <PhoneStep
          phone={phone}
          countryCode={countryCode}
          onPhoneChange={setPhone}
          onCountryCodeChange={setCountryCode}
          onSuccess={(otp) => { setDevOtp(otp || ''); setStep('otp'); }}
        />
      ) : (
        <OtpStep
          phone={phone}
          countryCode={countryCode}
          devOtp={devOtp}
          onBack={() => setStep('phone')}
        />
      )}
    </div>
  );
}
