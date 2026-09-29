/**
 * Community Health Report System (CHRS) - Official Dashboard View
 */

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Hospital,
  MapPin,
  Radio,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HealthFacility, HealthReport, OutbreakCluster } from '../types';

interface OfficialDashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenReport: (reportId: string) => void;
}

export const OfficialDashboardView: React.FC<OfficialDashboardViewProps> = ({
  onNavigate,
  onOpenReport,
}) => {
  const { user, official, isLoading: authLoading, isAuthenticated } = useAuth();
  const [facility, setFacility] = useState<HealthFacility | null>(null);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [clusters, setClusters] = useState<OutbreakCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && (user?.role === 'official' || user?.role === 'admin')) {
        loadOfficialData();
      } else {
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user?.role]);

  const loadOfficialData = async () => {
    setIsLoading(true);
    try {
      const [repData, outData] = await Promise.all([
        api.getOfficialAssignedReports().catch(() => ({ facility: null, reports: [] })),
        api.getOfficialOutbreaks().catch(() => ({ clusters: [] })),
      ]);
      setFacility(repData.facility || null);
      setReports(repData.reports || []);
      setClusters(outData.clusters || []);
    } catch (err: any) {
      console.warn('Notice loading official data:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingCount = reports.filter((r) => r.status === 'SUBMITTED' || r.status === 'PENDING_REVIEW').length;
  const verifiedCount = reports.filter((r) => r.status === 'VERIFIED').length;
  const inProgressCount = reports.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'VIEWED').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Official Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 rounded-2xl text-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>Health Surveillance & Epidemiological Station</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Officer {user?.name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 flex items-center gap-2">
            <span>Cadre: <strong>{official?.cadre || 'Surveillance Officer'}</strong></span>
            <span>•</span>
            <span>License: <strong className="font-mono">{official?.license_number}</strong></span>
          </p>
        </div>

        {facility && (
          <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl text-left text-xs max-w-sm">
            <div className="text-emerald-300 font-semibold flex items-center gap-1.5 mb-1">
              <Hospital className="w-4 h-4" />
              <span>Assigned Surveillance Station:</span>
            </div>
            <div className="font-bold text-white text-sm">{facility.name}</div>
            <div className="text-slate-300">{facility.address}, {facility.lga}</div>
          </div>
        )}
      </div>

      {/* Surveillance Case Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Pending Case Review</span>
          <div className="text-2xl font-bold text-amber-700 mt-1 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>{pendingCount}</span>
          </div>
          <span className="text-[11px] text-amber-600 block mt-1">Requires immediate triage</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Under Inspection</span>
          <div className="text-2xl font-bold text-blue-700 mt-1 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span>{inProgressCount}</span>
          </div>
          <span className="text-[11px] text-blue-600 block mt-1">Viewed / in clinical triage</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Verified Epidemiological Cases</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{verifiedCount}</span>
          </div>
          <span className="text-[11px] text-emerald-600 block mt-1">Outbreak algorithm active</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Active Clusters in Ward</span>
          <div className="text-2xl font-bold text-red-700 mt-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>{clusters.filter((c) => c.status !== 'DISMISSED').length}</span>
          </div>
          <span className="text-[11px] text-red-600 block mt-1">Spatial threshold met</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incoming Assigned Reports Queue */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Station Health Report Queue</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reports automatically geo-routed by proximity to {facility?.name || 'this facility'}.
              </p>
            </div>

            <button
              onClick={() => onNavigate('official-reports')}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No active cases in queue</p>
              <p className="text-xs text-slate-500 mt-0.5">Your facility queue is currently up to date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  onClick={() => onOpenReport(r.id)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {r.reference_no}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          r.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : r.status === 'VIEWED'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {r.status}
                      </span>
                      {r.status === 'SUBMITTED' && (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          NEW
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{r.description}</p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                      <span>Affected: <strong>{r.affected_count}</strong></span>
                      <span>•</span>
                      <span>Area: {r.lga}</span>
                      <span>•</span>
                      <span>Lodged: {new Date(r.created_at).toLocaleString('en-GB')}</span>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition flex items-center gap-1 flex-shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Surveillance Actions & Active Cluster Alert */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Surveillance Quick Actions
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('official-map')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Station Surveillance Map</div>
                    <div className="text-[11px] text-slate-500">Unmasked report coordinates</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('official-outbreaks')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Investigate Clusters</div>
                    <div className="text-[11px] text-slate-500">Threshold alerts & field reviews</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('official-alerts')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/50 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Issue Public Health Alert</div>
                    <div className="text-[11px] text-slate-500">Emergency public broadcast</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Outbreak Status Box */}
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5 space-y-2 text-xs text-red-950">
            <div className="flex items-center gap-2 font-bold text-red-900">
              <AlertCircle className="w-4 h-4 text-red-700" />
              <span>Epidemiological Alert Protocol</span>
            </div>
            <p className="text-red-800 leading-relaxed">
              When you verify cases, the system's spatial-temporal algorithm checks within a <strong>5 km radius</strong> over a <strong>7-day window</strong>. If 5 or more verified reports coincide, an automated outbreak cluster will be created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
