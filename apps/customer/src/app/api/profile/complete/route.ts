import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Decode JWT to get customer ID
  const payload = JSON.parse(atob(token.split('.')[1]));
  const customerId = payload.sub;

  const updateData: any = {};
  if (body.firstName) updateData.firstName = body.firstName;
  if (body.lastName) updateData.lastName = body.lastName;
  if (body.email) updateData.email = body.email;
  if (body.gender) updateData.gender = body.gender.toUpperCase();
  if (body.dateOfBirth) updateData.dateOfBirth = new Date(body.dateOfBirth).toISOString();
  if (body.language) updateData.language = body.language;

  const res = await fetch(`${API_URL}/customers/${customerId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.message || 'Failed to update profile' }, { status: res.status });
  }

  return NextResponse.json({ success: true, customer: data.data });
}
