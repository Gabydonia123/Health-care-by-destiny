/**
 * Community Health Report System (CHRS) - Official Surveillance Map View
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Eye,
  Filter,
  Hospital,
  Layers,
  MapPin,
  Maximize2,
  Radio,
  ShieldAlert,
} from 'lucide-react';
import { MapComponent } from '../components/MapComponent';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HealthFacility, HealthReport, OutbreakCluster, PublicAlert } from '../types';

export const OfficialMapView: React.FC = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [clusters, setClusters] = useState<OutbreakCluster[]>([]);
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && (user?.role === 'official' || user?.role === 'admin')) {
        loadMapSurveillance();
      } else {
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user?.role]);

  const loadMapSurveillance = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOfficialMapData();
      setReports(res.reports || []);
      setFacilities(res.facilities || []);
      setClusters(res.clusters || []);
      setAlerts(res.alerts || []);
    } catch (err: any) {
      console.warn('Notice loading official map data:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedReports = reports.filter((r) => {
    if (filterSeverity === 'VERIFIED_ONLY') return r.status === 'VERIFIED';
    if (filterSeverity === 'PENDING_ONLY') return r.status === 'SUBMITTED' || r.status === 'VIEWED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <span>High-Precision Epidemiological Surveillance Map</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full unmasked spatial coordinates, facility boundaries, and outbreak cluster polygons.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-semibold">Cases:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Reports ({reports.length})</option>
            <option value="VERIFIED_ONLY">Verified Only ({reports.filter((r) => r.status === 'VERIFIED').length})</option>
            <option value="PENDING_ONLY">Pending Triage</option>
          </select>
        </div>
      </div>

      {/* Map Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="h-[620px] rounded-xl overflow-hidden border border-slate-200">
          <MapComponent
            mode="surveillance"
            initialLat={6.5244}
            initialLng={3.3792}
            zoom={12}
            height="100%"
            facilities={facilities}
            reports={displayedReports}
            clusters={clusters}
            alerts={alerts}
          />
        </div>
      </div>
    </div>
  );
};
