/**
 * Community Health Report System (CHRS) - Navigation Bar
 */

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  Cpu,
  FileText,
  LogOut,
  MapPin,
  Menu,
  ShieldAlert,
  UserCheck,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  unreadNotifsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  unreadNotifsCount = 0,
}) => {
  const { user, official, isAuthenticated, logout, quickDemoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleQuickDemo = async (role: UserRole) => {
    await quickDemoLogin(role);
    setDemoMenuOpen(false);
    if (role === 'citizen') handleNav('citizen-dashboard');
    else if (role === 'official') handleNav('official-dashboard');
    else if (role === 'admin') handleNav('admin-dashboard');
  };

  return (
    <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-[1100]">
      {/* Top federal banner */}
      <div className="bg-emerald-950 px-4 py-1 text-[11px] font-medium text-emerald-200/90 flex items-center justify-between border-b border-emerald-800/40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 font-bold tracking-wider">
            <span className="w-2.5 h-2 bg-emerald-500 inline-block"></span>
            <span className="w-2.5 h-2 bg-white inline-block"></span>
            <span className="w-2.5 h-2 bg-emerald-500 inline-block"></span>
          </span>
          <span>FEDERAL REPUBLIC OF NIGERIA • EPIDEMIOLOGICAL SURVEILLANCE & CHRS</span>
        </div>

        {/* Role switcher pill */}
        <div className="relative">
          <button
            id="role-switcher-btn"
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded text-[11px] transition cursor-pointer border border-emerald-700"
          >
            <span>Role: <strong>{user ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Guest'}</strong></span>
          </button>

          {demoMenuOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-[1200] text-xs">
              <div className="px-3 py-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                Switch Role
              </div>
              <button
                onClick={() => handleQuickDemo('citizen')}
                className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-slate-700 flex items-center justify-between"
              >
                <span>Citizen (Chinedu)</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Citizen</span>
              </button>
              <button
                onClick={() => handleQuickDemo('official')}
                className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-slate-700 flex items-center justify-between"
              >
                <span>Dr. Gabriel Etu</span>
                <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-700">Official</span>
              </button>
              <button
                onClick={() => handleQuickDemo('admin')}
                className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-slate-700 flex items-center justify-between"
              >
                <span>Eseoghene Destiny</span>
                <span className="text-[10px] bg-purple-100 px-1.5 py-0.5 rounded text-purple-700">Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => handleNav(isAuthenticated && user ? `${user.role}-dashboard` : 'portal-gateway')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-inner border border-emerald-400/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-tight text-white">
                CHRS <span className="text-emerald-300 font-medium text-sm">NIGERIA</span>
              </span>
              <span className="text-[11px] text-emerald-200 block font-normal">
                Community Health Report System
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('portal-gateway')}
                  className={`px-3 py-1.5 rounded-md transition ${activeView === 'portal-gateway' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Citizen & Facility Portals
                </button>
              </div>
            )}

            {/* Citizen navigation */}
            {isAuthenticated && user?.role === 'citizen' && (
              <>
                <button
                  onClick={() => handleNav('citizen-dashboard')}
                  className={`px-3 py-1.5 rounded-md transition ${activeView === 'citizen-dashboard' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('citizen-report')}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${activeView === 'citizen-report' ? 'bg-amber-400 text-slate-950 font-bold shadow' : 'bg-emerald-800/70 text-emerald-100 hover:bg-emerald-800'}`}
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-950" />
                  <span>Report Issue</span>
                </button>
                <button
                  onClick={() => handleNav('citizen-reports')}
                  className={`px-3 py-1.5 rounded-md transition ${activeView === 'citizen-reports' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  My Reports
                </button>
                <button
                  onClick={() => handleNav('citizen-map')}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${activeView === 'citizen-map' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  <span>Find Facility (Map)</span>
                </button>
                <button
                  onClick={() => handleNav('public-alerts')}
                  className={`px-3 py-1.5 rounded-md transition relative ${activeView === 'public-alerts' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  <Bell className="w-4 h-4 inline-block mr-1" />
                  <span>Advisories</span>
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleNav('citizen-account')}
                  className={`px-3 py-1.5 rounded-md transition ${activeView === 'citizen-account' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  My Account
                </button>
              </>
            )}

            {/* Official navigation */}
            {isAuthenticated && user?.role === 'official' && (
              <>
                <button
                  onClick={() => handleNav('official-dashboard')}
                  className={`px-3 py-1.5 rounded-md transition ${activeView === 'official-dashboard' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Medical Station
                </button>
                <button
                  onClick={() => handleNav('official-reports')}
                  className={`px-3 py-1.5 rounded-md transition ${activeView === 'official-reports' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Review Reports
                </button>
                <button
                  onClick={() => handleNav('official-map')}
                  className={`px-3 py-1.5 rounded-md transition ${activeView === 'official-map' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Surveillance Map
                </button>
                <button
                  onClick={() => handleNav('official-outbreaks')}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${activeView === 'official-outbreaks' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Outbreak Clusters</span>
                </button>
                <button
                  onClick={() => handleNav('official-alerts')}
                  className={`px-3 py-1.5 rounded-md transition ${activeView === 'official-alerts' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Issue Alert
                </button>
              </>
            )}

            {/* Administrator navigation */}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className={`px-2.5 py-1.5 rounded-md transition ${activeView === 'admin-dashboard' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => handleNav('admin-ai-assistant')}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-sm hover:brightness-105`}
                >
                  <Cpu className="w-4 h-4 text-slate-900" />
                  AI Assistant
                </button>
                <button
                  onClick={() => handleNav('admin-outbreaks')}
                  className={`px-2.5 py-1.5 rounded-md transition flex items-center gap-1 ${activeView === 'admin-outbreaks' ? 'bg-emerald-800 text-white font-semibold' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  <span>Outbreak Approvals</span>
                </button>
                <button
                  onClick={() => handleNav('admin-facilities')}
                  className={`px-2.5 py-1.5 rounded-md transition ${activeView === 'admin-facilities' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Facilities
                </button>
                <button
                  onClick={() => handleNav('admin-admins')}
                  className={`px-2.5 py-1.5 rounded-md transition ${activeView === 'admin-admins' ? 'bg-purple-800 text-white font-semibold' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Admin Accounts
                </button>
                <button
                  onClick={() => handleNav('admin-reports')}
                  className={`px-2.5 py-1.5 rounded-md transition ${activeView === 'admin-reports' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Reports
                </button>
                <button
                  onClick={() => handleNav('admin-audit-logs')}
                  className={`px-2.5 py-1.5 rounded-md transition ${activeView === 'admin-audit-logs' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
                >
                  Audit Logs
                </button>
              </>
            )}
          </nav>

          {/* User Status / Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white">{user?.name}</div>
                  <div className="text-[11px] text-emerald-300 capitalize">
                    {user?.role === 'official' && official ? official.cadre : user?.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-citizen-login-btn"
                  onClick={() => handleNav('citizen-login')}
                  className="text-xs px-3.5 py-1.5 font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-sm cursor-pointer"
                >
                  Citizen Login
                </button>
                <button
                  id="nav-facility-login-btn"
                  onClick={() => handleNav('official-login')}
                  className="text-xs px-3.5 py-1.5 font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition border border-emerald-600 cursor-pointer"
                >
                  Medical Facility
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950/95 backdrop-blur border-t border-emerald-800 px-4 py-4 space-y-2 text-sm font-medium animate-fadeIn">
          {!isAuthenticated ? (
            <div className="space-y-3 py-2">
              <button
                onClick={() => handleNav('portal-gateway')}
                className="w-full text-left py-2.5 px-3.5 rounded-xl bg-emerald-900 text-white font-medium hover:bg-emerald-800 flex items-center justify-between"
              >
                <span>CHRS Portal Gateway</span>
                <span className="text-xs text-emerald-300">Choose Role →</span>
              </button>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleNav('citizen-login')}
                  className="w-full py-2.5 text-center rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  Citizen Login or Sign-up
                </button>
                <button
                  onClick={() => handleNav('official-login')}
                  className="w-full py-2.5 text-center rounded-xl bg-emerald-800 text-emerald-100 hover:bg-emerald-700 border border-emerald-700 font-semibold"
                >
                  Medical Facility Login
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="pb-2 border-b border-emerald-800 text-xs text-emerald-300">
                Logged in as: <strong className="text-white">{user?.name}</strong> ({user?.role})
              </div>

              {user?.role === 'citizen' && (
                <>
                  <button onClick={() => handleNav('citizen-dashboard')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Dashboard
                  </button>
                  <button onClick={() => handleNav('citizen-report')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Submit Health Report
                  </button>
                  <button onClick={() => handleNav('citizen-reports')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    My Reports History
                  </button>
                  <button onClick={() => handleNav('citizen-map')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Find Facility (Map)
                  </button>
                  <button onClick={() => handleNav('public-alerts')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Health Advisories
                  </button>
                  <button onClick={() => handleNav('citizen-account')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    My Account & Settings
                  </button>
                </>
              )}

              {user?.role === 'official' && (
                <>
                  <button onClick={() => handleNav('official-dashboard')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Medical Station
                  </button>
                  <button onClick={() => handleNav('official-reports')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Review Reports
                  </button>
                  <button onClick={() => handleNav('official-map')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Surveillance Map
                  </button>
                  <button onClick={() => handleNav('official-outbreaks')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Outbreak Clusters
                  </button>
                  <button onClick={() => handleNav('official-alerts')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Issue Authorized Alert
                  </button>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <button onClick={() => handleNav('admin-dashboard')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Overview Dashboard
                  </button>
                  <button onClick={() => handleNav('admin-ai-assistant')} className="w-full text-left py-2 px-3 rounded bg-amber-400 text-slate-950 font-bold">
                    🤖 AI Administration Assistant
                  </button>
                  <button onClick={() => handleNav('admin-outbreaks')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Outbreak Approvals & Detection
                  </button>
                  <button onClick={() => handleNav('admin-facilities')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Facilities Accreditation
                  </button>
                  <button onClick={() => handleNav('admin-admins')} className="w-full text-left py-2 px-3 rounded text-purple-200 hover:bg-purple-900 font-semibold">
                    Admin Accounts Management
                  </button>
                  <button onClick={() => handleNav('admin-officials')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Surveillance Officials
                  </button>
                  <button onClick={() => handleNav('admin-reports')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    All Reports Oversight
                  </button>
                  <button onClick={() => handleNav('admin-audit-logs')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Security Audit Logs
                  </button>
                  <button onClick={() => handleNav('admin-audit-logs')} className="w-full text-left py-2 px-3 rounded text-emerald-100 hover:bg-emerald-800">
                    Audit Logs
                  </button>
                </>
              )}

              <div className="pt-2 border-t border-emerald-800">
                <button
                  onClick={logout}
                  className="w-full py-2 text-center rounded bg-red-600 text-white font-semibold"
                >
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
