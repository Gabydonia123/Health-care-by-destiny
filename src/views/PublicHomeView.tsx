/**
 * Community Health Report System (CHRS) - Public Home & Surveillance Map View
 */

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck,
  Hospital,
  MapPin,
  Radio,
  Shield,
  Users,
} from 'lucide-react';
import { MapComponent } from '../components/MapComponent';
import { api } from '../services/api';
import { HealthFacility, OutbreakCluster, PublicAlert } from '../types';

interface PublicHomeViewProps {
  onNavigate: (view: string) => void;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [clusters, setClusters] = useState<OutbreakCluster[]>([]);
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [emergencyMessage, setEmergencyMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPublicMapData().catch(() => ({ reports: [], facilities: [], clusters: [], alerts: [] })),
      api.getPublicSettings().catch(() => ({ available_states: [], emergency_message: '' })),
    ])
      .then(([mapData, settings]) => {
        setReports(mapData.reports || []);
        setFacilities(mapData.facilities || []);
        setClusters(mapData.clusters || []);
        setAlerts(mapData.alerts || []);
        if (settings.emergency_message) {
          setEmergencyMessage(settings.emergency_message);
        }
      })
      .catch((err) => console.warn('Public home data notice:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      {/* Emergency Alert Banner if broadcasted by health authorities */}
      {emergencyMessage && (
        <div className="bg-amber-500 text-amber-950 px-4 py-3 rounded-xl border border-amber-600 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Radio className="w-5 h-5 animate-pulse text-amber-950" />
            <span>FEDERAL EPIDEMIOLOGICAL BROADCAST: {emergencyMessage}</span>
          </div>
          <button
            onClick={() => onNavigate('public-alerts')}
            className="text-xs bg-amber-900 text-white font-bold px-3 py-1 rounded-md hover:bg-amber-800 transition whitespace-nowrap cursor-pointer"
          >
            View Advisories
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-lg overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-700/80 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Real-time Nigerian Public Health Surveillance
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Early Warning & Community Health Reporting System
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Empowering Nigerian communities to report suspected outbreaks of cholera, febrile illnesses, and environmental health hazards. All reports are automatically geo-routed via the Haversine algorithm to the nearest accredited government health facility.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('citizen-report')}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-slate-950" />
              <span>Submit Health Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('citizen-login')}
              className="px-5 py-3 bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition border border-emerald-600/60 cursor-pointer"
            >
              Citizen Sign In
            </button>

            <button
              onClick={() => onNavigate('facility-register')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-emerald-100 font-medium text-xs sm:text-sm rounded-xl transition border border-white/20 cursor-pointer"
            >
              Accredit a Health Facility
            </button>
          </div>
        </div>

        {/* Decorative background shield */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-10 pointer-events-none">
          <Shield className="w-full h-full text-white" />
        </div>
      </div>

      {/* Surveillance Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Approved Health Facilities</span>
          <div className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <Hospital className="w-5 h-5 text-emerald-600" />
            <span>{facilities.length}</span>
          </div>
          <span className="text-[11px] text-emerald-700 block mt-1">Lagos, Abuja FCT, Edo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Community Reports Monitored</span>
          <div className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>{reports.length}</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Geo-spatial verification</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Active Outbreak Clusters</span>
          <div className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>{clusters.filter((c) => c.status !== 'DISMISSED').length}</span>
          </div>
          <span className="text-[11px] text-amber-700 block mt-1">Surveillance investigated</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Active Health Advisories</span>
          <div className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-600" />
            <span>{alerts.length}</span>
          </div>
          <span className="text-[11px] text-red-700 block mt-1">Official NCDC/MOH alerts</span>
        </div>
      </div>

      {/* Interactive Public Surveillance Map */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>National Epidemiological Surveillance Map</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Approximate public report coordinates, accredited government healthcare centres, and detected outbreak zones.
            </p>
          </div>
          <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
            🔒 Citizen Identifiers & Exact Coordinates Anonymized
          </span>
        </div>

        <div className="h-[460px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
          <MapComponent
            mode="surveillance"
            initialLat={6.5244}
            initialLng={3.3792}
            zoom={11}
            height="100%"
            facilities={facilities}
            reports={reports}
            clusters={clusters}
            alerts={alerts}
          />
        </div>
      </div>

      {/* Public Health Alerts Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Health Advisories & Alerts</h3>
            <p className="text-xs text-slate-500">Issued by verified Medical Surveillance Officers</p>
          </div>
          <button
            onClick={() => onNavigate('public-alerts')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Advisories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.slice(0, 2).map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  alert.severity === 'EMERGENCY'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {alert.severity}
                </span>
                <span className="text-[11px] text-slate-400">Area: {alert.affected_area}, {alert.state}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800">{alert.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
