import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'apsara_admin_session';

interface AdminJwtPayload {
  id: string;
  email: string;
  name?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

const getBearerToken = (request: Request) => {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) {
    return '';
  }

  const token = header.slice(7).trim();
  if (!token || token === 'null' || token === 'undefined') {
    return '';
  }

  return token;
};

const getCookieToken = (request: Request) => {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map((part) => part.trim());
  const match = cookies.find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!match) {
    return '';
  }

  return decodeURIComponent(match.slice(ADMIN_SESSION_COOKIE.length + 1));
};

export function verifyAdminRequest(
  request: Request,
  allowedRoles: string[] = ['admin', 'superadmin']
): { ok: true; admin: AdminJwtPayload } | { ok: false; response: NextResponse } {
  const token = getBearerToken(request) || getCookieToken(request);

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Server auth is not configured' }, { status: 500 })
    };
  }

  try {
    const decoded = jwt.verify(token, secret) as AdminJwtPayload;
    if (!decoded?.role || !allowedRoles.includes(decoded.role)) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      };
    }

    return { ok: true, admin: decoded };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    };
  }
}

export function getBearerTokenFromRequest(request: Request) {
  return getBearerToken(request);
}
