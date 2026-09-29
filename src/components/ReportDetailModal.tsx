/**
 * Community Health Report System (CHRS) - Report Detail & Timeline Modal
 */

import React from 'react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MapPin,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { HealthReport, ReportStatusHistory } from '../types';

interface ReportDetailModalProps {
  report: HealthReport;
  history?: ReportStatusHistory[];
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  history = [],
  onClose,
}) => {
  const getStatusBadge = (status: string) => {
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
    <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs bg-emerald-950/80 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700">
                {report.reference_no}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(report.status)}`}>
                {report.status}
              </span>
            </div>
            <h2 className="text-lg font-bold">{report.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Facility & Location info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Assigned Health Facility</span>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>{report.facility_name || 'Primary Healthcare Centre'}</span>
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                Jurisdiction: {report.lga}, {report.state}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium block">Report Coordinates</span>
              <div className="font-mono text-xs text-slate-700 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</span>
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                Location: {report.location_name || 'Community zone'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reported Observation
            </h4>
            <p className="text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* Symptoms & Affected */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reported Symptoms & Impact
            </h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {report.symptoms && report.symptoms.length > 0 ? (
                report.symptoms.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-medium"
                  >
                    • {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No specific symptoms recorded</span>
              )}
            </div>
            <div className="text-xs text-slate-600">
              Reported Affected Count: <strong className="text-slate-900">{report.affected_count} person(s)</strong>
            </div>
          </div>

          {/* Image preview */}
          {report.image_url && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Attached Photograph / Evidence
              </h4>
              <img
                src={report.image_url}
                alt="Report evidence"
                className="max-h-60 rounded-xl border border-slate-200 object-cover shadow-xs"
              />
            </div>
          )}

          {/* Chronological Status Progression Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Surveillance Verification Timeline</span>
            </h4>

            <div className="relative border-l-2 border-emerald-200 ml-3 space-y-4 py-1">
              {history.length > 0 ? (
                history.map((hist, idx) => (
                  <div key={hist.id || idx} className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-100 flex items-center justify-center text-white text-[8px]">
                      ✓
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{hist.status}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(hist.created_at).toLocaleString('en-GB')}
                      </span>
                    </div>
                    {hist.notes && (
                      <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                        {hist.notes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white" />
                  <div className="text-xs font-bold text-slate-800">SUBMITTED</div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(report.created_at).toLocaleString('en-GB')}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Report lodged into surveillance database. Pending verification by official.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
