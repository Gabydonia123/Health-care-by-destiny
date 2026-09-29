/**
 * Community Health Report System (CHRS) - Citizen Reports Full History View
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Eye,
  FileCheck,
  Filter,
  Hospital,
  MapPin,
  PlusCircle,
  Search,
} from 'lucide-react';
import { ReportDetailModal } from '../components/ReportDetailModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HealthReport, ReportStatusHistory } from '../types';

export const CitizenReportsView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportStatusHistory[]>([]);

  useEffect(() => {
    if (!authLoading) {
      loadReports();
    }
  }, [authLoading, isAuthenticated]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        setReports([]);
        return;
      }
      const res = await api.getCitizenReports();
      setReports(res.reports || []);
    } catch (err: any) {
      console.warn('Could not load reports:', err?.message || err);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReport = async (report: HealthReport) => {
    try {
      const details = await api.getCitizenReportDetails(report.id);
      setSelectedReport(details.report);
      setReportHistory(details.history || []);
    } catch {
      setSelectedReport(report);
      setReportHistory([]);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category_name && r.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.lga.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Health Reports Archive</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Chronological log of community health reports submitted under your national citizen profile.
          </p>
        </div>

        <button
          onClick={() => onNavigate('citizen-report')}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New Report</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference number (CHR-2026-...), category, disease, or LGA..."
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
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="VIEWED">VIEWED (Under Inspection)</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No matching reports found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or filing a new community health report.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => handleOpenReport(report)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {report.reference_no}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{report.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{report.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Hospital className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium text-slate-700">{report.facility_name || 'Assigned Facility'}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>{report.lga}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          history={reportHistory}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};
