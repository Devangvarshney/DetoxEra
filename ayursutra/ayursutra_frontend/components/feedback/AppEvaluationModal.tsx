"use client";

import React, { useState } from "react";
import { 
  Star, 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  HeartHandshake,
  ShieldCheck,
  CalendarCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";

interface AppEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapyPlanId?: number;
  therapyTitle?: string;
  onSuccess?: () => void;
}

export function AppEvaluationModal({
  isOpen,
  onClose,
  therapyPlanId,
  therapyTitle,
  onSuccess
}: AppEvaluationModalProps) {
  const { user } = useAuth();
  const isPractitioner = user?.role === "practitioner";

  const [daysPostTherapy, setDaysPostTherapy] = useState<number>(2);
  const [usabilityRating, setUsabilityRating] = useState<number>(5);
  const [precautionsRating, setPrecautionsRating] = useState<number>(5);
  const [schedulingRating, setSchedulingRating] = useState<number>(5);
  const [overallRating, setOverallRating] = useState<number>(5);
  const [recommendScore, setRecommendScore] = useState<number>(10);
  const [adherenceImproved, setAdherenceImproved] = useState<boolean>(true);
  const [likedMost, setLikedMost] = useState<string>("");
  const [improvementSuggestions, setImprovementSuggestions] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.post("/feedback/app-evaluation", {
        therapy_plan_id: therapyPlanId || null,
        therapy_title: therapyTitle || "Panchakarma Protocol",
        days_post_therapy: daysPostTherapy,
        app_usability_rating: usabilityRating,
        precautions_clarity_rating: precautionsRating,
        scheduling_convenience_rating: schedulingRating,
        overall_experience_rating: overallRating,
        recommend_score: recommendScore,
        clinical_adherence_improved: adherenceImproved,
        liked_most: likedMost.trim() || null,
        improvement_suggestions: improvementSuggestions.trim() || null
      });

      setSubmitSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || "Failed to submit evaluation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2 pt-3 pb-24 sm:p-4 overflow-y-auto overscroll-contain animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[calc(100dvh-6.5rem)] sm:h-auto max-h-[calc(100dvh-6.5rem)] sm:max-h-[calc(100dvh-2.5rem)] my-auto animate-scale-in shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="hero-gradient px-4 py-3 sm:px-6 sm:py-4 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close survey"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1 pr-8">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-ayur-accent text-[11px] font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 1-2 Days Post-Therapy Follow-up
            </span>
            <span className="text-white/60 text-xs">·</span>
            <span className="text-white/80 text-xs capitalize">
              {isPractitioner ? "Doctor Perspective" : "Patient Perspective"}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-outfit font-bold pr-8">
            AyurSutra Platform Evaluation Survey
          </h3>
          <p className="text-white/80 text-xs mt-0.5 pr-8">
            Help us assess the clinical effectiveness and app usability of the digital therapeutics platform.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto min-h-0 flex-1 space-y-5">
          {submitSuccess ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-outfit font-bold text-gray-900">
                Evaluation Successfully Recorded!
              </h4>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                Thank you for contributing to our research study. Your responses on usability, precaution clarity, and clinical adherence directly inform our project report.
              </p>
              <div className="pt-2">
                <Button
                  onClick={onClose}
                  className="bg-[#1E7E34] hover:bg-[#155D27] text-white text-xs font-semibold rounded-xl px-5"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Days post therapy selector */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Days Since Therapy Completed:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 5, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDaysPostTherapy(days)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        daysPostTherapy === days
                          ? "bg-[#1E7E34] text-white shadow-xs"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {days} {days === 1 ? "day" : "days"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. App Usability Rating */}
              <div className="space-y-1.5 p-3 rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    1. App Navigation & Ease of Use (System Usability)
                  </Label>
                  <span className="text-xs font-bold text-emerald-700">{usabilityRating} / 5</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  How smooth and intuitive was finding information, viewing sessions, and using the app?
                </p>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUsabilityRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= usabilityRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Precaution Clarity (Purvakarma & Paschatkarma) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    2. Precaution Guidance & Diet Clarity
                  </Label>
                  <span className="text-xs font-bold text-emerald-700">{precautionsRating} / 5</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Did the Purvakarma (pre-procedure) and Paschatkarma (recovery diet) notifications provide clear instructions?
                </p>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPrecautionsRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= precautionsRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Scheduling & Alerts Convenience */}
              <div className="space-y-1.5 p-3 rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                    3. Scheduling Convenience & Reminders
                  </Label>
                  <span className="text-xs font-bold text-emerald-700">{schedulingRating} / 5</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  How effective was the automated scheduling and timeline alerts in preventing date/time confusion?
                </p>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSchedulingRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= schedulingRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Overall Experience */}
              <div className="space-y-1.5 p-3 rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                    4. Overall Satisfaction with AyurSutra
                  </Label>
                  <span className="text-xs font-bold text-emerald-700">{overallRating} / 5</span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= overallRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Clinical Adherence Confirmation */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-gray-900">Did the app improve your adherence to the Ayurvedic treatment?</p>
                  <p className="text-[11px] text-gray-500">Compared to traditional paper notes or verbal advice</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAdherenceImproved(true)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      adherenceImproved
                        ? "bg-[#1E7E34] text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-200"
                    }`}
                  >
                    Yes (Improved)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdherenceImproved(false)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      !adherenceImproved
                        ? "bg-gray-800 text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-200"
                    }`}
                  >
                    Same
                  </button>
                </div>
              </div>

              {/* 6. Net Promoter Score (1-10) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-800">
                    6. Likelihood to Recommend (NPS 1-10)
                  </Label>
                  <span className="text-xs font-bold text-emerald-700">{recommendScore} / 10</span>
                </div>
                <div className="grid grid-cols-10 gap-1 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setRecommendScore(score)}
                      className={`h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

              {/* 7. Qualitative - What did you like most? */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-800">
                  What features did you like most in the app?
                </Label>
                <textarea
                  value={likedMost}
                  onChange={(e) => setLikedMost(e.target.value)}
                  placeholder="E.g., Automated precaution push reminders before sessions, procedure video explanations, interactive clinic map..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green/30 resize-none"
                />
              </div>

              {/* 8. Qualitative - What can be improved? */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-800">
                  What can be done to improve AyurSutra?
                </Label>
                <textarea
                  value={improvementSuggestions}
                  onChange={(e) => setImprovementSuggestions(e.target.value)}
                  placeholder="E.g., Add offline PDF download for diet plans, more regional languages, direct herbal medicine intake reminders..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-ayur-green/30 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-xs rounded-xl border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1E7E34] hover:bg-[#155D27] text-white text-xs font-semibold rounded-xl px-5 h-9 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting..." : "Submit App Evaluation"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
