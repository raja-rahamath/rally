export interface Asset {
  id: string;
  customerId: string;
  tenantId: string;
  assetTypeId: string;
  name: string;
  fields: Record<string, unknown>;
  status: AssetStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type AssetStatus = 'active' | 'inactive' | 'archived';

export interface AssetType {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  icon?: string;
  fieldDefinitions: AssetFieldDefinition[];
  isActive: boolean;
}

export interface AssetFieldDefinition {
  key: string;
  label: string;
  labelAr?: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface CreateAssetRequest {
  assetTypeId: string;
  name: string;
  fields: Record<string, unknown>;
}

export interface ServiceRecord {
  id: string;
  assetId: string;
  tenantId: string;
  serviceType: string;
  description: string;
  date: Date;
  cost?: number;
  notes?: string;
  createdAt: Date;
}
