'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon, FunnelIcon, ClockIcon } from '@heroicons/react/24/outline';

interface AuditLogEntry {
  _id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  adminEmail?: string;
  adminRole?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const actionOptions = [
  '',
  'admin.login',
  'admin.register',
  'product.create',
  'product.update',
  'product.delete',
  'category.create',
  'category.update',
  'category.delete',
  'order.update',
];

const resourceOptions = ['', 'admin', 'product', 'category', 'order'];

export default function AuditPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  useEffect(() => {
    void fetchLogs();
  }, [actionFilter, resourceFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter) {
        params.set('action', actionFilter);
      }
      if (resourceFilter) {
        params.set('resourceType', resourceFilter);
      }
      params.set('limit', '150');

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        cache: 'no-store'
      });

      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Audit fetch error:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    return {
      total: logs.length,
      admin: logs.filter((log) => log.resourceType === 'admin').length,
      changes: logs.filter((log) => ['product', 'category', 'order'].includes(log.resourceType)).length,
    };
  }, [logs]);

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMetadata = (metadata?: Record<string, unknown>) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return 'No metadata';
    }

    return Object.entries(metadata)
      .slice(0, 4)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(' | ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Track admin logins and sensitive changes across the dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <ShieldCheckIcon className="w-6 h-6 text-gray-500" />
            <span className="text-2xl font-bold text-gray-900">{counts.total}</span>
          </div>
          <p className="mt-3 text-sm font-medium text-gray-700">Visible events</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <ClockIcon className="w-6 h-6 text-gray-500" />
            <span className="text-2xl font-bold text-gray-900">{counts.admin}</span>
          </div>
          <p className="mt-3 text-sm font-medium text-gray-700">Admin auth events</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <FunnelIcon className="w-6 h-6 text-gray-500" />
            <span className="text-2xl font-bold text-gray-900">{counts.changes}</span>
          </div>
          <p className="mt-3 text-sm font-medium text-gray-700">Data change events</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {actionOptions.map((action) => (
              <option key={action || 'all'} value={action}>
                {action || 'All actions'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Resource</label>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {resourceOptions.map((resource) => (
              <option key={resource || 'all'} value={resource}>
                {resource || 'All resources'}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setActionFilter('');
              setResourceFilter('');
            }}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">IP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">Loading audit logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No audit logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-4 text-sm text-gray-600">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div>{log.resourceType}</div>
                      <div className="text-xs text-gray-400">{log.resourceId || '-'}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div>{log.adminEmail || '-'}</div>
                      <div className="text-xs text-gray-400">{log.adminRole || '-'}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{log.ip || '-'}</td>
                    <td className="px-4 py-4 text-xs text-gray-500">{formatMetadata(log.metadata)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
