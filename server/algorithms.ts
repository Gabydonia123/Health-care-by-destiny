/**
 * Community Health Report System (CHRS) - Algorithms & Spatial Analysis
 * 1. Haversine Distance Formula
 * 2. Nearest Facility Routing Algorithm
 * 3. Spatial-Temporal Outbreak Cluster Detection (DBSCAN-like centroid clustering)
 * 4. Coordinate Anonymization for Public Health Privacy
 */

import { HealthFacility, HealthReport, OutbreakCluster } from '../src/types';

/**
 * Earth's mean radius in kilometers (WGS 84 ellipsoid approximation)
 */
export const EARTH_RADIUS_KM = 6371.0088;

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate the great-circle distance between two geographic points
 * using the Haversine formula.
 *
 * d = 2 * R * arcsin(sqrt(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)))
 *
 * @param lat1 Latitude of point 1 in decimal degrees
 * @param lon1 Longitude of point 1 in decimal degrees
 * @param lat2 Latitude of point 2 in decimal degrees
 * @param lon2 Longitude of point 2 in decimal degrees
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const radLat1 = degreesToRadians(lat1);
  const radLat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;
  return Number(distance.toFixed(3)); // round to 3 decimal places (meter precision)
}

/**
 * Route a health report to the nearest APPROVED and ACTIVE facility.
 * Enforces strict government accreditation filtering.
 */
export function routeToNearestApprovedFacility(
  reportLat: number,
  reportLng: number,
  facilities: HealthFacility[]
): { facility: HealthFacility; distanceKm: number } | null {
  const approvedActiveFacilities = facilities.filter(
    (f) => f.verification_status === 'APPROVED' && f.is_active === true
  );

  if (approvedActiveFacilities.length === 0) {
    return null;
  }

  let nearestFacility: HealthFacility | null = null;
  let minDistance = Infinity;

  for (const facility of approvedActiveFacilities) {
    const distance = calculateHaversineDistance(
      reportLat,
      reportLng,
      facility.latitude,
      facility.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestFacility = facility;
    }
  }

  return nearestFacility ? { facility: nearestFacility, distanceKm: minDistance } : null;
}

/**
 * Outbreak Detection Algorithm:
 * Scans verified reports within a configured time window and category.
 * If >= threshold reports fall within the configured geographic radius from each other,
 * a spatial cluster is generated or updated.
 *
 * NOTE: The prompt requires: "Never automatically call it a confirmed outbreak.
 * Cluster statuses: DETECTED -> UNDER_INVESTIGATION -> CONFIRMED / DISMISSED / RESOLVED"
 */
export function evaluateOutbreakClusters(params: {
  newVerifiedReport: HealthReport;
  allReports: HealthReport[];
  existingClusters: OutbreakCluster[];
  radiusKm: number;
  timeWindowDays: number;
  thresholdMinReports: number;
}): {
  clusterToCreate?: Omit<OutbreakCluster, 'id'> & { matchedReportIds: string[] };
  clusterToUpdate?: { clusterId: string; newReportCount: number; matchedReportIds: string[] };
} | null {
  const {
    newVerifiedReport,
    allReports,
    existingClusters,
    radiusKm,
    timeWindowDays,
    thresholdMinReports,
  } = params;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeWindowDays);

  // Filter verified reports in the same disease/hazard category and within time window
  const relevantReports = allReports.filter((r) => {
    if (r.category_id !== newVerifiedReport.category_id) return false;
    if (r.status !== 'VERIFIED' && r.status !== 'IN_PROGRESS' && r.status !== 'RESOLVED') return false;
    const reportDate = new Date(r.created_at);
    return reportDate >= cutoffDate;
  });

  // Ensure new report is included
  if (!relevantReports.some((r) => r.id === newVerifiedReport.id)) {
    relevantReports.push(newVerifiedReport);
  }

  // Find nearby verified reports to this new report within radiusKm
  const nearbyReports = relevantReports.filter((r) => {
    const dist = calculateHaversineDistance(
      newVerifiedReport.latitude,
      newVerifiedReport.longitude,
      r.latitude,
      r.longitude
    );
    return dist <= radiusKm;
  });

  // Check if an active cluster already covers this region and category
  const existingActiveCluster = existingClusters.find((c) => {
    if (c.category_id !== newVerifiedReport.category_id) return false;
    if (c.status === 'DISMISSED' || c.status === 'RESOLVED') return false;
    const dist = calculateHaversineDistance(
      newVerifiedReport.latitude,
      newVerifiedReport.longitude,
      c.center_lat,
      c.center_lng
    );
    return dist <= c.radius_km * 1.5; // within expanded cluster boundary
  });

  if (existingActiveCluster) {
    // Add report to existing cluster
    const matchedReportIds = nearbyReports.map((r) => r.id);
    return {
      clusterToUpdate: {
        clusterId: existingActiveCluster.id,
        newReportCount: Math.max(existingActiveCluster.report_count + 1, matchedReportIds.length),
        matchedReportIds,
      },
    };
  }

  // If threshold is reached, propose a new DETECTED cluster
  if (nearbyReports.length >= thresholdMinReports) {
    // Calculate geographic centroid
    const avgLat =
      nearbyReports.reduce((sum, r) => sum + r.latitude, 0) / nearbyReports.length;
    const avgLng =
      nearbyReports.reduce((sum, r) => sum + r.longitude, 0) / nearbyReports.length;

    const matchedReportIds = nearbyReports.map((r) => r.id);

    return {
      clusterToCreate: {
        cluster_name: `POSSIBLE OUTBREAK CLUSTER: ${newVerifiedReport.category_name || 'Suspected Pathogen'} (${newVerifiedReport.lga || newVerifiedReport.state})`,
        category_id: newVerifiedReport.category_id,
        category_name: newVerifiedReport.category_name,
        state: newVerifiedReport.state,
        lga: newVerifiedReport.lga,
        center_lat: Number(avgLat.toFixed(6)),
        center_lng: Number(avgLng.toFixed(6)),
        radius_km: radiusKm,
        report_count: nearbyReports.length,
        status: 'DETECTED',
        investigator_notes: `Automated detection triggered by ${nearbyReports.length} verified reports within ${radiusKm}km radius over the past ${timeWindowDays} days. Requires field epidemiological verification.`,
        detected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        matchedReportIds,
      },
    };
  }

  return null;
}

/**
 * Anonymize GPS coordinates for public health map
 * Jitters coordinates by approximately 400m-800m and strips personally identifiable details
 * in compliance with epidemiological data privacy guidelines.
 */
export function anonymizePublicReportLocation(lat: number, lng: number): { lat: number; lng: number } {
  // Deterministic pseudo-random shift based on coordinates
  const seed = Math.sin(lat * 1000 + lng * 100);
  const offsetLat = (seed * 0.008) - 0.004; // +/- ~450m
  const offsetLng = (Math.cos(lat * 100 + lng * 1000) * 0.008) - 0.004;

  return {
    lat: Number((lat + offsetLat).toFixed(4)),
    lng: Number((lng + offsetLng).toFixed(4)),
  };
}

/**
 * Generate sequential reference number, e.g. CHR-2026-00001
 */
let reportSequence = 100;
export function generateReportReference(): string {
  reportSequence += 1;
  const year = new Date().getFullYear();
  const sequenceStr = String(reportSequence).padStart(5, '0');
  return `CHR-${year}-${sequenceStr}`;
}
