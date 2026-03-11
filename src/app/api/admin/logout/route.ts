import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { enforceSameOrigin } from '@/lib/request-origin';

export async function POST(request: Request) {
  const originError = enforceSameOrigin(request);
  if (originError) {
    return originError;
  }

  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
