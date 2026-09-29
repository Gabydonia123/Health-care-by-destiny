-- ==============================================================================
-- COMMUNITY HEALTH REPORT SYSTEM (CHRS) - NIGERIA
-- Final-Year Computer Science Project Database Schema (MySQL 8.0 Compliant)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS outbreak_cluster_reports;
DROP TABLE IF EXISTS outbreak_clusters;
DROP TABLE IF EXISTS public_alerts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS report_status_history;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS report_categories;
DROP TABLE IF EXISTS health_officials;
DROP TABLE IF EXISTS facility_applications;
DROP TABLE IF EXISTS health_facilities;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('citizen', 'official', 'admin') NOT NULL DEFAULT 'citizen',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. HEALTH FACILITIES TABLE
CREATE TABLE health_facilities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(80) NOT NULL, -- 'Primary Healthcare Centre', 'General Hospital', etc.
    state VARCHAR(50) NOT NULL,
    lga VARCHAR(80) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    verification_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_INFORMATION') NOT NULL DEFAULT 'PENDING',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_facility_status (verification_status, is_active),
    INDEX idx_facility_coords (latitude, longitude),
    INDEX idx_facility_state (state, lga)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. FACILITY ACCREDITATION APPLICATIONS
CREATE TABLE facility_applications (
    id VARCHAR(36) PRIMARY KEY,
    facility_id VARCHAR(36) NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    applicant_email VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    supporting_document_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(36),
    FOREIGN KEY (facility_id) REFERENCES health_facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_application_status (facility_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. HEALTH OFFICIALS (SURVEILLANCE & MEDICAL OFFICERS)
CREATE TABLE health_officials (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    facility_id VARCHAR(36) NOT NULL,
    cadre VARCHAR(80) NOT NULL, -- 'Medical Officer', 'Epidemiologist', etc.
    license_number VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES health_facilities(id) ON DELETE RESTRICT,
    INDEX idx_official_facility (facility_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. REPORT CATEGORIES
CREATE TABLE report_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'alert-circle',
    severity_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. HEALTH REPORTS TABLE
CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    reference_no VARCHAR(50) NOT NULL UNIQUE, -- e.g. CHR-2026-00001
    citizen_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    symptoms JSON NOT NULL, -- Array of reported symptoms
    affected_count INT NOT NULL DEFAULT 1,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL,
    lga VARCHAR(80) NOT NULL,
    image_url TEXT,
    assigned_facility_id VARCHAR(36) NOT NULL,
    status ENUM('SUBMITTED', 'PENDING_REVIEW', 'VIEWED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES report_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_facility_id) REFERENCES health_facilities(id) ON DELETE RESTRICT,
    INDEX idx_report_status (status),
    INDEX idx_report_facility (assigned_facility_id),
    INDEX idx_report_created_at (created_at),
    INDEX idx_report_coords (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. REPORT STATUS AUDIT HISTORY
CREATE TABLE report_status_history (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id VARCHAR(36) NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_history_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. USER NOTIFICATIONS
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('REPORT_UPDATE', 'ALERT', 'SYSTEM', 'CLUSTER') NOT NULL DEFAULT 'REPORT_UPDATE',
    reference_id VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. OUTBREAK CLUSTERS
CREATE TABLE outbreak_clusters (
    id VARCHAR(36) PRIMARY KEY,
    cluster_name VARCHAR(200) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    state VARCHAR(50) NOT NULL,
    lga VARCHAR(80) NOT NULL,
    center_lat DECIMAL(10, 7) NOT NULL,
    center_lng DECIMAL(10, 7) NOT NULL,
    radius_km DECIMAL(6, 2) NOT NULL DEFAULT 5.00,
    report_count INT NOT NULL DEFAULT 0,
    status ENUM('DETECTED', 'UNDER_INVESTIGATION', 'CONFIRMED', 'DISMISSED', 'RESOLVED') NOT NULL DEFAULT 'DETECTED',
    investigator_notes TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES report_categories(id) ON DELETE RESTRICT,
    INDEX idx_cluster_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. OUTBREAK CLUSTER REPORT ASSOCIATIONS
CREATE TABLE outbreak_cluster_reports (
    cluster_id VARCHAR(36) NOT NULL,
    report_id VARCHAR(36) NOT NULL,
    distance_km DECIMAL(6, 3) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cluster_id, report_id),
    FOREIGN KEY (cluster_id) REFERENCES outbreak_clusters(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. PUBLIC HEALTH ALERTS
CREATE TABLE public_alerts (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    affected_area VARCHAR(150) NOT NULL,
    state VARCHAR(50) NOT NULL,
    severity ENUM('INFORMATION', 'ADVISORY', 'WARNING', 'EMERGENCY') NOT NULL DEFAULT 'ADVISORY',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    radius_km DECIMAL(6, 2),
    issued_by_official_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES report_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (issued_by_official_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_alert_active (is_active, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. AUDIT LOGS (ADMIN & AI ACTIONS)
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    admin_user_id VARCHAR(36) NOT NULL,
    ai_action VARCHAR(100) NOT NULL,
    affected_entity VARCHAR(80) NOT NULL,
    entity_id VARCHAR(80) NOT NULL,
    previous_value TEXT,
    new_value TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_audit_admin (admin_user_id),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. SYSTEM SETTINGS
CREATE TABLE system_settings (
    setting_key VARCHAR(80) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description VARCHAR(255) NOT NULL,
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. PASSWORD RESET TOKENS
CREATE TABLE password_reset_tokens (
    token VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
