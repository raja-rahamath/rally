import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const TENANT_ID = process.env.TENANT_ID || '';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Get tenant ID — in production this would come from subdomain/config
  let tenantId = TENANT_ID;
  if (!tenantId) {
    // Fetch from slug for dev
    const tenantRes = await fetch(`${API_URL}/tenants/slug/al-jazeera-motors`);
    const tenantData = await tenantRes.json();
    tenantId = tenantData.data?.id || '';
  }

  const res = await fetch(`${API_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, tenantId }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.message || 'Login failed' }, { status: 401 });
  }

  // Forward cookies from API to client
  const response = NextResponse.json({ success: true, user: data.data?.user });

  const setCookies = res.headers.getSetCookie();
  for (const cookie of setCookies) {
    response.headers.append('Set-Cookie', cookie);
  }

  return response;
}
