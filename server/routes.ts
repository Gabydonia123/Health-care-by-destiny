/**
 * Community Health Report System (CHRS) - REST API Routes
 */

import bcrypt from 'bcryptjs';
import { Router } from 'express';
import {
  HealthFacility,
  HealthReport,
  Notification,
  PublicAlert,
  ReportCategory,
  User,
} from '../src/types';
import { processAiAdminCommand } from './aiService';
import {
  anonymizePublicReportLocation,
  evaluateOutbreakClusters,
  generateReportReference,
  routeToNearestApprovedFacility,
} from './algorithms';
import { AuthenticatedRequest, authenticateToken, generateToken, requireRole } from './auth';
import { db } from './db';

export const apiRouter = Router();

// Ensure db initialized
db.initialize();

// ==============================================================================
// 1. AUTHENTICATION ROUTES
// ==============================================================================

// Citizen Registration
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required' });
    }

    if (db.findUserByEmail(email)) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id: `usr-${Date.now().toString(36)}`,
      name,
      email,
      phone,
      role: 'citizen',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.createUser(user, passwordHash);
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Citizen registration successful',
      user,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// General / Citizen Login
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hash = db.getUserPasswordHash(user.id);
    if (!hash || !(await bcrypt.compare(password, hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const official = user.role === 'official' ? db.getOfficialByUserId(user.id) : undefined;
    return res.json({
      message: 'Login successful',
      user,
      official,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Official / Medical Facility Login (/official/login)
apiRouter.post('/auth/official/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user || user.role !== 'official') {
      return res.status(401).json({ error: 'Access denied: Medical Facility credentials required' });
    }

    const hash = db.getUserPasswordHash(user.id);
    if (!hash || !(await bcrypt.compare(password, hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const official = db.getOfficialByUserId(user.id);
    if (!official || !official.is_active) {
      return res.status(401).json({ error: 'Official profile is inactive or pending facility verification' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Official login authorized',
      user,
      official,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Administrator Login (/admin/login) - Strictly for Admins with Permanent Password Support
apiRouter.post('/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Administrator email and password are required' });
    }

    const user = db.findUserByEmail(email);
    // STRICT SECURITY: Only genuine administrator accounts can authenticate here
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Access denied: Administrator authorization required. This portal is strictly restricted to system administrators.' });
    }

    // Primary Admin Credentials for Eseoghene Destiny (eseoghenedestiny05@gmail.com)
    const isPrimaryAdmin = (
      user.email.toLowerCase() === 'eseoghenedestiny05@gmail.com' &&
      (password === 'Aharhibaba123.' || password === 'Admin@CHRS2026!')
    );
    
    let isPasswordValid = false;
    if (isPrimaryAdmin) {
      isPasswordValid = true;
    } else {
      const hash = db.getUserPasswordHash(user.id);
      if (hash && (await bcrypt.compare(password, hash))) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid administrator email or password' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Admin authorization granted',
      user,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Current User Profile & Context
apiRouter.get('/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let officialMetadata = null;
  if (user.role === 'official') {
    officialMetadata = db.getOfficialByUserId(user.id);
  }
  return res.json({ user, official: officialMetadata });
});

// Password Reset Request
apiRouter.post('/auth/password-reset-request', async (req, res) => {
  const { email } = req.body;
  const user = db.findUserByEmail(email);
  if (!user) {
    // Return friendly message even if email not found for privacy
    return res.json({ message: 'If an account matches that email, a password reset token has been issued.' });
  }
  const token = db.createPasswordResetToken(user.id);
  return res.json({
    message: 'Reset token generated successfully.',
    resetToken: token, // in production sent via SMS/Email
  });
});

// Password Reset Confirm
apiRouter.post('/auth/password-reset', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password required' });
  }
  const userId = db.verifyAndConsumePasswordResetToken(token);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid or expired password reset token' });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  db.setUserPassword(userId, hash);
  return res.json({ message: 'Password updated successfully. You can now login.' });
});

// ==============================================================================
// 2. PUBLIC & ANONYMIZED SURVEILLANCE ROUTES
// ==============================================================================

// Public Categories
apiRouter.get('/public/categories', (req, res) => {
  const categories = db.getCategories().filter((c) => c.is_active);
  return res.json({ categories });
});

// Public Alerts
apiRouter.get('/public/alerts', (req, res) => {
  const alerts = db.getPublicAlerts(true);
  return res.json({ alerts });
});

// Public Approved Facilities
apiRouter.get('/public/facilities', (req, res) => {
  const facilities = db.getFacilities().filter(
    (f) => f.verification_status === 'APPROVED' && f.is_active
  );
  return res.json({ facilities });
});

// Public Anonymized Surveillance Map Data
// Strictly enforces prompt requirement: "Public maps must NOT expose citizen names, phone numbers, emails, exact coordinates. Use approximate/aggregated public locations."
apiRouter.get('/public/map-data', (req, res) => {
  const reports = db.getReports().filter((r) => r.status !== 'REJECTED');
  const facilities = db.getFacilities().filter(
    (f) => f.verification_status === 'APPROVED' && f.is_active
  );
  const clusters = db.getOutbreakClusters();
  const alerts = db.getPublicAlerts(true);

  // Anonymize reports
  const anonymizedReports = reports.map((r) => {
    const coords = anonymizePublicReportLocation(r.latitude, r.longitude);
    return {
      id: r.id,
      category_id: r.category_id,
      category_name: r.category_name,
      status: r.status,
      latitude: coords.lat,
      longitude: coords.lng,
      lga: r.lga,
      state: r.state,
      affected_count: r.affected_count,
      created_at: r.created_at,
    };
  });

  return res.json({
    reports: anonymizedReports,
    facilities,
    clusters,
    alerts,
  });
});

// Public System Settings (Available States, Emergency message)
apiRouter.get('/public/settings', (req, res) => {
  const statesSetting = db.getSystemSetting('available_states');
  const emergencySetting = db.getSystemSetting('emergency_alert_message');

  return res.json({
    available_states: statesSetting ? JSON.parse(statesSetting.setting_value) : ['Lagos', 'Abuja FCT', 'Edo'],
    emergency_message: emergencySetting ? emergencySetting.setting_value : '',
  });
});

// Facility Accreditation Application (Public submission)
apiRouter.post('/facility/register', (req, res) => {
  try {
    const {
      name,
      type,
      state,
      lga,
      address,
      latitude,
      longitude,
      phone,
      email,
      applicant_name,
      applicant_email,
      license_number,
      notes,
    } = req.body;

    if (!name || !state || !lga || !address || !phone || !applicant_name || !license_number) {
      return res.status(400).json({ error: 'All mandatory facility and applicant fields must be provided' });
    }

    const facilityId = `fac-${Date.now().toString(36)}`;
    const newFacility: HealthFacility = {
      id: facilityId,
      name,
      type: type || 'Primary Healthcare Centre',
      state,
      lga,
      address,
      latitude: Number(latitude) || 6.5244,
      longitude: Number(longitude) || 3.3792,
      phone,
      email: email || applicant_email,
      verification_status: 'PENDING',
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.createFacility(newFacility);

    const application = db.createFacilityApplication({
      id: `app-${Date.now().toString(36)}`,
      facility_id: facilityId,
      applicant_name,
      applicant_email,
      license_number,
      notes,
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      message: 'Facility accreditation application submitted successfully. Current verification status: PENDING.',
      facility: newFacility,
      application,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 3. CITIZEN ROUTES
// ==============================================================================

// Submit Health Report (Available to any authenticated user)
apiRouter.post('/citizen/reports', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const citizen = req.user!;
    const {
      category_id,
      title,
      description,
      symptoms,
      affected_count,
      latitude,
      longitude,
      location_name,
      state,
      lga,
      image_url,
    } = req.body;

    if (!category_id || !title || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Category, title, description, and GPS coordinates are required' });
    }

    const reportLat = Number(latitude);
    const reportLng = Number(longitude);

    // 1. Generate unique reference: CHR-2026-00001
    const referenceNo = generateReportReference();

    // 2. Nearest APPROVED + ACTIVE Facility routing using Haversine
    const allFacilities = db.getFacilities();
    const routingResult = routeToNearestApprovedFacility(reportLat, reportLng, allFacilities);

    if (!routingResult) {
      return res.status(503).json({
        error: 'No approved and active health facilities currently available for automated assignment.',
      });
    }

    const assignedFacility = routingResult.facility;
    const distanceKm = routingResult.distanceKm;

    // 3. Save report
    const report: HealthReport = {
      id: `rep-${Date.now().toString(36)}`,
      reference_no: referenceNo,
      citizen_id: citizen.id,
      category_id,
      title,
      description,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms].filter(Boolean),
      affected_count: Number(affected_count) || 1,
      latitude: reportLat,
      longitude: reportLng,
      location_name: location_name || `${lga || state || 'Community location'}`,
      state: state || assignedFacility.state,
      lga: lga || assignedFacility.lga,
      image_url,
      assigned_facility_id: assignedFacility.id,
      status: 'SUBMITTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const savedReport = db.createReport(report);

    // 4. Notify citizen
    db.createNotification({
      id: `notif-${Date.now().toString(36)}-1`,
      user_id: citizen.id,
      title: `Report Logged: ${savedReport.reference_no}`,
      message: `Your report has been received and routed to ${assignedFacility.name} (approx ${distanceKm}km away). Status: SUBMITTED.`,
      type: 'REPORT_UPDATE',
      reference_id: savedReport.reference_no,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // 5. Notify officials of the assigned facility
    const facilityOfficials = db.getOfficials().filter((o) => o.facility_id === assignedFacility.id);
    for (const official of facilityOfficials) {
      db.createNotification({
        id: `notif-${Date.now().toString(36)}-off-${official.id}`,
        user_id: official.user_id,
        title: `New Case Assigned: ${savedReport.reference_no}`,
        message: `A suspected ${savedReport.category_name} case was routed to your facility (${distanceKm}km distance).`,
        type: 'REPORT_UPDATE',
        reference_id: savedReport.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    return res.status(201).json({
      message: 'Health report submitted successfully',
      report: savedReport,
      assigned_facility: assignedFacility,
      distance_km: distanceKm,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Citizen Reports List (Available to any authenticated user to view their submitted reports)
apiRouter.get('/citizen/reports', authenticateToken, (req: AuthenticatedRequest, res) => {
  const reports = db.getReportsByCitizenId(req.user!.id);
  return res.json({ reports });
});

// Citizen Report Details & Timeline
apiRouter.get('/citizen/reports/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const report = db.getReportById(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  // Allow report author, or any official/admin to view report details
  if (report.citizen_id !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'official') {
    return res.status(401).json({ error: 'Unauthorized to view this report' });
  }
  const history = db.getReportStatusHistory(report.id);
  return res.json({ report, history });
});

// Citizen Notifications
apiRouter.get('/citizen/notifications', authenticateToken, (req: AuthenticatedRequest, res) => {
  const notifications = db.getNotificationsByUserId(req.user!.id);
  return res.json({ notifications });
});

apiRouter.patch('/citizen/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res) => {
  db.markNotificationAsRead(req.params.id);
  return res.json({ success: true });
});

apiRouter.patch('/citizen/notifications/read-all', authenticateToken, (req: AuthenticatedRequest, res) => {
  db.markAllNotificationsAsRead(req.user!.id);
  return res.json({ success: true });
});

// Offline Reports Batch Sync
apiRouter.post('/sync/offline-reports', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const citizen = req.user!;
    const { reports } = req.body; // Array of QueuedOfflineReport

    if (!Array.isArray(reports) || reports.length === 0) {
      return res.status(400).json({ error: 'Array of queued reports required' });
    }

    const syncResults: Array<{ local_id: string; server_report_id?: string; reference_no?: string; success: boolean; error?: string }> = [];

    const allFacilities = db.getFacilities();

    for (const q of reports) {
      try {
        const reportLat = Number(q.latitude);
        const reportLng = Number(q.longitude);

        // Routing
        const routingResult = routeToNearestApprovedFacility(reportLat, reportLng, allFacilities);
        if (!routingResult) {
          syncResults.push({
            local_id: q.local_id,
            success: false,
            error: 'No approved facility available for routing',
          });
          continue;
        }

        const refNo = generateReportReference();
        const newReport: HealthReport = {
          id: `rep-sync-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
          reference_no: refNo,
          citizen_id: citizen.id,
          category_id: q.category_id,
          title: q.title,
          description: q.description,
          symptoms: q.symptoms || [],
          affected_count: q.affected_count || 1,
          latitude: reportLat,
          longitude: reportLng,
          location_name: q.location_name || `${q.lga}, ${q.state}`,
          state: q.state || routingResult.facility.state,
          lga: q.lga || routingResult.facility.lga,
          image_url: q.image_url,
          assigned_facility_id: routingResult.facility.id,
          status: 'SUBMITTED',
          created_at: q.timestamp || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const saved = db.createReport(newReport);

        db.createNotification({
          id: `notif-${Date.now().toString(36)}`,
          user_id: citizen.id,
          title: `Offline Report Synced: ${saved.reference_no}`,
          message: `Your offline queued report has been uploaded to ${routingResult.facility.name}.`,
          type: 'REPORT_UPDATE',
          reference_id: saved.reference_no,
          is_read: false,
          created_at: new Date().toISOString(),
        });

        syncResults.push({
          local_id: q.local_id,
          server_report_id: saved.id,
          reference_no: saved.reference_no,
          success: true,
        });
      } catch (err: any) {
        syncResults.push({
          local_id: q.local_id,
          success: false,
          error: err.message,
        });
      }
    }

    return res.json({
      message: 'Batch synchronization complete',
      results: syncResults,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 4. HEALTH OFFICIAL ROUTES
// ==============================================================================

// Get Official's Facility and Reports
apiRouter.get('/official/assigned-reports', authenticateToken, requireRole('official', 'admin'), (req: AuthenticatedRequest, res) => {
  const official = db.getOfficialByUserId(req.user!.id);
  if (!official) {
    if (req.user!.role === 'admin') {
      const allFacilities = db.getFacilities();
      const facility = allFacilities[0] || null;
      const reports = db.getReports();
      return res.json({
        facility,
        reports,
      });
    }
    return res.status(404).json({ error: 'Official profile not found' });
  }

  const reports = db.getReportsByFacilityId(official.facility_id);
  return res.json({
    facility: official.facility,
    reports,
  });
});

// Official opens a report - automatically marks it VIEWED if SUBMITTED/PENDING_REVIEW
apiRouter.get('/official/reports/:id', authenticateToken, requireRole('official', 'admin'), (req: AuthenticatedRequest, res) => {
  const report = db.getReportById(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  // Automatic "VIEWED" transition requirement
  if (report.status === 'SUBMITTED' || report.status === 'PENDING_REVIEW') {
    db.updateReportStatus({
      reportId: report.id,
      newStatus: 'VIEWED',
      changedByUserId: req.user!.id,
      notes: 'Opened and inspected by health surveillance officer.',
    });

    // Notify citizen
    db.createNotification({
      id: `notif-viewed-${Date.now().toString(36)}`,
      user_id: report.citizen_id,
      title: `Report Viewed: ${report.reference_no}`,
      message: `Your health report was opened by a surveillance officer at ${report.facility_name}. Verification is in progress.`,
      type: 'REPORT_UPDATE',
      reference_id: report.reference_no,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  const updatedReport = db.getReportById(req.params.id)!;
  const history = db.getReportStatusHistory(updatedReport.id);
  return res.json({ report: updatedReport, history });
});

// Update Report Status (Verify / Reject / In Progress / Resolve)
apiRouter.patch('/official/reports/:id/status', authenticateToken, requireRole('official', 'admin'), (req: AuthenticatedRequest, res) => {
  try {
    const { status, notes } = req.body;
    const report = db.getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const validStatuses = ['PENDING_REVIEW', 'VIEWED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = db.updateReportStatus({
      reportId: report.id,
      newStatus: status,
      changedByUserId: req.user!.id,
      notes: notes || `Status changed to ${status}`,
    });

    // Notify citizen of the status transition
    db.createNotification({
      id: `notif-stat-${Date.now().toString(36)}`,
      user_id: report.citizen_id,
      title: `Report Status: ${status} (${report.reference_no})`,
      message: `Your health report has been updated to "${status}". Notes: ${notes || 'Surveillance action recorded.'}`,
      type: 'REPORT_UPDATE',
      reference_id: report.reference_no,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    let outbreakDetected = null;

    // Outbreak Detection trigger: Only VERIFIED reports trigger outbreak detection!
    if (status === 'VERIFIED') {
      const radiusSetting = Number(db.getSystemSetting('outbreak_radius_km')?.setting_value || 5);
      const timeWindowSetting = Number(db.getSystemSetting('outbreak_time_window_days')?.setting_value || 7);
      const thresholdSetting = Number(db.getSystemSetting('outbreak_min_reports')?.setting_value || 5);

      const outbreakEval = evaluateOutbreakClusters({
        newVerifiedReport: updated!,
        allReports: db.getReports(),
        existingClusters: db.getOutbreakClusters(),
        radiusKm: radiusSetting,
        timeWindowDays: timeWindowSetting,
        thresholdMinReports: thresholdSetting,
      });

      if (outbreakEval?.clusterToCreate) {
        const clusterId = `clus-${Date.now().toString(36)}`;
        const createdCluster = db.createOutbreakCluster(
          {
            ...outbreakEval.clusterToCreate,
            id: clusterId,
          },
          outbreakEval.clusterToCreate.matchedReportIds
        );
        outbreakDetected = createdCluster;

        // Broadcast notifications to all officials & admins
        const alertUsers = db.getAllUsers().filter((u) => u.role === 'official' || u.role === 'admin');
        for (const u of alertUsers) {
          db.createNotification({
            id: `notif-clus-${Date.now().toString(36)}-${u.id}`,
            user_id: u.id,
            title: `SURVEILLANCE ALERT: Outbreak Cluster Detected`,
            message: `${createdCluster.cluster_name} has reached threshold with ${createdCluster.report_count} verified cases. Status: DETECTED.`,
            type: 'CLUSTER',
            reference_id: createdCluster.id,
            is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      } else if (outbreakEval?.clusterToUpdate) {
        db.updateOutbreakCluster(outbreakEval.clusterToUpdate.clusterId, {
          report_count: outbreakEval.clusterToUpdate.newReportCount,
        });
      }
    }

    return res.json({
      message: `Report status updated to ${status}`,
      report: updated,
      outbreakDetected,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Official Surveillance Map (Full unmasked coordinates for verified cases, facilities, clusters)
apiRouter.get('/official/map-data', authenticateToken, requireRole('official', 'admin'), (req, res) => {
  const reports = db.getReports();
  const facilities = db.getFacilities();
  const clusters = db.getOutbreakClusters();
  const alerts = db.getPublicAlerts(false);

  return res.json({
    reports,
    facilities,
    clusters,
    alerts,
  });
});

// Outbreaks List for Officials
apiRouter.get('/official/outbreaks', authenticateToken, requireRole('official', 'admin'), (req, res) => {
  const clusters = db.getOutbreakClusters();
  return res.json({ clusters });
});

// Official updates cluster status (DETECTED -> UNDER_INVESTIGATION -> DISMISSED / RESOLVED)
// NOTE: Requirement 8 strictly dictates: "only admin can approve report of outbreak."
apiRouter.patch('/official/outbreaks/:id/status', authenticateToken, requireRole('official', 'admin'), (req: AuthenticatedRequest, res) => {
  const { status, investigator_notes } = req.body;
  const validStatuses = ['DETECTED', 'UNDER_INVESTIGATION', 'CONFIRMED', 'DISMISSED', 'RESOLVED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  // Requirement 8: ONLY admin can officially approve / declare a confirmed outbreak
  if (status === 'CONFIRMED' && req.user!.role !== 'admin') {
    return res.status(400).json({
      error: 'Access denied: Only System Administrators can officially approve and declare an Outbreak as CONFIRMED. Medical officers may recommend investigation and set status to UNDER_INVESTIGATION.'
    });
  }

  const updated = db.updateOutbreakCluster(req.params.id, {
    status,
    investigator_notes: investigator_notes || undefined,
  });

  if (!updated) return res.status(404).json({ error: 'Outbreak cluster not found' });

  // If approved by admin, record audit log
  if (status === 'CONFIRMED') {
    db.createAuditLog({
      id: `aud-${Date.now().toString(36)}`,
      action: 'ADMIN_APPROVE_OUTBREAK',
      user_id: req.user!.id,
      user_name: req.user!.name,
      target_entity: 'OutbreakCluster',
      target_id: req.params.id,
      details: {
        cluster_name: updated.cluster_name,
        approved_by: req.user!.name,
        notes: investigator_notes,
      },
      created_at: new Date().toISOString(),
    });
  }

  return res.json({ message: 'Outbreak cluster updated', cluster: updated });
});

// Dedicated Administrator Outbreak Approval Endpoint
apiRouter.patch('/admin/outbreaks/:id/approve', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { investigator_notes } = req.body;
  const cluster = db.getOutbreakClusterById(req.params.id);
  if (!cluster) return res.status(404).json({ error: 'Outbreak cluster not found' });

  const updated = db.updateOutbreakCluster(req.params.id, {
    status: 'CONFIRMED',
    investigator_notes: investigator_notes 
      ? `${cluster.investigator_notes ? cluster.investigator_notes + '\n' : ''}[Admin Approval - ${req.user!.name}]: ${investigator_notes}`
      : cluster.investigator_notes,
  });

  db.createAuditLog({
    id: `aud-${Date.now().toString(36)}`,
    action: 'ADMIN_APPROVE_OUTBREAK',
    user_id: req.user!.id,
    user_name: req.user!.name,
    target_entity: 'OutbreakCluster',
    target_id: cluster.id,
    details: {
      cluster_name: cluster.cluster_name,
      approved_by: req.user!.name,
      notes: investigator_notes,
    },
    created_at: new Date().toISOString(),
  });

  return res.json({ message: 'Outbreak officially approved and confirmed by Administrator', cluster: updated });
});

// Official Issues Authorized Public Health Alert
apiRouter.post('/official/alerts', authenticateToken, requireRole('official', 'admin'), (req: AuthenticatedRequest, res) => {
  try {
    const { title, category_id, message, affected_area, state, severity, latitude, longitude, radius_km, start_date, expiry_date } = req.body;

    if (!title || !category_id || !message || !affected_area) {
      return res.status(400).json({ error: 'Title, category, message, and affected area are required' });
    }

    const alertId = `alt-${Date.now().toString(36)}`;
    const newAlert: PublicAlert = {
      id: alertId,
      title,
      category_id,
      message,
      affected_area,
      state: state || 'Lagos',
      severity: severity || 'ADVISORY',
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      radius_km: radius_km ? Number(radius_km) : undefined,
      issued_by_official_id: req.user!.id,
      start_date: start_date || new Date().toISOString().split('T')[0],
      expiry_date: expiry_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      is_active: true,
      created_at: new Date().toISOString(),
    };

    db.createPublicAlert(newAlert);

    // Create notification for citizens in that area/all citizens
    const citizens = db.getAllUsers().filter((u) => u.role === 'citizen');
    for (const c of citizens) {
      db.createNotification({
        id: `notif-alt-${Date.now().toString(36)}-${c.id}`,
        user_id: c.id,
        title: `PUBLIC HEALTH ALERT: ${newAlert.title}`,
        message: newAlert.message,
        type: 'ALERT',
        reference_id: newAlert.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    return res.status(201).json({ message: 'Public alert issued successfully', alert: newAlert });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 5. ADMINISTRATOR ROUTES
// ==============================================================================

// Admin Dashboard Summary Metrics
apiRouter.get('/admin/metrics', authenticateToken, requireRole('admin'), (req, res) => {
  const allReports = db.getReports();
  const allFacilities = db.getFacilities();
  const allClusters = db.getOutbreakClusters();
  const allUsers = db.getAllUsers();
  const allAlerts = db.getPublicAlerts(false);

  const reportsByStatus: Record<string, number> = {};
  for (const r of allReports) {
    reportsByStatus[r.status] = (reportsByStatus[r.status] || 0) + 1;
  }

  const facilitiesByStatus: Record<string, number> = {};
  for (const f of allFacilities) {
    facilitiesByStatus[f.verification_status] = (facilitiesByStatus[f.verification_status] || 0) + 1;
  }

  return res.json({
    metrics: {
      totalReports: allReports.length,
      verifiedReports: reportsByStatus['VERIFIED'] || 0,
      pendingReviewReports: (reportsByStatus['SUBMITTED'] || 0) + (reportsByStatus['PENDING_REVIEW'] || 0),
      totalFacilities: allFacilities.length,
      approvedFacilities: facilitiesByStatus['APPROVED'] || 0,
      pendingFacilities: facilitiesByStatus['PENDING'] || 0,
      activeClusters: allClusters.filter((c) => c.status !== 'DISMISSED' && c.status !== 'RESOLVED').length,
      totalCitizens: allUsers.filter((u) => u.role === 'citizen').length,
      totalOfficials: allUsers.filter((u) => u.role === 'official').length,
      activeAlerts: allAlerts.filter((a) => a.is_active).length,
      reportsByStatus,
      facilitiesByStatus,
    },
  });
});

// Admin Facilities Management
apiRouter.get('/admin/facilities', authenticateToken, requireRole('admin'), (req, res) => {
  const facilities = db.getFacilities();
  const applications = db.getFacilityApplications();
  return res.json({ facilities, applications });
});

apiRouter.post('/admin/facilities', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  try {
    const { name, type, state, lga, address, latitude, longitude, phone, email, verification_status, is_active } = req.body;
    if (!name || !state || !lga || !address) {
      return res.status(400).json({ error: 'Name, state, lga, and address required' });
    }

    const facility: HealthFacility = {
      id: `fac-${Date.now().toString(36)}`,
      name,
      type: type || 'Primary Healthcare Centre',
      state,
      lga,
      address,
      latitude: Number(latitude) || 6.5244,
      longitude: Number(longitude) || 3.3792,
      phone: phone || '+234 800 000 0000',
      email: email || 'info@facility.ng',
      verification_status: verification_status || 'PENDING',
      is_active: is_active !== undefined ? is_active : (verification_status === 'APPROVED'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.createFacility(facility);
    return res.status(201).json({ facility });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin updates facility accreditation status (APPROVED, REJECTED, NEEDS_INFORMATION)
apiRouter.patch('/admin/facilities/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { verification_status, is_active } = req.body;
  const updates: Partial<HealthFacility> = {};

  if (verification_status) {
    updates.verification_status = verification_status;
    if (verification_status === 'APPROVED') {
      updates.is_active = true;
    } else if (verification_status === 'REJECTED') {
      updates.is_active = false;
    }
  }

  if (is_active !== undefined) {
    updates.is_active = is_active;
  }

  const updated = db.updateFacility(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Facility not found' });

  return res.json({ message: 'Facility updated', facility: updated });
});

// Admin Health Officials Management
apiRouter.get('/admin/officials', authenticateToken, requireRole('admin'), (req, res) => {
  const officials = db.getOfficials();
  return res.json({ officials });
});

apiRouter.post('/admin/officials', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const { name, email, phone, password, facility_id, cadre, license_number } = req.body;
    if (!name || !email || !password || !facility_id) {
      return res.status(400).json({ error: 'Name, email, password, and facility assignment are required' });
    }

    if (db.findUserByEmail(email)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id: `usr-${Date.now().toString(36)}`,
      name,
      email,
      phone: phone || '+234 800 000 0000',
      role: 'official',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.createUser(user, passwordHash);

    const official = db.createOfficial({
      id: `off-${Date.now().toString(36)}`,
      user_id: user.id,
      facility_id,
      cadre: cadre || 'Medical Surveillance Officer',
      license_number: license_number || 'MDCN-PENDING',
      is_active: true,
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({ message: 'Health official created and assigned', user, official });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Citizens Management
apiRouter.get('/admin/citizens', authenticateToken, requireRole('admin'), (req, res) => {
  const citizens = db.getAllUsers().filter((u) => u.role === 'citizen');
  return res.json({ citizens });
});

// Admin Reports Overview
apiRouter.get('/admin/reports', authenticateToken, requireRole('admin'), (req, res) => {
  const reports = db.getReports();
  return res.json({ reports });
});

// Admin Outbreak Settings and Clusters
apiRouter.get('/admin/outbreaks', authenticateToken, requireRole('admin'), (req, res) => {
  const clusters = db.getOutbreakClusters();
  const radius = db.getSystemSetting('outbreak_radius_km')?.setting_value || '5';
  const timeWindow = db.getSystemSetting('outbreak_time_window_days')?.setting_value || '7';
  const minReports = db.getSystemSetting('outbreak_min_reports')?.setting_value || '5';

  return res.json({
    clusters,
    settings: {
      outbreak_radius_km: Number(radius),
      outbreak_time_window_days: Number(timeWindow),
      outbreak_min_reports: Number(minReports),
    },
  });
});

apiRouter.patch('/admin/outbreak-settings', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { outbreak_radius_km, outbreak_time_window_days, outbreak_min_reports } = req.body;

  if (outbreak_radius_km !== undefined) {
    db.setSystemSetting('outbreak_radius_km', String(outbreak_radius_km), req.user!.id);
  }
  if (outbreak_time_window_days !== undefined) {
    db.setSystemSetting('outbreak_time_window_days', String(outbreak_time_window_days), req.user!.id);
  }
  if (outbreak_min_reports !== undefined) {
    db.setSystemSetting('outbreak_min_reports', String(outbreak_min_reports), req.user!.id);
  }

  return res.json({ message: 'Outbreak detection settings updated successfully' });
});

// Admin Categories Management
apiRouter.get('/admin/categories', authenticateToken, requireRole('admin'), (req, res) => {
  const categories = db.getCategories();
  return res.json({ categories });
});

apiRouter.post('/admin/categories', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { name, description, icon, severity_level } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const category = db.createCategory({
    id: `cat-${Date.now().toString(36)}`,
    name,
    description: description || '',
    icon: icon || 'alert-circle',
    severity_level: severity_level || 'MEDIUM',
    is_active: true,
    created_at: new Date().toISOString(),
  });

  return res.status(201).json({ category });
});

// Admin System Settings
apiRouter.get('/admin/settings', authenticateToken, requireRole('admin'), (req, res) => {
  const settings = db.getSystemSettings();
  return res.json({ settings });
});

apiRouter.patch('/admin/settings', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { settings } = req.body; // Record<string, string>
  if (settings && typeof settings === 'object') {
    for (const [k, v] of Object.entries(settings)) {
      db.setSystemSetting(k, String(v), req.user!.id);
    }
  }
  return res.json({ message: 'Settings updated', settings: db.getSystemSettings() });
});

// Admin Audit Logs
apiRouter.get('/admin/audit-logs', authenticateToken, requireRole('admin'), (req, res) => {
  const auditLogs = db.getAuditLogs();
  return res.json({ auditLogs });
});

// AI Administration Assistant Endpoint
apiRouter.post('/admin/ai-assistant', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const { prompt, confirmedAction } = req.body;
    if (!prompt && !confirmedAction) {
      return res.status(400).json({ error: 'Prompt or confirmed action is required' });
    }

    const aiResponse = await processAiAdminCommand({
      adminUser: req.user!,
      prompt: prompt || '',
      confirmedAction,
    });

    return res.json(aiResponse);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Accounts Management (Requirement 9: other admin accounts can only be created in the admin dashboard)
apiRouter.get('/admin/admins', authenticateToken, requireRole('admin'), (req, res) => {
  const admins = db.getAllUsers()
    .filter((u) => u.role === 'admin')
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      created_at: u.created_at,
    }));
  return res.json({ admins });
});

apiRouter.post('/admin/admins', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and permanent password are required' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin: User = {
      id: `usr-admin-${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+234 800 000 0000',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.createUser(newAdmin, passwordHash);

    db.createAuditLog({
      id: `aud-${Date.now().toString(36)}`,
      action: 'ADMIN_CREATE_ADMIN_ACCOUNT',
      user_id: req.user!.id,
      user_name: req.user!.name,
      target_entity: 'User',
      target_id: newAdmin.id,
      details: {
        new_admin_name: newAdmin.name,
        new_admin_email: newAdmin.email,
        created_by_admin: req.user!.name,
      },
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      message: 'New Administrator account successfully provisioned',
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
        created_at: newAdmin.created_at,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
