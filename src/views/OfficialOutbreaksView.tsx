/**
 * Community Health Report System (CHRS) - Official Outbreak Clusters Investigation View
 */

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  MapPin,
  Send,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OutbreakCluster } from '../types';

export const OfficialOutbreaksView: React.FC = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [clusters, setClusters] = useState<OutbreakCluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status edit state
  const [selectedCluster, setSelectedCluster] = useState<OutbreakCluster | null>(null);
  const [newStatus, setNewStatus] = useState<string>('UNDER_INVESTIGATION');
  const [investigatorNotes, setInvestigatorNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && (user?.role === 'official' || user?.role === 'admin')) {
        loadClusters();
      } else {
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user?.role]);

  const loadClusters = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOfficialOutbreaks();
      setClusters(res.clusters || []);
    } catch (err: any) {
      console.warn('Notice loading outbreak clusters:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCluster = (cluster: OutbreakCluster) => {
    setSelectedCluster(cluster);
    setNewStatus(cluster.status);
    setInvestigatorNotes(cluster.investigator_notes || '');
    setSuccessMessage(null);
  };

  const handleUpdateCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCluster) return;

    setIsUpdating(true);
    setSuccessMessage(null);

    try {
      const res = await api.updateOutbreakStatus(selectedCluster.id, newStatus, investigatorNotes);
      setSuccessMessage('Cluster investigation status updated successfully.');
      setSelectedCluster(res.cluster);
      setClusters((prev) =>
        prev.map((c) => (c.id === res.cluster.id ? res.cluster : c))
      );
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'UNDER_INVESTIGATION':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'DISMISSED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Epidemiological Outbreak Clusters Surveillance</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Clusters automatically detected by the spatial-temporal algorithm (5km radius, 7 days, 5 verified reports).
        </p>
      </div>

      {/* Clusters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            onClick={() => handleOpenCluster(cluster)}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-red-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(cluster.status)}`}>
                  {cluster.status}
                </span>
                <span className="text-xs text-slate-400">
                  Detected: {new Date(cluster.created_at).toLocaleDateString('en-GB')}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{cluster.cluster_name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>
                    Centroid: {cluster.center_lat.toFixed(4)}, {cluster.center_lng.toFixed(4)} ({cluster.lga}, {cluster.state})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Verified Cases</span>
                  <span className="font-bold text-slate-900 text-sm">{cluster.report_count} cases</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Surveillance Radius</span>
                  <span className="font-bold text-slate-900 text-sm">{cluster.radius_km} km</span>
                </div>
              </div>

              {cluster.investigator_notes && (
                <p className="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 line-clamp-2">
                  <strong>Notes:</strong> {cluster.investigator_notes}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
              <span>Inspect Investigation Trail →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cluster Details / Update Modal */}
      {selectedCluster && (
        <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(selectedCluster.status)}`}>
                  {selectedCluster.status}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedCluster.cluster_name}</h3>
                <span className="text-xs text-slate-500">{selectedCluster.lga}, {selectedCluster.state}</span>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCluster} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cluster Epidemiological Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="DETECTED">DETECTED (Automated spatial threshold reached)</option>
                  <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION (Field epidemiology team active)</option>
                  {user?.role === 'admin' ? (
                    <option value="CONFIRMED">CONFIRMED (Active laboratory-confirmed epidemic outbreak)</option>
                  ) : (
                    <option value="CONFIRMED" disabled>
                      CONFIRMED (Restricted: Administrator Outbreak Approval Required)
                    </option>
                  )}
                  <option value="RESOLVED">RESOLVED (Transmission broken, incident concluded)</option>
                  <option value="DISMISSED">DISMISSED (False statistical anomaly / resolved naturally)</option>
                </select>
                {user?.role !== 'admin' && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Note: By system policy, only System Administrators can officially approve and declare a confirmed outbreak.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Field Investigation & Lab Findings
                </label>
                <textarea
                  value={investigatorNotes}
                  onChange={(e) => setInvestigatorNotes(e.target.value)}
                  rows={4}
                  placeholder="Record environmental inspection findings, borehole cultures, secondary contact tracking..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCluster(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Update Investigation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
