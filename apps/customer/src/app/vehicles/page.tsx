'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/format-date';

interface AssetType {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Vehicle {
  id: string;
  name: string;
  fields: Record<string, string>;
  status: string;
  createdAt: string;
  assetType: AssetType;
}

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [vehiclesRes, settingsRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/settings'),
      ]);

      if (vehiclesRes.status === 401) {
        router.push('/login');
        return;
      }

      const vehiclesData = await vehiclesRes.json();
      setVehicles(vehiclesData.data || []);

      const settingsData = await settingsRes.json();
      if (settingsData.data?.settings?.dateFormat) {
        setDateFormat(settingsData.data.settings.dateFormat);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
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
    <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Vehicles</h1>
        </div>
        <button
          onClick={() => router.push('/vehicles/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Vehicle List */}
      {vehicles.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🚗</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No vehicles registered</h2>
          <p className="text-sm text-gray-400 mb-6">Add your vehicle to track services and earn points</p>
          <button
            onClick={() => router.push('/vehicles/add')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            Register Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} dateFormat={dateFormat} />
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleCard({ vehicle, dateFormat }: { vehicle: { id: string; name: string; status: string; fields: Record<string, string>; createdAt: string }; dateFormat: string }) {
  const { fields } = vehicle;
  const isActive = vehicle.status === 'ACTIVE';
  return (
    <a href={`/vehicles/${vehicle.id}/edit`} className={`block bg-white border rounded-2xl p-5 hover:shadow-md transition ${isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {isActive ? 'Active' : vehicle.status.charAt(0) + vehicle.status.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {fields.make} {fields.model} {fields.year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span className="text-2xl">🚗</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {fields.plateNumber && (
          <div>
            <span className="text-gray-400">Plate</span>
            <p className="font-medium text-gray-700">{fields.plateNumber}</p>
          </div>
        )}
        {fields.color && (
          <div>
            <span className="text-gray-400">Color</span>
            <p className="font-medium text-gray-700">{fields.color}</p>
          </div>
        )}
        {fields.mileage && (
          <div>
            <span className="text-gray-400">Mileage</span>
            <p className="font-medium text-gray-700">{Number(fields.mileage).toLocaleString()} km</p>
          </div>
        )}
        {fields.vin && (
          <div>
            <span className="text-gray-400">VIN</span>
            <p className="font-medium text-gray-700 font-mono text-xs">{fields.vin}</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-300 mt-3">
        Added {formatDate(vehicle.createdAt, dateFormat)}
      </p>
    </a>
  );
}
