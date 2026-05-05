import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Assets')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetController {
  constructor(private assetService: AssetService) {}

  @Get('types')
  @ApiOperation({ summary: 'Get asset types for tenant' })
  async getAssetTypes(@CurrentUser('tenantId') tenantId: string) {
    const types = await this.assetService.getAssetTypes(tenantId);
    return { success: true, data: types };
  }

  @Post('types')
  @ApiOperation({ summary: 'Create asset type (admin)' })
  async createAssetType(@CurrentUser('tenantId') tenantId: string, @Body() body: any) {
    const type = await this.assetService.createAssetType(tenantId, body);
    return { success: true, data: type };
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my assets (customer)' })
  async getMyAssets(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const assets = await this.assetService.getCustomerAssets(userId, tenantId);
    return { success: true, data: assets };
  }

  @Post()
  @ApiOperation({ summary: 'Register a new asset' })
  async createAsset(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    const asset = await this.assetService.createAsset(tenantId, userId, body);
    return { success: true, data: asset };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset details with service history' })
  async getAsset(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    const asset = await this.assetService.getAsset(id, tenantId);
    return { success: true, data: asset };
  }

  @Post(':id/services')
  @ApiOperation({ summary: 'Add service record to asset' })
  async addService(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    const record = await this.assetService.addServiceRecord(id, tenantId, body);
    return { success: true, data: record };
  }
}
