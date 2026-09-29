/**
 * Community Health Report System (CHRS) - Main Application Entrypoint & Router
 */

import React, { useEffect, useState } from 'react';
import {
  AiAdminAssistant,
} from './components/AiAdminAssistant';
import { CitizenReportForm } from './components/CitizenReportForm';
import { Navbar } from './components/Navbar';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  AdminLoginView,
  CitizenLoginView,
  CitizenRegisterView,
  OfficialLoginView,
} from './views/AuthViews';
import { CitizenDashboardView } from './views/CitizenDashboardView';
import { CitizenNotificationsView } from './views/CitizenNotificationsView';
import { CitizenReportsView } from './views/CitizenReportsView';
import { CitizenAccountView } from './views/CitizenAccountView';
import { CitizenMapView } from './views/CitizenMapView';
import { PortalGatewayView } from './views/PortalGatewayView';
import { FacilityRegisterView } from './views/FacilityRegisterView';
import { OfficialAlertsView } from './views/OfficialAlertsView';
import { OfficialDashboardView } from './views/OfficialDashboardView';
import { OfficialMapView } from './views/OfficialMapView';
import { OfficialOutbreaksView } from './views/OfficialOutbreaksView';
import { OfficialReportsView } from './views/OfficialReportsView';
import { PublicAlertsView } from './views/PublicAlertsView';
import { AdminAdminsView } from './views/AdminAdminsView';
import { AdminAuditLogsView } from './views/AdminAuditLogsView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminFacilitiesView } from './views/AdminFacilitiesView';
import { AdminOfficialsView } from './views/AdminOfficialsView';
import { AdminOutbreaksView } from './views/AdminOutbreaksView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { HeartPulse, Lock, PhoneCall, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  // Default entry view starts strictly with the two-option Gateway (Citizen or Medical Facility login/signup)
  const [activeView, setActiveView] = useState<string>('portal-gateway');
  const [selectedReportIdForOfficial, setSelectedReportIdForOfficial] = useState<string | null>(null);

  // Sync view when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'citizen') {
        if (
          activeView === 'portal-gateway' ||
          activeView === 'citizen-login' ||
          activeView === 'official-login' ||
          activeView === 'admin-login' ||
          activeView.startsWith('official-') ||
          activeView.startsWith('admin-')
        ) {
          setActiveView('citizen-dashboard');
        }
      } else if (user.role === 'official') {
        if (
          activeView === 'portal-gateway' ||
          activeView === 'citizen-login' ||
          activeView === 'official-login' ||
          activeView === 'admin-login' ||
          activeView.startsWith('citizen-') ||
          activeView.startsWith('admin-')
        ) {
          setActiveView('official-dashboard');
        }
      } else if (user.role === 'admin') {
        if (
          activeView === 'portal-gateway' ||
          activeView === 'citizen-login' ||
          activeView === 'official-login' ||
          activeView === 'admin-login' ||
          activeView.startsWith('citizen-') ||
          activeView.startsWith('official-')
        ) {
          setActiveView('admin-dashboard');
        }
      }
    } else if (!isAuthenticated) {
      // If logged out and on protected pages, return to portal gateway
      if (activeView.startsWith('citizen-') || activeView.startsWith('official-') || activeView.startsWith('admin-')) {
        setActiveView('portal-gateway');
      }
    }
  }, [isAuthenticated, user?.role]);

  const handleNavigate = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReportFromOfficial = (reportId: string) => {
    setSelectedReportIdForOfficial(reportId);
    setActiveView('official-reports');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Navbar with role-specific items & switcher */}
      <Navbar activeView={activeView} onNavigate={handleNavigate} />

      {/* Offline IndexedDB synchronization banner */}
      <OfflineSyncBanner />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {/* Gateway & Authentication Views */}
        {activeView === 'portal-gateway' && (
          <PortalGatewayView onNavigate={handleNavigate} />
        )}
        {activeView === 'public-alerts' && <PublicAlertsView onNavigate={handleNavigate} />}
        {activeView === 'facility-register' && <FacilityRegisterView onNavigate={handleNavigate} />}

        {activeView === 'citizen-login' && (
          <CitizenLoginView
            onNavigate={handleNavigate}
            onSuccess={() => setActiveView('citizen-dashboard')}
          />
        )}
        {activeView === 'citizen-register' && (
          <CitizenRegisterView
            onNavigate={handleNavigate}
            onSuccess={() => setActiveView('citizen-dashboard')}
          />
        )}
        {activeView === 'official-login' && (
          <OfficialLoginView
            onNavigate={handleNavigate}
            onSuccess={() => setActiveView('official-dashboard')}
          />
        )}
        {activeView === 'admin-login' && (
          <AdminLoginView
            onNavigate={handleNavigate}
            onSuccess={() => setActiveView('admin-dashboard')}
          />
        )}

        {/* Citizen Views */}
        {activeView === 'citizen-dashboard' && (
          <CitizenDashboardView onNavigate={handleNavigate} />
        )}
        {activeView === 'citizen-report' && (
          <CitizenReportForm
            onReportSubmitted={() => setActiveView('citizen-reports')}
            onCancel={() => setActiveView('citizen-dashboard')}
          />
        )}
        {activeView === 'citizen-reports' && (
          <CitizenReportsView onNavigate={handleNavigate} />
        )}
        {activeView === 'citizen-map' && (
          <CitizenMapView onNavigate={handleNavigate} />
        )}
        {activeView === 'citizen-account' && (
          <CitizenAccountView onNavigate={handleNavigate} />
        )}
        {activeView === 'citizen-notifications' && (
          <CitizenNotificationsView onNavigate={handleNavigate} />
        )}

        {/* Official Views */}
        {activeView === 'official-dashboard' && (
          <OfficialDashboardView
            onNavigate={handleNavigate}
            onOpenReport={handleOpenReportFromOfficial}
          />
        )}
        {activeView === 'official-reports' && (
          <OfficialReportsView selectedReportId={selectedReportIdForOfficial} />
        )}
        {activeView === 'official-map' && <OfficialMapView />}
        {activeView === 'official-outbreaks' && <OfficialOutbreaksView />}
        {activeView === 'official-alerts' && <OfficialAlertsView />}

        {/* Admin Views */}
        {activeView === 'admin-dashboard' && (
          <AdminDashboardView onNavigate={handleNavigate} />
        )}
        {activeView === 'admin-ai-assistant' && <AiAdminAssistant />}
        {activeView === 'admin-outbreaks' && <AdminOutbreaksView />}
        {activeView === 'admin-admins' && <AdminAdminsView />}
        {activeView === 'admin-facilities' && <AdminFacilitiesView />}
        {activeView === 'admin-officials' && <AdminOfficialsView />}
        {activeView === 'admin-audit-logs' && <AdminAuditLogsView />}
        {activeView === 'admin-settings' && <AdminSettingsView />}
      </main>

      {/* Professional Nigerian Public Health Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <HeartPulse className="w-5 h-5 text-emerald-400" />
                <span>Federal Republic of Nigeria — Community Health Report System (CHRS)</span>
              </div>
              <p className="text-slate-400 text-xs max-w-xl">
                Integrated Disease Surveillance and Response (IDSR) & Automated Epidemiological Warning Platform. Connecting grassroots communities with accredited primary healthcare facilities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">NCDC TOLL-FREE HOTLINE</span>
                  <span className="font-mono font-bold text-white">6232 / 0800-9700-0010</span>
                </div>
              </div>

              <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">NATIONAL EMERGENCY</span>
                  <span className="font-mono font-bold text-white">112 / 767</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              Computer Science Final-Year Degree Project: <strong>Community Health Report System</strong>.
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate('public-alerts')}
                className="hover:text-slate-300 transition cursor-pointer"
              >
                Health Advisories
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('facility-register')}
                className="hover:text-slate-300 transition cursor-pointer"
              >
                Facility Accreditation
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('admin-login')}
                className="text-slate-700 hover:text-slate-500 transition cursor-pointer flex items-center gap-1"
                title="Restricted Staff Authentication"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Restricted Access</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
