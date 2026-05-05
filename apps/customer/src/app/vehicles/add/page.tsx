'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface FieldDefinition {
  key: string;
  label: string;
  labelAr?: string;
  type: 'text' | 'number';
  required: boolean;
}

interface AssetType {
  id: string;
  name: string;
  slug: string;
  fieldDefinitions: FieldDefinition[];
}

export default function AddVehiclePage() {
  const router = useRouter();
  const [assetType, setAssetType] = useState<AssetType | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [vehicleName, setVehicleName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssetTypes();
  }, []);

  async function fetchAssetTypes() {
    try {
      const res = await fetch('/api/vehicles/asset-types');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      const vehicleType = (data.data || []).find((t: AssetType) => t.slug === 'vehicle');
      if (vehicleType) {
        setAssetType(vehicleType);
        const initial: Record<string, string> = {};
        for (const f of vehicleType.fieldDefinitions) {
          initial[f.key] = '';
        }
        setFields(initial);
      }
    } catch {
      setError('Failed to load form');
    } finally {
      setLoading(false);
    }
  }

  function updateField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function generateName(): string {
    if (vehicleName.trim()) return vehicleName.trim();
    const parts = [fields.make, fields.model, fields.year].filter(Boolean);
    return parts.join(' ') || 'My Vehicle';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assetType) return;
    setError('');

    // Validate required fields
    for (const fd of assetType.fieldDefinitions) {
      if (fd.required && !fields[fd.key]?.trim()) {
        setError(`${fd.label} is required`);
        return;
      }
    }

    // Validate year
    if (fields.year) {
      const year = parseInt(fields.year);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        setError('Please enter a valid year');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetTypeId: assetType.id,
          name: generateName(),
          fields,
        }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to register vehicle');
        return;
      }

      router.push('/vehicles');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!assetType) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 text-center">
        <p className="text-gray-500">Vehicle registration is not available.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 text-blue-600 text-sm">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Add Vehicle</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nickname <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder='e.g. "My Daily Driver"'
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-gray-50 focus:bg-white transition"
                />
              </div>

              {assetType.fieldDefinitions.map((fd) => (
                <div key={fd.key} className={fd.key === 'vin' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fd.label}
                    {fd.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={fd.type === 'number' ? 'number' : 'text'}
                    value={fields[fd.key] || ''}
                    onChange={(e) => updateField(fd.key, e.target.value)}
                    placeholder={fd.label}
                    required={fd.required}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-gray-50 focus:bg-white transition"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition md:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed md:order-2"
            >
              {submitting ? 'Registering...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
