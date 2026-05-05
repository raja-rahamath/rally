import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tenant' })
  async create(@Body() body: any) {
    const tenant = await this.tenantService.create(body);
    return { success: true, data: tenant };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all tenants' })
  async findAll() {
    const tenants = await this.tenantService.findAll();
    return { success: true, data: tenants };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findById(@Param('id') id: string) {
    const tenant = await this.tenantService.findById(id);
    return { success: true, data: tenant };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get tenant by slug (public)' })
  async findBySlug(@Param('slug') slug: string) {
    const tenant = await this.tenantService.findBySlug(slug);
    return { success: true, data: tenant };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'tenant_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tenant' })
  async update(@Param('id') id: string, @Body() body: any) {
    const tenant = await this.tenantService.update(id, body);
    return { success: true, data: tenant };
  }
}
