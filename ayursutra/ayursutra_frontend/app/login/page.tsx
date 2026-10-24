"use client";

import { useState } from "react";
import { useForm as useHookForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api, getApiErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AlertCircle, Leaf, Eye, EyeOff, User, Stethoscope, CheckCircle2, ArrowRight, Shield, Lock, Mail } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const schema = z.object({
  username: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"patient" | "practitioner">("patient");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useHookForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleQuickFill = (role: "patient" | "practitioner") => {
    setSelectedRole(role);
    setError("");
    if (role === "patient") {
      setValue("username", "patient@ayursutra.com");
      setValue("password", "password123");
    } else {
      setValue("username", "ananya@ayursutra.com");
      setValue("password", "password123");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError("");
    try {
      const formData = new URLSearchParams();
      formData.append("username", data.username);
      formData.append("password", data.password);
      
      const res = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      login(res.data.access_token);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Invalid email or password. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const features = selectedRole === "patient" ? [
    "Automated Pre & Post Procedure Alerts",
    "Recovery Milestones Tracking",
    "Certified Hospital & Doctor Discovery",
    "Detailed Panchakarma Factsheets",
  ] : [
    "Custom Therapy Plan Creation",
    "Automated Scheduling & Conflict Detection",
    "Session Feedback & Quality Metrics",
    "Patient Treatment Request Management",
  ];

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden px-4 py-12"
      style={{ background: "linear-gradient(135deg, var(--background) 0%, var(--surface-muted) 100%)" }}
    >
      {/* Decorative background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-ayur-green/5 -top-40 -left-40 blur-3xl" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-ayur-accent/5 bottom-0 right-0 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex min-h-[600px]">
            {/* ─── Left Panel: Branding ─── */}
            <div className="hidden lg:flex w-[45%] hero-gradient flex-col justify-between p-10 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute w-72 h-72 rounded-full border border-white/8 -top-16 -right-16 animate-spin-slow" />
              <div className="absolute w-48 h-48 rounded-full border border-white/6 bottom-16 -left-8 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "15s" }} />

              {/* Top: Logo */}
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-outfit font-bold text-xl leading-none">AyurSutra</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Panchakarma Management</p>
                </div>
              </div>

              {/* Middle: Headline + Features */}
              <div className="relative z-10 space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-ayur-accent text-[11px] font-semibold mb-3">
                    <Shield className="w-3 h-3" />
                    {selectedRole === "patient" ? "Patient Portal" : "Practitioner Suite"}
                  </div>
                  <h2 className="text-2xl font-outfit font-bold text-white leading-tight mb-2">
                    {selectedRole === "patient"
                      ? "Your Healing Journey Starts Here"
                      : "Manage Patients with Precision"}
                  </h2>
                  <p className="text-white/65 text-sm leading-relaxed">
                    {selectedRole === "patient"
                      ? "Access personalized Panchakarma therapy plans, automated precaution alerts, and recovery tracking."
                      : "Configure 3-stage protocols, review session feedback, and track clinical analytics with ease."}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {features.map((text) => (
                    <div key={text} className="flex items-center gap-2.5 text-white/80 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-ayur-accent shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom: Quote */}
              <div className="relative z-10">
                <div className="rounded-2xl bg-white/8 border border-white/12 p-4">
                  <p className="text-white/75 text-xs italic leading-relaxed">
                    &quot;Bridging traditional Ayurvedic authenticity with digital precision for standardized Panchakarma care.&quot;
                  </p>
                  <p className="text-ayur-accent text-[10px] font-semibold mt-2">Ministry of Ayush · MedTech 2024</p>
                </div>
              </div>
            </div>

            {/* ─── Right Panel: Form ─── */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-10">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center shadow-md">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-outfit font-bold text-2xl text-ayur-green-dark">AyurSutra</span>
              </div>

              {/* Heading */}
              <div className="mb-7">
                <h1 className="text-2xl font-outfit font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  Welcome back
                </h1>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Sign in to your account to continue
                </p>
              </div>

              {/* ─── Role Tabs ─── */}
              <div
                className="flex p-1 rounded-xl mb-6 gap-1"
                style={{ background: "var(--surface-muted)", border: "1px solid var(--border-color)" }}
              >
                <button
                  type="button"
                  id="role-patient"
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
                  id="role-practitioner"
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

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="username" className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ayur-muted pointer-events-none z-10" />
                    <input
                      id="username"
                      type="email"
                      placeholder={selectedRole === "patient" ? "patient@ayursutra.com" : "doctor@ayursutra.com"}
                      className="ayur-input has-icon-left text-sm"
                      style={{ paddingLeft: "2.75rem" }}
                      {...register("username")}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-[11px] text-red-500">{errors.username.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      Password
                    </label>
                    <Link href="#" className="text-[11px] text-ayur-green hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ayur-muted pointer-events-none z-10" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="ayur-input has-icon-left has-icon-right text-sm"
                      style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ayur-muted hover:text-ayur-green transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  id="login-submit"
                  type="submit"
                  className="w-full py-3 bg-ayur-green text-white font-semibold text-sm rounded-xl hover:bg-ayur-green-dark transition-all shadow-md shadow-ayur-green/20 flex items-center justify-center gap-2 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign In as {selectedRole === "patient" ? "Patient" : "Doctor"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" style={{ borderColor: "var(--border-color)" }} />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="px-3 text-ayur-muted font-medium" style={{ background: "var(--surface)" }}>
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <GoogleSignInButton
                role={selectedRole}
                onSuccess={(token) => login(token)}
                onError={(msg) => setError(msg)}
              />

              {/* Demo fill */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => handleQuickFill(selectedRole)}
                  className="text-xs text-ayur-green font-semibold hover:text-ayur-green-dark transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ayur-green/8 hover:bg-ayur-green/15"
                >
                  ⚡ Fill Demo {selectedRole === "patient" ? "Patient" : "Doctor"} Credentials
                </button>
              </div>

              {/* Register link */}
              <p className="mt-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Don&apos;t have an account?{" "}
                <Link
                  href={`/register?role=${selectedRole}`}
                  className="text-ayur-green font-bold hover:underline"
                >
                  Create {selectedRole === "patient" ? "Patient" : "Doctor"} Account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom trust badges */}
        <div className="flex justify-center gap-6 mt-6">
          {[
            { icon: Shield, text: "HIPAA-style Privacy" },
            { icon: CheckCircle2, text: "Certified Practitioners" },
            { icon: Lock, text: "Secure & Encrypted" },
          ].map((badge) => (
            <div key={badge.text} className="flex items-center gap-1.5 text-ayur-muted text-xs">
              <badge.icon className="w-3.5 h-3.5 text-ayur-accent" />
              {badge.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
