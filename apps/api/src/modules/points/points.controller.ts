import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PointsService } from './points.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Points')
@Controller('points')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PointsController {
  constructor(private pointsService: PointsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get current points balance' })
  async getBalance(@CurrentUser('userId') userId: string) {
    const balance = await this.pointsService.getBalance(userId);
    return { success: true, data: { balance } };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get points transaction history' })
  async getHistory(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.pointsService.getHistory(
      userId, tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
    return { success: true, data: result.transactions, meta: result.meta };
  }

  @Post('earn')
  @ApiOperation({ summary: 'Earn points (admin/system)' })
  async earn(@CurrentUser('tenantId') tenantId: string, @Body() body: any) {
    const result = await this.pointsService.earnPoints({ tenantId, ...body });
    return { success: true, data: result };
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem points' })
  async redeem(@CurrentUser('tenantId') tenantId: string, @Body() body: any) {
    const result = await this.pointsService.redeemPoints({ tenantId, ...body });
    return { success: true, data: result };
  }
}
