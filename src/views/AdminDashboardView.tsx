/**
 * Community Health Report System (CHRS) - Admin Dashboard View
 */

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  Hospital,
  Lock,
  Radio,
  Settings,
  Shield,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { api } from '../services/api';

interface AdminDashboardViewProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminMetrics();
      setMetrics(res.metrics || {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Admin Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-purple-900/40">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Federal Surveillance Directorate</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">National System Administration Console</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Centralized governance for facility accreditation, medical personnel assignment, epidemiological algorithms, and automated AI assistance.
          </p>
        </div>

        <button
          onClick={() => onNavigate('admin-ai-assistant')}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Cpu className="w-5 h-5 text-slate-950" />
          <span>Launch AI Assistant</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Total Community Reports</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>{metrics?.totalReports || 0}</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {metrics?.verifiedReports || 0} Verified • {metrics?.pendingReviewReports || 0} Pending
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Health Facilities</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Hospital className="w-5 h-5 text-emerald-600" />
            <span>{metrics?.totalFacilities || 0}</span>
          </div>
          <span className="text-[11px] text-emerald-700 block mt-1">
            {metrics?.approvedFacilities || 0} Approved • {metrics?.pendingFacilities || 0} Pending Accreditation
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Active Outbreak Clusters</span>
          <div className="text-2xl font-bold text-red-700 mt-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>{metrics?.activeClusters || 0}</span>
          </div>
          <span className="text-[11px] text-red-600 block mt-1">Spatial threshold met</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Surveillance Personnel</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>{metrics?.totalOfficials || 0}</span>
          </div>
          <span className="text-[11px] text-purple-700 block mt-1">
            {metrics?.totalCitizens || 0} Registered Citizens
          </span>
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* AI Assistant Card */}
        <div
          onClick={() => onNavigate('admin-ai-assistant')}
          className="bg-white p-5 rounded-2xl border-2 border-amber-300 hover:border-amber-500 transition cursor-pointer shadow-sm flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold mb-3">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">AI Administration Assistant</h3>
            <p className="text-xs text-slate-500 mt-1">
              Natural language command interface for managing locations, configuring outbreak thresholds, updating facilities, and reviewing audit logs with confirmation safety gates.
            </p>
          </div>
          <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
            <span>Open AI Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Facilities Accreditation */}
        <div
          onClick={() => onNavigate('admin-facilities')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 transition cursor-pointer shadow-2xs flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
              <Hospital className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Facility Accreditation</h3>
            <p className="text-xs text-slate-500 mt-1">
              Review submitted medical licenses, verify coordinates, approve accreditation, and toggle active status for case routing.
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
            <span>Manage Facilities ({metrics?.pendingFacilities || 0} Pending)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Outbreak Algorithm & Official Approval */}
        <div
          onClick={() => onNavigate('admin-outbreaks')}
          className="bg-white p-5 rounded-2xl border-2 border-red-200 hover:border-red-500 transition cursor-pointer shadow-2xs flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-900">Outbreak Approvals & Detection</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-800 rounded uppercase">
                Admin Exclusive
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Officially approve and declare confirmed outbreaks from spatial clusters, set Haversine distance radiuses, and trigger national alerts.
            </p>
          </div>
          <span className="text-xs text-red-700 font-bold flex items-center gap-1">
            <span>Review & Approve Outbreaks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* System Admin Accounts Management (Requirement 9) */}
        <div
          onClick={() => onNavigate('admin-admins')}
          className="bg-white p-5 rounded-2xl border-2 border-purple-200 hover:border-purple-600 transition cursor-pointer shadow-2xs flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-900">Administrator Accounts</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded uppercase">
                Internal Only
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Authorized creation of new administrative personnel. Additional admin accounts can strictly only be created from within this dashboard.
            </p>
          </div>
          <span className="text-xs text-purple-700 font-bold flex items-center gap-1">
            <span>Manage Administrator Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Surveillance Officials */}
        <div
          onClick={() => onNavigate('admin-officials')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-500 transition cursor-pointer shadow-2xs flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Health Officials Management</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create and assign Medical Officers to accredited Primary Healthcare Centres and hospitals.
            </p>
          </div>
          <span className="text-xs text-blue-700 font-bold flex items-center gap-1">
            <span>Manage Officials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Audit Logs */}
        <div
          onClick={() => onNavigate('admin-audit-logs')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-500 transition cursor-pointer shadow-2xs flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Audit Trails & Security Logs</h3>
            <p className="text-xs text-slate-500 mt-1">
              Immutable chronological record of administrative actions, AI-executed tools, setting changes, and case verifications.
            </p>
          </div>
          <span className="text-xs text-purple-700 font-bold flex items-center gap-1">
            <span>View Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* System Settings */}
        <div
          onClick={() => onNavigate('admin-settings')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-400 transition cursor-pointer shadow-2xs flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold mb-3">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Operational Locations & Settings</h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure available states and LGAs, national emergency alert messages, and default routing rules.
            </p>
          </div>
          <span className="text-xs text-slate-700 font-bold flex items-center gap-1">
            <span>Configure Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
