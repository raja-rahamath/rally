'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  pointsBalance: number;
  tierLevel: string;
  qrCode: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/profile');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setCustomer(data.customer);
    } catch {
      router.push('/login');
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

  if (!customer) return null;

  const displayName = customer.firstName
    ? `${customer.firstName} ${customer.lastName}`
    : 'Welcome!';

  return (
    <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Hello,</p>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{displayName}</h1>
        </div>
        <button
          onClick={() => router.push('/profile')}
          className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <span className="text-sm font-medium text-gray-600">
            {customer.firstName ? customer.firstName[0].toUpperCase() : '?'}
          </span>
        </button>
      </div>

      {/* Points Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <p className="text-sm opacity-80">Points Balance</p>
        <p className="text-4xl md:text-5xl font-bold mt-1">{customer.pointsBalance.toLocaleString()}</p>
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-xs opacity-60">Tier</p>
            <p className="text-sm font-medium capitalize">{customer.tierLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-60">Member ID</p>
            <p className="text-sm font-mono">{customer.qrCode}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
        <QuickAction icon="📄" label="Receipt" href="/upload" />
        <QuickAction icon="🚗" label="Vehicles" href="/vehicles" />
        <QuickAction icon="📊" label="History" href="/history" />
        <QuickAction icon="🎁" label="Rewards" href="/rewards" />
      </div>

      {/* Recent Activity placeholder */}
      <div className="bg-gray-50 rounded-xl p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>
        <p className="text-sm text-gray-400 text-center py-4">
          No recent activity. Upload a receipt to earn points!
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/login');
        }}
        className="w-full mt-6 text-sm text-gray-400 py-2 hover:text-gray-600"
      >
        Sign out
      </button>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} className="flex flex-col items-center gap-1 p-3 md:p-4 rounded-xl hover:bg-gray-50 transition">
      <span className="text-2xl md:text-3xl">{icon}</span>
      <span className="text-xs md:text-sm text-gray-600">{label}</span>
    </a>
  );
}
