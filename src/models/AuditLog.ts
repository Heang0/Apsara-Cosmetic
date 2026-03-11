import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  resourceType: { type: String, required: true },
  resourceId: { type: String, default: '' },
  adminId: { type: String, default: '' },
  adminEmail: { type: String, default: '' },
  adminRole: { type: String, default: '' },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
