"use client";

import React, { useState } from "react";
import { 
  Star, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  HeartHandshake,
  ShieldCheck,
  CalendarCheck,
  Users,
  Stethoscope,
  Clock,
  Activity,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";

const THERAPY_OPTIONS = [
  "Vamana (Gastric Detox / Kapha)",
  "Virechana (Liver & Purgation / Pitta)",
  "Basti (Medicated Enema / Vata)",
  "Nasya (Nasal Cleansing / ENT)",
  "Raktamokshana (Blood Purification)",
  "Shirodhara (Mental Stress / Sleep)",
  "Abhyanga & Swedana (Oleation & Steam)",
  "General Consultation"
];

export default function RealWorldSurveyPage() {
  const { user } = useAuth();
  
  // Role selector (default to user role or "patient")
  const [role, setRole] = useState<"patient" | "practitioner">(
    user?.role === "practitioner" ? "practitioner" : "patient"
  );
  
  const [name, setName] = useState<string>(
    (user as any)?.patient_profile?.name || (user as any)?.practitioner_profile?.name || user?.name || ""
  );
  const [therapyTitle, setTherapyTitle] = useState<string>(THERAPY_OPTIONS[1]);
  const [daysPostTherapy, setDaysPostTherapy] = useState<number>(2);

  // Common Ratings (1 - 5)
  const [usabilityRating, setUsabilityRating] = useState<number>(5);
  const [precautionsRating, setPrecautionsRating] = useState<number>(5);
  const [schedulingRating, setSchedulingRating] = useState<number>(5);
  const [overallRating, setOverallRating] = useState<number>(5);
  const [recommendScore, setRecommendScore] = useState<number>(10);
  const [adherenceImproved, setAdherenceImproved] = useState<boolean>(true);

  // Patient Specific
  const [purvakarmaCompliance, setPurvakarmaCompliance] = useState<boolean>(true);
  const [paschatkarmaDietCompliance, setPaschatkarmaDietCompliance] = useState<boolean>(true);
  const [symptomRelief, setSymptomRelief] = useState<number>(5);

  // Doctor Specific
  const [timeSaved, setTimeSaved] = useState<number>(20); // Minutes
  const [treatmentResetPrevented, setTreatmentResetPrevented] = useState<boolean>(true);
  const [templateSatisfaction, setTemplateSatisfaction] = useState<number>(5);

  // Qualitative
  const [likedMost, setLikedMost] = useState<string>("");
  const [improvementSuggestions, setImprovementSuggestions] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        therapy_title: therapyTitle,
        days_post_therapy: daysPostTherapy,
        app_usability_rating: usabilityRating,
        precautions_clarity_rating: precautionsRating,
        scheduling_convenience_rating: schedulingRating,
        overall_experience_rating: overallRating,
        recommend_score: recommendScore,
        clinical_adherence_improved: adherenceImproved,
        liked_most: likedMost.trim() || null,
        improvement_suggestions: improvementSuggestions.trim() || null
      };

      if (role === "patient") {
        payload.purvakarma_compliance = purvakarmaCompliance;
        payload.paschatkarma_diet_compliance = paschatkarmaDietCompliance;
        payload.symptom_relief_rating = symptomRelief;
      } else {
        payload.administrative_time_saved = timeSaved;
        payload.treatment_reset_prevented = treatmentResetPrevented;
        payload.template_satisfaction_rating = templateSatisfaction;
      }

      await api.post("/feedback/app-evaluation", payload);
      setSubmitSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || "Please log in to submit your survey response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <Link 
          href={role === "practitioner" ? "/practitioner/dashboard" : "/patient/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        {/* Survey Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="hero-gradient p-6 sm:p-8 text-white relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-ayur-accent text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Real-World Clinical Efficacy Study
            </div>
            <h1 className="text-2xl sm:text-3xl font-outfit font-bold">
              AyurSutra Platform Evaluation Survey
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Collecting genuine patient and doctor feedback on Panchakarma precaution alerts, 
              scheduling convenience, and clinical adherence to assess digital therapeutic outcomes.
            </p>

            {/* Role Switcher */}
            <div className="mt-5 inline-flex p-1 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/15">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  role === "patient" ? "bg-white text-gray-900 shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Patient Survey</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("practitioner")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  role === "practitioner" ? "bg-white text-gray-900 shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor / Vaidya Survey</span>
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            {submitSuccess ? (
              <div className="py-12 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-outfit font-bold text-gray-900">
                  Thank You for Your Feedback!
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Your response has been saved directly to the database. These real-world observations 
                  directly feed our project evaluation and research reporting without any synthetic fabrication.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    onClick={() => setSubmitSuccess(false)}
                    variant="outline"
                    className="text-xs rounded-xl"
                  >
                    Submit Another Response
                  </Button>
                  <Link href="/practitioner/analytics">
                    <Button className="bg-[#1E7E34] hover:bg-[#155D27] text-white text-xs font-semibold rounded-xl">
                      View Live Aggregated Stats →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Section 1: Clinical Context */}
                <div className="space-y-3 pb-5 border-b border-gray-100">
                  <h3 className="font-outfit font-bold text-sm text-gray-900 uppercase tracking-wider text-[#1E7E34]">
                    1. Clinical Context & Therapy Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">
                        {role === "patient" ? "Therapy Procedure Undergone" : "Primary Therapy Managed"}
                      </Label>
                      <select
                        value={therapyTitle}
                        onChange={(e) => setTherapyTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ayur-green/30"
                      >
                        {THERAPY_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">
                        Days Since Therapy Completed
                      </Label>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3, 5, 7].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setDaysPostTherapy(days)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              daysPostTherapy === days
                                ? "bg-[#1E7E34] text-white shadow-xs"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {days}d
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Role-Specific Questions */}
                <div className="space-y-4 pb-5 border-b border-gray-100">
                  <h3 className="font-outfit font-bold text-sm text-gray-900 uppercase tracking-wider text-[#1E7E34]">
                    {role === "patient" ? "2. Precaution & Dietary Adherence (Patient Questions)" : "2. Clinical Workflow & Efficiency (Doctor Questions)"}
                  </h3>

                  {role === "patient" ? (
                    <>
                      {/* Purvakarma Compliance */}
                      <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-gray-900">Did you follow pre-procedure (Purvakarma) fasting and ghee intake?</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">As notified by the app prior to the main treatment session</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPurvakarmaCompliance(true)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              purvakarmaCompliance ? "bg-[#1E7E34] text-white shadow-xs" : "bg-white text-gray-700 border border-gray-300"
                            }`}
                          >
                            ✓ Followed Strictly
                          </button>
                          <button
                            type="button"
                            onClick={() => setPurvakarmaCompliance(false)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              !purvakarmaCompliance ? "bg-amber-800 text-white shadow-xs" : "bg-white text-gray-700 border border-gray-300"
                            }`}
                          >
                            Had Deviations
                          </button>
                        </div>
                      </div>

                      {/* Paschatkarma Diet Compliance */}
                      <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-gray-900">Did you follow the graduated recovery diet (Samsarjana Krama)?</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Eating only thin warm gruel/soup without cold drinks or heavy foods</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPaschatkarmaDietCompliance(true)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              paschatkarmaDietCompliance ? "bg-[#1E7E34] text-white shadow-xs" : "bg-white text-gray-700 border border-gray-300"
                            }`}
                          >
                            ✓ Fully Followed
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaschatkarmaDietCompliance(false)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              !paschatkarmaDietCompliance ? "bg-amber-800 text-white shadow-xs" : "bg-white text-gray-700 border border-gray-300"
                            }`}
                          >
                            Partially
                          </button>
                        </div>
                      </div>

                      {/* Symptom Relief */}
                      <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-gray-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-gray-900">
                            Post-Therapy Symptom Relief / Improvement
                          </Label>
                          <span className="text-xs font-bold text-emerald-700">{symptomRelief} / 5</span>
                        </div>
                        <div className="flex items-center gap-1 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSymptomRelief(star)}
                              className="p-1 hover:scale-125 transition-transform cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${star <= symptomRelief ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Doctor Time Saved */}
                      <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900">Estimated Administrative Time Saved Per Patient Cycle</p>
                          <span className="font-bold text-emerald-700">{timeSaved} minutes</span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Compared to manual paper scheduling, handwriting precaution sheets, and verbal repeat calls.
                        </p>
                        <div className="grid grid-cols-5 gap-2 pt-1">
                          {[10, 15, 20, 25, 30].map((mins) => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => setTimeSaved(mins)}
                              className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                timeSaved === mins ? "bg-[#1E7E34] text-white shadow-xs" : "bg-white text-gray-700 border border-gray-200"
                              }`}
                            >
                              {mins} mins
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Treatment Reset Prevented */}
                      <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-gray-900">Did automated precaution push alerts prevent treatment reset events?</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Preventing patients from accidentally eating heavy foods or skipping fasting</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setTreatmentResetPrevented(true)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              treatmentResetPrevented ? "bg-[#1E7E34] text-white shadow-xs" : "bg-white text-gray-700 border border-gray-300"
                            }`}
                          >
                            ✓ Yes, Prevented Errors
                          </button>
                          <button
                            type="button"
                            onClick={() => setTreatmentResetPrevented(false)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              !treatmentResetPrevented ? "bg-gray-800 text-white shadow-xs" : "bg-white text-gray-700 border border-gray-300"
                            }`}
                          >
                            No Change
                          </button>
                        </div>
                      </div>

                      {/* Classical Template Satisfaction */}
                      <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-gray-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-gray-900">
                            Classical Panchakarma Template Usability (Charaka Samhita adherence)
                          </Label>
                          <span className="text-xs font-bold text-emerald-700">{templateSatisfaction} / 5</span>
                        </div>
                        <div className="flex items-center gap-1 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setTemplateSatisfaction(star)}
                              className="p-1 hover:scale-125 transition-transform cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${star <= templateSatisfaction ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Section 3: System Usability Scale (SUS) Core Questions */}
                <div className="space-y-3 pb-5 border-b border-gray-100">
                  <h3 className="font-outfit font-bold text-sm text-gray-900 uppercase tracking-wider text-[#1E7E34]">
                    3. System Usability Scale (SUS) & Interface Feedback
                  </h3>

                  <div className="space-y-3">
                    {/* Usability */}
                    <div className="p-3 rounded-xl border border-gray-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-gray-800">
                          App Navigation & UI Simplicity (Ease of Use)
                        </Label>
                        <span className="text-xs font-bold text-emerald-700">{usabilityRating} / 5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setUsabilityRating(star)} className="p-1 cursor-pointer">
                            <Star className={`w-5 h-5 ${star <= usabilityRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Precaution Guidance */}
                    <div className="p-3 rounded-xl border border-gray-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-gray-800">
                          Precaution Instructions & Diet Guidance Clarity
                        </Label>
                        <span className="text-xs font-bold text-emerald-700">{precautionsRating} / 5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setPrecautionsRating(star)} className="p-1 cursor-pointer">
                            <Star className={`w-5 h-5 ${star <= precautionsRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scheduling Convenience */}
                    <div className="p-3 rounded-xl border border-gray-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-gray-800">
                          Session Scheduling & Automated Timeline Alerts
                        </Label>
                        <span className="text-xs font-bold text-emerald-700">{schedulingRating} / 5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setSchedulingRating(star)} className="p-1 cursor-pointer">
                            <Star className={`w-5 h-5 ${star <= schedulingRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Overall */}
                    <div className="p-3 rounded-xl border border-gray-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-gray-800">
                          Overall Satisfaction with AyurSutra Platform
                        </Label>
                        <span className="text-xs font-bold text-emerald-700">{overallRating} / 5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setOverallRating(star)} className="p-1 cursor-pointer">
                            <Star className={`w-5 h-5 ${star <= overallRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Recommendation Score (NPS 1-10) */}
                <div className="space-y-2 pb-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-900">
                      4. Likelihood to Recommend to Colleagues / Other Patients (NPS 1–10)
                    </Label>
                    <span className="text-xs font-bold text-emerald-700">{recommendScore} / 10</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setRecommendScore(score)}
                        className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          recommendScore === score
                            ? "bg-[#1E7E34] text-white shadow-xs scale-105"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 5: Constructive Qualitative Feedback */}
                <div className="space-y-4">
                  <h3 className="font-outfit font-bold text-sm text-gray-900 uppercase tracking-wider text-[#1E7E34]">
                    5. Qualitative Feedback
                  </h3>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                      What features did you like most in AyurSutra?
                    </Label>
                    <textarea
                      value={likedMost}
                      onChange={(e) => setLikedMost(e.target.value)}
                      placeholder="E.g., Automated precaution push alerts before sessions, video procedure previews, clinic map navigator..."
                      rows={2}
                      className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green/30 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                      What can be done to improve AyurSutra for your clinical use?
                    </Label>
                    <textarea
                      value={improvementSuggestions}
                      onChange={(e) => setImprovementSuggestions(e.target.value)}
                      placeholder="E.g., Downloadable diet PDF, SMS reminders for rural areas, multi-language support..."
                      rows={2}
                      className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green/30 resize-none"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#1E7E34] hover:bg-[#155D27] text-white text-xs font-semibold rounded-xl px-8 h-10 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Saving Response..." : "Submit Real-World Survey Response"}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
