"use client";

import { useState } from "react";
import { CityData, HospitalDoctor } from "@/lib/data/practitionerLocations";
import { 
  MapPin, 
  Star, 
  Layers, 
  ArrowRight, 
  X,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleMapsSimulatorProps {
  city: CityData;
  activeHospital: HospitalDoctor | null;
  onSelectHospital: (hospital: HospitalDoctor | null) => void;
  onRequestTreatment: (hospital: HospitalDoctor) => void;
}

export function GoogleMapsSimulator({
  city,
  activeHospital,
  onSelectHospital,
  onRequestTreatment,
}: GoogleMapsSimulatorProps) {
  const [mapType, setMapType] = useState<"m" | "k">("m"); // 'm' = road map, 'k' = satellite
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(false);

  // Determine query: either active hospital's specific query or city-wide query
  const currentQuery = activeHospital ? activeHospital.mapQuery : city.mapQuery;
  const currentZoom = activeHospital ? 15 : city.zoomLevel || 12;

  // Real Google Maps Embed URL
  const iframeSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    currentQuery
  )}&t=${mapType}&z=${currentZoom}&ie=UTF8&iwloc=&output=embed`;

  const handleSelectHospitalWithFeedback = (h: HospitalDoctor | null) => {
    setIsIframeLoading(true);
    onSelectHospital(h);
    setTimeout(() => setIsIframeLoading(false), 500);
  };

  const handleToggleMapType = (type: "m" | "k") => {
    setIsIframeLoading(true);
    setMapType(type);
    setTimeout(() => setIsIframeLoading(false), 400);
  };

  return (
    <div className="w-full rounded-3xl overflow-hidden border border-gray-300 shadow-xl bg-white flex flex-col">
      {/* ─── Clean Header Toolbar Placed ABOVE the Map (Zero Collision with Google UI) ─── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Location Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1E7E34] flex items-center justify-center shrink-0 border border-emerald-200">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Google Maps View:</span>
              <span className="text-xs font-bold text-gray-900 truncate">
                {activeHospital ? activeHospital.name : city.name}
              </span>
            </div>
            {activeHospital && (
              <p className="text-[11px] text-[#1E7E34] font-semibold truncate">
                Dr: {activeHospital.doctorName} · {activeHospital.address}
              </p>
            )}
          </div>
        </div>

        {/* Right: Map / Satellite switcher & Reset Button */}
        <div className="flex items-center gap-2">
          {activeHospital && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectHospitalWithFeedback(null)}
              className="h-8 px-2.5 text-xs rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset City</span>
            </Button>
          )}

          <div className="flex rounded-xl overflow-hidden bg-gray-100 border border-gray-200 p-0.5">
            <button
              onClick={() => handleToggleMapType("m")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                mapType === "m"
                  ? "bg-[#1E7E34] text-white shadow-xs"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <Layers className="w-3 h-3" />
              Map
            </button>
            <button
              onClick={() => handleToggleMapType("k")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                mapType === "k"
                  ? "bg-[#1E7E34] text-white shadow-xs"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* ─── 100% Unobstructed Google Maps Iframe ─── */}
      <div className="relative w-full h-[520px] md:h-[580px] bg-gray-100">
        {isIframeLoading && (
          <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs flex items-center justify-center pointer-events-none transition-opacity">
            <div className="bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-gray-200 flex items-center gap-2.5 text-xs font-semibold text-gray-800">
              <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
              <span>Centering Google Map...</span>
            </div>
          </div>
        )}

        <iframe
          key={`${city.id}-${activeHospital?.id || 'city'}-${mapType}`}
          src={iframeSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
          title={`Google Map - ${activeHospital ? activeHospital.name : city.name}`}
        />
      </div>

      {/* ─── Bottom Spotlight Bar (When Doctor/Hospital is Selected) ─── */}
      {activeHospital && (
        <div className="bg-white border-t border-gray-200 p-4 transition-all animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Thumbnail */}
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeHospital.image}
                  alt={activeHospital.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-outfit font-bold text-sm text-gray-900 truncate">
                    {activeHospital.name}
                  </h4>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    {activeHospital.rating}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#1E7E34] truncate">
                  {activeHospital.doctorName} · {activeHospital.qualification}
                </p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  <MapPin className="w-3 h-3 inline mr-1 text-red-500" />
                  {activeHospital.address} · {activeHospital.distance}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectHospitalWithFeedback(null)}
                className="text-xs h-8 rounded-xl border-gray-300"
              >
                Clear Pin
              </Button>
              <Button
                size="sm"
                onClick={() => onRequestTreatment(activeHospital)}
                className="bg-[#1E7E34] hover:bg-[#155D27] text-white text-xs h-8 px-4 rounded-xl shadow-xs flex items-center gap-1.5 font-semibold"
              >
                <span>Request Treatment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
