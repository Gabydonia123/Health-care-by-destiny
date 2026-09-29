/**
 * Community Health Report System (CHRS) - Facility Accreditation Application View
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileCheck,
  Hospital,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

export const FacilityRegisterView: React.FC<{ onNavigate?: (view: string) => void }> = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Primary Healthcare Centre');
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState('Ikeja');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('6.5965');
  const [longitude, setLongitude] = useState('3.3421');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await api.submitFacilityRegistration({
        name,
        type,
        state,
        lga,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        phone,
        email,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        license_number: licenseNumber,
        notes,
      });

      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Accreditation application submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4 text-center animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Accreditation Application Submitted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your healthcare facility application has been registered with status{' '}
            <strong className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              PENDING
            </strong>
            . The Federal Epidemiological Surveillance Administrator will verify your license number{' '}
            <strong className="font-mono">{licenseNumber}</strong> prior to routing live citizen cases.
          </p>
          <button
            onClick={() => {
              setSubmittedSuccess(false);
              setName('');
              setAddress('');
              setLicenseNumber('');
            }}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Submit Another Facility
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl text-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Hospital className="w-4 h-4" />
          <span>Health Facility Accreditation Program</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">Register Healthcare Facility for Case Routing</h1>
        <p className="text-emerald-100 text-xs sm:text-sm mt-1">
          Apply to connect your clinic or hospital to the national epidemiological surveillance network. Approved facilities receive automated case notifications based on spatial proximity.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              1. Facility Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Official Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alausa Primary Health Centre"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Classification *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Primary Healthcare Centre">Primary Healthcare Centre (PHC)</option>
                  <option value="General Hospital">General Hospital</option>
                  <option value="Teaching Hospital">Teaching Hospital</option>
                  <option value="Comprehensive Health Clinic">Comprehensive Health Clinic</option>
                  <option value="Private Medical Centre">Private Medical Centre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Lagos">Lagos State</option>
                  <option value="Abuja FCT">Abuja FCT</option>
                  <option value="Edo">Edo State</option>
                  <option value="Kano">Kano State</option>
                  <option value="Rivers">Rivers State</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Local Govt Area (LGA) *</label>
                <input
                  type="text"
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  placeholder="e.g. Ikeja, Lagos Mainland, Oredo"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Facility Phone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, plot number, landmark"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Latitude *</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Longitude *</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              2. Medical Director / Surveillance Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Applicant Name *</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Dr. Oluwaseun Davies"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Applicant Work Email *</label>
                <input
                  type="email"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="director@phc.lagos.gov.ng"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MDCN / Regulatory Practice License Number *
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="MDCN/FMOH/REG-2024-XXXXX"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Mandatory for verification against federal health registry before live routing authorization.
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Submitting Application...' : 'Submit Accreditation Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
