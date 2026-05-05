import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'List customers (admin)' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: { page?: string; limit?: string; search?: string; status?: string },
  ) {
    const result = await this.customerService.findAll(tenantId, {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
      status: query.status,
    });
    return { success: true, data: result.customers, meta: result.meta };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Customer statistics' })
  async getStats(@CurrentUser('tenantId') tenantId: string) {
    const stats = await this.customerService.getStats(tenantId);
    return { success: true, data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID (360 view)' })
  async findById(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    const customer = await this.customerService.findById(id, tenantId);
    return { success: true, data: customer };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer profile' })
  async update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    const customer = await this.customerService.update(id, tenantId, body);
    return { success: true, data: customer };
  }
}
