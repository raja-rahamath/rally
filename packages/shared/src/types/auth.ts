export interface LoginOtpRequest {
  phone: string;
  countryCode: string;
}

export interface VerifyOtpRequest {
  phone: string;
  countryCode: string;
  otp: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

export type UserRole = 'super_admin' | 'tenant_admin' | 'manager' | 'csr' | 'customer';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}
