/**
 * Community Health Report System (CHRS) - Admin Audit Logs View
 */

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Filter,
  Lock,
  Search,
  Shield,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminAuditLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.target_entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.target_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(l.details || {}).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-700" />
          <span>System Audit Trail & Security Event Logs</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Immutable cryptographic and chronological record of all administrative operations, AI Assistant executions, and clinical status changes.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit logs by action, user name, target entity, or details..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Operation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-GB')}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{log.user_name || 'System / AI'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.user_id ? log.user_id.slice(0, 8) + '...' : 'SYSTEM'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-semibold text-[11px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    <div>{log.target_entity}</div>
                    {log.target_id && (
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                        {log.target_id}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <pre className="text-[10px] font-mono text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 overflow-x-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(log.details || {}, null, 1)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
