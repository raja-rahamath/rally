'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Receipt, TrendingUp } from 'lucide-react';

const reports = [
  { title: 'Customer Report', description: 'Customer registrations, tiers, and activity', icon: Users },
  { title: 'Transaction Report', description: 'Daily/monthly transaction volumes and amounts', icon: Receipt },
  { title: 'Points Report', description: 'Points issuance, redemption, and expiry', icon: TrendingUp },
  { title: 'Activity Log', description: 'Admin user actions and system events', icon: FileText },
];

export default function ReportsPage() {
  return (
    <>
      <Header title="Reports" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <Card key={report.title} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Full interactive reports with export coming in Phase 3
        </p>
      </div>
    </>
  );
}
