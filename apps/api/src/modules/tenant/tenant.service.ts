import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug: string;
    industry: string;
    settings?: Record<string, string>;
    branding?: { primaryColor?: string; secondaryColor?: string; appName: string; logo?: string };
  }) {
    const existing = await this.prisma.tenant.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('Tenant slug already exists');

    const tenant = await this.prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        industry: data.industry,
        branding: data.branding
          ? { create: data.branding }
          : undefined,
        settings: data.settings
          ? {
              create: Object.entries(data.settings).map(([key, value]) => ({
                key,
                value,
              })),
            }
          : undefined,
      },
      include: { branding: true, settings: true },
    });

    return tenant;
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: { branding: true },
    });
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { branding: true, settings: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { branding: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, data: Partial<{ name: string; industry: string; status: any }>) {
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async getSettings(tenantId: string): Promise<Record<string, string>> {
    const settings = await this.prisma.tenantSetting.findMany({ where: { tenantId } });
    return Object.fromEntries(settings.map((s) => [s.key, s.value]));
  }

  async updateSetting(tenantId: string, key: string, value: string) {
    return this.prisma.tenantSetting.upsert({
      where: { tenantId_key: { tenantId, key } },
      update: { value },
      create: { tenantId, key, value },
    });
  }
}
