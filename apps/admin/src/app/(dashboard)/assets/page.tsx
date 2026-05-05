'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Car, Settings2 } from 'lucide-react';

interface AssetType {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  fieldDefinitions: any[];
  isActive: boolean;
}

export default function AssetsPage() {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetTypes();
  }, []);

  async function fetchAssetTypes() {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/assets/types');
      const data = await res.json();
      setAssetTypes(data.data || []);
    } catch (err) {
      console.error('Failed to fetch asset types:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Assets" />
      <div className="p-6 space-y-6">
        {/* Asset Types */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Asset Types</h2>
            <p className="text-sm text-muted-foreground">
              Configure what customers can register (vehicles, equipment, etc.)
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Asset Type
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-muted-foreground col-span-full text-center py-8">Loading...</p>
          ) : assetTypes.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No asset types configured
            </p>
          ) : (
            assetTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{type.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{type.slug}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {type.fieldDefinitions.map((field: any) => (
                      <Badge key={field.key} variant="secondary" className="text-xs">
                        {field.label}
                        {field.required && <span className="text-destructive ml-0.5">*</span>}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {type.fieldDefinitions.length} fields configured
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
