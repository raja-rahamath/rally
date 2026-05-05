'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number';
  required: boolean;
}

export default function EditVehiclePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [fieldDefs, setFieldDefs] = useState<FieldDefinition[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [vehicleName, setVehicleName] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicle();
  }, []);

  async function fetchVehicle() {
    try {
      const [vehicleRes, typesRes] = await Promise.all([
        fetch(`/api/vehicles/${id}`),
        fetch('/api/vehicles/asset-types'),
      ]);

      if (vehicleRes.status === 401) {
        router.push('/login');
        return;
      }

      const vehicleData = await vehicleRes.json();
      const typesData = await typesRes.json();

      if (!vehicleData.success) {
        setError('Vehicle not found');
        return;
      }

      const vehicle = vehicleData.data;
      setVehicleName(vehicle.name || '');
      setFields(vehicle.fields || {});
      setStatus(vehicle.status || 'ACTIVE');

      const assetType = (typesData.data || []).find(
        (t: { id: string }) => t.id === vehicle.assetTypeId,
      );
      if (assetType) {
        setFieldDefs(assetType.fieldDefinitions);
      }
    } catch {
      setError('Failed to load vehicle');
    } finally {
      setLoading(false);
    }
  }

  function updateField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    for (const fd of fieldDefs) {
      if (fd.required && !fields[fd.key]?.trim()) {
        setError(`${fd.label} is required`);
        return;
      }
    }

    if (fields.year) {
      const year = parseInt(fields.year);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        setError('Please enter a valid year');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: vehicleName.trim() || undefined, fields, status }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to update vehicle');
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Edit Vehicle</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Vehicle Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 mb-4 md:mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Vehicle Info</h2>
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

              {fieldDefs.map((fd) => (
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

          {/* Status Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Status</h2>
                <p className="text-sm text-gray-600 mt-1">{status === 'ACTIVE' ? 'This vehicle is active and visible' : 'This vehicle is inactive and hidden'}</p>
              </div>
              <button
                type="button"
                onClick={() => setStatus(status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Actions */}
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
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
