'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Receipt, Star, TrendingUp } from 'lucide-react';

interface DashboardStats {
  customers: { total: number; active: number; newThisMonth: number };
  transactions: { pending: number; todayCount: number; todayAmount: number };
  points: { totalIssued: number; totalRedeemed: number };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // TODO: Fetch real stats from API
    setStats({
      customers: { total: 1, active: 1, newThisMonth: 1 },
      transactions: { pending: 0, todayCount: 0, todayAmount: 0 },
      points: { totalIssued: 5000, totalRedeemed: 0 },
    });
  }, []);

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Customers"
            value={stats?.customers.total ?? '--'}
            description={`${stats?.customers.newThisMonth ?? 0} new this month`}
            icon={Users}
            trend={{ value: 12, label: 'from last month' }}
          />
          <StatCard
            title="Pending Reviews"
            value={stats?.transactions.pending ?? '--'}
            description="Transactions awaiting approval"
            icon={Receipt}
          />
          <StatCard
            title="Points Issued"
            value={stats?.points.totalIssued?.toLocaleString() ?? '--'}
            description="Total points in circulation"
            icon={Star}
          />
          <StatCard
            title="Today's Revenue"
            value={`${stats?.transactions.todayAmount ?? 0} BHD`}
            description={`${stats?.transactions.todayCount ?? 0} transactions`}
            icon={TrendingUp}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <CustomerRow name="Ahmed Al Khalifa" phone="+973 33001234" points={5000} tier="Driver" />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                More customers will appear as they register
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No pending transactions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function CustomerRow({ name, phone, points, tier }: { name: string; phone: string; points: number; tier: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{phone}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{points.toLocaleString()} pts</p>
        <Badge variant="secondary" className="text-xs">{tier}</Badge>
      </div>
    </div>
  );
}
