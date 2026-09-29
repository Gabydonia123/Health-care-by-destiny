/**
 * Community Health Report System (CHRS) - Citizen Dashboard View
 */

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Hospital,
  MapPin,
  PlusCircle,
  ShieldCheck,
  User,
} from 'lucide-react';
import { MapComponent } from '../components/MapComponent';
import { ReportDetailModal } from '../components/ReportDetailModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HealthFacility, HealthReport, ReportStatusHistory } from '../types';

interface CitizenDashboardViewProps {
  onNavigate: (view: string) => void;
}

export const CitizenDashboardView: React.FC<CitizenDashboardViewProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected report modal
  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportStatusHistory[]>([]);

  useEffect(() => {
    if (!authLoading) {
      loadCitizenData();
    }
  }, [authLoading, isAuthenticated]);

  const loadCitizenData = async () => {
    setIsLoading(true);
    try {
      const facPromise = api.getFacilities().catch(() => ({ facilities: [] }));
      const repPromise = isAuthenticated
        ? api.getCitizenReports().catch((err: any) => {
            console.warn('Could not fetch citizen reports:', err?.message || err);
            return { reports: [] };
          })
        : Promise.resolve({ reports: [] });

      const [repData, facData] = await Promise.all([repPromise, facPromise]);
      setReports(repData.reports || []);
      setFacilities(facData.facilities || []);
    } catch (err: any) {
      console.warn('Notice loading citizen data:', err?.message || err);
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
      {/* Citizen Welcome Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl text-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Community Health Surveillance Sentinel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Welcome, {user?.name || 'Citizen'}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            You can report suspected communicable health conditions, track investigation timelines by surveillance officers, and view public health advisories for your area.
          </p>
        </div>

        <button
          onClick={() => onNavigate('citizen-report')}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Submit New Report</span>
        </button>
      </div>

      {/* Quick Action & Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('citizen-reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-500 transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Submitted Reports</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{reports.length}</div>
            <span className="text-xs text-emerald-700 font-semibold block mt-1 flex items-center gap-1">
              <span>View report history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('citizen-notifications')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-500 transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-slate-500 font-medium block">Notifications & Status Updates</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">Live</div>
            <span className="text-xs text-emerald-700 font-semibold block mt-1 flex items-center gap-1">
              <span>Check alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('public-alerts')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-500 transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-slate-500 font-medium block">Official Health Advisories</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">Active</div>
            <span className="text-xs text-emerald-700 font-semibold block mt-1 flex items-center gap-1">
              <span>View advisories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Reports Table & Local Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Reports List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>My Submitted Health Reports</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of investigations conducted by assigned healthcare facilities.
              </p>
            </div>
            <button
              onClick={() => onNavigate('citizen-report')}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              + Log New Case
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
              <FileCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No health reports filed yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                If you observe contaminated water sources, fever, or unusual community sickness, click below to report it.
              </p>
              <button
                onClick={() => onNavigate('citizen-report')}
                className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
              >
                File First Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleOpenReport(report)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {report.reference_no}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Hospital className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{report.facility_name || 'Assigned PHC'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{report.lga}, {report.state}</span>
                      </span>
                      <span>• {new Date(report.created_at).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>

                  <button className="text-xs text-slate-400 hover:text-emerald-700 p-1.5 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Local Surveillance & Accredited Health Clinics */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Hospital className="w-4 h-4 text-emerald-700" />
              <span>Accredited Primary Healthcare Facilities</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Approved centers equipped with epidemiological verification capabilities.
            </p>
          </div>

          <div className="h-56 rounded-xl overflow-hidden border border-slate-200">
            <MapComponent
              mode="surveillance"
              initialLat={6.5244}
              initialLng={3.3792}
              zoom={11}
              height="100%"
              facilities={facilities}
              reports={reports}
              showLegend={false}
            />
          </div>

          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {facilities.slice(0, 3).map((f) => (
              <div key={f.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{f.name}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                    APPROVED
                  </span>
                </div>
                <div className="text-slate-500">{f.address}, {f.lga}</div>
                <div className="text-emerald-700 font-medium">📞 {f.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
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
