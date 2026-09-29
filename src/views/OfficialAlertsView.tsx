/**
 * Community Health Report System (CHRS) - Official Issue Alert View
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Radio,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { ReportCategory } from '../types';

export const OfficialAlertsView: React.FC = () => {
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [message, setMessage] = useState('');
  const [affectedArea, setAffectedArea] = useState('Lagos Island');
  const [state, setState] = useState('Lagos');
  const [severity, setSeverity] = useState('ADVISORY');
  const [radiusKm, setRadiusKm] = useState('5');
  const [latitude, setLatitude] = useState('6.4549');
  const [longitude, setLongitude] = useState('3.4246');
  const [expiryDays, setExpiryDays] = useState('14');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getCategories().then((res) => {
      setCategories(res.categories || []);
      if (res.categories?.length > 0) setCategoryId(res.categories[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const expiryDate = new Date(Date.now() + parseInt(expiryDays) * 86400000)
        .toISOString()
        .split('T')[0];

      await api.issueOfficialAlert({
        title,
        category_id: categoryId,
        message,
        affected_area: affectedArea,
        state,
        severity,
        radius_km: Number(radiusKm),
        latitude: Number(latitude),
        longitude: Number(longitude),
        expiry_date: expiryDate,
      });

      setSuccessMessage('Public health alert issued and broadcasted to citizens.');
      setTitle('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Alert broadcast failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-emerald-950 rounded-2xl text-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Emergency Public Broadcast Dispatch Center</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">Issue Authorized Public Health Alert</h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Authorized Medical Officers can broadcast immediate disease prevention guidance, boiling advisories, and quarantine warnings across affected jurisdictions.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alert Headline / Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Precautionary Water Boiling Advisory for Lagos Island Wards"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Associated Disease / Hazard *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alert Severity Level *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
              >
                <option value="ADVISORY">ADVISORY (General precaution)</option>
                <option value="WARNING">WARNING (Heightened vigilance / isolated cases)</option>
                <option value="EMERGENCY">EMERGENCY (Active spreading epidemic outbreak)</option>
                <option value="INFORMATION">INFORMATION (Standard health update)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="Lagos">Lagos State</option>
                <option value="Abuja FCT">Abuja FCT</option>
                <option value="Edo">Edo State</option>
                <option value="Kano">Kano State</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Affected Area / LGA *</label>
              <input
                type="text"
                value={affectedArea}
                onChange={(e) => setAffectedArea(e.target.value)}
                placeholder="e.g. Lagos Island CMS, Marina"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Guidance Message & Prevention Instructions *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="State clear, actionable steps for residents: e.g. Chlorinate well water, seek immediate rehydration if symptoms occur, report new cases."
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Broadcasting Alert...' : 'Authorize & Broadcast Alert'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
