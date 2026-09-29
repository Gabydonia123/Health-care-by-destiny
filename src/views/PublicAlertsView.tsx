/**
 * Community Health Report System (CHRS) - Public Health Advisories View
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Radio,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { PublicAlert } from '../types';

export const PublicAlertsView: React.FC<{ onNavigate?: (view: string) => void }> = () => {
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAlerts().then((res) => {
      setAlerts(res.alerts || []);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ADVISORY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-emerald-950 rounded-2xl text-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Federal Health Surveillance Broadcasts</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">Public Health Advisories & Outbreak Bulletins</h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
          Official health protection advisories authorized by certified Medical Surveillance Officers and local healthcare authorities.
        </p>
      </div>

      {/* Advisories Grid */}
      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No active public emergency alerts</h3>
          <p className="text-xs text-slate-500 mt-1">
            Epidemiological surveillance is normal in all monitored local government wards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity} ALERT
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{alert.affected_area}, {alert.state}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{alert.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {alert.message}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Effective: {alert.start_date} to {alert.expiry_date}</span>
                </div>
                <span className="text-emerald-700 font-semibold">Active Bulletin</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* General Health Safety Guidance */}
      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 text-xs space-y-3 text-emerald-950">
        <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-800" />
          <span>Essential Community Health Preventive Protocols</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg border border-emerald-100">
            <strong>Safe Drinking Water:</strong> Boil all borehole or stream water for at least 3 minutes or treat with water purification tablets before drinking.
          </div>
          <div className="bg-white p-3 rounded-lg border border-emerald-100">
            <strong>Early Rehydration:</strong> Administer Oral Rehydration Salts (ORS) at the first onset of watery diarrhoea and notify your nearest Primary Healthcare Centre.
          </div>
          <div className="bg-white p-3 rounded-lg border border-emerald-100">
            <strong>Hand Hygiene:</strong> Wash hands thoroughly with soap under running water before meal preparation and after visiting public spaces.
          </div>
        </div>
      </div>
    </div>
  );
};
