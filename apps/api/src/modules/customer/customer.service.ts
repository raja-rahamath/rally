import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = { tenantId };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.status) {
      where.status = query.status as any;
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      customers,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, tenantId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: { assets: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, tenantId: string, data: Prisma.CustomerUpdateInput) {
    const customer = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');

    return this.prisma.customer.update({ where: { id }, data });
  }

  async getStats(tenantId: string) {
    const [total, active, thisMonth] = await Promise.all([
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.customer.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.customer.count({
        where: {
          tenantId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ]);
    return { total, active, newThisMonth: thisMonth };
  }
}
