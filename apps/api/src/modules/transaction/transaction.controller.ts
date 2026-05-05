import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a transaction (receipt upload)' })
  async create(@CurrentUser('tenantId') tenantId: string, @CurrentUser('userId') userId: string, @Body() body: any) {
    const transaction = await this.transactionService.create({
      tenantId,
      customerId: body.customerId || userId,
      ...body,
    });
    return { success: true, data: transaction };
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending transactions for review (CSR)' })
  async findPending(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.transactionService.findPending(
      tenantId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20,
    );
    return { success: true, data: result.transactions, meta: result.meta };
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my transactions (customer)' })
  async findMine(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
  ) {
    const result = await this.transactionService.findByCustomer(userId, tenantId, page ? parseInt(page) : 1);
    return { success: true, data: result.transactions, meta: result.meta };
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a transaction (CSR)' })
  async approve(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string, @CurrentUser('userId') userId: string) {
    const result = await this.transactionService.approve(id, tenantId, userId);
    return { success: true, data: result };
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a transaction (CSR)' })
  async reject(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: { reason: string },
  ) {
    const result = await this.transactionService.reject(id, tenantId, userId, body.reason);
    return { success: true, data: result };
  }
}
