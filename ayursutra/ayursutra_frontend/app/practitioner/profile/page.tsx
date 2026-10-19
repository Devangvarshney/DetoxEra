"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { 
  UserCircle, 
  Mail, 
  Award, 
  Stethoscope, 
  Briefcase, 
  Pencil, 
  Check, 
  X, 
  ShieldCheck, 
  AlertCircle,
  MapPin,
  Building2,
  Phone,
  Clock,
  Sparkles,
  Star,
  CheckCircle2,
  Eye,
  ImageIcon,
  Navigation,
  LocateFixed
} from "lucide-react";

export default function PractitionerProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Basic Profile (Registration)
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [city, setCity] = useState("");

  // Clinical & Public Visibility Setup
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [phone, setPhone] = useState("");
  const [accreditation, setAccreditation] = useState("");
  const [therapies, setTherapies] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [timing, setTiming] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const handleFetchLiveLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser or device.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Accessing GPS satellite / network location...");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationStatus("Resolving address and city details...");

        try {
          // Primary Geocoding Provider: OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );

          if (!res.ok) throw new Error("Nominatim failed");
          const data = await res.json();
          const addr = data.address || {};

          const detectedCity =
            addr.city ||
            addr.town ||
            addr.municipality ||
            addr.state_district ||
            addr.district ||
            addr.suburb ||
            addr.state ||
            "";

          // Construct formatted street address
          const addressParts = [
            addr.amenity || addr.building || addr.house_number || "",
            addr.road || addr.street || addr.neighbourhood || "",
            addr.suburb || addr.subdistrict || "",
            addr.city || addr.town || addr.county || "",
            addr.state ? `${addr.state}` : "",
            addr.postcode ? `PIN ${addr.postcode}` : "",
          ].filter(Boolean);

          const fullAddress = addressParts.length > 1
            ? addressParts.join(", ")
            : (data.display_name ? data.display_name.split(",").slice(0, 4).join(",").trim() : "");

          if (fullAddress) {
            setClinicAddress(fullAddress);
          }
          if (detectedCity) {
            setCity(detectedCity);
          }

          setLocationStatus(`Live location detected: ${detectedCity} (${fullAddress.slice(0, 40)}...)`);
          setTimeout(() => setLocationStatus(null), 5000);
        } catch {
          // Fallback Provider: BigDataCloud Reverse Geocoding API
          try {
            const fallbackRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const fbData = await fallbackRes.json();
            const fbCity = fbData.city || fbData.locality || fbData.principalSubdivision || "";
            const fbAddress = [
              fbData.locality || "",
              fbData.city || "",
              fbData.principalSubdivision || "",
              fbData.countryName || ""
            ].filter(Boolean).join(", ");

            if (fbAddress) setClinicAddress(fbAddress);
            if (fbCity) setCity(fbCity);
            setLocationStatus(`Live location detected: ${fbCity}`);
            setTimeout(() => setLocationStatus(null), 5000);
          } catch {
            setErrorMessage("Could not resolve address automatically. Please enter your address manually.");
          }
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(null);
        if (err.code === 1) {
          setErrorMessage("Location permission was denied. Please allow location access in your device settings.");
        } else if (err.code === 2) {
          setErrorMessage("Location unavailable. Please check your network/GPS connection.");
        } else if (err.code === 3) {
          setErrorMessage("Location request timed out. Please try again or type manually.");
        } else {
          setErrorMessage("Could not determine live location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ["practitioner-profile"],
    queryFn: async () => {
      const res = await api.get("/practitioners/me/profile");
      return res.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setSpecialization(profile.specialization || "");
      setQualification(profile.qualification || "");
      setExperience(profile.experience || "");
      setCity(profile.city || "");
      setClinicName(profile.clinic_name || "");
      setClinicAddress(profile.clinic_address || "");
      setConsultationFee(profile.consultation_fee || "");
      setPhone(profile.phone || "");
      setAccreditation(profile.accreditation || "");
      setTherapies(profile.therapies || "");
      setProfileImage(profile.profile_image || "");
      setTiming(profile.timing || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.patch("/practitioners/me", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practitioner-profile"] });
      queryClient.invalidateQueries({ queryKey: ["practitioners"] });
      setIsEditing(false);
      setSuccessMessage("Profile & Clinic details updated! You are now visible to patients.");
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4500);
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail;
      setErrorMessage(typeof detail === "string" ? detail : "Failed to update profile. Please try again.");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If clinic details are filled, mark completed
    const hasClinicDetails = Boolean(clinicName.trim() && clinicAddress.trim());

    updateMutation.mutate({
      name: name.trim(),
      specialization: specialization.trim(),
      qualification: qualification.trim(),
      experience: experience.trim(),
      city: city.trim(),
      clinic_name: clinicName.trim(),
      clinic_address: clinicAddress.trim(),
      consultation_fee: consultationFee.trim(),
      phone: phone.trim(),
      accreditation: accreditation.trim(),
      therapies: therapies.trim(),
      profile_image: profileImage.trim(),
      timing: timing.trim(),
      is_profile_completed: hasClinicDetails,
    });
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || "");
      setSpecialization(profile.specialization || "");
      setQualification(profile.qualification || "");
      setExperience(profile.experience || "");
      setCity(profile.city || "");
      setClinicName(profile.clinic_name || "");
      setClinicAddress(profile.clinic_address || "");
      setConsultationFee(profile.consultation_fee || "");
      setPhone(profile.phone || "");
      setAccreditation(profile.accreditation || "");
      setTherapies(profile.therapies || "");
      setProfileImage(profile.profile_image || "");
      setTiming(profile.timing || "");
    }
    setErrorMessage(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="p-12 text-center text-ayur-muted animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-ayur-green/20 animate-spin" />
          <p className="font-medium">Loading practitioner profile...</p>
        </div>
      </div>
    );
  }

  const initialLetter = (name || user?.email || "D").charAt(0).toUpperCase();
  const isProfileComplete = Boolean(profile?.is_profile_completed || (profile?.clinic_name && profile?.clinic_address));

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl animate-fade-in pb-20">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-ayur-green-dark">Doctor Profile & Clinic</h1>
            {isProfileComplete ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Visible to Patients
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Incomplete Profile
              </span>
            )}
          </div>
          <p className="text-ayur-muted text-xs sm:text-sm mt-0.5">
            Complete your clinic setup so patients can find you and book Panchakarma therapies
          </p>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-[#1E7E34] hover:bg-[#155D27] text-white rounded-xl flex items-center gap-2 self-start shadow-sm text-xs font-semibold px-4 py-2"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
        )}
      </div>

      {/* Profile Completion Warning Banner */}
      {!isProfileComplete && !isEditing && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Action Required: Complete Your Clinic Details</p>
              <p className="text-amber-800/90 text-xs mt-0.5">
                You registered with basic credentials. To become visible on the patient screen, please add your Clinic Name, Address, and Consultation Fee.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs shrink-0 self-end sm:self-auto"
          >
            Complete Profile Now
          </Button>
        </div>
      )}

      {/* Success / Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-xs animate-slide-up">
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3 shadow-xs animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Main Card */}
      <Card className="glass-card overflow-hidden rounded-3xl border border-ayur-border/80 shadow-md">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-ayur-green-dark to-ayur-green p-6 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center text-2xl font-bold font-outfit shadow-inner shrink-0">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImage} alt={name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                initialLetter
              )}
            </div>
            <div>
              <h2 className="text-xl font-outfit font-bold tracking-tight">
                {name ? `Dr. ${name.replace(/^Dr\.?\s*/i, "")}` : "AyurSutra Practitioner"}
              </h2>
              <p className="text-white/80 text-xs flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
              </p>
              <p className="text-white/70 text-xs mt-0.5">
                {specialization || "Ayurvedic Specialist"} · {city || "India"}
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[11px] text-white/70 block uppercase font-medium">Public Status</span>
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
              isProfileComplete ? "bg-white/20 text-white" : "bg-amber-400 text-amber-950"
            }`}>
              {isProfileComplete ? "Active on Patient List" : "Needs Update"}
            </span>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-8">
              {/* SECTION 1: Personal & Professional Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <UserCircle className="w-4 h-4 text-[#1E7E34]" />
                  <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
                    1. Professional Credentials (Registration)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-700">Doctor Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Dr. Mohit Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Specialization *</label>
                    <Input
                      required
                      placeholder="e.g. Panchakarma & Chronic Disorders"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Degree / Qualification *</label>
                    <Input
                      required
                      placeholder="e.g. BAMS, MD (Ayurveda)"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Years of Experience *</label>
                    <Input
                      required
                      placeholder="e.g. 8 years"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700">City / Region *</label>
                      <button
                        type="button"
                        onClick={handleFetchLiveLocation}
                        disabled={isLocating}
                        className="text-[11px] font-semibold text-[#1E7E34] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-60"
                      >
                        <LocateFixed className="w-3 h-3 text-emerald-600" />
                        <span>Detect City</span>
                      </button>
                    </div>
                    <Input
                      required
                      placeholder="e.g. Delhi NCR, Ludhiana, Kochi, Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Clinic & Hospital Setup (Needed for Patient Screen) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Building2 className="w-4 h-4 text-[#1E7E34]" />
                  <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
                    2. Clinic & Hospital Details (Visible to Patients)
                  </h3>
                </div>

                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    These details will be shown to patients searching for Ayurvedic centers in your city.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-700">Clinic / Hospital Name *</label>
                    <Input
                      required
                      placeholder="e.g. Kerala Ayurveda Life Center / Sanjeevani Ayurveda Clinic"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-gray-700">Clinic Full Address *</label>
                      <button
                        type="button"
                        onClick={handleFetchLiveLocation}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E7E34] text-xs font-bold border border-emerald-300 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
                      >
                        {isLocating ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                            <span>Detecting GPS Location...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Auto-Fill from Live GPS</span>
                          </>
                        )}
                      </button>
                    </div>

                    {locationStatus && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{locationStatus}</span>
                      </div>
                    )}

                    <Input
                      required
                      placeholder="e.g. DLF Phase 4, Golf Course Road, Gurugram, NCR"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                    <p className="text-[11px] text-gray-400">
                      Tap &quot;Auto-Fill from Live GPS&quot; to fetch your exact clinic street address and city automatically.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Consultation Fee *</label>
                    <Input
                      required
                      placeholder="e.g. ₹700 or ₹500"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Contact Phone Number</label>
                    <Input
                      placeholder="e.g. +91 98112 34567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Accreditation / Certifications</label>
                    <Input
                      placeholder="e.g. NABH Accredited · CGHS approved / Ayush Certified"
                      value={accreditation}
                      onChange={(e) => setAccreditation(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Clinic Timings / Status</label>
                    <Input
                      placeholder="e.g. Open now · Closes 8:00 PM"
                      value={timing}
                      onChange={(e) => setTiming(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-700">Offered Panchakarma Therapies</label>
                    <Input
                      placeholder="e.g. Vamana, Virechana, Basti, Nasya, Raktamokshana"
                      value={therapies}
                      onChange={(e) => setTherapies(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-700">Clinic / Doctor Photo URL</label>
                    <Input
                      placeholder="e.g. https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      className="rounded-xl text-xs h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                  className="rounded-xl px-5 text-xs h-10"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  <span>Cancel</span>
                </Button>

                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-[#1E7E34] hover:bg-[#155D27] text-white rounded-xl px-6 text-xs font-semibold h-10 shadow-sm flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save & Make Visible to Patients</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* SECTION 1: Credentials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <UserCircle className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                    Professional Credentials
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Specialization</span>
                    <p className="text-sm font-semibold text-gray-900">{specialization || "Not set"}</p>
                  </div>

                  <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Qualification</span>
                    <p className="text-sm font-semibold text-gray-900">{qualification || "Not set"}</p>
                  </div>

                  <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Experience</span>
                    <p className="text-sm font-semibold text-gray-900">{experience || "Not set"}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Clinic & Consultation Public Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                      Clinic & Consultation Setup
                    </h3>
                  </div>

                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    isProfileComplete ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {isProfileComplete ? "Publicly Listed" : "Unlisted (Fill Details)"}
                  </span>
                </div>

                {isProfileComplete ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                      <span className="text-[11px] font-bold text-gray-400 uppercase block">Clinic Name</span>
                      <p className="text-sm font-bold text-gray-900">{clinicName}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                      <span className="text-[11px] font-bold text-gray-400 uppercase block">Consultation Fee</span>
                      <p className="text-sm font-bold text-emerald-800">{consultationFee || "₹700"}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1 sm:col-span-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase block">Full Address</span>
                      <p className="text-xs text-gray-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{clinicAddress} ({city})</span>
                      </p>
                    </div>

                    {phone && (
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block">Phone</span>
                        <p className="text-xs text-gray-700">{phone}</p>
                      </div>
                    )}

                    {timing && (
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block">Timing</span>
                        <p className="text-xs text-gray-700">{timing}</p>
                      </div>
                    )}

                    {accreditation && (
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1 sm:col-span-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block">Accreditation</span>
                        <p className="text-xs text-emerald-700 font-medium">{accreditation}</p>
                      </div>
                    )}

                    {therapies && (
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1 sm:col-span-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase block">Available Therapies</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {therapies.split(",").map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 text-center space-y-3">
                    <p className="text-xs text-amber-800 max-w-md mx-auto">
                      You haven&apos;t added your Clinic Name, Address, or Consultation Fee yet. Click <strong>Edit Profile</strong> to fill them out so patients can view your clinic on the map and request consultations!
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="bg-[#1E7E34] hover:bg-[#155D27] text-white rounded-xl text-xs"
                    >
                      Fill Clinic Details
                    </Button>
                  </div>
                )}
              </div>

              {/* SECTION 3: Live Preview of Doctor Card (How Patients See It!) */}
              {isProfileComplete && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                      Patient Card Live Preview
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    This is how your card appears to patients on the <strong>Doctor Discovery</strong> screen:
                  </p>

                  <div className="max-w-md mx-auto sm:mx-0 rounded-2xl p-4 border border-gray-200 bg-white shadow-sm flex flex-col gap-3">
                    <div className="flex gap-3.5 items-start">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                        {profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profileImage} alt={clinicName} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-emerald-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-outfit font-bold text-sm text-gray-900 leading-tight">
                          {clinicName || "My Ayurvedic Hospital"}
                        </h4>

                        <div className="flex items-center gap-1 text-xs mt-1">
                          <span className="font-bold text-gray-900">4.9</span>
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-gray-500">(Verified)</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-600 truncate text-[11px]">Panchakarma Center</span>
                        </div>

                        <p className="text-[11px] text-emerald-700 font-medium mt-0.5 truncate">
                          {accreditation || "Ayush Certified Practitioner"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-ayur-green-dark">
                          Dr. {name.replace(/^Dr\.?\s*/i, "")}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {qualification || "BAMS"} · {experience || "5 years"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-gray-500 block">Fee</span>
                        <span className="font-bold text-gray-900">{consultationFee || "₹700"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{clinicAddress || city}</span>
                      </span>
                      <span className="text-emerald-700 font-medium shrink-0">
                        {timing ? timing.split("·")[0] : "Open now"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" variant="outline" className="flex-1 text-xs h-8 rounded-xl border-gray-300" disabled>
                        View on Map
                      </Button>
                      <Button size="sm" className="flex-1 bg-[#1E7E34] text-white text-xs h-8 rounded-xl" disabled>
                        Request Treatment
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
