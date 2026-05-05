export interface Customer {
  id: string;
  tenantId: string;
  phone: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  nationalId?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  language: 'en' | 'ar';
  status: CustomerStatus;
  pointsBalance: number;
  tierLevel: string;
  qrCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerStatus = 'active' | 'inactive' | 'blacklisted';

export interface CreateCustomerRequest {
  phone: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  language?: 'en' | 'ar';
}

export interface CustomerSearchQuery {
  search?: string;
  status?: CustomerStatus;
  tierLevel?: string;
  page?: number;
  limit?: number;
}
