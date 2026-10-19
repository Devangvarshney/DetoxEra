"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Phone, 
  Pencil, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function PatientProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["patient-profile"],
    queryFn: async () => {
      const res = await api.get("/patients/me");
      return res.data;
    },
  });

  // Populate form state when profile data arrives
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAge(profile.age !== null && profile.age !== undefined ? String(profile.age) : "");
      setGender(profile.gender || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (payload: { name: string; age: number | null; gender: string; phone: string }) => {
      const res = await api.patch("/patients/me", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
      setIsEditing(false);
      setSuccessMessage("Your profile was updated successfully!");
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3500);
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail;
      setErrorMessage(typeof detail === "string" ? detail : "Failed to update profile. Please try again.");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAge = age.trim() === "" ? null : parseInt(age, 10);
    if (parsedAge !== null && (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130)) {
      setErrorMessage("Please enter a valid age between 1 and 130.");
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      age: parsedAge,
      gender: gender.trim(),
      phone: phone.trim(),
    });
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || "");
      setAge(profile.age !== null && profile.age !== undefined ? String(profile.age) : "");
      setGender(profile.gender || "");
      setPhone(profile.phone || "");
    }
    setErrorMessage(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="p-12 text-center text-ayur-muted animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-ayur-green/20 animate-spin" />
          <p className="font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const initialLetter = (name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="container mx-auto p-6 max-w-3xl animate-fade-in">
      {/* Top Header with Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark">My Profile</h1>
          <p className="text-ayur-muted text-sm mt-0.5">
            Manage your personal details and Ayurvedic patient record
          </p>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-ayur-green hover:bg-ayur-green-dark text-white rounded-xl flex items-center gap-2 self-start shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-xs animate-slide-up">
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3 shadow-xs animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <Card className="glass-card overflow-hidden rounded-3xl border border-ayur-border/80 shadow-md">
        {/* Profile Card Header Banner */}
        <div className="bg-gradient-to-r from-ayur-green-dark to-ayur-green p-6 text-white flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center text-2xl font-bold font-outfit shadow-inner shrink-0">
            {initialLetter}
          </div>
          <div>
            <h2 className="text-xl font-outfit font-bold tracking-tight">
              {name || "AyurSutra Patient"}
            </h2>
            <p className="text-white/80 text-xs flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8">
          {isEditing ? (
            /* ─── Edit Mode Form ─── */
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name Input */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="name" className="text-xs font-bold text-ayur-green-dark uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-ayur-green" />
                    <span>Full Name *</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-ayur-border focus:border-ayur-green h-11 text-sm bg-white"
                  />
                </div>

                {/* Email (Read-Only) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-ayur-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-ayur-muted" />
                    <span>Email Address (Account ID)</span>
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-ayur-light/80 border border-ayur-border text-sm text-ayur-muted">
                    <span>{user?.email}</span>
                    <span className="text-[11px] font-semibold text-ayur-green-dark flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                </div>

                {/* Age Input */}
                <div className="space-y-1.5">
                  <label htmlFor="age" className="text-xs font-bold text-ayur-green-dark uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-ayur-green" />
                    <span>Age</span>
                  </label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="rounded-xl border-ayur-border focus:border-ayur-green h-11 text-sm bg-white"
                  />
                </div>

                {/* Gender Select */}
                <div className="space-y-1.5">
                  <label htmlFor="gender" className="text-xs font-bold text-ayur-green-dark uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-ayur-green" />
                    <span>Gender</span>
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-ayur-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayur-green/30 focus:border-ayur-green text-ayur-text"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Phone Input */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="phone" className="text-xs font-bold text-ayur-green-dark uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-ayur-green" />
                    <span>Phone Number</span>
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border-ayur-border focus:border-ayur-green h-11 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ayur-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                  className="rounded-xl px-5 h-11 text-xs font-semibold"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  <span>Cancel</span>
                </Button>

                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-ayur-green hover:bg-ayur-green-dark text-white rounded-xl px-6 h-11 text-xs font-semibold shadow-sm flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* ─── View Mode ─── */
            <div className="space-y-6">
              {/* Full Name */}
              <div className="pb-4 border-b border-ayur-border/60">
                <span className="text-xs font-bold text-ayur-muted uppercase tracking-wider block mb-1">
                  Full Name
                </span>
                <p className="text-lg font-semibold text-ayur-green-dark">
                  {name || (
                    <span className="text-ayur-muted/60 italic text-sm font-normal">
                      Not set — click &quot;Edit Profile&quot; to add
                    </span>
                  )}
                </p>
              </div>

              {/* Email Address */}
              <div className="pb-4 border-b border-ayur-border/60">
                <span className="text-xs font-bold text-ayur-muted uppercase tracking-wider block mb-1">
                  Email Address
                </span>
                <p className="text-base text-ayur-text font-medium flex items-center gap-2">
                  <span>{user?.email}</span>
                  <span className="px-2 py-0.5 rounded-md bg-ayur-green/10 text-ayur-green text-[11px] font-semibold">
                    Account Login
                  </span>
                </p>
              </div>

              {/* Age, Gender, Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs font-bold text-ayur-muted uppercase tracking-wider block mb-1">
                    Age
                  </span>
                  <p className="text-base font-medium text-ayur-text">
                    {age ? (
                      `${age} years`
                    ) : (
                      <span className="text-ayur-muted/60 italic text-sm font-normal">
                        Not set
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-ayur-muted uppercase tracking-wider block mb-1">
                    Gender
                  </span>
                  <p className="text-base font-medium text-ayur-text">
                    {gender || (
                      <span className="text-ayur-muted/60 italic text-sm font-normal">
                        Not set
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-ayur-muted uppercase tracking-wider block mb-1">
                    Phone Number
                  </span>
                  <p className="text-base font-medium text-ayur-text">
                    {phone || (
                      <span className="text-ayur-muted/60 italic text-sm font-normal">
                        Not set
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
