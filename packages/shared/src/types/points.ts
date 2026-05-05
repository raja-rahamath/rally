export interface PointsTransaction {
  id: string;
  customerId: string;
  tenantId: string;
  type: PointsTransactionType;
  amount: number;
  balance: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export type PointsTransactionType = 'earn' | 'redeem' | 'expire' | 'adjust' | 'transfer_in' | 'transfer_out';

export interface EarnPointsRequest {
  customerId: string;
  transactionAmount: number;
  referenceType: string;
  referenceId?: string;
  description?: string;
  multiplier?: number;
}

export interface RedeemPointsRequest {
  customerId: string;
  points: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
}

export interface PointsRule {
  id: string;
  tenantId: string;
  name: string;
  pointsPerUnit: number;
  currency: string;
  multiplier: number;
  conditions?: Record<string, unknown>;
  isActive: boolean;
}
