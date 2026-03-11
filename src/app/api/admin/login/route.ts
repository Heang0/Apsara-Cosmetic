import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { getClientIp, takeRateLimit } from '@/lib/rate-limit';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { enforceSameOrigin } from '@/lib/request-origin';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: Request) {
  try {
    const originError = enforceSameOrigin(request);
    if (originError) {
      return originError;
    }

    const body = await request.json();
    const { email, password } = body;

    const ip = getClientIp(request);
    const loginLimit = takeRateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
    if (!loginLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Create token
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email,
        name: admin.name,
        role: admin.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    const response = NextResponse.json({
      message: 'Login successful',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    response.headers.set('Cache-Control', 'no-store');

    await writeAuditLog({
      request,
      action: 'admin.login',
      resourceType: 'admin',
      resourceId: String(admin._id),
      admin: {
        id: String(admin._id),
        email: admin.email,
        role: admin.role,
      },
      metadata: { email: admin.email },
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS if needed
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
