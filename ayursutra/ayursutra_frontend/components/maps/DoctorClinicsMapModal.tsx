"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Layers, 
  X, 
  ExternalLink, 
  Building2, 
  Clock, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  Calendar,
  Navigation,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ClinicItem {
  id?: string | number;
  clinic_name: string;
  clinic_address: string;
  city?: string;
  timing?: string;
  phone?: string;
  consultation_fee?: string;
  fee?: string;
  is_primary?: boolean;
}

export interface DoctorForMap {
  id: number | string;
  doctorName: string;
  name?: string;
  qualification?: string;
  specialization?: string;
  experience?: string;
  city?: string;
  fee?: string;
  consultation_fee?: string;
  phone?: string;
  timing?: string;
  clinics?: ClinicItem[];
  cghsStatus?: string;
  image?: string;
  practitionerDbId?: number;
  is_profile_completed?: boolean;
  rating?: number;
  reviewsCount?: number;
  reviews?: any[];
  therapies?: string[];
}

interface DoctorClinicsMapModalProps {
  doctor: DoctorForMap | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestBooking?: (doctor: DoctorForMap, clinic: ClinicItem) => void;
}

export function DoctorClinicsMapModal({
  doctor,
  isOpen,
  onClose,
  onRequestBooking,
}: DoctorClinicsMapModalProps) {
  const [selectedClinicIndex, setSelectedClinicIndex] = useState<number>(0);
  const [mapType, setMapType] = useState<"m" | "k">("m"); // 'm' = road map, 'k' = satellite
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(false);

  // Reset selected clinic when doctor changes & handle ESC / scroll lock
  useEffect(() => {
    setSelectedClinicIndex(0);
  }, [doctor?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !doctor) return null;

  // Normalized clinics list (at least 1 entry constructed from doctor's info)
  const rawClinics = doctor.clinics && doctor.clinics.length > 0
    ? doctor.clinics
    : [{
        clinic_name: doctor.name || `${doctor.doctorName}'s Clinic`,
        clinic_address: doctor.city ? `${doctor.city}, India` : "Clinic Address",
        city: doctor.city || "",
        timing: doctor.timing || "",
        phone: doctor.phone || "",
        consultation_fee: doctor.consultation_fee || doctor.fee || "",
        is_primary: true
      }];

  const activeClinic = rawClinics[selectedClinicIndex] || rawClinics[0];

  // Construct precise map search query for Google Maps
  const cleanClinicName = activeClinic.clinic_name || doctor.doctorName;
  const cleanAddress = activeClinic.clinic_address || activeClinic.city || doctor.city || "";
  const mapQuery = `${cleanClinicName}, ${cleanAddress}`.trim();

  // Google Maps Embed URL
  const iframeSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`;

  // External Google Maps navigation link
  const externalGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapQuery
  )}`;

  const handleSelectClinic = (idx: number) => {
    setIsIframeLoading(true);
    setSelectedClinicIndex(idx);
    setTimeout(() => setIsIframeLoading(false), 300);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] my-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Modal Header ─── */}
        <div className="hero-gradient px-4 py-3 sm:px-5 sm:py-4 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-ayur-accent text-[11px] font-semibold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Doctor Clinic Map Navigator
            </span>
            <span className="text-white/60 text-xs">·</span>
            <span className="text-white/80 text-xs">
              {rawClinics.length} {rawClinics.length === 1 ? "Clinic Location" : "Clinics Available"}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-outfit font-bold text-white">
            {doctor.doctorName}
          </h3>
          <p className="text-white/80 text-xs mt-0.5">
            {doctor.qualification} · {doctor.specialization} · {doctor.experience || "Certified Vaidya"}
          </p>
        </div>

        {/* ─── Multiple Clinics Tab Selector (Shown if doctor has multiple branches) ─── */}
        {rawClinics.length > 1 && (
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Select Clinic Branch to Pin on Map:
              </span>
              <span className="text-[11px] text-gray-400">
                Click a branch to view location
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {rawClinics.map((clinic, idx) => {
                const isSelected = selectedClinicIndex === idx;
                return (
                  <button
                    key={clinic.id || idx}
                    type="button"
                    onClick={() => handleSelectClinic(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#1E7E34] text-white shadow-xs scale-[1.02]"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-red-500"}`} />
                    <span>{clinic.clinic_name}</span>
                    {clinic.is_primary && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        Primary
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Map Toolbar ─── */}
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {activeClinic.clinic_name}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {activeClinic.clinic_address} {activeClinic.city ? `· ${activeClinic.city}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Satellite / Roadmap Switch */}
            <div className="flex rounded-lg overflow-hidden bg-gray-100 border border-gray-200 p-0.5">
              <button
                type="button"
                onClick={() => setMapType("m")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  mapType === "m"
                    ? "bg-[#1E7E34] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Layers className="w-3 h-3" /> Map
              </button>
              <button
                type="button"
                onClick={() => setMapType("k")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  mapType === "k"
                    ? "bg-[#1E7E34] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Satellite
              </button>
            </div>

            {/* External Navigation Link */}
            <a
              href={externalGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 transition-colors"
              title="Open full Google Maps in new tab for GPS directions"
            >
              <Navigation className="w-3 h-3 text-emerald-600" />
              <span>Directions</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* ─── Map Viewport ─── */}
        <div className="relative w-full h-[200px] xs:h-[230px] sm:h-[280px] md:h-[320px] bg-gray-100 overflow-hidden shrink-0">
          {isIframeLoading && (
            <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <iframe
            title={`${activeClinic.clinic_name} location map`}
            src={iframeSrc}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>

        {/* ─── Scrollable Selected Clinic Details ─── */}
        <div className="p-3 sm:p-4 bg-white space-y-2.5 overflow-y-auto min-h-0 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Address */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" /> Clinic Address
              </span>
              <p className="text-xs text-gray-800 font-medium leading-relaxed">
                {activeClinic.clinic_address} {activeClinic.city ? `, ${activeClinic.city}` : ""}
              </p>
            </div>

            {/* Timings */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" /> Operating Hours
              </span>
              <p className="text-xs text-gray-800 font-medium">
                {activeClinic.timing || doctor.timing || "Contact clinic for hours"}
              </p>
            </div>

            {/* Consultation Fee & Phone */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-600" /> Fee & Contact
              </span>
              <div className="flex items-center justify-between text-xs gap-1">
                <span className="font-bold text-gray-900">
                  {activeClinic.consultation_fee || activeClinic.fee || doctor.consultation_fee || doctor.fee || "Consult for fee"}
                </span>
                {activeClinic.phone || doctor.phone ? (
                  <a
                    href={`tel:${activeClinic.phone || doctor.phone}`}
                    className="text-emerald-700 hover:underline font-semibold truncate"
                  >
                    {activeClinic.phone || doctor.phone}
                  </a>
                ) : (
                  <span className="text-gray-400">Not provided</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Pinned Modal Action Footer (Never obscured or cut off) ─── */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs rounded-xl border-gray-300 cursor-pointer"
          >
            Close Map
          </Button>

          {onRequestBooking && (
            <Button
              size="sm"
              onClick={() => {
                onRequestBooking(doctor, activeClinic);
                onClose();
              }}
              className="bg-[#1E7E34] hover:bg-[#155D27] text-white text-xs font-semibold rounded-xl px-4 sm:px-5 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Book Consultation at this Clinic</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
