/**
 * Community Health Report System (CHRS) - Citizen Map & Location Finder
 * 
 * Complies with requirement: "integrated map into the website for easy location finder"
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Compass,
  Hospital,
  Locate,
  MapPin,
  Navigation,
  Phone,
  PlusCircle,
  Search,
} from 'lucide-react';
import { MapComponent } from '../components/MapComponent';
import { api } from '../services/api';
import { HealthFacility } from '../types';

interface CitizenMapViewProps {
  onNavigate: (view: string, reportLocation?: { lat: number; lng: number }) => void;
}

export const CitizenMapView: React.FC<CitizenMapViewProps> = ({ onNavigate }) => {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [closestFacility, setClosestFacility] = useState<{
    facility: HealthFacility;
    distanceKm: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const [facData, alertData] = await Promise.all([
        api.getFacilities().catch(() => ({ facilities: [] })),
        api.getAlerts().catch(() => ({ alerts: [] })),
      ]);
      setFacilities(facData.facilities || []);
      setAlerts(alertData.alerts || []);
    } catch (err: any) {
      console.warn('Notice loading map data:', err?.message || err);
    }
  };

  // Haversine distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocating(false);

        // Find closest facility
        if (facilities.length > 0) {
          let closest = facilities[0];
          let minDistance = calculateDistance(coords.lat, coords.lng, closest.latitude, closest.longitude);

          for (let i = 1; i < facilities.length; i++) {
            const d = calculateDistance(coords.lat, coords.lng, facilities[i].latitude, facilities[i].longitude);
            if (d < minDistance) {
              minDistance = d;
              closest = facilities[i];
            }
          }

          setClosestFacility({
            facility: closest,
            distanceKm: parseFloat(minDistance.toFixed(2)),
          });
          setSelectedFacility(closest);
        }
      },
      (error) => {
        setIsLocating(false);
        // Default to Lagos City center if GPS permission is denied
        const defaultCoords = { lat: 6.5244, lng: 3.3792 };
        setUserLocation(defaultCoords);
        if (facilities.length > 0) {
          const closest = facilities[0];
          const dist = calculateDistance(defaultCoords.lat, defaultCoords.lng, closest.latitude, closest.longitude);
          setClosestFacility({ facility: closest, distanceKm: parseFloat(dist.toFixed(2)) });
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.lga.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Header with Search and Locate Button */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Health Facility & Location Finder</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
            Interactive Healthcare Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Locate accredited primary healthcare centres, clinics, hospitals, and local health alerts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search LGA, facility name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Locate className="w-4 h-4" />
            <span>{isLocating ? 'Locating...' : 'Find Nearest to Me (GPS)'}</span>
          </button>

          <button
            onClick={() => onNavigate('citizen-report')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Report Health Issue</span>
          </button>
        </div>
      </div>

      {/* Closest Facility Highlight Card */}
      {closestFacility && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-md">
                <Navigation className="w-3 h-3 text-emerald-700" />
                <span>Nearest Healthcare Station ({closestFacility.distanceKm} km away)</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {closestFacility.facility.name}
              </h3>
              <p className="text-xs text-slate-600">
                {closestFacility.facility.address}, {closestFacility.facility.lga}, {closestFacility.facility.state}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-700" />
                  {closestFacility.facility.phone}
                </span>
                <span className="text-emerald-700 font-semibold">
                  Type: {closestFacility.facility.type}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('citizen-report')}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            Report Case at This Location
          </button>
        </div>
      )}

      {/* Map and Facilities Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Map */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-hidden flex flex-col">
          <div className="h-[480px] w-full rounded-xl overflow-hidden relative">
            <MapComponent
              facilities={filteredFacilities}
              userLocation={userLocation}
              height="100%"
              onSelectFacility={(fac) => setSelectedFacility(fac)}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              <span>Accredited Medical Facility</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span>Your GPS Position</span>
            </span>
            <span>Showing {filteredFacilities.length} facilities across Nigeria</span>
          </div>
        </div>

        {/* Right Facility Directory List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 flex flex-col h-[550px]">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Facility Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any facility to view details
            </p>
          </div>

          <div className="overflow-y-auto flex-grow space-y-2.5 pr-1">
            {filteredFacilities.map((fac) => {
              const isSelected = selectedFacility?.id === fac.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {fac.name}
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 whitespace-nowrap">
                      {fac.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>{fac.lga}, {fac.state}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                    <span>{fac.phone}</span>
                  </p>
                </div>
              );
            })}
            {filteredFacilities.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No facilities matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
