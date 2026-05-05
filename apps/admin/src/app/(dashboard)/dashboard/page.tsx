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

  const [customers, setCustomers] = useState<any[]>([]);
  const [pendingTx, setPendingTx] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, customersRes, txRes] = await Promise.all([
          fetch('/api/proxy/dashboard/stats'),
          fetch('/api/proxy/customers?limit=5'),
          fetch('/api/proxy/transactions/pending?limit=5'),
        ]);
        const dashData = await dashRes.json();
        const customersData = await customersRes.json();
        const txData = await txRes.json();

        if (dashData.data) {
          setStats(dashData.data);
        } else {
          setStats({
            customers: { total: 0, active: 0, newThisMonth: 0 },
            transactions: { pending: 0, todayCount: 0, todayAmount: 0 },
            points: { totalIssued: 0, totalRedeemed: 0 },
          });
        }
        setCustomers(customersData.data || []);
        setPendingTx(txData.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    }
    fetchData();
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
              {customers.length > 0 ? (
                <div className="space-y-3">
                  {customers.map((c: any) => (
                    <CustomerRow
                      key={c.id}
                      name={`${c.firstName} ${c.lastName}`}
                      phone={`${c.countryCode} ${c.phone}`}
                      points={c.pointsBalance}
                      tier={c.tierLevel}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No customers yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTx.length > 0 ? (
                <div className="space-y-3">
                  {pendingTx.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">
                          {tx.customer ? `${tx.customer.firstName} ${tx.customer.lastName}` : 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.invoiceNumber || 'No invoice #'}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {parseFloat(tx.amount).toFixed(3)} {tx.currency}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No pending transactions
                </p>
              )}
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
