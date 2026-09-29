/**
 * Community Health Report System (CHRS) - Admin Outbreak Engine Configuration View
 */

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  MapPin,
  RefreshCw,
  Save,
  Sliders,
} from 'lucide-react';
import { api } from '../services/api';
import { OutbreakCluster } from '../types';

export const AdminOutbreaksView: React.FC = () => {
  const [radiusKm, setRadiusKm] = useState('5.0');
  const [windowDays, setWindowDays] = useState('7');
  const [minReports, setMinReports] = useState('5');

  const [clusters, setClusters] = useState<OutbreakCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettingsAndClusters();
  }, []);

  const loadSettingsAndClusters = async () => {
    setIsLoading(true);
    try {
      const [settRes, outRes] = await Promise.all([
        api.getAdminSettings(),
        api.getAdminClusters(),
      ]);
      const s = settRes.settings || {};
      if (s.outbreak_radius_km) setRadiusKm(String(s.outbreak_radius_km));
      if (s.outbreak_time_window_days) setWindowDays(String(s.outbreak_time_window_days));
      if (s.outbreak_min_reports) setMinReports(String(s.outbreak_min_reports));
      setClusters(outRes.clusters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    try {
      await api.updateAdminOutbreakSettings({
        radius_km: Number(radiusKm),
        time_window_days: Number(windowDays),
        min_reports: Number(minReports),
      });
      setSuccessMessage('Algorithm parameters saved! Spatial cluster evaluation recalculated.');
      const outRes = await api.getAdminClusters();
      setClusters(outRes.clusters || []);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-red-600" />
          <span>Spatial-Temporal Outbreak Detection Engine</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Mathematical parameters utilized by the automated Haversine clustering algorithm to trigger epidemiological alert states.
        </p>
      </div>

      {/* Algorithm Config Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Sliders className="w-4 h-4 text-emerald-700" />
          <span>Epidemiological Threshold Configuration</span>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Surveillance Cluster Radius (km) *</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="50"
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              required
            />
            <span className="text-[11px] text-slate-400 block">Default: 5.0 km</span>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Sliding Temporal Window (days) *</label>
            <input
              type="number"
              min="1"
              max="90"
              value={windowDays}
              onChange={(e) => setWindowDays(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              required
            />
            <span className="text-[11px] text-slate-400 block">Default: 7 days</span>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Minimum Verified Reports (threshold) *</label>
            <input
              type="number"
              min="2"
              max="100"
              value={minReports}
              onChange={(e) => setMinReports(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              required
            />
            <span className="text-[11px] text-slate-400 block">Default: 5 verified reports</span>
          </div>

          <div className="sm:col-span-3 pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Recalculating...' : 'Update & Re-evaluate Outbreaks'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Detected Clusters Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Active Outbreak Clusters Registry ({clusters.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Cluster Name</th>
                <th className="py-3 px-4">Centroid Coordinates</th>
                <th className="py-3 px-4">Ward / LGA</th>
                <th className="py-3 px-4">Verified Reports</th>
                <th className="py-3 px-4">Radius</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Admin Outbreak Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {clusters.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.cluster_name}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {c.center_lat.toFixed(4)}, {c.center_lng.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4">{c.lga}, {c.state}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.report_count} cases</td>
                  <td className="py-3.5 px-4">{c.radius_km} km</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        c.status === 'CONFIRMED'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : c.status === 'UNDER_INVESTIGATION'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {c.status === 'CONFIRMED' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved by Admin
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          const note = prompt(`Enter administrative outbreak confirmation note for "${c.cluster_name}":`, 'Confirmed by Administrator following epidemiological verification.');
                          if (note !== null) {
                            try {
                              await api.approveAdminOutbreak(c.id, note);
                              const outRes = await api.getAdminClusters();
                              setClusters(outRes.clusters || []);
                              alert(`Outbreak "${c.cluster_name}" has been officially APPROVED and CONFIRMED.`);
                            } catch (err: any) {
                              alert(`Approval failed: ${err.message}`);
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        title="Only administrators can approve report of outbreak"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Outbreak</span>
                      </button>
                    )}
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
