import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function verifyAdminToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return { error: 'No token provided', status: 401 };
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return { decoded };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}
