/**
 * Community Health Report System (CHRS) - Admin Facilities Management View
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileCheck,
  Hospital,
  MapPin,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { FacilityApplication, HealthFacility } from '../types';

export const AdminFacilitiesView: React.FC = () => {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [applications, setApplications] = useState<FacilityApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add facility modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Primary Healthcare Centre');
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState('Lagos Island');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('6.4549');
  const [longitude, setLongitude] = useState('3.4246');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminFacilities();
      setFacilities(res.facilities || []);
      setApplications(res.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.updateAdminFacility(id, { verification_status: status });
      await loadFacilities();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await api.updateAdminFacility(id, { is_active: !currentActive });
      await loadFacilities();
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminFacility({
        name,
        type,
        state,
        lga,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        phone,
        email,
        verification_status: 'APPROVED',
        is_active: true,
      });
      setAddModalOpen(false);
      setName('');
      setAddress('');
      await loadFacilities();
    } catch (err: any) {
      alert(`Creation failed: ${err.message}`);
    }
  };

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.lga.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Hospital className="w-5 h-5 text-emerald-700" />
            <span>Health Facilities Accreditation & Case Routing Registry</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Only verified and active facilities are considered by the Haversine router for automated case assignment.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Health Facility</span>
        </button>
      </div>

      {/* Pending Applications Banner if any */}
      {applications.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-700" />
              <span>Pending Accreditation Applications ({applications.length})</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {applications.map((app) => (
              <div key={app.id} className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{app.applicant_name}</span>
                  <span className="font-mono text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    Lic: {app.license_number}
                  </span>
                </div>
                <p className="text-slate-500">{app.applicant_email}</p>
                {app.notes && <p className="text-slate-600 italic">"{app.notes}"</p>}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(app.facility_id, 'APPROVED')}
                    className="px-3 py-1 bg-emerald-700 text-white font-semibold rounded text-[11px] hover:bg-emerald-800 cursor-pointer"
                  >
                    Approve Facility
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(app.facility_id, 'REJECTED')}
                    className="px-3 py-1 bg-red-600 text-white font-semibold rounded text-[11px] hover:bg-red-700 cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search facilities by name, LGA, or state..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Facilities Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Facility Name & Type</th>
                <th className="py-3 px-4">Location (LGA, State)</th>
                <th className="py-3 px-4">GPS Coordinates</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Accreditation</th>
                <th className="py-3 px-4">Routing Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFacilities.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{f.name}</div>
                    <div className="text-[11px] text-slate-400">{f.type}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{f.lga}, {f.state}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">{f.address}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{f.phone}</div>
                    <div className="text-[10px] text-slate-400">{f.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        f.verification_status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : f.verification_status === 'REJECTED'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {f.verification_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(f.id, f.is_active)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        f.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {f.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {f.verification_status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(f.id, 'APPROVED')}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                    {f.verification_status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(f.id, 'REJECTED')}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold transition cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Facility Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900">Add Accredited Health Facility</h3>
            <form onSubmit={handleCreateFacility} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lagos Island General Hospital"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Lagos">Lagos State</option>
                    <option value="Abuja FCT">Abuja FCT</option>
                    <option value="Edo">Edo State</option>
                    <option value="Kano">Kano State</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Local Govt Area (LGA) *</label>
                  <input
                    type="text"
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    placeholder="e.g. Lagos Island"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full street address"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@facility.ng"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
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
                  Create & Approve Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
