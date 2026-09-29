/**
 * Community Health Report System (CHRS) - Citizen Report Submission Form
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  FileCheck,
  Hospital,
  Loader2,
  MapPin,
  Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { offlineDb } from '../services/offlineDb';
import { HealthReport, ReportCategory } from '../types';
import { MapComponent } from './MapComponent';

interface CitizenReportFormProps {
  onReportSubmitted: (report: HealthReport) => void;
  onCancel?: () => void;
}

const COMMON_SYMPTOMS = [
  'Severe Watery Diarrhoea',
  'Frequent Vomiting',
  'High Fever / Chills',
  'Severe Headache / Neck Stiffness',
  'Skin Rash / Petechiae',
  'Jaundice (Yellow Eyes)',
  'Bleeding / Haemorrhage',
  'Persistent Cough / Difficulty Breathing',
  'Abdominal Cramps',
  'Extreme Dehydration / Weakness',
];

export const CitizenReportForm: React.FC<CitizenReportFormProps> = ({
  onReportSubmitted,
  onCancel,
}) => {
  const { user, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState<string>('');
  const [affectedCount, setAffectedCount] = useState<number>(1);

  // Location
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [state, setState] = useState<string>('Lagos');
  const [lga, setLga] = useState<string>('Lagos Island');
  const [availableStates, setAvailableStates] = useState<string[]>(['Lagos', 'Abuja FCT', 'Edo', 'Kano']);

  // Image upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // States
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<any | null>(null);
  const [isOfflineSaved, setIsOfflineSaved] = useState<boolean>(false);

  useEffect(() => {
    // Load categories & states
    api.getCategories().then((res) => {
      setCategories(res.categories || []);
      if (res.categories?.length > 0) setSelectedCategory(res.categories[0].id);
    }).catch((err) => console.warn('Categories loading notice:', err));

    api.getPublicSettings().then((res) => {
      if (res.available_states) setAvailableStates(res.available_states);
    }).catch((err) => console.warn('Settings loading notice:', err));

    // Try automatic GPS immediately on load
    handleGetGpsLocation();
  }, []);

  const handleGetGpsLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please select location manually on the map.');
      setIsLocating(false);
      // Fallback centroid for Lagos
      setLat(6.5244);
      setLng(3.3792);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        setLat(latitude);
        setLng(longitude);
        setIsLocating(false);
        if (!locationName) {
          setLocationName(`GPS: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
        }
      },
      (err) => {
        console.warn('GPS location error:', err);
        setLocationError('Could not automatically retrieve GPS. Please tap your location on the map below.');
        setIsLocating(false);
        // Fallback default coordinates (Lagos Island)
        if (lat === null || lng === null) {
          setLat(6.4549);
          setLng(3.4246);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapPointSelected = (point: { lat: number; lng: number }) => {
    setLat(point.lat);
    setLng(point.lng);
    setLocationError(null);
    if (!locationName) {
      setLocationName(`Selected GPS: ${point.lat}, ${point.lng}`);
    }
  };

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !symptoms.includes(customSymptom.trim())) {
      setSymptoms([...symptoms, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedCategory) {
      setSubmitError('Please select a health condition / category.');
      return;
    }
    if (!title.trim()) {
      setSubmitError('Please enter a brief title summarizing the health issue.');
      return;
    }
    if (!description.trim()) {
      setSubmitError('Please provide details about what you observed or experienced.');
      return;
    }
    if (lat === null || lng === null) {
      setSubmitError('Please specify the location using GPS or the map pin.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      category_id: selectedCategory,
      title: title.trim(),
      description: description.trim(),
      symptoms,
      affected_count: Number(affectedCount) || 1,
      latitude: lat,
      longitude: lng,
      location_name: locationName || `${lga}, ${state}`,
      state,
      lga,
      image_url: imagePreview || undefined,
    };

    // If offline, save to IndexedDB
    if (!navigator.onLine) {
      try {
        const queued = await offlineDb.queueReport(payload);
        setIsOfflineSaved(true);
        setIsSubmitting(false);
        setSuccessReport({
          reference_no: `OFFLINE-QUEUED-${queued.local_id.slice(-6)}`,
          title: payload.title,
          offline: true,
        });
        return;
      } catch (err: any) {
        setSubmitError(`Could not queue report offline: ${err.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const res = await api.submitReport(payload);
      setSuccessReport(res);
      setIsSubmitting(false);
      onReportSubmitted(res.report);
    } catch (err: any) {
      // If network failure during submission, fallback to offline queue
      try {
        await offlineDb.queueReport(payload);
        setIsOfflineSaved(true);
        setSuccessReport({
          reference_no: `OFFLINE-QUEUED-${Date.now().toString(36)}`,
          title: payload.title,
          offline: true,
        });
      } catch (queueErr) {
        setSubmitError(err.message || 'Submission failed.');
      }
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (successReport) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 max-w-2xl mx-auto my-6 text-center animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {isOfflineSaved ? 'Report Saved to Local Device' : 'Health Report Successfully Submitted!'}
        </h2>

        <p className="text-slate-600 mb-6 text-sm sm:text-base">
          {isOfflineSaved ? (
            <span>
              Your report has been securely queued in local offline browser storage (IndexedDB). It will automatically sync to the national database as soon as internet connectivity resumes.
            </span>
          ) : (
            <span>
              Thank you for reporting. Your surveillance alert has been logged into the National Epidemiological Database and routed to the nearest accredited Primary Healthcare facility.
            </span>
          )}
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Reference</span>
            <span className="font-mono font-bold text-emerald-800 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {successReport.report?.reference_no || successReport.reference_no}
            </span>
          </div>

          {successReport.assigned_facility && (
            <div className="flex items-start gap-3 pt-1">
              <Hospital className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 block">Nearest Assigned Health Facility</span>
                <span className="text-sm font-semibold text-slate-800">
                  {successReport.assigned_facility.name}
                </span>
                <span className="text-xs text-slate-500 block">
                  Distance: <strong>{successReport.distance_km} km</strong> (via Haversine Router) • {successReport.assigned_facility.phone}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200">
            <span>Current Status:</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {isOfflineSaved ? 'LOCAL_QUEUED' : 'SUBMITTED (Pending Official Verification)'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setSuccessReport(null);
              setIsOfflineSaved(false);
              setTitle('');
              setDescription('');
              setSymptoms([]);
              setImagePreview(null);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg transition text-sm cursor-pointer shadow-sm"
          >
            Submit Another Report
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition text-sm cursor-pointer"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-6 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>Public Health Surveillance Intake Form</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Report a Suspected Health Issue</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Submit early observations of water-borne, febrile, or communicable illness in your community. Reports are automatically routed to the nearest accredited government health facility.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              1. Suspected Health Condition / Hazard *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xl mt-0.5">
                      {cat.icon === 'droplets' ? '💧' : cat.icon === 'flame' ? '🔥' : cat.icon === 'waves' ? '🌊' : '⚠️'}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        {cat.name}
                        {cat.severity_level === 'CRITICAL' && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{cat.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Issue Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                2. Report Title / Summary *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Several residents suffering acute diarrhoea after bore hole contamination"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-800 placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Detailed Observation *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe how many people are affected, common drinking water sources, exact street landmarks, when symptoms began, and any known hospitalizations..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-800 placeholder-slate-400"
                required
              />
            </div>
          </div>

          {/* 3. Observed Symptoms & Affected Count */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              3. Observed Symptoms (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_SYMPTOMS.map((sym) => {
                const active = symptoms.includes(sym);
                return (
                  <button
                    type="button"
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                      active
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {sym} {active && '✓'}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSymptom();
                  }
                }}
                placeholder="Other specific symptom..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
              <button
                type="button"
                onClick={addCustomSymptom}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <label className="text-xs font-semibold text-slate-700">
                Estimated Number of Affected Persons:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAffectedCount((c) => Math.max(1, c - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center font-bold text-slate-800 border border-slate-300 rounded-lg py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setAffectedCount((c) => c + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 4. GPS Location & Interactive Map Pinpoint */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                4. Location & Geographic Pinpoint *
              </label>
              <button
                type="button"
                id="get-gps-btn"
                onClick={handleGetGpsLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
                )}
                {isLocating ? 'Acquiring GPS...' : 'Auto-Detect GPS Location'}
              </button>
            </div>

            {locationError && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-3">
                {locationError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-slate-500 font-medium mb-1">Operational State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>
                      {s} State
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 font-medium mb-1">Local Govt Area (LGA)</label>
                <input
                  type="text"
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  placeholder="e.g. Ikeja, Lagos Island, Oredo"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 font-medium mb-1">Street Landmark / Ward</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Broad Street CMS / Market Junction"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
              <span>
                Coordinates: <strong>{lat !== null ? `${lat.toFixed(5)}, ${lng?.toFixed(5)}` : 'Not set'}</strong>
              </span>
              <span className="text-[11px] text-slate-400">
                (Click on the map below if GPS fails or to refine pin)
              </span>
            </div>

            {/* Interactive Leaflet Pin Picker */}
            <div className="h-64 rounded-xl overflow-hidden border border-slate-300 shadow-sm">
              <MapComponent
                mode="picker"
                initialLat={lat || 6.4549}
                initialLng={lng || 3.4246}
                zoom={lat ? 14 : 11}
                height="100%"
                selectedPoint={lat && lng ? { lat, lng } : null}
                onPointSelected={handleMapPointSelected}
              />
            </div>
          </div>

          {/* 5. Photo Upload */}
          <div className="border-t border-slate-200 pt-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              5. Photo Evidence / Water Sample (Optional)
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-800 text-xs font-semibold cursor-pointer transition">
                <Camera className="w-4 h-4" />
                <span>Upload Photograph / Document</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              {imagePreview && (
                <div className="relative inline-block border border-slate-300 rounded-lg overflow-hidden">
                  <img src={imagePreview} alt="Upload preview" className="w-24 h-24 object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              🔒 In compliance with Nigerian public health protocols, report coordinates are transmitted securely to accredited Primary Healthcare officers.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-sm font-medium rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                id="submit-report-btn"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-lg transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Routing to Nearest PHC...</span>
                  </>
                ) : (
                  <>
                    <span>Submit to Health Facility</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
