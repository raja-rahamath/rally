import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Rally database...');

  // Create demo tenant (car dealership)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'al-jazeera-motors' },
    update: {},
    create: {
      name: 'Al Jazeera Motors',
      slug: 'al-jazeera-motors',
      industry: 'automobile',
      status: 'ACTIVE',
    },
  });

  // Tenant branding
  await prisma.tenantBranding.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      appName: 'Al Jazeera Rewards',
      primaryColor: '#1E3A5F',
      secondaryColor: '#C5A572',
    },
  });

  // Tenant settings
  const settings = {
    defaultLanguage: 'en',
    currency: 'BHD',
    timezone: 'Asia/Bahrain',
    pointsPerUnit: '30',
    pointValue: '0.0007',
    dateFormat: 'dd/MM/yyyy',
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.tenantSetting.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key } },
      update: { value },
      create: { tenantId: tenant.id, key, value },
    });
  }

  // Points rule
  await prisma.pointsRule.upsert({
    where: { id: 'default-rule' },
    update: {},
    create: {
      id: 'default-rule',
      tenantId: tenant.id,
      name: 'Default Earning Rule',
      pointsPerUnit: 30,
      currency: 'BHD',
      multiplier: 1.0,
      isActive: true,
    },
  });

  // Asset type: Vehicle
  await prisma.assetType.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'vehicle' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Vehicle',
      slug: 'vehicle',
      icon: 'car',
      fieldDefinitions: [
        { key: 'make', label: 'Make', labelAr: 'الشركة المصنعة', type: 'text', required: true },
        { key: 'model', label: 'Model', labelAr: 'الموديل', type: 'text', required: true },
        { key: 'year', label: 'Year', labelAr: 'السنة', type: 'number', required: true },
        { key: 'vin', label: 'VIN', labelAr: 'رقم الهيكل', type: 'text', required: false },
        { key: 'plateNumber', label: 'Plate Number', labelAr: 'رقم اللوحة', type: 'text', required: true },
        { key: 'color', label: 'Color', labelAr: 'اللون', type: 'text', required: false },
        { key: 'mileage', label: 'Mileage (km)', labelAr: 'المسافة المقطوعة', type: 'number', required: false },
      ],
    },
  });

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@rally.app' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@rally.app',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'TENANT_ADMIN',
    },
  });

  // CSR user
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'csr@rally.app' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'csr@rally.app',
      passwordHash,
      firstName: 'CSR',
      lastName: 'Agent',
      role: 'CSR',
    },
  });

  // Demo customer
  await prisma.customer.upsert({
    where: { tenantId_phone_countryCode: { tenantId: tenant.id, phone: '33001234', countryCode: '+973' } },
    update: {},
    create: {
      tenantId: tenant.id,
      phone: '33001234',
      countryCode: '+973',
      firstName: 'Ahmed',
      lastName: 'Al Khalifa',
      email: 'ahmed@example.com',
      language: 'ar',
      pointsBalance: 5000,
      tierLevel: 'driver',
      qrCode: '20250001',
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Tenant: ${tenant.name} (${tenant.id})`);
  console.log('Admin: admin@rally.app / admin123');
  console.log('CSR: csr@rally.app / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
