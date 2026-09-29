/**
 * Community Health Report System (CHRS) - Database Layer & Seed Store
 * Implements relational schema operations, foreign keys, transaction-like mutations,
 * and realistic Nigerian epidemiological data.
 */

import bcrypt from 'bcryptjs';
import {
  AuditLog,
  FacilityApplication,
  HealthFacility,
  HealthOfficial,
  HealthReport,
  Notification,
  OutbreakCluster,
  OutbreakClusterReport,
  PublicAlert,
  ReportCategory,
  ReportStatusHistory,
  SystemSetting,
  User,
} from '../src/types';

interface DatabaseStore {
  users: User[];
  passwordHashes: Record<string, string>;
  healthFacilities: HealthFacility[];
  facilityApplications: FacilityApplication[];
  healthOfficials: HealthOfficial[];
  reportCategories: ReportCategory[];
  reports: HealthReport[];
  reportStatusHistory: ReportStatusHistory[];
  notifications: Notification[];
  outbreakClusters: OutbreakCluster[];
  outbreakClusterReports: OutbreakClusterReport[];
  publicAlerts: PublicAlert[];
  auditLogs: AuditLog[];
  systemSettings: Record<string, SystemSetting>;
  passwordResetTokens: Array<{ token: string; userId: string; expiresAt: string; used: boolean }>;
}

// In-memory singleton database store initialized with seed records
class InMemoryDatabase {
  private store: DatabaseStore = {
    users: [],
    passwordHashes: {},
    healthFacilities: [],
    facilityApplications: [],
    healthOfficials: [],
    reportCategories: [],
    reports: [],
    reportStatusHistory: [],
    notifications: [],
    outbreakClusters: [],
    outbreakClusterReports: [],
    publicAlerts: [],
    auditLogs: [],
    systemSettings: {},
    passwordResetTokens: [],
  };

  private initialized = false;

