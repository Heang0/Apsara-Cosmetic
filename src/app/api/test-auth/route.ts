import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/middleware/adminAuth';

export async function GET(request: Request) {
  const authResult = verifyAdminToken(request as any);
  
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }
  
  return NextResponse.json({
    message: 'Auth working!',
    user: authResult.decoded
  });
}
