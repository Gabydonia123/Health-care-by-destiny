/**
 * Community Health Report System (CHRS) - Frontend API Service
 */

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('chrs_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('chrs_token', token);
  } else {
    localStorage.removeItem('chrs_token');
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    // Only clear stored token if the user's session is verified as expired on me check
    if (res.status === 401 && endpoint === '/auth/me') {
      setAuthToken(null);
    }
    const errorMessage =
      data?.error ||
      data?.message ||
      (res.status === 401 ? 'Unauthorized: Session expired or access denied' : `Request failed (Status ${res.status})`);
    throw new Error(errorMessage);
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  officialLogin: (body: any) => request('/auth/official/login', { method: 'POST', body: JSON.stringify(body) }),
  adminLogin: (body: any) => request('/auth/admin/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  requestPasswordReset: (email: string) => request('/auth/password-reset-request', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (body: any) => request('/auth/password-reset', { method: 'POST', body: JSON.stringify(body) }),

  // Public
  getCategories: () => request('/public/categories'),
  getAlerts: () => request('/public/alerts'),
  getFacilities: () => request('/public/facilities'),
  getPublicMapData: () => request('/public/map-data'),
  getPublicSettings: () => request('/public/settings'),
  submitFacilityRegistration: (body: any) => request('/facility/register', { method: 'POST', body: JSON.stringify(body) }),

  // Citizen
  submitReport: (body: any) => request('/citizen/reports', { method: 'POST', body: JSON.stringify(body) }),
  getCitizenReports: () => request('/citizen/reports'),
  getCitizenReportDetails: (id: string) => request(`/citizen/reports/${id}`),
  getCitizenNotifications: () => request('/citizen/notifications'),
  markNotificationRead: (id: string) => request(`/citizen/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/citizen/notifications/read-all', { method: 'PATCH' }),
  syncOfflineReports: (reports: any[]) => request('/sync/offline-reports', { method: 'POST', body: JSON.stringify({ reports }) }),

  // Official
  getOfficialAssignedReports: () => request('/official/assigned-reports'),
  getOfficialReportDetails: (id: string) => request(`/official/reports/${id}`),
  updateReportStatus: (id: string, status: string, notes?: string) =>
    request(`/official/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  getOfficialMapData: () => request('/official/map-data'),
  getOfficialOutbreaks: () => request('/official/outbreaks'),
  updateOutbreakStatus: (id: string, status: string, investigator_notes?: string) =>
    request(`/official/outbreaks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, investigator_notes }) }),
  issueOfficialAlert: (body: any) => request('/official/alerts', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAdminMetrics: () => request('/admin/metrics'),
  getAdminFacilities: () => request('/admin/facilities'),
  createAdminFacility: (body: any) => request('/admin/facilities', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminFacility: (id: string, body: any) => request(`/admin/facilities/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminOfficials: () => request('/admin/officials'),
  createAdminOfficial: (body: any) => request('/admin/officials', { method: 'POST', body: JSON.stringify(body) }),
  getAdminCitizens: () => request('/admin/citizens'),
  getAdminReports: () => request('/admin/reports'),
  getAdminOutbreaks: () => request('/admin/outbreaks'),
  getAdminClusters: () => request('/admin/outbreaks'),
  approveAdminOutbreak: (id: string, notes?: string) =>
    request(`/admin/outbreaks/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ investigator_notes: notes }) }),
  updateAdminOutbreakSettings: (body: any) => request('/admin/outbreak-settings', { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminAdmins: () => request('/admin/admins'),
  createAdminAdmin: (body: any) => request('/admin/admins', { method: 'POST', body: JSON.stringify(body) }),
  getAdminCategories: () => request('/admin/categories'),
  createAdminCategory: (body: any) => request('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
  getAdminSettings: () => request('/admin/settings'),
  updateAdminSettings: (settings: Record<string, any>) => request('/admin/settings', { method: 'PATCH', body: JSON.stringify({ settings }) }),
  getAdminAuditLogs: () => request('/admin/audit-logs'),
  sendAiAssistantCommand: (body: { prompt?: string; confirmedAction?: any }) =>
    request('/admin/ai-assistant', { method: 'POST', body: JSON.stringify(body) }),
};
