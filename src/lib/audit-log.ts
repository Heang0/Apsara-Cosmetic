import connectDB from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { getClientIp } from '@/lib/rate-limit';

interface AuditAdmin {
  id?: string;
  email?: string;
  role?: string;
}

interface AuditInput {
  request: Request;
  action: string;
  resourceType: string;
  resourceId?: string;
  admin?: AuditAdmin;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(input: AuditInput) {
  try {
    await connectDB();
    await AuditLog.create({
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId || '',
      adminId: input.admin?.id || '',
      adminEmail: input.admin?.email || '',
      adminRole: input.admin?.role || '',
      ip: getClientIp(input.request),
      userAgent: input.request.headers.get('user-agent') || '',
      metadata: input.metadata || {},
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
