import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class PointsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async earnPoints(data: {
    tenantId: string;
    customerId: string;
    transactionAmount: number;
    referenceType: string;
    referenceId?: string;
    description?: string;
    multiplier?: number;
  }) {
    const rule = await this.prisma.pointsRule.findFirst({
      where: { tenantId: data.tenantId, isActive: true },
    });

    if (!rule) throw new BadRequestException('No active points rule for tenant');

    const points = Math.floor(
      data.transactionAmount * rule.pointsPerUnit * (data.multiplier || rule.multiplier),
    );

    const customer = await this.prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) throw new BadRequestException('Customer not found');

    const newBalance = customer.pointsBalance + points;

    const [transaction] = await this.prisma.$transaction([
      this.prisma.pointsTransaction.create({
        data: {
          tenantId: data.tenantId,
          customerId: data.customerId,
          type: 'EARN',
          amount: points,
          balance: newBalance,
          description: data.description || `Earned ${points} points`,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
        },
      }),
      this.prisma.customer.update({
        where: { id: data.customerId },
        data: { pointsBalance: newBalance },
      }),
    ]);

    // Invalidate cached balance
    await this.redis.del(`points:${data.customerId}`);

    return { transaction, pointsEarned: points, newBalance };
  }

  async redeemPoints(data: {
    tenantId: string;
    customerId: string;
    points: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) throw new BadRequestException('Customer not found');
    if (customer.pointsBalance < data.points) {
      throw new BadRequestException('Insufficient points balance');
    }

    const newBalance = customer.pointsBalance - data.points;

    const [transaction] = await this.prisma.$transaction([
      this.prisma.pointsTransaction.create({
        data: {
          tenantId: data.tenantId,
          customerId: data.customerId,
          type: 'REDEEM',
          amount: -data.points,
          balance: newBalance,
          description: data.description,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
        },
      }),
      this.prisma.customer.update({
        where: { id: data.customerId },
        data: { pointsBalance: newBalance },
      }),
    ]);

    await this.redis.del(`points:${data.customerId}`);

    return { transaction, pointsRedeemed: data.points, newBalance };
  }

  async getBalance(customerId: string) {
    const cached = await this.redis.get(`points:${customerId}`);
    if (cached) return parseInt(cached);

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { pointsBalance: true },
    });

    if (customer) {
      await this.redis.set(`points:${customerId}`, customer.pointsBalance.toString(), 300);
    }

    return customer?.pointsBalance || 0;
  }

  async getHistory(customerId: string, tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.pointsTransaction.findMany({
        where: { customerId, tenantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pointsTransaction.count({ where: { customerId, tenantId } }),
    ]);

    return { transactions, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
