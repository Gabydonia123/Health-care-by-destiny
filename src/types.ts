/**
 * Community Health Report System (CHRS) - Types & Interfaces
 * Nigerian Public Health Surveillance Platform
 */

export type UserRole = 'citizen' | 'official' | 'admin';

export type FacilityVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFORMATION';

export type ReportStatus =
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'VIEWED'
  | 'VERIFIED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export type OutbreakClusterStatus =
  | 'DETECTED'
  | 'UNDER_INVESTIGATION'
  | 'CONFIRMED'
  | 'DISMISSED'
  | 'RESOLVED';

export type AlertSeverity = 'INFORMATION' | 'ADVISORY' | 'WARNING' | 'EMERGENCY';

export type NotificationType = 'REPORT_UPDATE' | 'ALERT' | 'SYSTEM' | 'CLUSTER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface HealthFacility {
  id: string;
  name: string;
  type: string; // 'Primary Healthcare Centre' | 'General Hospital' | 'Federal Medical Centre' | 'Teaching Hospital' | 'Specialist Clinic'
  state: string;
  lga: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  verification_status: FacilityVerificationStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacilityApplication {
  id: string;
  facility_id: string;
  applicant_name: string;
  applicant_email: string;
  license_number: string;
  supporting_document_url?: string;
  notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  facility?: HealthFacility;
}

export interface HealthOfficial {
  id: string;
  user_id: string;
  facility_id: string;
  cadre: string; // 'Medical Officer' | 'Epidemiologist' | 'Surveillance Officer' | 'Public Health Nurse'
  license_number: string;
  is_active: boolean;
  created_at: string;
  user?: User;
  facility?: HealthFacility;
}

export interface ReportCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  severity_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_active: boolean;
  created_at: string;
}

export interface HealthReport {
  id: string;
  reference_no: string; // e.g. CHR-2026-00001
  citizen_id: string;
  category_id: string;
  title: string;
  description: string;
  symptoms: string[];
  affected_count: number;
  latitude: number;
  longitude: number;
  location_name: string;
  state: string;
  lga: string;
  image_url?: string;
  assigned_facility_id: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  citizen_name?: string;
  citizen_phone?: string;
  category_name?: string;
  facility_name?: string;
  facility_phone?: string;
  distance_to_facility_km?: number;
}

export interface ReportStatusHistory {
  id: string;
  report_id: string;
  previous_status: ReportStatus;
  new_status: ReportStatus;
  changed_by_user_id: string;
  changed_by_name?: string;
  notes?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface OutbreakCluster {
  id: string;
  cluster_name: string;
  category_id: string;
  category_name?: string;
  state: string;
  lga: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  report_count: number;
  status: OutbreakClusterStatus;
  investigator_notes?: string;
  detected_at: string;
  updated_at: string;
  reports?: HealthReport[];
}

export interface OutbreakClusterReport {
  cluster_id: string;
  report_id: string;
  distance_km: number;
  added_at: string;
}

export interface PublicAlert {
  id: string;
  title: string;
  category_id: string;
  category_name?: string;
  message: string;
  affected_area: string;
  state: string;
  severity: AlertSeverity;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  issued_by_official_id: string;
  issuer_name?: string;
  start_date: string;
  expiry_date: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  admin_user_id?: string;
  admin_name?: string;
  action?: string;
  ai_action?: string;
  target_entity?: string;
  affected_entity?: string;
  target_id?: string;
  entity_id?: string;
  previous_value?: string;
  new_value?: string;
  details?: any;
  ip_address?: string;
  created_at?: string;
  timestamp?: string;
}

export interface AiAssistantResponse {
  message: string;
  requiresConfirmation?: boolean;
  actionDetails?: any;
  actionExecuted?: {
    action: string;
    result: any;
  };
}

export interface SystemSetting {
  setting_key: string;
  setting_value: string;
  description: string;
  updated_by?: string;
  updated_at: string;
}

export interface QueuedOfflineReport {
  local_id: string;
  category_id: string;
  title: string;
  description: string;
  symptoms: string[];
  affected_count: number;
  latitude: number;
  longitude: number;
  location_name: string;
  state: string;
  lga: string;
  image_url?: string;
  timestamp: string;
  sync_status: 'PENDING' | 'SYNCING' | 'FAILED' | 'SYNCED';
  error_message?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action_proposed?: {
    action_type: string;
    description: string;
    affected_entity: string;
    target_id?: string;
    payload: any;
    is_sensitive: boolean;
  };
  action_result?: {
    success: boolean;
    message: string;
    audit_log_id?: string;
    details?: any;
  };
}
