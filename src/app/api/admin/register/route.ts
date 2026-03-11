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

    if (process.env.ENABLE_ADMIN_REGISTRATION !== 'true') {
      return NextResponse.json(
        { error: 'Admin registration is disabled' },
        { status: 403 }
      );
    }

    const ip = getClientIp(request);
    const registerLimit = takeRateLimit(`admin-register:${ip}`, 3, 60 * 60 * 1000);
    if (!registerLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, password, name } = await request.json();

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();
    const cleanPassword = String(password || '');

    // Validate input
    if (!cleanEmail || !cleanPassword || !cleanName) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 10) {
      return NextResponse.json(
        { error: 'Password must be at least 10 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: cleanEmail });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 400 }
      );
    }

    // Create new admin
    const admin = await Admin.create({
      email: cleanEmail,
      password: cleanPassword,
      name: cleanName,
      role: 'admin', // Default role for new admins
    });

    // Create token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      message: 'Admin created successfully',
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
      action: 'admin.register',
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}
