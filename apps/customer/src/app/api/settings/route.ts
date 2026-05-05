import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const TENANT_SLUG = process.env.TENANT_SLUG || 'al-jazeera-motors';

export async function GET() {
  try {
    const tenantRes = await fetch(`${API_URL}/tenants/slug/${TENANT_SLUG}`);
    const tenantData = await tenantRes.json();

    if (!tenantData.success) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const settings: Record<string, string> = {};
    for (const s of tenantData.data.settings || []) {
      settings[s.key] = s.value;
    }

    return NextResponse.json({
      success: true,
      data: {
        tenant: {
          id: tenantData.data.id,
          name: tenantData.data.name,
          slug: tenantData.data.slug,
        },
        branding: tenantData.data.branding,
        settings,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
