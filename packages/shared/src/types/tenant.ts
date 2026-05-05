export interface Tenant {
  id: string;
  name: string;
  slug: string;
  industry: string;
  status: TenantStatus;
  settings: TenantSettings;
  branding: TenantBranding;
  createdAt: Date;
  updatedAt: Date;
}

export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'trial';

export interface TenantSettings {
  defaultLanguage: 'en' | 'ar';
  currency: string;
  timezone: string;
  pointsPerUnit: number;
  pointValue: number;
  enabledModules: string[];
  smsProvider?: string;
  emailProvider?: string;
}

export interface TenantBranding {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  appName: string;
  favicon?: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  industry: string;
  settings: Partial<TenantSettings>;
  branding: Partial<TenantBranding>;
}
