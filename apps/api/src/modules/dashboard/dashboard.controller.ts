import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(@CurrentUser('tenantId') tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalCustomers,
      activeCustomers,
      newThisMonth,
      pendingTransactions,
      todayTransactions,
      totalPointsIssued,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.customer.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.customer.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
      this.prisma.transaction.count({ where: { tenantId, status: 'PENDING' } }),
      this.prisma.transaction.findMany({
        where: { tenantId, createdAt: { gte: startOfDay }, status: 'APPROVED' },
        select: { amount: true },
      }),
      this.prisma.pointsTransaction.aggregate({
        where: { tenantId, type: 'EARN' },
        _sum: { amount: true },
      }),
    ]);

    const todayAmount = todayTransactions.reduce((sum, tx) => sum + tx.amount.toNumber(), 0);

    return {
      success: true,
      data: {
        customers: { total: totalCustomers, active: activeCustomers, newThisMonth },
        transactions: {
          pending: pendingTransactions,
          todayCount: todayTransactions.length,
          todayAmount,
        },
        points: {
          totalIssued: totalPointsIssued._sum.amount || 0,
        },
      },
    };
  }
}
