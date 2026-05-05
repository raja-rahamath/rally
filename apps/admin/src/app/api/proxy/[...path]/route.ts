import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path.join('/'));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path.join('/'), 'POST');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path.join('/'), 'PATCH');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path.join('/'), 'DELETE');
}

async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  let token = cookieStore.get('access_token')?.value;

  // Auto-login in development if no token
  if (!token && process.env.NODE_ENV !== 'production') {
    try {
      // Resolve tenant
      const tenantRes = await fetch(`${API_URL}/tenants/slug/al-jazeera-motors`);
      const tenantData = await tenantRes.json();
      const tenantId = tenantData.data?.id;

      if (tenantId) {
        const loginRes = await fetch(`${API_URL}/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@rally.app', password: 'admin123', tenantId }),
        });
        const loginData = await loginRes.json();

        // Get token from Set-Cookie header
        const setCookies = loginRes.headers.getSetCookie();
        for (const cookie of setCookies) {
          const [nameValue] = cookie.split(';');
          const [name, value] = nameValue.split('=');
          if (name.trim() === 'access_token') {
            token = value.trim();
            cookieStore.set('access_token', token, { httpOnly: true, maxAge: 900 });
          }
          if (name.trim() === 'refresh_token') {
            cookieStore.set('refresh_token', value.trim(), { httpOnly: true, maxAge: 604800 });
          }
        }
      }
    } catch (err) {
      console.error('Dev auto-login failed:', err);
    }
  }

  return token;
}

async function proxyRequest(req: NextRequest, path: string, method?: string) {
  const accessToken = await getAccessToken();

  const url = new URL(req.url);
  const queryString = url.search;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const fetchOptions: RequestInit = {
    method: method || req.method,
    headers,
  };

  if (method && method !== 'GET' && method !== 'HEAD') {
    try {
      const body = await req.json();
      fetchOptions.body = JSON.stringify(body);
    } catch {
      // No body
    }
  }

  const res = await fetch(`${API_URL}/${path}${queryString}`, fetchOptions);
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
