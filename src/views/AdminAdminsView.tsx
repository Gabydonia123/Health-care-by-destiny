/**
 * Community Health Report System (CHRS) - Admin Accounts Management
 * 
 * Complies with requirement 9:
 * "other admin accounts can only be created in the admin dashboard after the first account has been created by you."
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  PlusCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

export const AdminAdminsView: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New admin form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminAdmins();
      setAdmins(data.admins || []);
    } catch (err: any) {
      console.error('Error fetching admin accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in name, email, and password.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createAdminAdmin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '+234 800 000 0000',
        password: password.trim(),
      });

      setStatusMessage({
        type: 'success',
        text: `Administrator account for "${res.admin.name}" provisioned successfully!`,
      });

      // Clear form
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');

      // Reload list
      loadAdmins();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to create administrator account.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-purple-800/40">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Administrative Governance & Access Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">
            System Administrator Accounts
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
            In accordance with system policy, additional administrator accounts can strictly only be provisioned from within this dashboard by an authorized administrator.
          </p>
        </div>

        <div className="bg-purple-900/60 border border-purple-700/60 rounded-xl p-3 text-right">
          <span className="text-[11px] text-purple-300 block">Primary Administrator</span>
          <span className="text-sm font-bold text-white block">Eseoghene Destiny</span>
          <span className="text-[10px] text-purple-300/90 font-mono">eseoghenedestiny05@gmail.com</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Create New Admin Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-700" />
                <span>Create New Administrator</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded uppercase">
                Admin-Only Action
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Only authenticated administrators can provision additional admin accounts for surveillance operations.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name & Title *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Ngozi Eze"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Administrator Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. newadmin@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set strong administrator password"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:outline-purple-600"
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
              disabled={isSubmitting}
              className="w-full py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Administrator...' : 'Create Administrator Account'}</span>
            </button>
          </form>
        </div>

        {/* Right: Existing Admins Directory */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-700" />
                <span>Authorized System Administrators</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current active administrative credentials in the system
              </p>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-full">
              {admins.length} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold">
                  <th className="p-3">Administrator</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Access Tier</th>
                  <th className="p-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{admin.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{admin.email}</div>
                    </td>
                    <td className="p-3 text-slate-600">{admin.phone}</td>
                    <td className="p-3">
                      {admin.email.toLowerCase() === 'eseoghenedestiny05@gmail.com' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                          <Shield className="w-3 h-3 text-purple-700" />
                          Primary Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(admin.created_at).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
