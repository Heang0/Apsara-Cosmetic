import { NextResponse } from 'next/server';

const cleanOrigin = (value?: string | null) => String(value || '').trim().replace(/\/$/, '');

export function enforceSameOrigin(request: Request) {
  const originHeader = cleanOrigin(request.headers.get('origin'));
  if (!originHeader) {
    return null;
  }

  const requestOrigin = cleanOrigin(new URL(request.url).origin);
  const configuredOrigin = cleanOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const allowedOrigins = new Set([requestOrigin, configuredOrigin].filter(Boolean));

  if (!allowedOrigins.has(originHeader)) {
    return NextResponse.json(
      { error: 'Cross-origin request rejected' },
      { status: 403 }
    );
  }

  return null;
}
