/**
 * Community Health Report System (CHRS) - Official Reports Management & Clinical Verification
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  Filter,
  Hospital,
  MapPin,
  Phone,
  Search,
  Send,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HealthReport, OutbreakCluster, ReportStatusHistory } from '../types';

export const OfficialReportsView: React.FC<{ selectedReportId?: string | null }> = ({
  selectedReportId,
}) => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active Report Modal
  const [activeReport, setActiveReport] = useState<HealthReport | null>(null);
  const [activeHistory, setActiveHistory] = useState<ReportStatusHistory[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string>('VERIFIED');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState<boolean>(false);
  const [outbreakBanner, setOutbreakBanner] = useState<OutbreakCluster | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && (user?.role === 'official' || user?.role === 'admin')) {
        loadAssignedReports();
      } else {
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user?.role]);

  useEffect(() => {
    if (selectedReportId) {
      handleInspectReport(selectedReportId);
    }
  }, [selectedReportId]);

  const loadAssignedReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOfficialAssignedReports();
      setReports(res.reports || []);
    } catch (err: any) {
      console.warn('Notice loading assigned reports:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspectReport = async (reportId: string) => {
    setActionSuccess(null);
    setOutbreakBanner(null);
    try {
      // Backend automatically updates status to "VIEWED" and notifies citizen if currently SUBMITTED
      const res = await api.getOfficialReportDetails(reportId);
      setActiveReport(res.report);
      setActiveHistory(res.history || []);
      setUpdatingStatus(res.report.status === 'SUBMITTED' ? 'VERIFIED' : res.report.status);
      setClinicalNotes('');

      // Refresh table list
      setReports((prev) =>
        prev.map((r) => (r.id === res.report.id ? res.report : r))
      );
    } catch (err: any) {
      console.warn('Notice inspecting report details:', err?.message || err);
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    setIsSubmittingUpdate(true);
    setActionSuccess(null);
    setOutbreakBanner(null);

    try {
      const res = await api.updateReportStatus(
        activeReport.id,
        updatingStatus,
        clinicalNotes || `Clinical status updated to ${updatingStatus}`
      );

      setActiveReport(res.report);
      setActionSuccess(`Report status successfully updated to ${updatingStatus}.`);

      if (res.outbreakDetected) {
        setOutbreakBanner(res.outbreakDetected);
      }

      // Refresh history & list
      const details = await api.getOfficialReportDetails(activeReport.id);
      setActiveHistory(details.history || []);
      setReports((prev) =>
        prev.map((r) => (r.id === res.report.id ? res.report : r))
      );
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.lga.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category_name && r.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'VIEWED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'RESOLVED':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-emerald-700" />
          <span>Assigned Surveillance Cases & Verification Triage</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Health officials review citizen reports, confirm lab diagnoses, update case status, and trigger spatial cluster detection.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assigned cases by Reference (CHR-2026-...), category, or LGA..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 w-full sm:w-auto"
          >
            <option value="ALL">All Statuses ({reports.length})</option>
            <option value="SUBMITTED">SUBMITTED (Unopened)</option>
            <option value="VIEWED">VIEWED</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Title / Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Affected</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Lodged Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No cases match the current filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {r.reference_no}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{r.title}</div>
                      <div className="text-[11px] text-slate-400">{r.category_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {r.lga}, {r.state}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {r.affected_count}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(r.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleInspectReport(r.id)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-xs transition cursor-pointer"
                      >
                        Inspect & Triage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Inspection & Verification Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">
                    {activeReport.reference_no}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getStatusColor(activeReport.status)}`}>
                    {activeReport.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold">{activeReport.title}</h2>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Outbreak Trigger Notification if detected! */}
              {outbreakBanner && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 animate-bounce">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-900 text-sm">
                        EPIDEMIOLOGICAL OUTBREAK CLUSTER DETECTED!
                      </h4>
                      <p className="text-xs text-red-800 mt-1">
                        Spatial algorithm identified <strong>{outbreakBanner.report_count} verified cases</strong> within 5km radius in {outbreakBanner.lga}, {outbreakBanner.state}.
                        Cluster <strong>{outbreakBanner.cluster_name}</strong> has been created with status <strong>DETECTED</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {actionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Citizen Information & Location Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Reporting Citizen (Authorized Official View)</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>{activeReport.citizen_name || 'Registered Citizen'}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{activeReport.citizen_phone || 'Confidential Surveillance Registry'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-medium block">High-Accuracy Geographic Coordinates</span>
                  <div className="font-mono text-xs text-slate-800 font-bold mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>Lat: {activeReport.latitude.toFixed(6)}, Lng: {activeReport.longitude.toFixed(6)}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Ward / Landmark: {activeReport.location_name} ({activeReport.lga})
                  </div>
                </div>
              </div>

              {/* Reported Observation */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Citizen Health Observation
                </h4>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed text-xs">
                  {activeReport.description}
                </p>
              </div>

              {/* Symptoms & Affected */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Symptoms & Affected Count
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {activeReport.symptoms?.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md font-medium"
                    >
                      • {s}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-slate-600">
                  Total Affected Persons: <strong>{activeReport.affected_count}</strong>
                </div>
              </div>

              {/* Image Evidence */}
              {activeReport.image_url && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Attached Evidence / Specimen Photograph
                  </h4>
                  <img
                    src={activeReport.image_url}
                    alt="Report Evidence"
                    className="max-h-60 rounded-xl border border-slate-200 object-cover"
                  />
                </div>
              )}

              {/* Verification & Action Form */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-700" />
                  <span>Surveillance Officer Action & Clinical Triage</span>
                </h4>

                <form onSubmit={handleSaveStatus} className="space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Update Case Verification Status *
                    </label>
                    <select
                      value={updatingStatus}
                      onChange={(e) => setUpdatingStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
                    >
                      <option value="VIEWED">VIEWED (Opened, undergoing clinical assessment)</option>
                      <option value="VERIFIED">VERIFIED (Confirmed epidemiological case - Triggers Outbreak Algorithm!)</option>
                      <option value="IN_PROGRESS">IN_PROGRESS (Field team deployed to location)</option>
                      <option value="RESOLVED">RESOLVED (Decontamination / medical response concluded)</option>
                      <option value="REJECTED">REJECTED (Unsubstantiated / false alarm / non-infectious)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinical Notes & Epidemiological Rationale
                    </label>
                    <textarea
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      rows={3}
                      placeholder="e.g. Stool culture positive for Vibrio cholerae O1. Contact tracing initiated with community leaders in ward."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingUpdate}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingUpdate ? 'Processing Verification...' : 'Save & Broadcast Status'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Status History Timeline */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Audit Trail & Progression History</span>
                </h4>
                <div className="relative border-l-2 border-emerald-200 ml-3 space-y-3 py-1">
                  {activeHistory.map((hist, idx) => (
                    <div key={hist.id || idx} className="relative pl-6 text-xs">
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{hist.status}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(hist.created_at).toLocaleString('en-GB')}
                        </span>
                      </div>
                      {hist.notes && (
                        <p className="text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                          {hist.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveReport(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Close Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