  public async initialize() {
    if (this.initialized) return;

    const defaultPasswordHash = await bcrypt.hash('password123', 10);
    const adminPasswordHash = await bcrypt.hash('Aharhibaba123.', 10);

    // 1. Initial Users
    const citizenUser: User = {
      id: 'usr-citizen-01',
      name: 'Chinedu Okafor',
      email: 'citizen@chrs.gov.ng',
      phone: '+234 803 123 4567',
      role: 'citizen',
      created_at: '2026-08-01T08:00:00.000Z',
      updated_at: '2026-08-01T08:00:00.000Z',
    };

    const officialUser: User = {
      id: 'usr-official-01',
      name: 'Dr. Gabriel Etu',
      email: 'gabrieletu40@gmail.com',
      phone: '+234 802 987 6543',
      role: 'official',
      created_at: '2026-08-01T08:00:00.000Z',
      updated_at: '2026-08-01T08:00:00.000Z',
    };

    const officialUserGov: User = {
      id: 'usr-official-02',
      name: 'Dr. Gabriel Etu',
      email: 'official@chrs.gov.ng',
      phone: '+234 802 987 6543',
      role: 'official',
      created_at: '2026-08-01T08:00:00.000Z',
      updated_at: '2026-08-01T08:00:00.000Z',
    };

    const adminUser: User = {
      id: 'usr-admin-01',
      name: 'Eseoghene Destiny',
      email: 'eseoghenedestiny05@gmail.com',
      phone: '+234 809 555 1122',
      role: 'admin',
      created_at: '2026-08-01T08:00:00.000Z',
      updated_at: '2026-08-01T08:00:00.000Z',
    };

    this.store.users = [citizenUser, officialUser, officialUserGov, adminUser];
    this.store.passwordHashes = {
      [citizenUser.id]: defaultPasswordHash,
      [officialUser.id]: defaultPasswordHash,
      [officialUserGov.id]: defaultPasswordHash,
      [adminUser.id]: adminPasswordHash,
    };

    // 2. Health Facilities
    this.store.healthFacilities = [
      {
        id: 'fac-lagos-01',
        name: 'Lagos Island Comprehensive Health Centre',
        type: 'Primary Healthcare Centre',
        state: 'Lagos',
        lga: 'Lagos Island',
        address: '15 Broad Street, Lagos Island',
        latitude: 6.4549,
        longitude: 3.4246,
        phone: '+234 1 234 5678',
        email: 'lagosisland.phc@health.lagosstate.gov.ng',
        verification_status: 'APPROVED',
        is_active: true,
        created_at: '2026-01-10T10:00:00.000Z',
        updated_at: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'fac-ikeja-02',
        name: 'Ikeja General Hospital',
        type: 'General Hospital',
        state: 'Lagos',
        lga: 'Ikeja',
        address: 'Oba Akinjobi Way, GRA, Ikeja',
        latitude: 6.5954,
        longitude: 3.3364,
        phone: '+234 1 876 5432',
        email: 'info@ikejageneralhospital.org.ng',
        verification_status: 'APPROVED',
        is_active: true,
        created_at: '2026-01-12T10:00:00.000Z',
        updated_at: '2026-01-12T10:00:00.000Z',
      },
      {
        id: 'fac-abuja-03',
        name: 'Garki District Hospital',
        type: 'General Hospital',
        state: 'Abuja FCT',
        lga: 'Municipal',
        address: 'Tafawa Balewa Way, Area 10, Garki, Abuja',
        latitude: 9.0322,
        longitude: 7.4891,
        phone: '+234 9 461 3000',
        email: 'surveillance@garkihospital.com',
        verification_status: 'APPROVED',
        is_active: true,
        created_at: '2026-01-15T10:00:00.000Z',
        updated_at: '2026-01-15T10:00:00.000Z',
      },
      {
        id: 'fac-benin-04',
        name: 'University of Benin Teaching Hospital (UBTH)',
        type: 'Teaching Hospital',
        state: 'Edo',
        lga: 'Egor',
        address: 'Ugbowo Lagos-Benin Expressway, Benin City',
        latitude: 6.3934,
        longitude: 5.6148,
        phone: '+234 52 600 440',
        email: 'epidemiology@ubth.org.ng',
        verification_status: 'APPROVED',
        is_active: true,
        created_at: '2026-02-01T10:00:00.000Z',
        updated_at: '2026-02-01T10:00:00.000Z',
      },
      {
        id: 'fac-kano-05',
        name: 'Aminu Kano Teaching Hospital (AKTH)',
        type: 'Teaching Hospital',
        state: 'Kano',
        lga: 'Tarauni',
        address: 'Zaria Road, Tarauni, Kano',
        latitude: 11.9687,
        longitude: 8.5372,
        phone: '+234 64 669 881',
        email: 'surveillance@akth.org.ng',
        verification_status: 'APPROVED',
        is_active: true,
        created_at: '2026-02-05T10:00:00.000Z',
        updated_at: '2026-02-05T10:00:00.000Z',
      },
      {
        id: 'fac-ibadan-06',
        name: 'University College Hospital (UCH) Ibadan',
        type: 'Teaching Hospital',
        state: 'Oyo',
        lga: 'Ibadan North',
        address: 'Queen Elizabeth Road, Ibadan',
        latitude: 7.4042,
        longitude: 3.9061,
        phone: '+234 2 241 0088',
        email: 'publichealth@uch-ibadan.org.ng',
        verification_status: 'APPROVED',
        is_active: true,
        created_at: '2026-02-10T10:00:00.000Z',
        updated_at: '2026-02-10T10:00:00.000Z',
      },
      // Pending Facility Application
      {
        id: 'fac-oredo-07',
        name: 'Oredo Community Health Clinic',
        type: 'Primary Healthcare Centre',
        state: 'Edo',
        lga: 'Oredo',
        address: '22 Ring Road, King Square, Benin City',
        latitude: 6.335,
        longitude: 5.6037,
        phone: '+234 805 111 2233',
        email: 'contact@oredoclinic.ng',
        verification_status: 'PENDING',
        is_active: false,
        created_at: '2026-09-01T14:30:00.000Z',
        updated_at: '2026-09-01T14:30:00.000Z',
      },
      // Needs Information Facility Application
      {
        id: 'fac-alimosho-08',
        name: 'Alimosho Maternal & Child Centre',
        type: 'Specialist Clinic',
        state: 'Lagos',
        lga: 'Alimosho',
        address: '45 LASU-Iba Expressway, Igando, Lagos',
        latitude: 6.6094,
        longitude: 3.2562,
        phone: '+234 803 777 8899',
        email: 'info@alimoshohealth.gov.ng',
        verification_status: 'NEEDS_INFORMATION',
        is_active: false,
        created_at: '2026-08-25T11:20:00.000Z',
        updated_at: '2026-08-28T09:15:00.000Z',
      },
    ];

    // 3. Facility Applications
    this.store.facilityApplications = [
      {
        id: 'app-oredo-01',
        facility_id: 'fac-oredo-07',
        applicant_name: 'Dr. Osasumwen Ighodaro',
        applicant_email: 'osas.ighodaro@oredoclinic.ng',
        license_number: 'MDCN-2018-88492',
        supporting_document_url: 'https://cdn.health.gov.ng/accreditation/oredo-cert.pdf',
        notes: 'Primary health care outreach facility with 15 observation beds and triage bay.',
        created_at: '2026-09-01T14:30:00.000Z',
      },
      {
        id: 'app-alimosho-02',
        facility_id: 'fac-alimosho-08',
        applicant_name: 'Matron Folake Sanusi',
        applicant_email: 'f.sanusi@alimoshohealth.gov.ng',
        license_number: 'NMCN-2015-44211',
        supporting_document_url: 'https://cdn.health.gov.ng/accreditation/alimosho-cert.pdf',
        notes: 'Additional fire safety compliance certificate and waste management MOU requested.',
        created_at: '2026-08-25T11:20:00.000Z',
        reviewed_at: '2026-08-28T09:15:00.000Z',
        reviewed_by: 'usr-admin-01',
      },
    ];

    // 4. Health Officials
    this.store.healthOfficials = [
      {
        id: 'off-01',
        user_id: 'usr-official-01',
        facility_id: 'fac-lagos-01',
        cadre: 'Surveillance Medical Officer',
        license_number: 'MDCN-2014-55321',
        is_active: true,
        created_at: '2026-08-01T08:00:00.000Z',
      },
      {
        id: 'off-02',
        user_id: 'usr-official-02',
        facility_id: 'fac-lagos-01',
        cadre: 'Surveillance Medical Officer',
        license_number: 'MDCN-2014-55321',
        is_active: true,
        created_at: '2026-08-01T08:00:00.000Z',
      },
    ];

    // 5. Report Categories
    this.store.reportCategories = [
      {
        id: 'cat-cholera',
        name: 'Cholera / Acute Watery Diarrhoea',
        description: 'Severe sudden watery diarrhoea with vomiting, dehydration, and rapid weakness.',
        icon: 'droplets',
        severity_level: 'CRITICAL',
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-lassa',
        name: 'Lassa Fever / Viral Haemorrhagic Suspicion',
        description: 'High fever, facial swelling, mucosal bleeding, severe chest/back pain.',
        icon: 'flame',
        severity_level: 'CRITICAL',
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-malaria-severe',
        name: 'Severe Febrile Illness / Complicated Malaria',
        description: 'Unremitting high temperatures, convulsions, severe anemia, jaundice.',
        icon: 'activity',
        severity_level: 'HIGH',
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-flood-hazard',
        name: 'Flood-related Health Hazard & Contaminated Water',
        description: 'Stagnant floodwater inundating community wells, septic tank overflows, skin eruptions.',
        icon: 'waves',
        severity_level: 'HIGH',
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-meningitis',
        name: 'Meningitis / Cerebrospinal Fever',
        description: 'Sudden high fever, stiff neck, photophobia, altered mental status, petechial rash.',
        icon: 'brain',
        severity_level: 'CRITICAL',
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-food-poisoning',
        name: 'Food Poisoning / Community Ingestion Cluster',
        description: 'Multiple community members ill after shared market or festive meal with abdominal cramps.',
        icon: 'utensils',
        severity_level: 'MEDIUM',
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ];

    // 6. Reports (including verified reports around Lagos Island to illustrate active cluster)
    this.store.reports = [
      {
        id: 'rep-001',
        reference_no: 'CHR-2026-00001',
        citizen_id: 'usr-citizen-01',
        category_id: 'cat-cholera',
        title: 'Cluster of sudden rice-water diarrhoea cases along Marina market',
        description: 'Over 6 market vendors and shop attendants suddenly developed severe diarrhoea and vomiting after drinking borehole water.',
        symptoms: ['Severe Watery Diarrhoea', 'Vomiting', 'Muscle Cramps', 'Extreme Weakness'],
        affected_count: 6,
        latitude: 6.4520,
        longitude: 3.4210,
        location_name: 'Marina Waterfront Market, Lagos Island',
        state: 'Lagos',
        lga: 'Lagos Island',
        assigned_facility_id: 'fac-lagos-01',
        status: 'VERIFIED',
        created_at: '2026-09-10T11:00:00.000Z',
        updated_at: '2026-09-11T09:30:00.000Z',
      },
      {
        id: 'rep-002',
        reference_no: 'CHR-2026-00002',
        citizen_id: 'usr-citizen-01',
        category_id: 'cat-cholera',
        title: 'Secondary cases in Broad Street residential compound',
        description: 'Two elderly residents and three children suffering dehydration.',
        symptoms: ['Severe Watery Diarrhoea', 'Sunken Eyes', 'Fever', 'Lethargy'],
        affected_count: 5,
        latitude: 6.4555,
        longitude: 3.4235,
        location_name: 'Broad Street near CMS, Lagos Island',
        state: 'Lagos',
        lga: 'Lagos Island',
        assigned_facility_id: 'fac-lagos-01',
        status: 'VERIFIED',
        created_at: '2026-09-11T14:15:00.000Z',
        updated_at: '2026-09-12T08:20:00.000Z',
      },
      {
        id: 'rep-003',
        reference_no: 'CHR-2026-00003',
        citizen_id: 'usr-citizen-01',
        category_id: 'cat-cholera',
        title: 'Watery stooling after burst municipal pipe on Idumota Street',
        description: 'Contaminated run-off entered residential water tanks.',
        symptoms: ['Watery Diarrhoea', 'Abdominal Cramping'],
        affected_count: 4,
        latitude: 6.4590,
        longitude: 3.3850,
        location_name: 'Idumota Market Area, Lagos Island',
        state: 'Lagos',
        lga: 'Lagos Island',
        assigned_facility_id: 'fac-lagos-01',
        status: 'VERIFIED',
        created_at: '2026-09-12T10:05:00.000Z',
        updated_at: '2026-09-12T15:40:00.000Z',
      },
      {
        id: 'rep-004',
        reference_no: 'CHR-2026-00004',
        citizen_id: 'usr-citizen-01',
        category_id: 'cat-cholera',
        title: 'Rapid onset dehydration in Isale Eko youth centre',
        description: 'Youth attendees fell ill after consuming community tap water.',
        symptoms: ['Severe Watery Diarrhoea', 'Vomiting', 'Dehydration'],
        affected_count: 7,
        latitude: 6.4630,
        longitude: 3.3910,
        location_name: 'Isale Eko Community Centre, Lagos Island',
        state: 'Lagos',
        lga: 'Lagos Island',
        assigned_facility_id: 'fac-lagos-01',
        status: 'VERIFIED',
        created_at: '2026-09-13T08:30:00.000Z',
        updated_at: '2026-09-13T12:00:00.000Z',
      },
      {
        id: 'rep-005',
        reference_no: 'CHR-2026-00005',
        citizen_id: 'usr-citizen-01',
        category_id: 'cat-cholera',
        title: 'Fifth reported household case near Campbell Street',
        description: 'Mother and two young siblings showing signs of acute dehydration.',
        symptoms: ['Rice-water Diarrhoea', 'Vomiting'],
        affected_count: 3,
        latitude: 6.4510,
        longitude: 3.3980,
        location_name: 'Campbell Street, Lagos Island',
        state: 'Lagos',
        lga: 'Lagos Island',
        assigned_facility_id: 'fac-lagos-01',
        status: 'VERIFIED',
        created_at: '2026-09-13T16:20:00.000Z',
        updated_at: '2026-09-14T07:10:00.000Z',
      },
      {
        id: 'rep-006',
        reference_no: 'CHR-2026-00006',
        citizen_id: 'usr-citizen-01',
        category_id: 'cat-flood-hazard',
        title: 'Submerged septic drainage contaminating borehole well',
        description: 'Heavy rains flooded the street gutter into open wells used by 12 families.',
        symptoms: ['Skin Rash', 'Mild Diarrhoea', 'Eye Irritation'],
        affected_count: 12,
        latitude: 6.6010,
        longitude: 3.3420,
        location_name: 'Alausa residential quarters, Ikeja',
        state: 'Lagos',
        lga: 'Ikeja',
        assigned_facility_id: 'fac-ikeja-02',
        status: 'SUBMITTED',
        created_at: '2026-09-14T06:00:00.000Z',
        updated_at: '2026-09-14T06:00:00.000Z',
      },
    ];

    // 7. Report Status History
    this.store.reportStatusHistory = [
      {
        id: 'hist-01',
        report_id: 'rep-001',
        previous_status: 'SUBMITTED',
        new_status: 'VIEWED',
        changed_by_user_id: 'usr-official-01',
        notes: 'Initial clinical assessment opened by surveillance officer.',
        timestamp: '2026-09-10T12:00:00.000Z',
      },
      {
        id: 'hist-02',
        report_id: 'rep-001',
        previous_status: 'VIEWED',
        new_status: 'VERIFIED',
        changed_by_user_id: 'usr-official-01',
        notes: 'Rapid diagnostic test (RDT) positive for Vibrio cholerae. Oral rehydration dispatched.',
        timestamp: '2026-09-11T09:30:00.000Z',
      },
      {
        id: 'hist-03',
        report_id: 'rep-002',
        previous_status: 'SUBMITTED',
        new_status: 'VERIFIED',
        changed_by_user_id: 'usr-official-01',
        notes: 'Epidemiologically linked to Marina market well contamination.',
        timestamp: '2026-09-12T08:20:00.000Z',
      },
      {
        id: 'hist-04',
        report_id: 'rep-003',
        previous_status: 'SUBMITTED',
        new_status: 'VERIFIED',
        changed_by_user_id: 'usr-official-01',
        notes: 'Water samples collected for state microbiology laboratory.',
        timestamp: '2026-09-12T15:40:00.000Z',
      },
      {
        id: 'hist-05',
        report_id: 'rep-004',
        previous_status: 'SUBMITTED',
        new_status: 'VERIFIED',
        changed_by_user_id: 'usr-official-01',
        notes: 'Field rapid response team deployed to Isale Eko.',
        timestamp: '2026-09-13T12:00:00.000Z',
      },
      {
        id: 'hist-06',
        report_id: 'rep-005',
        previous_status: 'SUBMITTED',
        new_status: 'VERIFIED',
        changed_by_user_id: 'usr-official-01',
        notes: 'Threshold reached: Automated Outbreak Cluster Detection triggered.',
        timestamp: '2026-09-14T07:10:00.000Z',
      },
    ];

    // 8. Notifications
    this.store.notifications = [
      {
        id: 'notif-01',
        user_id: 'usr-citizen-01',
        title: 'Report Received: CHR-2026-00006',
        message: 'Your report regarding Flood-related Health Hazard has been routed to Ikeja General Hospital (approx 1.2km away).',
        type: 'REPORT_UPDATE',
        reference_id: 'CHR-2026-00006',
        is_read: false,
        created_at: '2026-09-14T06:01:00.000Z',
      },
      {
        id: 'notif-02',
        user_id: 'usr-citizen-01',
        title: 'Report Verified: CHR-2026-00005',
        message: 'Dr. Gabriel Etu at Lagos Island Health Centre has verified your report and initiated public health intervention.',
        type: 'REPORT_UPDATE',
        reference_id: 'CHR-2026-00005',
        is_read: false,
        created_at: '2026-09-14T07:10:00.000Z',
      },
      {
        id: 'notif-03',
        user_id: 'usr-official-01',
        title: 'Possible Outbreak Cluster Triggered',
        message: 'Spatial surveillance detected 5 verified Cholera reports in Lagos Island LGA within a 5km radius.',
        type: 'CLUSTER',
        reference_id: 'clus-01',
        is_read: false,
        created_at: '2026-09-14T07:11:00.000Z',
      },
    ];

    // 9. Outbreak Clusters
    this.store.outbreakClusters = [
      {
        id: 'clus-01',
        cluster_name: 'POSSIBLE OUTBREAK CLUSTER: Acute Watery Diarrhoea (Lagos Island)',
        category_id: 'cat-cholera',
        state: 'Lagos',
        lga: 'Lagos Island',
        center_lat: 6.4561,
        center_lng: 3.4037,
        radius_km: 5.0,
        report_count: 5,
        status: 'DETECTED',
        investigator_notes: 'Initial spatial-temporal cluster detected matching 5 verified cases within 7 days. Chlorine water purification and contact tracing in progress.',
        detected_at: '2026-09-14T07:11:00.000Z',
        updated_at: '2026-09-14T07:11:00.000Z',
      },
    ];

    // 10. Outbreak Cluster Reports association
    this.store.outbreakClusterReports = [
      { cluster_id: 'clus-01', report_id: 'rep-001', distance_km: 1.9, added_at: '2026-09-14T07:11:00.000Z' },
      { cluster_id: 'clus-01', report_id: 'rep-002', distance_km: 2.1, added_at: '2026-09-14T07:11:00.000Z' },
      { cluster_id: 'clus-01', report_id: 'rep-003', distance_km: 2.0, added_at: '2026-09-14T07:11:00.000Z' },
      { cluster_id: 'clus-01', report_id: 'rep-004', distance_km: 1.6, added_at: '2026-09-14T07:11:00.000Z' },
      { cluster_id: 'clus-01', report_id: 'rep-005', distance_km: 0.8, added_at: '2026-09-14T07:11:00.000Z' },
    ];

    // 11. Public Alerts
    this.store.publicAlerts = [
      {
        id: 'alert-01',
        title: 'CHOLERA SURVEILLANCE & HYGIENE ADVISORY',
        category_id: 'cat-cholera',
        message: 'Lagos State Ministry of Health alerts residents of Lagos Island and surrounding communities to boil all drinking water and practice frequent handwashing. Immediate treatment is available free at all accredited PHCs.',
        affected_area: 'Lagos Island LGA & CMS Corridor',
        state: 'Lagos',
        severity: 'WARNING',
        latitude: 6.4561,
        longitude: 3.4037,
        radius_km: 7.5,
        issued_by_official_id: 'usr-official-01',
        start_date: '2026-09-12',
        expiry_date: '2026-09-26',
        is_active: true,
        created_at: '2026-09-12T10:00:00.000Z',
      },
    ];

    // 12. Audit Logs
    this.store.auditLogs = [
      {
        id: 'aud-01',
        admin_user_id: 'usr-admin-01',
        ai_action: 'SYSTEM_BOOTSTRAP',
        affected_entity: 'SystemConfig',
        entity_id: 'SYS-INIT',
        previous_value: 'null',
        new_value: 'INITIALIZED',
        details: 'Community Health Report System initialized with baseline Nigerian public health parameters.',
        timestamp: '2026-08-01T08:00:00.000Z',
      },
      {
        id: 'aud-02',
        admin_user_id: 'usr-admin-01',
        ai_action: 'FACILITY_STATUS_UPDATE',
        affected_entity: 'HealthFacility',
        entity_id: 'fac-lagos-01',
        previous_value: 'PENDING',
        new_value: 'APPROVED',
        details: 'Lagos Island Comprehensive Health Centre accredited following state surveillance inspection.',
        timestamp: '2026-08-05T14:20:00.000Z',
      },
    ];

    // 13. System Settings
    this.store.systemSettings = {
      outbreak_radius_km: {
        setting_key: 'outbreak_radius_km',
        setting_value: '5',
        description: 'Maximum geographical radius in kilometers for clustering verified cases',
        updated_by: 'usr-admin-01',
        updated_at: '2026-08-01T08:00:00.000Z',
      },
      outbreak_time_window_days: {
        setting_key: 'outbreak_time_window_days',
        setting_value: '7',
        description: 'Time threshold window in days to consider cases epidemiologically linked',
        updated_by: 'usr-admin-01',
        updated_at: '2026-08-01T08:00:00.000Z',
      },
      outbreak_min_reports: {
        setting_key: 'outbreak_min_reports',
        setting_value: '5',
        description: 'Minimum number of verified health reports to trigger a possible outbreak cluster',
        updated_by: 'usr-admin-01',
        updated_at: '2026-08-01T08:00:00.000Z',
      },
      available_states: {
        setting_key: 'available_states',
        setting_value: JSON.stringify([
          'Lagos',
          'Abuja FCT',
          'Edo',
          'Kano',
          'Oyo',
          'Rivers',
          'Anambra',
          'Kaduna',
          'Enugu',
          'Delta',
        ]),
        description: 'List of active operational Nigerian states for facility routing and reports',
        updated_by: 'usr-admin-01',
        updated_at: '2026-08-01T08:00:00.000Z',
      },
      emergency_alert_message: {
        setting_key: 'emergency_alert_message',
        setting_value: 'Report any sudden water-borne illness or high fever immediately to your nearest accredited Primary Healthcare Centre.',
        description: 'Public banner advisory message displayed across citizen portal',
        updated_by: 'usr-admin-01',
        updated_at: '2026-08-01T08:00:00.000Z',
      },
    };

    this.initialized = true;
  }

  // User queries
  public findUserByEmail(email: string): User | undefined {
    return this.store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.store.users.find((u) => u.id === id);
  }

  public getUserPasswordHash(userId: string): string | undefined {
    return this.store.passwordHashes[userId];
  }

  public setUserPassword(userId: string, newHash: string) {
    this.store.passwordHashes[userId] = newHash;
  }

  public createUser(user: User, passwordHash: string): User {
    this.store.users.push(user);
    this.store.passwordHashes[user.id] = passwordHash;
    return user;
  }

  public getAllUsers(): User[] {
    return [...this.store.users];
  }

  // Facility queries
  public getFacilities(): HealthFacility[] {
    return [...this.store.healthFacilities];
  }

  public getFacilityById(id: string): HealthFacility | undefined {
    return this.store.healthFacilities.find((f) => f.id === id);
  }

  public createFacility(facility: HealthFacility): HealthFacility {
    this.store.healthFacilities.push(facility);
    return facility;
  }

  public updateFacility(id: string, updates: Partial<HealthFacility>): HealthFacility | null {
    const index = this.store.healthFacilities.findIndex((f) => f.id === id);
    if (index === -1) return null;
    this.store.healthFacilities[index] = {
      ...this.store.healthFacilities[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.store.healthFacilities[index];
  }

  public deleteFacility(id: string): boolean {
    const initialLen = this.store.healthFacilities.length;
    this.store.healthFacilities = this.store.healthFacilities.filter((f) => f.id !== id);
    return this.store.healthFacilities.length < initialLen;
  }

  // Facility Applications
  public getFacilityApplications(): FacilityApplication[] {
    return this.store.facilityApplications.map((app) => ({
      ...app,
      facility: this.getFacilityById(app.facility_id),
    }));
  }

  public createFacilityApplication(app: FacilityApplication): FacilityApplication {
    this.store.facilityApplications.push(app);
    return app;
  }

  public updateFacilityApplication(id: string, updates: Partial<FacilityApplication>): FacilityApplication | null {
    const index = this.store.facilityApplications.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.store.facilityApplications[index] = {
      ...this.store.facilityApplications[index],
      ...updates,
    };
    return this.store.facilityApplications[index];
  }

  // Health Officials
  public getOfficials(): HealthOfficial[] {
    return this.store.healthOfficials.map((off) => ({
      ...off,
      user: this.findUserById(off.user_id),
      facility: this.getFacilityById(off.facility_id),
    }));
  }

  public getOfficialByUserId(userId: string): HealthOfficial | undefined {
    const official = this.store.healthOfficials.find((o) => o.user_id === userId);
    if (!official) return undefined;
    return {
      ...official,
      user: this.findUserById(official.user_id),
      facility: this.getFacilityById(official.facility_id),
    };
  }

  public createOfficial(official: HealthOfficial): HealthOfficial {
    this.store.healthOfficials.push(official);
    return official;
  }

  // Categories
  public getCategories(): ReportCategory[] {
    return [...this.store.reportCategories];
  }

  public getCategoryById(id: string): ReportCategory | undefined {
    return this.store.reportCategories.find((c) => c.id === id);
  }

  public createCategory(category: ReportCategory): ReportCategory {
    this.store.reportCategories.push(category);
    return category;
  }

  public updateCategory(id: string, updates: Partial<ReportCategory>): ReportCategory | null {
    const index = this.store.reportCategories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.store.reportCategories[index] = { ...this.store.reportCategories[index], ...updates };
    return this.store.reportCategories[index];
  }

  // Reports
  public getReports(): HealthReport[] {
    return this.store.reports.map((r) => this.enrichReport(r));
  }

  public getReportById(id: string): HealthReport | undefined {
    const r = this.store.reports.find((report) => report.id === id || report.reference_no === id);
    return r ? this.enrichReport(r) : undefined;
  }

  public getReportsByCitizenId(citizenId: string): HealthReport[] {
    return this.store.reports
      .filter((r) => r.citizen_id === citizenId)
      .map((r) => this.enrichReport(r))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getReportsByFacilityId(facilityId: string): HealthReport[] {
    return this.store.reports
      .filter((r) => r.assigned_facility_id === facilityId)
      .map((r) => this.enrichReport(r))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createReport(report: HealthReport): HealthReport {
    this.store.reports.push(report);
    // Add initial status history
    this.store.reportStatusHistory.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      report_id: report.id,
      previous_status: 'SUBMITTED',
      new_status: 'SUBMITTED',
      changed_by_user_id: report.citizen_id,
      notes: 'Report submitted by citizen via mobile portal.',
      timestamp: report.created_at,
    });
    return this.enrichReport(report);
  }

  public updateReportStatus(params: {
    reportId: string;
    newStatus: HealthReport['status'];
    changedByUserId: string;
    notes?: string;
  }): HealthReport | null {
    const index = this.store.reports.findIndex((r) => r.id === params.reportId);
    if (index === -1) return null;

    const previousStatus = this.store.reports[index].status;
    if (previousStatus === params.newStatus) {
      return this.enrichReport(this.store.reports[index]);
    }

    this.store.reports[index] = {
      ...this.store.reports[index],
      status: params.newStatus,
      updated_at: new Date().toISOString(),
    };

    // Record history
    this.store.reportStatusHistory.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      report_id: params.reportId,
      previous_status: previousStatus,
      new_status: params.newStatus,
      changed_by_user_id: params.changedByUserId,
      notes: params.notes,
      timestamp: new Date().toISOString(),
    });

    return this.enrichReport(this.store.reports[index]);
  }

  public getReportStatusHistory(reportId: string): ReportStatusHistory[] {
    return this.store.reportStatusHistory
      .filter((h) => h.report_id === reportId)
      .map((h) => {
        const u = this.findUserById(h.changed_by_user_id);
        return {
          ...h,
          changed_by_name: u ? u.name : 'System',
        };
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private enrichReport(r: HealthReport): HealthReport {
    const citizen = this.findUserById(r.citizen_id);
    const category = this.getCategoryById(r.category_id);
    const facility = this.getFacilityById(r.assigned_facility_id);

    return {
      ...r,
      citizen_name: citizen ? citizen.name : 'Unknown Citizen',
      citizen_phone: citizen ? citizen.phone : undefined,
      category_name: category ? category.name : 'Uncategorized',
      facility_name: facility ? facility.name : 'Unassigned Facility',
      facility_phone: facility ? facility.phone : undefined,
    };
  }

  // Notifications
  public getNotificationsByUserId(userId: string): Notification[] {
    return this.store.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createNotification(n: Notification): Notification {
    this.store.notifications.push(n);
    return n;
  }

  public markNotificationAsRead(id: string): boolean {
    const n = this.store.notifications.find((notif) => notif.id === id);
    if (n) {
      n.is_read = true;
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.store.notifications
      .filter((n) => n.user_id === userId)
      .forEach((n) => (n.is_read = true));
  }

  // Outbreak Clusters
  public getOutbreakClusters(): OutbreakCluster[] {
    return this.store.outbreakClusters.map((c) => {
      const cat = this.getCategoryById(c.category_id);
      return {
        ...c,
        category_name: cat ? cat.name : undefined,
      };
    });
  }

  public getOutbreakClusterById(id: string): OutbreakCluster | undefined {
    const c = this.store.outbreakClusters.find((cluster) => cluster.id === id);
    if (!c) return undefined;
    const cat = this.getCategoryById(c.category_id);
    const clusterReportLinks = this.store.outbreakClusterReports.filter(
      (rel) => rel.cluster_id === id
    );
    const reports = clusterReportLinks
      .map((rel) => this.getReportById(rel.report_id))
      .filter((r): r is HealthReport => Boolean(r));

    return {
      ...c,
      category_name: cat ? cat.name : undefined,
      reports,
    };
  }

  public createOutbreakCluster(
    cluster: OutbreakCluster,
    reportIds: string[] = []
  ): OutbreakCluster {
    this.store.outbreakClusters.push(cluster);
    for (const repId of reportIds) {
      this.store.outbreakClusterReports.push({
        cluster_id: cluster.id,
        report_id: repId,
        distance_km: 1.0,
        added_at: new Date().toISOString(),
      });
    }
    return cluster;
  }

  public updateOutbreakCluster(id: string, updates: Partial<OutbreakCluster>): OutbreakCluster | null {
    const index = this.store.outbreakClusters.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.store.outbreakClusters[index] = {
      ...this.store.outbreakClusters[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.store.outbreakClusters[index];
  }

  // Public Alerts
  public getPublicAlerts(activeOnly = true): PublicAlert[] {
    return this.store.publicAlerts
      .filter((a) => (!activeOnly || a.is_active))
      .map((a) => {
        const cat = this.getCategoryById(a.category_id);
        const issuer = this.findUserById(a.issued_by_official_id);
        return {
          ...a,
          category_name: cat ? cat.name : undefined,
          issuer_name: issuer ? issuer.name : 'Public Health Directorate',
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createPublicAlert(alert: PublicAlert): PublicAlert {
    this.store.publicAlerts.push(alert);
    return alert;
  }

  public updatePublicAlert(id: string, updates: Partial<PublicAlert>): PublicAlert | null {
    const index = this.store.publicAlerts.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.store.publicAlerts[index] = { ...this.store.publicAlerts[index], ...updates };
    return this.store.publicAlerts[index];
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.store.auditLogs
      .map((log) => {
        const admin = this.findUserById(log.admin_user_id);
        return {
          ...log,
          admin_name: admin ? admin.name : 'Administrator',
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public createAuditLog(log: AuditLog): AuditLog {
    this.store.auditLogs.unshift(log);
    return log;
  }

  // System Settings
  public getSystemSettings(): Record<string, SystemSetting> {
    return { ...this.store.systemSettings };
  }

  public getSystemSetting(key: string): SystemSetting | undefined {
    return this.store.systemSettings[key];
  }

  public setSystemSetting(key: string, value: string, adminUserId?: string, description?: string): SystemSetting {
    const existing = this.store.systemSettings[key];
    const setting: SystemSetting = {
      setting_key: key,
      setting_value: value,
      description: description || (existing ? existing.description : key),
      updated_by: adminUserId,
      updated_at: new Date().toISOString(),
    };
    this.store.systemSettings[key] = setting;
    return setting;
  }

  // Password reset tokens
  public createPasswordResetToken(userId: string): string {
    const token = `rst-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    this.store.passwordResetTokens.push({ token, userId, expiresAt, used: false });
    return token;
  }

  public verifyAndConsumePasswordResetToken(token: string): string | null {
    const record = this.store.passwordResetTokens.find((r) => r.token === token && !r.used);
    if (!record) return null;
    if (new Date(record.expiresAt).getTime() < Date.now()) return null;
    record.used = true;
    return record.userId;
  }
}

export const db = new InMemoryDatabase();
