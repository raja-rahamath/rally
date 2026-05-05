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

async function proxyRequest(req: NextRequest, path: string, method?: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

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
