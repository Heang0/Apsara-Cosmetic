import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const adminAuth = verifyAdminRequest(request);
  if (!adminAuth.ok) {
    return adminAuth.response;
  }

  const response = NextResponse.json({
    admin: {
      id: adminAuth.admin.id,
      email: adminAuth.admin.email,
      name: adminAuth.admin.name || '',
      role: adminAuth.admin.role || 'admin',
    }
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
