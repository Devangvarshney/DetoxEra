"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import { DoctorClinicsMapModal, DoctorForMap, ClinicItem } from "@/components/maps/DoctorClinicsMapModal";
import { addPractitionerReview } from "@/lib/supabase";
import { 
  MapPin, 
  Search, 
  Star, 
  Clock, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Building2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Send, 
  Building,
  Phone,
  Stethoscope,
  Compass,
  Filter,
  UserCheck
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
  const queryClient = useQueryClient();
  const isPractitioner = user?.role === "practitioner";

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [filterOnlyCompleted, setFilterOnlyCompleted] = useState<boolean>(false);

  // Expanded multiple clinics accordion inside cards
  const [expandedClinicsDocId, setExpandedClinicsDocId] = useState<string | number | null>(null);

  // Dedicated Doctor Clinics Map Modal state
  const [mapDoctor, setMapDoctor] = useState<DoctorForMap | null>(null);

  // Treatment Request Modal State
  const [modalDoctor, setModalDoctor] = useState<DoctorForMap | null>(null);
  const [selectedClinicForRequest, setSelectedClinicForRequest] = useState<string>("");
  const [preferredTherapy, setPreferredTherapy] = useState<string>("General Consultation");
  const [symptomsMessage, setSymptomsMessage] = useState<string>("");
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Review & Feedback Modal State
  const [reviewModalDoctor, setReviewModalDoctor] = useState<DoctorForMap | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [hoverRatingScore, setHoverRatingScore] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [patientReviewerName, setPatientReviewerName] = useState<string>("");
  const [selectedClinicAddressForReview, setSelectedClinicAddressForReview] = useState<string>("");
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState<boolean>(false);
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null);

  // Fetch real practitioners directly from backend database
  const { data: dbPractitioners = [], isLoading } = useQuery({
    queryKey: ["practitioners"],
    queryFn: async () => {
      try {
        const res = await api.get("/practitioners");
        return res.data || [];
      } catch {
        return [];
      }
    },
  });

  // Transform and normalize database doctors
  const doctors: DoctorForMap[] = useMemo(() => {
    return (dbPractitioners || []).map((p: any) => {
      const rawClinics: ClinicItem[] = (p.clinics && p.clinics.length > 0)
        ? p.clinics.map((c: any) => ({
            id: c.id,
            clinic_name: c.clinic_name || p.clinic_name || "",
            clinic_address: c.clinic_address || p.clinic_address || "",
            city: c.city || p.city || "",
            timing: c.timing || p.timing || "",
            phone: c.phone || p.phone || "",
            consultation_fee: c.consultation_fee || p.consultation_fee || "",
            fee: c.consultation_fee || p.consultation_fee || "",
            is_primary: Boolean(c.is_primary),
          }))
        : (p.clinic_name || p.clinic_address)
        ? [{
            clinic_name: p.clinic_name || "",
            clinic_address: p.clinic_address || "",
            city: p.city || "",
            timing: p.timing || "",
            phone: p.phone || "",
            consultation_fee: p.consultation_fee || "",
            fee: p.consultation_fee || "",
            is_primary: true,
          }]
        : [];

      const reviews = p.reviews || [];
      const hasReviews = reviews.length > 0;
      const avgRating = hasReviews
        ? Number((reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1))
        : null;

      const formattedDoctorName = p.name ? (p.name.startsWith("Dr.") ? p.name : `Dr. ${p.name}`) : "Ayurvedic Practitioner";

      return {
        id: p.id,
        practitionerDbId: p.id,
        doctorName: formattedDoctorName,
        name: rawClinics[0]?.clinic_name || p.clinic_name || `${formattedDoctorName}'s Clinic`,
        qualification: p.qualification || "",
        specialization: p.specialization || "Ayurveda",
        experience: p.experience ? (p.experience.includes("year") ? p.experience : `${p.experience} years exp.`) : "",
        city: p.city || rawClinics[0]?.city || "",
        fee: rawClinics[0]?.consultation_fee || p.consultation_fee || "",
        consultation_fee: rawClinics[0]?.consultation_fee || p.consultation_fee || "",
        phone: rawClinics[0]?.phone || p.phone || "",
        timing: rawClinics[0]?.timing || p.timing || "",
        clinics: rawClinics,
        cghsStatus: p.accreditation || null,
        image: p.profile_image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
        is_profile_completed: Boolean(p.is_profile_completed || (p.clinic_name && p.clinic_address)),
        rating: avgRating,
        reviewsCount: reviews.length,
        reviews: reviews,
        therapies: p.therapies ? p.therapies.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      };
    });
  }, [dbPractitioners]);

  // Extract unique cities from all actual doctors
  const availableCities = useMemo(() => {
    const citySet = new Set<string>();
    doctors.forEach((d) => {
      if (d.city && d.city.trim() && d.city !== "India") {
        citySet.add(d.city.trim());
      }
      d.clinics?.forEach((c) => {
        if (c.city && c.city.trim()) {
          citySet.add(c.city.trim());
        }
      });
    });
    return Array.from(citySet).sort();
  }, [doctors]);

  // Filter doctors by search query, selected city, and profile completion
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      // City filter
      if (selectedCity !== "all") {
        const matchesCity = 
          (doc.city && doc.city.toLowerCase() === selectedCity.toLowerCase()) ||
          doc.clinics?.some((c) => c.city && c.city.toLowerCase() === selectedCity.toLowerCase()) ||
          doc.clinics?.some((c) => c.clinic_address && c.clinic_address.toLowerCase().includes(selectedCity.toLowerCase()));
        if (!matchesCity) return false;
      }

      // Filter only completed profile if toggle is active
      if (filterOnlyCompleted && !doc.is_profile_completed) {
        return false;
      }

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = doc.doctorName.toLowerCase().includes(q);
        const matchesSpec = doc.specialization?.toLowerCase().includes(q);
        const matchesQual = doc.qualification?.toLowerCase().includes(q);
        const matchesCity = doc.city?.toLowerCase().includes(q);
        const matchesClinic = doc.clinics?.some(
          (c) => c.clinic_name.toLowerCase().includes(q) || c.clinic_address.toLowerCase().includes(q)
        );

        return matchesName || matchesSpec || matchesQual || matchesCity || matchesClinic;
      }

      return true;
    });
  }, [doctors, selectedCity, filterOnlyCompleted, searchQuery]);

  // Fetch reviews for active modal doctor
  const { data: activeModalReviews, refetch: refetchModalReviews } = useQuery({
    queryKey: ["practitioner-reviews", reviewModalDoctor?.practitionerDbId],
    enabled: !!reviewModalDoctor?.practitionerDbId,
    queryFn: async () => {
      if (!reviewModalDoctor?.practitionerDbId) return [];
      try {
        const res = await api.get(`/practitioners/${reviewModalDoctor.practitionerDbId}/reviews`);
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Treatment booking mutation
  const requestTreatmentMutation = useMutation({
    mutationFn: async (payload: { practitionerId: number; message: string }) => {
      const res = await api.post("/treatment-requests", {
        practitioner_id: payload.practitionerId,
        message: payload.message,
      });
      return res.data;
    },
    onSuccess: () => {
      setRequestSuccess(true);
      setRequestError(null);
      setSymptomsMessage("");
      queryClient.invalidateQueries({ queryKey: ["patient-requests"] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.message || "Failed to submit request. Please try again.";
      setRequestError(msg);
    },
  });

  // Review submission mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!reviewModalDoctor) return;
      const targetDbId = reviewModalDoctor.practitionerDbId || Number(reviewModalDoctor.id);

      const commentText = reviewComment.trim();
      const payload = {
        practitioner_id: targetDbId,
        patient_name: patientReviewerName.trim() || user?.name || "Patient",
        rating: ratingScore,
        review_text: commentText || "",
        review: commentText || "",
        clinic_name: reviewModalDoctor.name || null,
        clinic_address: selectedClinicAddressForReview || reviewModalDoctor.clinics?.[0]?.clinic_address || reviewModalDoctor.city || null,
      };

      try {
        const res = await api.post(`/practitioners/${targetDbId}/reviews`, payload);
        return res.data;
      } catch (backendErr) {
        const supaRes = await addPractitionerReview(payload);
        if (supaRes) return supaRes;
        throw backendErr;
      }
    },
    onSuccess: () => {
      setReviewSubmitSuccess(true);
      setReviewSubmitError(null);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["practitioners"] });
      queryClient.invalidateQueries({ queryKey: ["practitioner-reviews", reviewModalDoctor?.practitionerDbId] });
      refetchModalReviews();
      setTimeout(() => setReviewSubmitSuccess(false), 3500);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.message || "Failed to submit feedback. Please try again.";
      setReviewSubmitError(msg);
    },
  });

  const handleOpenRequestModal = (doctor: DoctorForMap, preselectedClinic?: ClinicItem) => {
    setModalDoctor(doctor);
    const initialAddress = preselectedClinic?.clinic_address || doctor.clinics?.[0]?.clinic_address || doctor.city || "";
    setSelectedClinicForRequest(initialAddress);
    setRequestSuccess(false);
    setRequestError(null);
  };

  const handleOpenReviewsModal = (doctor: DoctorForMap) => {
    setReviewModalDoctor(doctor);
    setRatingScore(5);
    setHoverRatingScore(0);
    setReviewComment("");
    setPatientReviewerName(user?.name || "");
    setSelectedClinicAddressForReview(doctor.clinics?.[0]?.clinic_address || doctor.city || "");
    setReviewSubmitSuccess(false);
    setReviewSubmitError(null);
  };

  const handleSubmitRequest = () => {
    if (!modalDoctor) return;
    setRequestError(null);

    const targetDbId = modalDoctor.practitionerDbId || Number(modalDoctor.id);
    const chosenClinic = modalDoctor.clinics?.find((c) => c.clinic_address === selectedClinicForRequest);
    const clinicNotice = chosenClinic
      ? `Clinic Branch: ${chosenClinic.clinic_name} (${chosenClinic.clinic_address})`
      : `Clinic: ${modalDoctor.name} (${modalDoctor.city})`;

    const formattedMessage = `Doctor: ${modalDoctor.doctorName}\n${clinicNotice}\nCity: ${modalDoctor.city}\nPreferred Therapy: ${preferredTherapy}\n\nSymptoms / Medical History:\n${symptomsMessage.trim() || "Requesting standard Ayurvedic consultation."}`;

    requestTreatmentMutation.mutate({
      practitionerId: targetDbId,
      message: formattedMessage,
    });
  };

  return (
    <div className="min-h-screen bg-ayur-light/40 pb-24 animate-fade-in">
      {/* ─── Top Header Strip ─── */}
      <div className="bg-white border-b border-ayur-border/80 sticky top-16 z-30 shadow-xs">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-outfit font-bold text-ayur-green-dark">
                  Certified Ayurvedic Doctors & Clinics
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Database Verified
                </span>
              </div>
              <p className="text-xs md:text-sm text-ayur-muted mt-0.5">
                Browse all registered practitioners, explore their clinic locations on Google Maps, and schedule consultations.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#1E7E34]" />
                <span><strong>{doctors.length}</strong> Registered Doctors</span>
              </div>
              {availableCities.length > 0 && (
                <div className="px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span><strong>{availableCities.length}</strong> Cities Covered</span>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar & City Filters Toolbar */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by doctor name, clinic, specialization, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green/30 bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* City Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedCity("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCity === "all"
                    ? "bg-[#1E7E34] text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                All Cities ({doctors.length})
              </button>

              {availableCities.map((cityName) => {
                const count = doctors.filter(
                  (d) => (d.city && d.city.toLowerCase() === cityName.toLowerCase()) ||
                    d.clinics?.some((c) => c.city && c.city.toLowerCase() === cityName.toLowerCase())
                ).length;

                return (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => setSelectedCity(cityName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                      selectedCity.toLowerCase() === cityName.toLowerCase()
                        ? "bg-[#1E7E34] text-white shadow-xs"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>{cityName}</span>
                    <span className="opacity-70 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content: Real Doctors Directory Grid ─── */}
      <div className="container mx-auto px-4 mt-6 max-w-7xl">
        {/* Results Count Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-outfit font-bold text-gray-900">
              {selectedCity === "all" ? "All Doctors" : `Doctors in ${selectedCity}`}
            </h2>
            <span className="text-xs text-ayur-muted">
              ({filteredDoctors.length} {filteredDoctors.length === 1 ? "practitioner found" : "practitioners found"})
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filterOnlyCompleted}
              onChange={(e) => setFilterOnlyCompleted(e.target.checked)}
              className="rounded border-gray-300 text-[#1E7E34] focus:ring-[#1E7E34]"
            />
            <span>Show only with completed clinic address</span>
          </label>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-white border border-gray-200 p-6 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                    <div className="h-3 bg-gray-200 rounded-md w-1/2" />
                  </div>
                </div>
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-8 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* No doctors match empty state */}
        {!isLoading && filteredDoctors.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-200 shadow-xs max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1E7E34] flex items-center justify-center mx-auto border border-emerald-200">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-outfit font-bold text-gray-900">
              No doctors found matching your filter
            </h3>
            <p className="text-xs text-ayur-muted">
              Try resetting your search query or selecting &quot;All Cities&quot; to discover all registered Ayurvedic practitioners.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCity("all");
                setFilterOnlyCompleted(false);
              }}
              className="text-xs rounded-xl border-gray-300"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Doctor Cards Grid */}
        {!isLoading && filteredDoctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doc) => {
              const hasClinics = doc.clinics && doc.clinics.length > 0;
              const hasMultipleClinics = doc.clinics && doc.clinics.length > 1;
              const isClinicsExpanded = expandedClinicsDocId === doc.id;
              const primaryClinic = doc.clinics?.[0];

              return (
                <div
                  key={doc.id}
                  className="rounded-3xl p-5 border border-gray-200 bg-white shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
                >
                  {/* Top: Doctor Avatar & Bio */}
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={doc.image}
                          alt={doc.doctorName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Verified Practitioner" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-outfit font-bold text-base text-gray-900 truncate">
                            {doc.doctorName}
                          </h3>
                        </div>

                        <p className="text-xs text-[#1E7E34] font-semibold truncate">
                          {doc.qualification} · {doc.specialization}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                          <span className="truncate">{doc.experience}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-gray-700 font-medium">
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                            {doc.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ratings & Accreditations */}
                    <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleOpenReviewsModal(doc)}
                        className="flex items-center gap-1 hover:underline text-left cursor-pointer"
                        title="Click to view reviews"
                      >
                        {doc.rating !== null && Boolean(doc.reviewsCount && doc.reviewsCount > 0) ? (
                          <>
                            <span className="font-bold text-gray-900">{doc.rating}</span>
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-gray-500 text-[11px]">
                              ({doc.reviewsCount} {doc.reviewsCount === 1 ? "review" : "reviews"})
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-gray-300" />
                            <span>No ratings yet</span>
                          </span>
                        )}
                      </button>

                      {doc.cghsStatus ? (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                          {doc.cghsStatus}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Ayush Practitioner
                        </span>
                      )}
                    </div>

                    {/* Primary Clinic Card Box */}
                    {hasClinics ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-[#1E7E34] shrink-0" />
                            <span className="truncate">{primaryClinic?.clinic_name || doc.name}</span>
                          </span>
                          {primaryClinic?.fee && (
                            <span className="text-[11px] font-bold text-gray-900 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                              {primaryClinic.fee}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-600 flex items-start gap-1 leading-snug">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {primaryClinic?.clinic_address} {primaryClinic?.city ? `· ${primaryClinic.city}` : ""}
                          </span>
                        </p>

                        {(primaryClinic?.timing || doc.timing || primaryClinic?.phone) && (
                          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-emerald-100/60">
                            {primaryClinic?.timing || doc.timing ? (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                {primaryClinic?.timing || doc.timing}
                              </span>
                            ) : <span />}
                            {primaryClinic?.phone && (
                              <span className="flex items-center gap-1 font-semibold text-emerald-800">
                                <Phone className="w-2.5 h-2.5" />
                                {primaryClinic.phone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[11px]">Clinic Address Updating</p>
                          <p className="text-[10px] text-amber-700 mt-0.5">
                            Practicing in {doc.city}. Consultations available on request.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Multiple Clinics Accordion (if doctor has multiple branches) */}
                    {hasMultipleClinics && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedClinicsDocId(isClinicsExpanded ? null : doc.id)}
                          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[11px] font-semibold text-gray-700 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{doc.clinics!.length} Clinic Locations Available</span>
                          </span>
                          {isClinicsExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                          )}
                        </button>

                        {isClinicsExpanded && (
                          <div className="mt-2 space-y-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              All Verified Clinic Branches:
                            </p>
                            {doc.clinics!.map((clinic, cIdx) => (
                              <div
                                key={clinic.id || cIdx}
                                className="p-2.5 bg-white rounded-xl border border-gray-200 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                                    <Building className="w-3 h-3 text-emerald-600" />
                                    {clinic.clinic_name}
                                  </span>
                                  {clinic.is_primary ? (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                      Primary
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-gray-100 text-gray-600 font-medium px-1.5 py-0.2 rounded">
                                      Branch #{cIdx + 1}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-600 flex items-start gap-1">
                                  <MapPin className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                                  <span>{clinic.clinic_address} {clinic.city ? `· ${clinic.city}` : ""}</span>
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                                  <span>{clinic.timing || "Open daily"}</span>
                                  <span className="font-semibold text-gray-900">Fee: {clinic.consultation_fee || clinic.fee || doc.fee}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ─── Bottom Actions Bar (Matches User Request: Show on Map button for doctor!) ─── */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {/* Primary Button: Show on Map (Dedicated button mapping this doctor's clinics) */}
                    <Button
                      type="button"
                      onClick={() => setMapDoctor(doc)}
                      className="w-full bg-[#1E7E34] hover:bg-[#155D27] text-white text-xs font-semibold h-9 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <MapPin className="w-4 h-4 text-amber-300" />
                      <span>Show on Map ({hasMultipleClinics ? `All ${doc.clinics!.length} Clinics` : "Clinic Location"})</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      {/* Reviews Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReviewsModal(doc)}
                        className="flex-1 text-xs h-8 rounded-xl border-amber-300 text-amber-800 hover:bg-amber-50 flex items-center justify-center gap-1 font-semibold cursor-pointer"
                      >
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>Reviews</span>
                      </Button>

                      {/* Book Consultation Button */}
                      {!isPractitioner && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRequestModal(doc)}
                          className="flex-1 border-[#1E7E34] text-[#1E7E34] hover:bg-emerald-50 text-xs h-8 rounded-xl font-semibold cursor-pointer"
                        >
                          Book Visit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Dedicated Doctor Clinics Map Modal ─── */}
      <DoctorClinicsMapModal
        doctor={mapDoctor}
        isOpen={Boolean(mapDoctor)}
        onClose={() => setMapDoctor(null)}
        onRequestBooking={(doc, clinic) => {
          handleOpenRequestModal(doc, clinic);
        }}
      />

      {/* ─── Treatment Request Dialog Modal ─── */}
      {modalDoctor && (
        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
          onClick={() => setModalDoctor(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-ayur-border overflow-hidden animate-scale-in max-h-[calc(100dvh-2rem)] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="hero-gradient p-5 sm:p-6 text-white relative shrink-0">
              <button
                type="button"
                onClick={() => setModalDoctor(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-ayur-accent text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Book Consultation
              </div>
              <h3 className="text-xl font-outfit font-bold">{modalDoctor.doctorName}</h3>
              <p className="text-white/80 text-xs mt-0.5">
                {modalDoctor.qualification} · {modalDoctor.specialization} ({modalDoctor.city})
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto min-h-0 flex-1">
              {requestSuccess ? (
                <div className="py-8 text-center space-y-3 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-outfit font-bold text-ayur-green-dark">
                    Treatment Request Sent!
                  </h4>
                  <p className="text-xs text-ayur-muted max-w-sm mx-auto">
                    Your consultation request has been forwarded to <strong>{modalDoctor.doctorName}</strong>. You will receive notifications when the practitioner creates your personalized therapy plan.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModalDoctor(null)}
                    className="mt-2 text-xs rounded-xl"
                  >
                    Done
                  </Button>
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

                  {/* Multiple Clinics / Addresses Selection */}
                  {modalDoctor.clinics && modalDoctor.clinics.length > 1 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        Select Preferred Clinic Location / Branch
                      </Label>
                      <select
                        value={selectedClinicForRequest}
                        onChange={(e) => setSelectedClinicForRequest(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ayur-green/30"
                      >
                        {modalDoctor.clinics.map((c, idx) => (
                          <option key={c.id || idx} value={c.clinic_address}>
                            {c.clinic_name} — {c.clinic_address} {c.is_primary ? "(Primary)" : ""}
                          </option>
                        ))}
                      </select>
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
                      Describe Your Symptoms & Health Goals
                    </Label>
                    <textarea
                      value={symptomsMessage}
                      onChange={(e) => setSymptomsMessage(e.target.value)}
                      placeholder="E.g., I have been experiencing chronic joint inflammation and digestive sluggishness for 4 months..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green/30 resize-none"
                    />
                  </div>

                  {/* Doctor Info Pill */}
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-800">
                      Clinic: {selectedClinicForRequest || modalDoctor.clinics?.[0]?.clinic_address || modalDoctor.city}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Consultation Fee: {modalDoctor.fee} · {modalDoctor.cghsStatus}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setModalDoctor(null)}
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

      {/* ─── Practitioner Reviews & Feedback Modal ─── */}
      {reviewModalDoctor && (
        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
          onClick={() => setReviewModalDoctor(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-ayur-border overflow-hidden animate-scale-in max-h-[calc(100dvh-2rem)] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="hero-gradient p-5 sm:p-6 text-white relative shrink-0">
              <button
                type="button"
                onClick={() => setReviewModalDoctor(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-ayur-accent text-xs font-semibold mb-2">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Patient Feedback & Reviews
              </div>
              <h3 className="text-xl font-outfit font-bold">{reviewModalDoctor.doctorName}</h3>
              <p className="text-white/80 text-xs mt-0.5">
                {reviewModalDoctor.qualification} · {reviewModalDoctor.specialization} ({reviewModalDoctor.city})
              </p>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Rating Overview Card */}
              {activeModalReviews && activeModalReviews.length > 0 ? (
                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-outfit font-bold text-gray-900 leading-none">
                      {(
                        activeModalReviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) /
                        activeModalReviews.length
                      ).toFixed(1)}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(
                              activeModalReviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) /
                              activeModalReviews.length
                            )
                              ? "text-amber-500 fill-amber-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Based on {activeModalReviews.length} {activeModalReviews.length === 1 ? "verified patient review" : "verified patient reviews"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      ✓ Verified Reviews
                    </span>
                    {reviewModalDoctor.cghsStatus && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {reviewModalDoctor.cghsStatus}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-4 border border-dashed border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-gray-700">No Patient Ratings Yet</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Be the first to share your experience with {reviewModalDoctor.doctorName}!
                    </p>
                  </div>
                  {reviewModalDoctor.cghsStatus && (
                    <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {reviewModalDoctor.cghsStatus}
                    </span>
                  )}
                </div>
              )}

              {/* Submit Feedback Form */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-outfit font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#1E7E34]" /> Leave Feedback & Stars
                  </h4>
                  <span className="text-[11px] text-gray-400">Share your experience</span>
                </div>

                {reviewSubmitSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thank you for your feedback! Your review has been recorded.</span>
                  </div>
                )}

                {reviewSubmitError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{reviewSubmitError}</span>
                  </div>
                )}

                {/* Star Rating Picker (1 - 5 stars) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">
                    Your Star Rating:
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRatingScore(star)}
                          onMouseLeave={() => setHoverRatingScore(0)}
                          onClick={() => setRatingScore(star)}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (hoverRatingScore || ratingScore)
                                ? "text-amber-500 fill-amber-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-700 ml-1">
                      {hoverRatingScore || ratingScore} / 5
                      <span className="text-gray-400 font-normal ml-1">
                        {(hoverRatingScore || ratingScore) === 5 && "— Excellent"}
                        {(hoverRatingScore || ratingScore) === 4 && "— Very Good"}
                        {(hoverRatingScore || ratingScore) === 3 && "— Good / Average"}
                        {(hoverRatingScore || ratingScore) === 2 && "— Fair"}
                        {(hoverRatingScore || ratingScore) === 1 && "— Poor"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Multiple Clinics / Addresses selector for review */}
                {reviewModalDoctor.clinics && reviewModalDoctor.clinics.length > 1 && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Clinic Location Visited:
                    </Label>
                    <select
                      value={selectedClinicAddressForReview}
                      onChange={(e) => setSelectedClinicAddressForReview(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ayur-green/30"
                    >
                      {reviewModalDoctor.clinics.map((c, idx) => (
                        <option key={c.id || idx} value={c.clinic_address}>
                          {c.clinic_name} — {c.clinic_address} {c.is_primary ? "(Primary)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Patient Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">
                    Your Name:
                  </Label>
                  <input
                    type="text"
                    value={patientReviewerName}
                    onChange={(e) => setPatientReviewerName(e.target.value)}
                    placeholder="E.g., Ramesh Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ayur-green/30"
                  />
                </div>

                {/* Review Text Area */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">
                    Your Review / Feedback:
                  </Label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe the diagnosis, therapy results, doctor behavior, clinic hygiene..."
                    rows={3}
                    className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green/30 resize-none"
                  />
                </div>

                <Button
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={submitReviewMutation.isPending}
                  className="w-full bg-[#1E7E34] hover:bg-[#155D27] text-white text-xs font-semibold rounded-xl h-9 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitReviewMutation.isPending ? "Submitting Review..." : "Submit Review"}</span>
                </Button>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                <h4 className="font-outfit font-bold text-sm text-gray-900">
                  Recent Patient Reviews ({activeModalReviews?.length || (reviewModalDoctor.reviews?.length || 0)})
                </h4>

                {((activeModalReviews && activeModalReviews.length > 0) || (reviewModalDoctor.reviews && reviewModalDoctor.reviews.length > 0)) ? (
                  <div className="space-y-2.5">
                    {(activeModalReviews || reviewModalDoctor.reviews || []).map((rev: any, idx: number) => (
                      <div
                        key={rev.id || idx}
                        className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">
                            {rev.patient_name || "Verified Patient"}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= rev.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {rev.clinic_address && (
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-red-400" />
                            <span>Clinic: {rev.clinic_name ? `${rev.clinic_name} - ` : ""}{rev.clinic_address}</span>
                          </p>
                        )}

                        {rev.review_text || rev.review || rev.comments ? (
                          <p className="text-gray-700 leading-relaxed text-xs">
                            {rev.review_text || rev.review || rev.comments}
                          </p>
                        ) : null}

                        <p className="text-[10px] text-gray-400">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "Recent verified consultation"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gray-50 text-center text-xs text-gray-500 border border-dashed border-gray-200">
                    No reviews submitted yet. Be the first to share your experience with {reviewModalDoctor.doctorName}!
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewModalDoctor(null)}
                className="text-xs rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
