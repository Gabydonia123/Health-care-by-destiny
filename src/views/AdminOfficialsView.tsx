/**
 * Community Health Report System (CHRS) - Admin Officials Management View
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Hospital,
  Plus,
  Search,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import { HealthFacility, HealthOfficial } from '../types';

export const AdminOfficialsView: React.FC = () => {
  const [officials, setOfficials] = useState<HealthOfficial[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add official modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Official123!');
  const [facilityId, setFacilityId] = useState('');
  const [cadre, setCadre] = useState('Surveillance Officer');
  const [licenseNumber, setLicenseNumber] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [offRes, facRes] = await Promise.all([
        api.getAdminOfficials(),
        api.getAdminFacilities(),
      ]);
      setOfficials(offRes.officials || []);
      const approvedFacs = (facRes.facilities || []).filter((f) => f.verification_status === 'APPROVED');
      setFacilities(approvedFacs);
      if (approvedFacs.length > 0) setFacilityId(approvedFacs[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminOfficial({
        name,
        email,
        password,
        facility_id: facilityId,
        cadre,
        license_number: licenseNumber,
      });
      setAddModalOpen(false);
      setName('');
      setEmail('');
      setLicenseNumber('');
      await loadData();
    } catch (err: any) {
      alert(`Error creating official: ${err.message}`);
    }
  };

  const filteredOfficials = officials.filter(
    (o) =>
      o.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cadre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.facility_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>Health Surveillance Personnel & Facility Deployment</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Surveillance Medical Officers assigned to triage and verify disease outbreaks at accredited stations.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Health Official</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search officials by name, cadre, license, or assigned facility..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Officials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Officer Details</th>
                <th className="py-3 px-4">Cadre & Specialization</th>
                <th className="py-3 px-4">Practice License #</th>
                <th className="py-3 px-4">Assigned Facility</th>
                <th className="py-3 px-4">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOfficials.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{o.user_name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{o.user_email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {o.cadre}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {o.license_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-emerald-800 flex items-center gap-1">
                      <Hospital className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{o.facility_name || 'Primary Healthcare Facility'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ACTIVE SURVEILLANCE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Official Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-700" />
              <span>Provision Healthcare Surveillance Officer</span>
            </h3>

            <form onSubmit={handleCreateOfficial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Chidinma Eze"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Work Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="c.eze@ncdc.gov.ng"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cadre / Designation *</label>
                  <select
                    value={cadre}
                    onChange={(e) => setCadre(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Surveillance Officer">Surveillance Officer</option>
                    <option value="Medical Officer of Health (MOH)">Medical Officer of Health (MOH)</option>
                    <option value="Disease Surveillance Notification Officer (DSNO)">DSNO (LGA Level)</option>
                    <option value="Laboratory Epidemiologist">Laboratory Epidemiologist</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Practice License # *</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="MDCN/2023/12345"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deploy to Accredited Facility *</label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                  required
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.lga}, {f.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg"
                >
                  Deploy Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
