import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  async createAssetType(tenantId: string, data: { name: string; slug: string; icon?: string; fieldDefinitions: any[] }) {
    return this.prisma.assetType.create({
      data: { tenantId, ...data, fieldDefinitions: data.fieldDefinitions },
    });
  }

  async getAssetTypes(tenantId: string) {
    return this.prisma.assetType.findMany({ where: { tenantId, isActive: true } });
  }

  async createAsset(tenantId: string, customerId: string, data: { assetTypeId: string; name: string; fields: any }) {
    const assetType = await this.prisma.assetType.findFirst({
      where: { id: data.assetTypeId, tenantId },
    });
    if (!assetType) throw new NotFoundException('Asset type not found');

    return this.prisma.asset.create({
      data: { tenantId, customerId, ...data },
    });
  }

  async getCustomerAssets(customerId: string, tenantId: string) {
    return this.prisma.asset.findMany({
      where: { customerId, tenantId, status: 'ACTIVE' },
      include: { assetType: true },
    });
  }

  async getAsset(id: string, tenantId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
      include: { assetType: true, services: { orderBy: { date: 'desc' } } },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async addServiceRecord(assetId: string, tenantId: string, data: { serviceType: string; description: string; date: Date; cost?: number; notes?: string }) {
    const asset = await this.prisma.asset.findFirst({ where: { id: assetId, tenantId } });
    if (!asset) throw new NotFoundException('Asset not found');

    return this.prisma.serviceRecord.create({
      data: { assetId, tenantId, ...data },
    });
  }
}
