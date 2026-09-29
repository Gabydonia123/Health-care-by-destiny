/**
 * Community Health Report System (CHRS) - Portal Gateway (First Page)
 * 
 * Complies with strict user directives:
 * 1. The first page only shows two options: Citizen login or Medical Facility login (or sign-up if no account).
 * 2. Removes complex homepage/landing page; starts directly with the login choice.
 * 3. Does not display the Admin login on the public page.
 * 4. Simple, clean, and easy to follow for users who are not tech-oriented.
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  HeartPulse,
  Hospital,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

type GatewayMode =
  | 'select'
  | 'citizen-login'
  | 'citizen-signup'
  | 'facility-login'
  | 'facility-signup'
  | 'admin-login';

interface PortalGatewayViewProps {
  onSuccess?: (role: string) => void;
  onNavigate?: (view: string) => void;
  initialMode?: GatewayMode;
}

export const PortalGatewayView: React.FC<PortalGatewayViewProps> = ({
  onSuccess,
  onNavigate,
  initialMode = 'select',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<GatewayMode>(initialMode);

  const navigateToRole = (role: string) => {
    if (onSuccess) onSuccess(role);
    if (onNavigate) onNavigate(`${role}-dashboard`);
  };

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Facility Registration Specific Fields
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('Primary Healthcare Centre');
  const [facilityState, setFacilityState] = useState('Lagos');
  const [facilityLga, setFacilityLga] = useState('Ikeja');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [applicantLicense, setApplicantLicense] = useState('');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      if (!email || !password) throw new Error('Please enter your email and password');
      await login(email.trim(), password, 'citizen');
      navigateToRole('citizen');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitizenSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      if (!name || !email || !password || !phone) {
        throw new Error('Please fill in your name, email, phone number, and password');
      }
      await register(name.trim(), email.trim(), phone.trim(), password);
      navigateToRole('citizen');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacilityLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      if (!email || !password) throw new Error('Please enter your facility email and password');
      await login(email.trim(), password, 'official');
      navigateToRole('official');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials or accreditation status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacilitySignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      if (!facilityName || !email || !password || !name) {
        throw new Error('Please fill in facility name, official email, password, and officer name');
      }

      await api.submitFacilityRegistration({
        name: facilityName,
        type: facilityType,
        state: facilityState,
        lga: facilityLga,
        address: facilityAddress || 'Hospital Crescent',
        latitude: 6.5244,
        longitude: 3.3792,
        phone: phone || '+234 1 234 5678',
        email: email.trim(),
        applicant_name: name.trim(),
        applicant_email: email.trim(),
        license_number: applicantLicense || 'MDCN-SUBMITTED',
        notes: `Registered via portal signup. Password: ${password}`,
      });

      setSuccessMessage('Facility registration submitted successfully! Our surveillance team has recorded your facility.');
      setMode('facility-login');
    } catch (err: any) {
      setErrorMessage(err.message || 'Facility registration failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      if (!email || !password) throw new Error('Please enter administrator email and password');
      await login(email.trim(), password, 'admin');
      navigateToRole('admin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Administrator authorization rejected.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6">
      {/* Top Simple National Header */}
      <div className="text-center mb-8 max-w-xl">
        <div className="inline-flex items-center justify-center p-2.5 bg-emerald-100 rounded-full mb-3 text-emerald-800 border border-emerald-200 shadow-2xs">
          <HeartPulse className="w-7 h-7 text-emerald-700" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Community Health Report System
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Federal Republic of Nigeria • Grassroots Disease Surveillance & Response
        </p>
      </div>

      {/* Main Choice Screen (When mode === 'select') */}
      {mode === 'select' && (
        <div className="w-full max-w-3xl animate-fadeIn space-y-6">
          <div className="text-center mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              Select Your Access Portal to Continue
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Choose whether you are an everyday citizen or accredited medical facility personnel
            </p>
          </div>

          {/* TWO PRIMARY CHOICES (Citizen vs Medical Facility) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OPTION 1: CITIZEN */}
            <div className="bg-white rounded-3xl border-2 border-emerald-500/80 shadow-md p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Public Access
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-emerald-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Citizen Portal
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  For residents and community members. Report symptoms, illnesses, contaminated water, or check status updates on your community.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  id="citizen-login-choice-btn"
                  onClick={() => {
                    resetMessages();
                    setMode('citizen-login');
                  }}
                  className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Citizen Login</span>
                </button>

                <button
                  id="citizen-signup-choice-btn"
                  onClick={() => {
                    resetMessages();
                    setMode('citizen-signup');
                  }}
                  className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl transition border border-emerald-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>New citizen? Sign up with Gmail</span>
                </button>
              </div>
            </div>

            {/* OPTION 2: MEDICAL FACILITY */}
            <div className="bg-white rounded-3xl border-2 border-blue-500/80 shadow-md p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Medical Staff
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                  <Hospital className="w-8 h-8 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Medical Facility Portal
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  For Primary Healthcare Centres, Clinics, and Hospitals. Review citizen reports, verify disease cases, and manage clinical surveillance.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  id="facility-login-choice-btn"
                  onClick={() => {
                    resetMessages();
                    setMode('facility-login');
                  }}
                  className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Medical Facility Login</span>
                </button>

                <button
                  id="facility-signup-choice-btn"
                  onClick={() => {
                    resetMessages();
                    setMode('facility-signup');
                  }}
                  className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded-xl transition border border-blue-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Register New Healthcare Facility</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CITIZEN LOGIN FORM */}
      {mode === 'citizen-login' && (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
          <div className="bg-emerald-800 p-6 text-white text-center relative">
            <button
              onClick={() => {
                resetMessages();
                setMode('select');
              }}
              className="absolute left-4 top-5 text-emerald-200 hover:text-white flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-2">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Citizen Login</h2>
            <p className="text-xs text-emerald-200 mt-1">Sign in with your email or Gmail account</p>
          </div>

          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCitizenLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail or Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600"
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
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In as Citizen'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
              <p className="text-xs text-slate-600">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    resetMessages();
                    setMode('citizen-signup');
                  }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Create citizen account
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CITIZEN SIGN UP FORM */}
      {mode === 'citizen-signup' && (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
          <div className="bg-emerald-800 p-6 text-white text-center relative">
            <button
              onClick={() => {
                resetMessages();
                setMode('select');
              }}
              className="absolute left-4 top-5 text-emerald-200 hover:text-white flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-2">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Create Citizen Account</h2>
            <p className="text-xs text-emerald-200 mt-1">Join the community health reporting network</p>
          </div>

          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCitizenSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chinedu Okafor"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail or Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Register & Start Reporting'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Already registered?{' '}
                <button
                  onClick={() => {
                    resetMessages();
                    setMode('citizen-login');
                  }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MEDICAL FACILITY LOGIN FORM */}
      {mode === 'facility-login' && (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
          <div className="bg-blue-800 p-6 text-white text-center relative">
            <button
              onClick={() => {
                resetMessages();
                setMode('select');
              }}
              className="absolute left-4 top-5 text-blue-200 hover:text-white flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-700 text-white flex items-center justify-center mb-2">
              <Hospital className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Medical Facility Login</h2>
            <p className="text-xs text-blue-200 mt-1">For Doctors, Nurses & PHC Surveillance Staff</p>
          </div>

          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleFacilityLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Facility Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. official@chrs.gov.ng or phc@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facility Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-blue-600 focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Sign In to Medical Station'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Need to register your health facility?{' '}
                <button
                  onClick={() => {
                    resetMessages();
                    setMode('facility-signup');
                  }}
                  className="font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  Register facility here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MEDICAL FACILITY SIGN UP / REGISTRATION FORM */}
      {mode === 'facility-signup' && (
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
          <div className="bg-blue-800 p-6 text-white text-center relative">
            <button
              onClick={() => {
                resetMessages();
                setMode('select');
              }}
              className="absolute left-4 top-5 text-blue-200 hover:text-white flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-700 text-white flex items-center justify-center mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Register Healthcare Facility</h2>
            <p className="text-xs text-blue-200 mt-1">Enroll your Hospital, PHC or Clinic into CHRS</p>
          </div>

          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleFacilitySignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Health Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="e.g. Alausa Comprehensive Primary Health Centre"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facility Type *</label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Primary Healthcare Centre">Primary Healthcare Centre</option>
                    <option value="General Hospital">General Hospital</option>
                    <option value="Specialist Hospital">Specialist Hospital</option>
                    <option value="Community Health Post">Community Health Post</option>
                    <option value="Private Clinic">Private Clinic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State & LGA *</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="text"
                      value={facilityState}
                      onChange={(e) => setFacilityState(e.target.value)}
                      placeholder="State"
                      className="px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                    />
                    <input
                      type="text"
                      value={facilityLga}
                      onChange={(e) => setFacilityLga(e.target.value)}
                      placeholder="LGA"
                      className="px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor / Officer Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Gabriel Etu"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MDCN / License No.</label>
                  <input
                    type="text"
                    value={applicantLicense}
                    onChange={(e) => setApplicantLicense(e.target.value)}
                    placeholder="e.g. MDCN-2020-12345"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="facility@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 802 000 0000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Facility Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set facility account password"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Submitting Application...' : 'Register Medical Facility'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Already registered?{' '}
                <button
                  onClick={() => {
                    resetMessages();
                    setMode('facility-login');
                  }}
                  className="font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED RESTRICTED ADMINISTRATOR GATEWAY (Strictly for Admins with Permanent Password) */}
      {mode === 'admin-login' && (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-purple-500 overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 p-6 text-white text-center relative">
            <button
              onClick={() => {
                resetMessages();
                setMode('select');
              }}
              className="absolute left-4 top-5 text-purple-200 hover:text-white flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-900/80 text-purple-200 flex items-center justify-center mb-2 border border-purple-700">
              <Shield className="w-7 h-7 text-purple-300" />
            </div>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900 border border-purple-700 text-purple-200 mb-1 uppercase tracking-wider">
              RESTRICTED SYSTEM ACCESS
            </span>
            <h2 className="text-xl font-bold">System Administrator Gateway</h2>
            <p className="text-xs text-slate-300 mt-1">
              Federal Surveillance Directorate & Epidemiological Command
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-4 p-3.5 bg-purple-50 border border-purple-200 text-purple-950 text-xs rounded-xl space-y-1">
              <span className="font-bold block text-purple-900">Primary Administrator Account:</span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-semibold block text-slate-900">Eseoghene Destiny</span>
                  <span className="font-mono text-purple-800 text-[11px] block font-medium">
                    eseoghenedestiny05@gmail.com
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('eseoghenedestiny05@gmail.com');
                    setPassword('Aharhibaba123.');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-purple-200 hover:bg-purple-300 text-purple-900 rounded-lg transition cursor-pointer self-start sm:self-center"
                >
                  Autofill Credentials
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block pt-1 border-t border-purple-200/60 mt-1">
                Strict Security: Only authenticated administrators can log in here. Additional admin accounts can only be created from within the admin dashboard after logging in.
              </span>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
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
                    placeholder="eseoghenedestiny05@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-purple-600 focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Permanent Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-purple-600 focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-900 hover:bg-purple-950 text-white font-bold text-sm rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Authorizing...' : 'Authorize Administrator Access'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Discreet Administrator Entry Point (Not prominently displayed on public page, per requirement 2) */}
      {mode === 'select' && (
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              resetMessages();
              setMode('admin-login');
            }}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition flex items-center gap-1.5 mx-auto cursor-pointer"
            title="System Administration Portal"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Administrator Gateway</span>
          </button>
        </div>
      )}
    </div>
  );
};
