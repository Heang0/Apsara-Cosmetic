import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const adminAuth = verifyAdminRequest(request);
  if (!adminAuth.ok) {
    return adminAuth.response;
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const action = String(searchParams.get('action') || '').trim();
    const resourceType = String(searchParams.get('resourceType') || '').trim();
    const limitRaw = Number(searchParams.get('limit') || 100);
    const limit = Math.max(1, Math.min(200, Number.isFinite(limitRaw) ? limitRaw : 100));

    const query: Record<string, unknown> = {};
    if (action) {
      query.action = action;
    }
    if (resourceType) {
      query.resourceType = resourceType;
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(logs.map((log: any) => ({
      ...log,
      _id: String(log._id),
    })));
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
