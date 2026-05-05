import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Decode JWT to get customer ID (simple base64 decode of payload)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const customerId = payload.sub;
    const tenantId = payload.tenantId;

    const res = await fetch(`${API_URL}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: res.status });
    }

    return NextResponse.json({ success: true, customer: data.data });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
