"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import { CITIES_DATA, CityData, HospitalDoctor } from "@/lib/data/practitionerLocations";
import { GoogleMapsSimulator } from "@/components/maps/GoogleMapsSimulator";
import { 
  MapPin, 
  Search, 
  Star, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Filter,
  Sparkles,
  Building2,
  Navigation,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const PANCHAKARMA_THERAPIES = [
  { name: "General Consultation", desc: "Comprehensive pulse diagnosis & assessment" },
  { name: "Vamana (Gastric Detox)", desc: "Induced therapeutic emesis for Kapha & respiratory disorders" },
  { name: "Virechana (Liver & Purgation)", desc: "Herbal purgation for Pitta, skin & digestive disorders" },
  { name: "Basti (Medicated Enema)", desc: "Colon rejuvenation & Vata stabilization (arthritis, sciatica, pain)" },
  { name: "Nasya (Nasal Cleansing)", desc: "Nasal administration of herbal oils for sinus, headaches & mental clarity" },
  { name: "Raktamokshana (Blood Cleansing)", desc: "Purifying blood stagnation, eczema, varicose veins & vascular health" },
];

export default function PatientPractitionersPage() {
  const { user } = useAuth();
  const isPractitioner = user?.role === "practitioner";

  const [selectedCityId, setSelectedCityId] = useState<string>("delhi");
  const [citySearchInput, setCitySearchInput] = useState<string>("");
  const [activeHospital, setActiveHospital] = useState<HospitalDoctor | null>(null);
  
  // Treatment Request Modal State
  const [modalHospital, setModalHospital] = useState<HospitalDoctor | null>(null);
  const [preferredTherapy, setPreferredTherapy] = useState<string>("General Consultation");
  const [symptomsMessage, setSymptomsMessage] = useState<string>("");
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const activeCity: CityData = CITIES_DATA[selectedCityId] || CITIES_DATA["delhi"];

  // Fetch real practitioners from backend
  const { data: dbPractitioners } = useQuery({
    queryKey: ["practitioners"],
    queryFn: async () => {
      try {
        const res = await api.get("/practitioners");
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Filter ONLY practitioners who completed their profile (with clinic & consultation details)
  const verifiedDbHospitals: HospitalDoctor[] = (dbPractitioners || [])
    .filter((p: any) => p.is_profile_completed && (
      !p.city || 
      p.city.toLowerCase().includes(selectedCityId) || 
      (selectedCityId === "delhi" && (p.city.toLowerCase().includes("delhi") || p.city.toLowerCase().includes("noida") || p.city.toLowerCase().includes("gurugram") || p.city.toLowerCase().includes("gurgaon"))) ||
      (selectedCityId === "punjab" && (p.city.toLowerCase().includes("punjab") || p.city.toLowerCase().includes("chandigarh") || p.city.toLowerCase().includes("ludhiana"))) ||
      (selectedCityId === "kerala" && (p.city.toLowerCase().includes("kerala") || p.city.toLowerCase().includes("kochi"))) ||
      (selectedCityId === "mumbai" && (p.city.toLowerCase().includes("mumbai") || p.city.toLowerCase().includes("pune")))
    ))
    .map((p: any) => ({
      id: `db-practitioner-${p.id}`,
      name: p.clinic_name || `${p.name}'s Ayurvedic Center`,
      doctorName: p.name.startsWith("Dr.") ? p.name : `Dr. ${p.name}`,
      practitionerDbId: p.id,
      qualification: p.qualification || "BAMS, MD",
      experience: p.experience || "5+ years",
      specialization: p.specialization || "Panchakarma Specialist",
      rating: 4.9,
      reviewsCount: 142,
      type: "Verified On-Platform Doctor",
      cghsStatus: p.accreditation || "NABH Accredited · Ayush Certified",
      address: p.clinic_address || p.city || "Clinic Location",
      distance: "1.2 km away",
      openStatus: p.timing || "Open now · Closes 8:00 PM",
      phone: p.phone || "+91 98112 34567",
      fee: p.consultation_fee || "₹700",
      image: p.profile_image || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300&auto=format&fit=crop&q=80",
      coords: { x: 50, y: 45 },
      therapies: p.therapies ? p.therapies.split(",").map((s: string) => s.trim()) : ["Vamana", "Virechana", "Basti", "Nasya"],
      mapQuery: `${p.clinic_name || p.name} ${p.clinic_address || p.city}`,
    }));

  // Verified doctors from database appear first at top of list
  const displayHospitals: HospitalDoctor[] = [
    ...verifiedDbHospitals,
    ...activeCity.hospitals.filter(
      (h) => !verifiedDbHospitals.some((vh) => vh.practitionerDbId === h.practitionerDbId)
    )
  ];

  const requestTreatmentMutation = useMutation({
    mutationFn: async ({ practitionerId, message }: { practitionerId: number; message: string }) => {
      const res = await api.post("/treatment-requests", {
        practitioner_id: practitionerId,
        message,
      });
      return res.data;
    },
    onSuccess: () => {
      setRequestSuccess(true);
      setRequestError(null);
      setTimeout(() => {
        setModalHospital(null);
        setRequestSuccess(false);
        setSymptomsMessage("");
      }, 2000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "Failed to submit request. Please try again.";
      setRequestError(msg);
    },
  });

  const handleCitySearch = (query: string) => {
    setCitySearchInput(query);
    const q = query.toLowerCase().trim();
    if (!q) return;

    if (q.includes("delhi") || q.includes("noida") || q.includes("gurgaon") || q.includes("gurugram")) {
      setSelectedCityId("delhi");
      setActiveHospital(null);
    } else if (q.includes("punjab") || q.includes("chandigarh") || q.includes("ludhiana") || q.includes("amritsar")) {
      setSelectedCityId("punjab");
      setActiveHospital(null);
    } else if (q.includes("kerala") || q.includes("kochi") || q.includes("trivandrum") || q.includes("cochin")) {
      setSelectedCityId("kerala");
      setActiveHospital(null);
    } else if (q.includes("mumbai") || q.includes("pune") || q.includes("maharashtra")) {
      setSelectedCityId("mumbai");
      setActiveHospital(null);
    }
  };

  const handleOpenRequestModal = (hospital: HospitalDoctor) => {
    setModalHospital(hospital);
    setRequestSuccess(false);
    setRequestError(null);
  };

  const handleSubmitRequest = () => {
    if (!modalHospital) return;
    setRequestError(null);

    // Use linked practitioner db ID or find match from DB or default to 1
    const targetDbId =
      modalHospital.practitionerDbId ||
      dbPractitioners?.find((p: any) => p.name.toLowerCase().includes(modalHospital.doctorName.toLowerCase()))?.id ||
      dbPractitioners?.[0]?.id ||
      1;

    const formattedMessage = `Hospital: ${modalHospital.name}\nCity: ${activeCity.name}\nPreferred Therapy: ${preferredTherapy}\n\nSymptoms / Medical History:\n${symptomsMessage.trim() || "Requesting standard Ayurvedic consultation."}`;

    requestTreatmentMutation.mutate({
      practitionerId: targetDbId,
      message: formattedMessage,
    });
  };

  return (
    <div className="min-h-screen bg-ayur-light/40 pb-24">
      {/* ─── Top Header Strip ─── */}
      <div className="bg-white border-b border-ayur-border/80 sticky top-16 z-30 shadow-xs">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-outfit font-bold text-ayur-green-dark">
                  Find a Practitioner & Hospital
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-emerald-600" /> City Simulation
                </span>
              </div>
              <p className="text-xs md:text-sm text-ayur-muted mt-0.5">
                Simulate your location to discover verified Ayurvedic centers and certified Panchakarma doctors near you.
              </p>
            </div>

            {/* City Search Bar & Quick Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter city (e.g. Delhi, Punjab)..."
                  value={citySearchInput}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green/30 bg-white"
                />
              </div>

              {/* City Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "delhi", label: "Delhi NCR" },
                  { id: "punjab", label: "Punjab" },
                  { id: "kerala", label: "Kerala" },
                  { id: "mumbai", label: "Mumbai / Pune" },
                ].map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCityId(city.id);
                      setActiveHospital(null);
                      setCitySearchInput("");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCityId === city.id
                        ? "bg-[#1E7E34] text-white shadow-sm scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content: Map & Hospital List (Split View like Google Maps) ─── */}
      <div className="container mx-auto px-4 mt-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Simulated Google Maps View (7 cols on desktop) */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1 text-xs text-gray-600">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-red-500" />
                Showing Google Maps view for: <strong className="text-gray-900">{activeCity.name}</strong>
              </span>
              <span className="text-gray-400">Click any pin marker to view clinic details</span>
            </div>

            <GoogleMapsSimulator
              city={activeCity}
              activeHospital={activeHospital}
              onSelectHospital={(h) => setActiveHospital(h)}
              onRequestTreatment={(h) => handleOpenRequestModal(h)}
            />
          </div>

          {/* Right Column: Doctors & Hospitals List (5 cols on desktop, matches user screenshot!) */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-ayur-green" />
                <h3 className="font-outfit font-bold text-base text-ayur-green-dark">
                  Ayurvedic Centers ({displayHospitals.length})
                </h3>
              </div>
              <span className="text-xs text-ayur-muted">{activeCity.state}</span>
            </div>

            {/* Scrollable list container */}
            <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
              {displayHospitals.map((hospital) => {
                const isSelected = activeHospital?.id === hospital.id;

                return (
                  <div
                    key={hospital.id}
                    onClick={() => setActiveHospital(hospital)}
                    className={`rounded-2xl p-4 transition-all duration-200 cursor-pointer border bg-white shadow-xs hover:shadow-md flex flex-col gap-3 ${
                      isSelected
                        ? "border-[#1E7E34] ring-2 ring-[#1E7E34]/20 shadow-md bg-emerald-50/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex gap-3.5 items-start">
                      {/* Clinic Thumbnail */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={hospital.image}
                          alt={hospital.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Header info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-outfit font-bold text-sm text-gray-900 leading-tight">
                            {hospital.name}
                          </h4>
                        </div>

                        {/* Rating & reviews */}
                        <div className="flex items-center gap-1 text-xs mt-1">
                          <span className="font-bold text-gray-900">{hospital.rating}</span>
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-gray-500">({hospital.reviewsCount})</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-600 truncate text-[11px]">{hospital.type}</span>
                        </div>

                        {/* Accreditation */}
                        <p className="text-[11px] text-emerald-700 font-medium mt-0.5 truncate">
                          {hospital.cghsStatus}
                        </p>
                      </div>
                    </div>

                    {/* Doctor details & Consultation fee */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-ayur-green-dark">
                          {hospital.doctorName}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {hospital.qualification} · {hospital.experience}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-gray-500 block">Fee</span>
                        <span className="font-bold text-gray-900">{hospital.fee}</span>
                      </div>
                    </div>

                    {/* Address & distance */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{hospital.distance}</span>
                      </span>
                      <span className="text-emerald-700 font-medium shrink-0">
                        {hospital.openStatus.split("·")[0]}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHospital(hospital);
                        }}
                        className="flex-1 text-xs h-8 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        View on Map
                      </Button>

                      {!isPractitioner && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRequestModal(hospital);
                          }}
                          className="flex-1 bg-[#1E7E34] hover:bg-[#155D27] text-white text-xs h-8 rounded-xl shadow-xs"
                        >
                          Request Treatment
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Treatment Request Dialog Modal ─── */}
      {modalHospital && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-ayur-border overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="hero-gradient p-6 text-white relative">
              <button
                onClick={() => setModalHospital(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-ayur-accent text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Book Consultation
              </div>
              <h3 className="text-xl font-outfit font-bold">{modalHospital.name}</h3>
              <p className="text-white/80 text-xs mt-0.5">
                Practitioner: {modalHospital.doctorName} ({modalHospital.qualification})
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {requestSuccess ? (
                <div className="py-8 text-center space-y-3 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-outfit font-bold text-ayur-green-dark">
                    Treatment Request Sent!
                  </h4>
                  <p className="text-xs text-ayur-muted max-w-sm mx-auto">
                    Your request has been forwarded to <strong>{modalHospital.doctorName}</strong>. You will receive notifications when the practitioner creates your personalized therapy plan.
                  </p>
                </div>
              ) : (
                <>
                  {requestError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-red-800">Notice</p>
                        <p className="text-[11px] text-red-600 mt-0.5">{requestError}</p>
                      </div>
                    </div>
                  )}

                  {/* Select Preferred Therapy */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Preferred Therapy / Procedure
                    </Label>
                    <select
                      value={preferredTherapy}
                      onChange={(e) => setPreferredTherapy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ayur-green/30"
                    >
                      {PANCHAKARMA_THERAPIES.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-ayur-muted italic">
                      {PANCHAKARMA_THERAPIES.find((t) => t.name === preferredTherapy)?.desc}
                    </p>
                  </div>

                  {/* Describe Symptoms */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">
                      Describe Your Symptoms & Goals
                    </Label>
                    <textarea
                      value={symptomsMessage}
                      onChange={(e) => setSymptomsMessage(e.target.value)}
                      placeholder="E.g., I have been suffering from chronic joint pain and digestive issues for 6 months..."
                      rows={4}
                      className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green/30 resize-none"
                    />
                  </div>

                  {/* Hospital Info Pill */}
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-800">
                      Clinic Location: {modalHospital.address}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Consultation Fee: {modalHospital.fee} · {modalHospital.cghsStatus}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setModalHospital(null)}
                      className="text-xs rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitRequest}
                      disabled={requestTreatmentMutation.isPending}
                      className="bg-[#1E7E34] hover:bg-[#155D27] text-white text-xs font-semibold rounded-xl px-5"
                    >
                      {requestTreatmentMutation.isPending ? "Submitting..." : "Send Request"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
