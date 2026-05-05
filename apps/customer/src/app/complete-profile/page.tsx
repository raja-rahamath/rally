'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MIN_AGE = 16;

function getMaxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_AGE);
  return d.toISOString().split('T')[0];
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateName(name: string) {
  return /^[a-zA-Z\u0600-\u06FF\s'-]{2,50}$/.test(name.trim());
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    language: 'en',
  });

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!form.firstName.trim()) {
      errs.firstName = 'First name is required';
    } else if (!validateName(form.firstName)) {
      errs.firstName = 'Enter a valid name (letters only, 2-50 chars)';
    }

    if (!form.lastName.trim()) {
      errs.lastName = 'Last name is required';
    } else if (!validateName(form.lastName)) {
      errs.lastName = 'Enter a valid name (letters only, 2-50 chars)';
    }

    if (!form.email.trim()) {
      errs.email = 'Email is required for account verification';
    } else if (!validateEmail(form.email)) {
      errs.email = 'Enter a valid email address';
    }

    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        errs.dateOfBirth = 'Date of birth cannot be in the future';
      } else {
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
        if (actualAge < MIN_AGE) {
          errs.dateOfBirth = `You must be at least ${MIN_AGE} years old`;
        }
      }
    }

    if (!confirmed) {
      errs.confirmed = 'You must confirm the information is accurate';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      // Redirect to email verification page
      router.push('/verify-email');
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <span className="text-green-600 text-xl">✓</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Welcome!</h1>
        <p className="text-gray-500 mt-1">Complete your profile to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Names */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => updateForm('firstName', e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              placeholder="Ahmed"
              autoFocus
            />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => updateForm('lastName', e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              placeholder="Al Khalifa"
            />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateForm('email', e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            placeholder="ahmed@example.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          <p className="text-xs text-gray-400 mt-1">A verification email will be sent to this address</p>
        </div>

        {/* Gender & DOB */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => updateForm('gender', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => updateForm('dateOfBirth', e.target.value)}
              max={getMaxDob()}
              className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateForm('language', 'en')}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition ${
                form.language === 'en' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => updateForm('language', 'ar')}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition ${
                form.language === 'ar' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <div className={`flex items-start gap-3 p-3 rounded-xl border ${errors.confirmed ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
          <input
            type="checkbox"
            id="confirm"
            checked={confirmed}
            onChange={(e) => { setConfirmed(e.target.checked); if (errors.confirmed) setErrors(prev => { const n = { ...prev }; delete n.confirmed; return n; }); }}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="confirm" className="text-sm text-gray-600">
            I confirm that all the information I have provided is valid and accurate. I understand that providing false information may result in account suspension.
          </label>
        </div>
        {errors.confirmed && <p className="text-xs text-red-500 -mt-2">{errors.confirmed}</p>}

        {/* Form-level error */}
        {errors.form && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errors.form}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Registration'}
        </button>
      </form>
    </div>
  );
}
