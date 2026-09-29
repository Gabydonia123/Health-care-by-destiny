/**
 * Community Health Report System (CHRS) - Admin System Settings View
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Radio,
  Save,
  Settings,
} from 'lucide-react';
import { api } from '../services/api';

export const AdminSettingsView: React.FC = () => {
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [activeStates, setActiveStates] = useState('Lagos, Abuja FCT, Edo, Kano, Rivers');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getAdminSettings().then((res) => {
      const s = res.settings || {};
      if (s.emergency_message) setEmergencyMessage(s.emergency_message);
      if (s.active_states) setActiveStates(s.active_states);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    try {
      await api.updateAdminSettings({
        emergency_message: emergencyMessage,
        active_states: activeStates,
      });
      setSuccessMessage('System settings updated successfully.');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <span>National Surveillance System Configuration</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure federal broadcast banners, active surveillance states, and global alert settings.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-600" />
              <span>Federal Emergency Broadcast Banner (Appears across public portal)</span>
            </label>
            <input
              type="text"
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              placeholder="e.g. Heightened surveillance active for cholera in Lagos Island. Report contaminated water sources immediately."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Leave blank to disable the emergency banner on the public home page.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Active Epidemiological States (Comma-separated)
            </label>
            <input
              type="text"
              value={activeStates}
              onChange={(e) => setActiveStates(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Determines the states enabled for citizen reporting dropdowns and facility accreditation.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Settings...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
