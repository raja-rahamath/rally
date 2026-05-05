import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PointsService } from '../points/points.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private pointsService: PointsService,
  ) {}

  async create(data: {
    tenantId: string;
    customerId: string;
    invoiceNumber?: string;
    amount: number;
    currency?: string;
    date: Date;
    receiptImageUrl?: string;
  }) {
    return this.prisma.transaction.create({
      data: {
        tenantId: data.tenantId,
        customerId: data.customerId,
        invoiceNumber: data.invoiceNumber,
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency || 'BHD',
        date: data.date,
        receiptImageUrl: data.receiptImageUrl,
        status: 'PENDING',
      },
    });
  }

  async approve(id: string, tenantId: string, reviewedBy: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId, status: 'PENDING' },
    });
    if (!transaction) throw new NotFoundException('Transaction not found or already reviewed');

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: { status: 'APPROVED', reviewedBy, reviewedAt: new Date() },
    });

    // Award points
    const result = await this.pointsService.earnPoints({
      tenantId,
      customerId: transaction.customerId,
      transactionAmount: transaction.amount.toNumber(),
      referenceType: 'transaction',
      referenceId: id,
    });

    await this.prisma.transaction.update({
      where: { id },
      data: { pointsEarned: result.pointsEarned },
    });

    return { transaction: updated, pointsEarned: result.pointsEarned };
  }

  async reject(id: string, tenantId: string, reviewedBy: string, reason: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId, status: 'PENDING' },
    });
    if (!transaction) throw new NotFoundException('Transaction not found or already reviewed');

    return this.prisma.transaction.update({
      where: { id },
      data: { status: 'REJECTED', reviewedBy, reviewedAt: new Date(), rejectionReason: reason },
    });
  }

  async findPending(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { tenantId, status: 'PENDING' },
        include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { tenantId, status: 'PENDING' } }),
    ]);
    return { transactions, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findByCustomer(customerId: string, tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { customerId, tenantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { customerId, tenantId } }),
    ]);
    return { transactions, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
