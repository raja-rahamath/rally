'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface Transaction {
  id: string;
  invoiceNumber: string | null;
  amount: string;
  currency: string;
  date: string;
  status: string;
  pointsEarned: number | null;
  customer?: { firstName: string; lastName: string; phone: string };
  createdAt: string;
}

export default function TransactionsPage() {
  const [tab, setTab] = useState('pending');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions(tab);
  }, [tab]);

  async function fetchTransactions(status: string) {
    setLoading(true);
    try {
      const endpoint = status === 'pending' ? '/api/proxy/transactions/pending' : `/api/proxy/transactions?status=${status}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setTransactions(data.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await fetch(`/api/proxy/transactions/${id}/approve`, { method: 'PATCH' });
      fetchTransactions(tab);
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  }

  async function handleReject(id: string) {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await fetch(`/api/proxy/transactions/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      fetchTransactions(tab);
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="secondary">Pending</Badge>;
      case 'APPROVED': return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
      case 'AUTO_APPROVED': return <Badge className="bg-blue-100 text-blue-700">Auto</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Header title="Transactions" />
      <div className="p-6 space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No {tab} transactions
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {tx.customer ? `${tx.customer.firstName} ${tx.customer.lastName}` : '--'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {tx.invoiceNumber || '--'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {parseFloat(tx.amount).toFixed(3)} {tx.currency}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(tx.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{statusBadge(tx.status)}</TableCell>
                          <TableCell>
                            {tx.pointsEarned ? `+${tx.pointsEarned}` : '--'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {tx.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleApprove(tx.id)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleReject(tx.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
