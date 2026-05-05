import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function POST(req: NextRequest) {
  const { phone, countryCode } = await req.json();

  const res = await fetch(`${API_URL}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, countryCode }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.message || 'Failed to send OTP' }, { status: res.status });
  }

  return NextResponse.json({ success: true, message: 'OTP sent', ...(data.data?.otp && { devOtp: data.data.otp }) });
}
