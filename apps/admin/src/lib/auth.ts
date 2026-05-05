'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function login(email: string, password: string, tenantId: string) {
  const res = await fetch(`${API_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, tenantId }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed');

  // Extract cookies from response
  const setCookies = res.headers.getSetCookie();
  const cookieStore = await cookies();

  for (const cookie of setCookies) {
    const [nameValue] = cookie.split(';');
    const [name, value] = nameValue.split('=');
    cookieStore.set(name.trim(), value.trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: name.includes('refresh') ? 7 * 24 * 60 * 60 : 15 * 60,
    });
  }

  return json.data;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');
  if (!token) return null;
  return { token: token.value };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  redirect('/login');
}
