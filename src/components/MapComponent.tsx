/**
 * Community Health Report System (CHRS) - Leaflet & OpenStreetMap Component
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { HealthFacility, HealthReport, OutbreakCluster, PublicAlert } from '../types';

interface MapComponentProps {
  mode?: 'picker' | 'surveillance';
  initialLat?: number;
  initialLng?: number;
  zoom?: number;
  height?: string;
  selectedPoint?: { lat: number; lng: number } | null;
  onPointSelected?: (point: { lat: number; lng: number }) => void;
  facilities?: HealthFacility[];
  reports?: Array<Partial<HealthReport> & { latitude: number; longitude: number }>;
  clusters?: OutbreakCluster[];
  alerts?: PublicAlert[];
  showLegend?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  mode = 'surveillance',
  initialLat = 6.5244, // Lagos, Nigeria default centroid
  initialLng = 3.3792,
  zoom = 11,
  height = '420px',
  selectedPoint,
  onPointSelected,
  facilities = [],
  reports = [],
  clusters = [],
  alerts = [],
  showLegend = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom,
      attributionControl: false,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors | CHRS Nigeria Surveillance',
    }).addTo(map);

    L.control.attribution({ position: 'bottomright' }).addTo(map);

    const layers = L.layerGroup().addTo(map);
    layerGroupRef.current = layers;
    mapInstanceRef.current = map;

    // Handle map click in picker mode
    if (mode === 'picker') {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (onPointSelected) {
          onPointSelected({
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
          });
        }
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mode]);

  // Update selected point marker in picker mode
  useEffect(() => {
    if (!mapInstanceRef.current || mode !== 'picker') return;

    if (selectedPoint) {
      const { lat, lng } = selectedPoint;

      if (!markerRef.current) {
        const pinIcon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:12px;">📍</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
        });

        markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(mapInstanceRef.current);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      mapInstanceRef.current.setView([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 13));
    }
  }, [selectedPoint, mode]);

  // Render surveillance layers (facilities, reports, clusters, alerts)
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || mode !== 'surveillance') return;

    const layers = layerGroupRef.current;
    layers.clearLayers();

    // 1. Facilities
    facilities.forEach((f) => {
      const isApproved = f.verification_status === 'APPROVED' && f.is_active;
      const color = isApproved ? '#059669' : '#f59e0b';
      const facilityIcon = L.divIcon({
        className: 'facility-icon',
        html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.35);">🏥</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([f.latitude, f.longitude], { icon: facilityIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: bold; color: #065f46;">${f.name}</h4>
          <p style="margin: 0 0 4px; font-size: 12px; color: #4b5563;">${f.type} • ${f.lga}, ${f.state}</p>
          <div style="display: inline-block; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; background: ${isApproved ? '#d1fae5; color: #065f46;' : '#fef3c7; color: #92400e;'}">
            ${f.verification_status} ${f.is_active ? '(ACTIVE)' : '(INACTIVE)'}
          </div>
          <p style="margin: 6px 0 0; font-size: 11px; color: #6b7280;">📞 ${f.phone}</p>
        </div>
      `);
      layers.addLayer(marker);
    });

    // 2. Health Reports (Cases)
    reports.forEach((r) => {
      const isVerified = r.status === 'VERIFIED';
      const color = isVerified ? '#dc2626' : '#ea580c';

      const circle = L.circleMarker([r.latitude, r.longitude], {
        radius: isVerified ? 9 : 7,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      });

      circle.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="background: ${color}; width: 8px; height: 8px; border-radius: 50%;"></span>
            <strong style="font-size: 12px; color: #111827;">${r.reference_no || 'Suspected Case'}</strong>
          </div>
          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1f2937;">${r.title || r.category_name || 'Health Condition'}</p>
          <p style="margin: 0 0 2px; font-size: 12px; color: #4b5563;">Status: <strong>${r.status}</strong></p>
          <p style="margin: 0; font-size: 11px; color: #6b7280;">LGA: ${r.lga || 'Local ward'} • Affected: ${r.affected_count || 1}</p>
        </div>
      `);
      layers.addLayer(circle);
    });

    // 3. Outbreak Clusters
    clusters.forEach((c) => {
      const isDismissed = c.status === 'DISMISSED' || c.status === 'RESOLVED';
      if (isDismissed) return;

      const circle = L.circle([c.center_lat, c.center_lng], {
        radius: c.radius_km * 1000,
        color: '#ef4444',
        fillColor: '#f87171',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '6, 6',
      });

      circle.bindPopup(`
        <div style="font-family: sans-serif; min-width: 220px; padding: 6px;">
          <span style="background: #fee2e2; color: #991b1b; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">EPIDEMIOLOGICAL ALERT</span>
          <h4 style="margin: 6px 0 4px; font-size: 14px; color: #991b1b; font-weight: bold;">${c.cluster_name}</h4>
          <p style="margin: 0 0 4px; font-size: 12px; color: #374151;">Status: <strong>${c.status}</strong></p>
          <p style="margin: 0 0 4px; font-size: 12px; color: #374151;">Verified Cases in Cluster: <strong>${c.report_count}</strong></p>
          <p style="margin: 0; font-size: 11px; color: #6b7280;">Radius: ${c.radius_km} km • ${c.lga}, ${c.state}</p>
        </div>
      `);
      layers.addLayer(circle);

      // Add center flag icon
      const centerMarker = L.circleMarker([c.center_lat, c.center_lng], {
        radius: 5,
        fillColor: '#991b1b',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      });
      layers.addLayer(centerMarker);
    });

    // 4. Public Alerts
    alerts.forEach((a) => {
      if (a.latitude && a.longitude && a.radius_km) {
        const alertCircle = L.circle([a.latitude, a.longitude], {
          radius: a.radius_km * 1000,
          color: a.severity === 'EMERGENCY' ? '#dc2626' : '#f59e0b',
          fillColor: a.severity === 'EMERGENCY' ? '#ef4444' : '#fbbf24',
          fillOpacity: 0.15,
          weight: 1.5,
        });

        alertCircle.bindPopup(`
          <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
            <span style="background: #fef3c7; color: #92400e; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">PUBLIC ALERT [${a.severity}]</span>
            <h4 style="margin: 4px 0 2px; font-size: 13px; font-weight: bold; color: #92400e;">${a.title}</h4>
            <p style="margin: 0; font-size: 11px; color: #4b5563;">${a.message}</p>
          </div>
        `);
        layers.addLayer(alertCircle);
      }
    });

    // Auto-fit if reports or facilities exist and initial view is default
    if (reports.length > 0 || facilities.length > 0) {
      const boundsPoints: L.LatLngExpression[] = [];
      reports.forEach((r) => boundsPoints.push([r.latitude, r.longitude]));
      facilities.forEach((f) => boundsPoints.push([f.latitude, f.longitude]));
      if (boundsPoints.length > 1) {
        const bounds = L.latLngBounds(boundsPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
      }
    }
  }, [facilities, reports, clusters, alerts, mode]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {mode === 'picker' && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          Click anywhere on the map to pinpoint exact location
        </div>
      )}

      {showLegend && mode === 'surveillance' && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 text-xs shadow-md space-y-1">
          <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
            Surveillance Legend
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block text-[9px] text-white text-center leading-3">
              +
            </span>
            <span>Approved Health Facility</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <span>Verified Disease Report</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span>Suspected / Submitted Report</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3.5 h-2.5 rounded border border-red-500 border-dashed bg-red-100 inline-block" />
            <span>Outbreak Cluster Zone</span>
          </div>
        </div>
      )}
    </div>
  );
};
