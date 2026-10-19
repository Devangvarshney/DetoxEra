"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  AlertCircle, User, Stethoscope, CheckCircle2, Leaf,
  Mail, Lock, Phone, Calendar, Users, Award, Eye, EyeOff, ArrowRight, MapPin, LocateFixed
} from "lucide-react";

// Patient schema
const patientSchema = z.object({
  name: z.string().min(2, { message: "Full Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  age: z.coerce.number().min(1, { message: "Age is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
});

// Practitioner schema
const practitionerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  specialization: z.string().min(2, { message: "Specialization is required (e.g. Panchakarma)" }),
  qualification: z.string().min(2, { message: "Qualification is required (e.g. BAMS, MD)" }),
  experience: z.string().min(1, { message: "Experience is required (e.g. 8 years)" }),
  city: z.string().min(2, { message: "City is required (e.g. Delhi, Mumbai)" }),
});

type PatientFormData = z.infer<typeof patientSchema>;
type PractitionerFormData = z.infer<typeof practitionerSchema>;

function FieldWrapper({ children, label, htmlFor, error }: { children: React.ReactNode; label: string; htmlFor: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function InputWithIcon({ icon: Icon, ...props }: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ayur-muted pointer-events-none z-10" />
      <input
        className="ayur-input has-icon-left text-sm w-full"
        style={{ paddingLeft: "2.75rem" }}
        {...props}
      />
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "practitioner" ? "practitioner" : "patient";

  const [selectedRole, setSelectedRole] = useState<"patient" | "practitioner">(initialRole);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const patientForm = useForm<PatientFormData>({ resolver: zodResolver(patientSchema) });
  const practitionerForm = useForm<PractitionerFormData>({ resolver: zodResolver(practitionerSchema) });
  const [isDetectingCity, setIsDetectingCity] = useState(false);

  const detectLiveCity = () => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setIsDetectingCity(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`
          );
          const data = await res.json();
          const addr = data.address || {};
          const detectedCity =
            addr.city ||
            addr.town ||
            addr.municipality ||
            addr.state_district ||
            addr.district ||
            addr.state ||
            "";
          if (detectedCity) {
            practitionerForm.setValue("city", detectedCity);
          }
        } catch {
          // ignore or fallback
        } finally {
          setIsDetectingCity(false);
        }
      },
      () => setIsDetectingCity(false),
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "practitioner") setSelectedRole("practitioner");
    else if (roleParam === "patient") setSelectedRole("patient");
  }, [searchParams]);

  const onPatientSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    setError("");
    try {
      await api.post("/auth/register/patient", {
        user_in: { email: data.email, password: data.password, role: "patient" },
        patient_in: { name: data.name, phone: data.phone, age: data.age, gender: data.gender },
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPractitionerSubmit = async (data: PractitionerFormData) => {
    setIsLoading(true);
    setError("");
    try {
      await api.post("/auth/register/practitioner", {
        user_in: { email: data.email, password: data.password, role: "practitioner" },
        practitioner_in: {
          name: data.name,
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience,
          city: data.city,
        },
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm rounded-3xl p-10 text-center shadow-2xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border-color)" }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-outfit font-bold text-ayur-green mb-2">Account Created!</h2>
          <p className="text-sm text-ayur-muted">
            Redirecting you to sign in as {selectedRole === "patient" ? "Patient" : "Doctor"}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden px-4 py-12"
      style={{ background: "linear-gradient(135deg, var(--background) 0%, var(--surface-muted) 100%)" }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-ayur-green/5 -top-32 -right-32 blur-3xl" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-ayur-accent/5 bottom-0 left-0 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border-color)" }}
        >
          <div className="flex min-h-[620px]">
            {/* ─── Left Branding Panel ─── */}
            <div className="hidden lg:flex w-[42%] hero-gradient flex-col justify-between p-10 relative overflow-hidden">
              <div className="absolute w-72 h-72 rounded-full border border-white/8 -top-20 -right-20 animate-spin-slow" />
              <div className="absolute w-48 h-48 rounded-full border border-white/5 bottom-10 -left-10 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "18s" }} />

              {/* Logo */}
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-outfit font-bold text-xl leading-none">AyurSutra</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Panchakarma Management</p>
                </div>
              </div>

              {/* Role-specific content */}
              <div className="relative z-10 space-y-5">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-ayur-accent text-[11px] font-semibold mb-3`}>
                    {selectedRole === "patient" ? <Users className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                    {selectedRole === "patient" ? "Patient Account" : "Practitioner Account"}
                  </div>
                  <h2 className="text-2xl font-outfit font-bold text-white leading-tight mb-2">
                    {selectedRole === "patient" ? "Begin Your Healing Journey" : "Join Our Practitioner Network"}
                  </h2>
                  <p className="text-white/65 text-sm leading-relaxed">
                    {selectedRole === "patient"
                      ? "Register to access personalized Panchakarma plans, automated therapy tracking, and certified doctor discovery."
                      : "Create a practitioner profile to manage patients, design therapy plans, and deliver standardized Panchakarma care."}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {(selectedRole === "patient" ? [
                    "Personalized Panchakarma Therapy Plans",
                    "Automated Pre & Post Procedure Alerts",
                    "Recovery Milestone Tracking",
                    "Connect with Certified Practitioners",
                  ] : [
                    "Patient Management Dashboard",
                    "Multi-Session Plan Creation",
                    "Automated Scheduling & Alerts",
                    "Clinical Analytics & Feedback",
                  ]).map((text) => (
                    <div key={text} className="flex items-center gap-2.5 text-white/80 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-ayur-accent shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div className="relative z-10">
                <div className="rounded-2xl bg-white/8 border border-white/12 p-4">
                  <p className="text-white/75 text-xs italic leading-relaxed">
                    &quot;Ancient Wisdom. Modern Care. One Platform.&quot;
                  </p>
                  <p className="text-ayur-accent text-[10px] font-semibold mt-1.5">Ministry of Ayush · MedTech 2024</p>
                </div>
              </div>
            </div>

            {/* ─── Right Form Panel ─── */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-10 overflow-y-auto">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
                <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center shadow-md">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-outfit font-bold text-2xl text-ayur-green-dark">AyurSutra</span>
              </div>

              <div className="mb-6">
                <h1 className="text-2xl font-outfit font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  Create an Account
                </h1>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Choose your role and fill in your details
                </p>
              </div>

              {/* Role Tabs */}
              <div
                className="flex p-1 rounded-xl mb-5 gap-1"
                style={{ background: "var(--surface-muted)", border: "1px solid var(--border-color)" }}
              >
                <button
                  type="button"
                  id="reg-role-patient"
                  onClick={() => { setSelectedRole("patient"); setError(""); }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === "patient"
                      ? "bg-ayur-green text-white shadow-sm"
                      : "text-ayur-muted hover:text-ayur-green"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Patient
                </button>
                <button
                  type="button"
                  id="reg-role-practitioner"
                  onClick={() => { setSelectedRole("practitioner"); setError(""); }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === "practitioner"
                      ? "bg-ayur-green text-white shadow-sm"
                      : "text-ayur-muted hover:text-ayur-green"
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  Practitioner
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* ─── Patient Form ─── */}
              {selectedRole === "patient" ? (
                <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-4">
                  <FieldWrapper label="Full Name" htmlFor="patient-name" error={patientForm.formState.errors.name?.message}>
                    <InputWithIcon icon={User} id="patient-name" placeholder="Rahul Sharma" {...patientForm.register("name")} />
                  </FieldWrapper>

                  <FieldWrapper label="Email Address" htmlFor="patient-email" error={patientForm.formState.errors.email?.message}>
                    <InputWithIcon icon={Mail} id="patient-email" type="email" placeholder="rahul@example.com" {...patientForm.register("email")} />
                  </FieldWrapper>

                  <FieldWrapper label="Password" htmlFor="patient-password" error={patientForm.formState.errors.password?.message}>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ayur-muted pointer-events-none z-10" />
                      <input
                        id="patient-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        className="ayur-input has-icon-left has-icon-right text-sm w-full"
                        style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                        {...patientForm.register("password")}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ayur-muted hover:text-ayur-green transition-colors p-1">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FieldWrapper>

                  <div className="grid grid-cols-2 gap-3">
                    <FieldWrapper label="Phone Number" htmlFor="patient-phone" error={patientForm.formState.errors.phone?.message}>
                      <InputWithIcon icon={Phone} id="patient-phone" placeholder="9876543210" {...patientForm.register("phone")} />
                    </FieldWrapper>
                    <FieldWrapper label="Age" htmlFor="patient-age" error={patientForm.formState.errors.age?.message}>
                      <InputWithIcon icon={Calendar} id="patient-age" type="number" placeholder="32" {...patientForm.register("age")} />
                    </FieldWrapper>
                  </div>

                  <FieldWrapper label="Gender" htmlFor="patient-gender" error={patientForm.formState.errors.gender?.message}>
                    <select
                      id="patient-gender"
                      className="ayur-input text-sm"
                      {...patientForm.register("gender")}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </FieldWrapper>

                  <Button
                    id="patient-register-submit"
                    type="submit"
                    className="w-full py-3 bg-ayur-green text-white font-semibold text-sm rounded-xl hover:bg-ayur-green-dark transition-all shadow-md shadow-ayur-green/20 flex items-center justify-center gap-2 mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
                    ) : (
                      <>Create Patient Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                </form>
              ) : (
                /* ─── Practitioner Form ─── */
                <form onSubmit={practitionerForm.handleSubmit(onPractitionerSubmit)} className="space-y-4">
                  <FieldWrapper label="Full Name (with Title)" htmlFor="practitioner-name" error={practitionerForm.formState.errors.name?.message}>
                    <InputWithIcon icon={User} id="practitioner-name" placeholder="Dr. Rajesh Varma" {...practitionerForm.register("name")} />
                  </FieldWrapper>

                  <FieldWrapper label="Email Address" htmlFor="practitioner-email" error={practitionerForm.formState.errors.email?.message}>
                    <InputWithIcon icon={Mail} id="practitioner-email" type="email" placeholder="doctor@hospital.com" {...practitionerForm.register("email")} />
                  </FieldWrapper>

                  <FieldWrapper label="Password" htmlFor="practitioner-password" error={practitionerForm.formState.errors.password?.message}>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ayur-muted pointer-events-none z-10" />
                      <input
                        id="practitioner-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        className="ayur-input has-icon-left has-icon-right text-sm w-full"
                        style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                        {...practitionerForm.register("password")}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ayur-muted hover:text-ayur-green transition-colors p-1">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label="Clinical Specialization" htmlFor="practitioner-specialization" error={practitionerForm.formState.errors.specialization?.message}>
                    <InputWithIcon icon={Award} id="practitioner-specialization" placeholder="Panchakarma & Vata Disorders" {...practitionerForm.register("specialization")} />
                  </FieldWrapper>

                  <div className="grid grid-cols-2 gap-3">
                    <FieldWrapper label="Medical Qualification" htmlFor="practitioner-qualification" error={practitionerForm.formState.errors.qualification?.message}>
                      <InputWithIcon icon={Award} id="practitioner-qualification" placeholder="BAMS, MD (Ayurveda)" {...practitionerForm.register("qualification")} />
                    </FieldWrapper>
                    <FieldWrapper label="Experience" htmlFor="practitioner-experience" error={practitionerForm.formState.errors.experience?.message}>
                      <InputWithIcon icon={Calendar} id="practitioner-experience" placeholder="e.g. 8 years" {...practitionerForm.register("experience")} />
                    </FieldWrapper>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="practitioner-city" className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                        Practicing City / Location
                      </label>
                      <button
                        type="button"
                        onClick={detectLiveCity}
                        disabled={isDetectingCity}
                        className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-60"
                      >
                        <LocateFixed className="w-3 h-3 text-emerald-600" />
                        <span>{isDetectingCity ? "Detecting GPS..." : "Auto-Detect City"}</span>
                      </button>
                    </div>
                    <InputWithIcon icon={MapPin} id="practitioner-city" placeholder="e.g. Delhi NCR, Mumbai, Jaipur, Bengaluru" {...practitionerForm.register("city")} />
                    {practitionerForm.formState.errors.city?.message && (
                      <p className="text-[11px] text-red-500 mt-1">{practitionerForm.formState.errors.city?.message}</p>
                    )}
                  </div>

                  <Button
                    id="practitioner-register-submit"
                    type="submit"
                    className="w-full py-3 bg-ayur-green text-white font-semibold text-sm rounded-xl hover:bg-ayur-green-dark transition-all shadow-md shadow-ayur-green/20 flex items-center justify-center gap-2 mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registering...</>
                    ) : (
                      <>Register as Practitioner <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                </form>
              )}

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" style={{ borderColor: "var(--border-color)" }} />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="px-3 text-ayur-muted font-medium" style={{ background: "var(--surface)" }}>
                    or quick register with
                  </span>
                </div>
              </div>

              <GoogleSignInButton
                role={selectedRole}
                onSuccess={(token) => login(token)}
                onError={(msg) => setError(msg)}
                text="signup_with"
              />

              <p className="mt-5 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <Link href="/login" className="text-ayur-green font-bold hover:underline">
                  Sign in to AyurSutra
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ayur-muted">Loading registration form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
