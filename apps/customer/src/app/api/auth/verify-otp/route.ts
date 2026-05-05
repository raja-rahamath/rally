import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const TENANT_SLUG = process.env.TENANT_SLUG || 'al-jazeera-motors';

export async function POST(req: NextRequest) {
  const { phone, countryCode, otp } = await req.json();

  // Resolve tenant ID
  const tenantRes = await fetch(`${API_URL}/tenants/slug/${TENANT_SLUG}`);
  const tenantData = await tenantRes.json();
  const tenantId = tenantData.data?.id;

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 500 });
  }

  const res = await fetch(`${API_URL}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, countryCode, otp, tenantId }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.message || 'Invalid OTP' }, { status: res.status });
  }

  // Store tokens in cookies
  const cookieStore = await cookies();
  const setCookies = res.headers.getSetCookie();

  for (const cookie of setCookies) {
    const [nameValue] = cookie.split(';');
    const [name, value] = nameValue.split('=');
    cookieStore.set(name.trim(), value.trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: name.includes('refresh') ? 604800 : 900,
    });
  }

  // Also set a customer_token marker for the redirect logic
  cookieStore.set('customer_token', 'active', {
    httpOnly: true,
    maxAge: 604800,
  });

  const isNewCustomer = !data.data?.customer?.firstName;

  return NextResponse.json({
    success: true,
    isNewCustomer,
    customer: data.data?.customer,
  });
}
