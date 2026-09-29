/**
 * Community Health Report System (CHRS) - Authentication Views
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Hospital,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AuthViewProps {
  initialMode?: 'citizen-login' | 'citizen-register' | 'official-login' | 'admin-login';
  onSuccess: (role: string) => void;
  onSwitchMode: (mode: string) => void;
}

export const AuthViews: React.FC<AuthViewProps> = ({
  initialMode = 'citizen-login',
  onSuccess,
  onSwitchMode,
}) => {
  const { login, register, quickDemoLogin } = useAuth();

  const [mode, setMode] = useState<'citizen-login' | 'citizen-register' | 'official-login' | 'admin-login'>(
    initialMode
  );

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password modal state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetTokenReceived, setResetTokenReceived] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'citizen-register') {
        if (!name || !email || !phone || !password) {
          throw new Error('Please fill in all registration fields');
        }
        await register(name, email, phone, password);
        onSuccess('citizen');
      } else if (mode === 'citizen-login') {
        await login(email, password, 'citizen');
        onSuccess('citizen');
      } else if (mode === 'official-login') {
        await login(email, password, 'official');
        onSuccess('official');
      } else if (mode === 'admin-login') {
        await login(email, password, 'admin');
        onSuccess('admin');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = async (role: 'citizen' | 'official' | 'admin') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await quickDemoLogin(role);
      onSuccess(role);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    if (!resetEmail) return;
    try {
      const res = await api.requestPasswordReset(resetEmail);
      if (res.resetToken) {
        setResetTokenReceived(res.resetToken);
        setSuccessMessage(`Reset token issued: ${res.resetToken}`);
      } else {
        setSuccessMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handlePasswordResetConfirm = async () => {
    if (!resetTokenReceived || !newPassword) return;
    try {
      await api.resetPassword({ token: resetTokenReceived, newPassword });
      setSuccessMessage('Password reset successfully! You can now log in.');
      setForgotPasswordOpen(false);
      setResetTokenReceived(null);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const getPortalInfo = () => {
    switch (mode) {
      case 'official-login':
        return {
          title: 'Health Official Surveillance Portal',
          subtitle: 'Restricted access for certified Medical Surveillance Officers and Facility Directors',
          badge: 'FACILITY PERSONNEL ONLY',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          accent: 'from-blue-900 to-emerald-950',
          role: 'official',
        };
      case 'admin-login':
        return {
          title: 'Epidemiological Administrator Portal',
          subtitle: 'Government surveillance administrators, AI operations, and facility accreditation',
          badge: 'SYSTEM ADMINISTRATION',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          accent: 'from-slate-900 via-purple-950 to-slate-900',
          role: 'admin',
        };
      case 'citizen-register':
        return {
          title: 'Citizen Registration',
          subtitle: 'Join Nigeria’s community health surveillance network to submit and track reports',
          badge: 'PUBLIC ACCESS',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          accent: 'from-emerald-900 to-teal-950',
          role: 'citizen',
        };
      default:
        return {
          title: 'Citizen Surveillance Login',
          subtitle: 'Sign in to log suspected disease reports and view community health alerts',
          badge: 'PUBLIC ACCESS',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          accent: 'from-emerald-900 to-teal-950',
          role: 'citizen',
        };
    }
  };

  const portal = getPortalInfo();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Portal Header */}
        <div className={`bg-gradient-to-r ${portal.accent} p-6 text-white text-center relative`}>
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mb-2 uppercase tracking-wider ${portal.badgeColor}`}>
            {portal.badge}
          </span>
          <h2 className="text-xl font-bold">{portal.title}</h2>
          <p className="text-xs text-slate-200 mt-1">{portal.subtitle}</p>
        </div>

        {/* Demo Fast Fill Buttons for Defense Testing */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 text-center">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Academic Project Defense: Quick Sign In
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('citizen')}
              className="px-2.5 py-1 text-xs bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-300 rounded font-medium shadow-2xs transition cursor-pointer"
            >
              👤 Citizen
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('official')}
              className="px-2.5 py-1 text-xs bg-white hover:bg-slate-100 text-blue-800 border border-blue-300 rounded font-medium shadow-2xs transition cursor-pointer"
            >
              🏥 Official (Dr. Gabriel Etu)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="px-2.5 py-1 text-xs bg-white hover:bg-slate-100 text-purple-800 border border-purple-300 rounded font-medium shadow-2xs transition cursor-pointer"
            >
              🛡️ Admin (Eseoghene Destiny)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'citizen-register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Chinedu Okafor"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  mode === 'official-login'
                    ? 'official@chrs.gov.ng'
                    : mode === 'admin-login'
                    ? 'eseoghenedestiny05@gmail.com'
                    : 'citizen@chrs.gov.ng'
                }
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password *</label>
              {mode.includes('login') && (
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading
              ? 'Authenticating...'
              : mode === 'citizen-register'
              ? 'Complete Citizen Registration'
              : 'Sign In'}
          </button>
        </form>

        {/* Portal Switching Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-center space-y-2 text-slate-600">
          {mode === 'citizen-login' && (
            <>
              <div>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('citizen-register');
                    onSwitchMode('citizen-register');
                  }}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-center gap-4 text-[11px]">
                <button
                  onClick={() => {
                    setMode('official-login');
                    onSwitchMode('official-login');
                  }}
                  className="text-blue-700 hover:underline cursor-pointer font-medium"
                >
                  Health Official Login →
                </button>
                <button
                  onClick={() => {
                    setMode('admin-login');
                    onSwitchMode('admin-login');
                  }}
                  className="text-purple-700 hover:underline cursor-pointer font-medium"
                >
                  Administrator Portal →
                </button>
              </div>
            </>
          )}

          {mode === 'citizen-register' && (
            <div>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('citizen-login');
                  onSwitchMode('citizen-login');
                }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {(mode === 'official-login' || mode === 'admin-login') && (
            <div>
              <button
                onClick={() => {
                  setMode('citizen-login');
                  onSwitchMode('citizen-login');
                }}
                className="text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                ← Return to Citizen Portal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-[1400] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-5 h-5 text-emerald-700" />
              <span>Password Recovery</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered email address to receive a secure recovery verification token.
            </p>

            {!resetTokenReceived ? (
              <div className="space-y-3">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <button
                  type="button"
                  onClick={handlePasswordResetRequest}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition"
                >
                  Request Reset Token
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded text-xs">
                  Token: <strong className="font-mono">{resetTokenReceived}</strong>
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <button
                  type="button"
                  onClick={handlePasswordResetConfirm}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition"
                >
                  Confirm & Update Password
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setForgotPasswordOpen(false);
                setResetTokenReceived(null);
              }}
              className="mt-3 w-full py-1 text-slate-500 text-xs hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const CitizenLoginView: React.FC<{ onNavigate: (v: string) => void; onSuccess: () => void }> = ({
  onNavigate,
  onSuccess,
}) => (
  <AuthViews initialMode="citizen-login" onSwitchMode={onNavigate} onSuccess={onSuccess} />
);

export const CitizenRegisterView: React.FC<{ onNavigate: (v: string) => void; onSuccess: () => void }> = ({
  onNavigate,
  onSuccess,
}) => (
  <AuthViews initialMode="citizen-register" onSwitchMode={onNavigate} onSuccess={onSuccess} />
);

export const OfficialLoginView: React.FC<{ onNavigate: (v: string) => void; onSuccess: () => void }> = ({
  onNavigate,
  onSuccess,
}) => (
  <AuthViews initialMode="official-login" onSwitchMode={onNavigate} onSuccess={onSuccess} />
);

export const AdminLoginView: React.FC<{ onNavigate: (v: string) => void; onSuccess: () => void }> = ({
  onNavigate,
  onSuccess,
}) => (
  <AuthViews initialMode="admin-login" onSwitchMode={onNavigate} onSuccess={onSuccess} />
);

