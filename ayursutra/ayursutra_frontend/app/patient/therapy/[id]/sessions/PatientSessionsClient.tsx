"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Star, CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, MessageSquare, Shield, Award } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { ProgressChart } from "@/components/shared/ProgressChart";

const STATUS_CONFIG = {
  completed: { label: "Completed", dot: "bg-emerald-500", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  scheduled: { label: "Scheduled", dot: "bg-blue-500", border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
  pending: { label: "Pending", dot: "bg-ayur-border", border: "border-ayur-border", bg: "bg-ayur-light", text: "text-ayur-muted", icon: AlertTriangle },
  cancelled: { label: "Cancelled", dot: "bg-red-400", border: "border-red-200", bg: "bg-red-50", text: "text-red-600", icon: AlertTriangle },
};

const SYMPTOM_TAGS = [
  "Better energy", "Less pain", "Improved sleep", "Better digestion",
  "Reduced anxiety", "Skin improvement", "Weight change", "Joint flexibility",
  "Fatigue", "Nausea", "Headache", "Bloating",
];

export default function PatientSessionsClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const planId = (params?.id as string) || searchParams?.get("id") || searchParams?.get("plan_id") || "";

  const { data: plan, isLoading: isPlanLoading } = useQuery({
    queryKey: ["patient-plan", planId],
    queryFn: async () => {
      if (!planId) return null;
      const res = await api.get(`/therapy/plans/${planId}`);
      return res.data;
    },
    enabled: !!planId,
  });

  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["patient-plan-sessions", planId],
    queryFn: async () => {
      if (!planId) return [];
      const res = await api.get(`/therapy/plans/${planId}/sessions`);
      return res.data;
    },
    enabled: !!planId,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["plan-milestones", planId],
    queryFn: async () => {
      if (!planId) return [];
      try {
        const res = await api.get(`/milestones/plans/${planId}/milestones`);
        return res.data;
      } catch {
        return [];
      }
    },
    enabled: !!planId,
  });

  if (isPlanLoading || isSessionsLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="h-16 rounded-2xl shimmer mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  const completedCount = sessions?.filter((s: any) => s.status === "completed").length || 0;
  const totalSessions = plan?.number_of_sessions || 0;
  const progress = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  const achievedMilestones = milestones.filter((m: any) => m.is_achieved).length;

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      {/* Plan Header */}
      <div className="hero-gradient rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute right-4 top-4 text-[80px] opacity-10 leading-none">🌿</div>
        <div className="relative z-10">
          <p className="text-white/60 text-sm mb-1">Therapy Plan</p>
          <h1 className="text-2xl font-outfit font-bold text-white mb-1">{plan?.title}</h1>
          {plan?.description && <p className="text-white/70 text-sm max-w-lg">{plan.description}</p>}
          
          <div className="flex items-center gap-6 mt-4">
            <div>
              <p className="text-white/60 text-xs">Progress</p>
              <p className="text-white font-bold text-lg">{progress}%</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Sessions</p>
              <p className="text-white font-bold text-lg">{completedCount}/{totalSessions}</p>
            </div>
            {milestones.length > 0 && (
              <div>
                <p className="text-white/60 text-xs">Milestones</p>
                <p className="text-white font-bold text-lg">{achievedMilestones}/{milestones.length}</p>
              </div>
            )}
          </div>

          <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-ayur-accent transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      {planId && <ProgressChart planId={Number(planId)} />}

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card className="glass-card my-6">
          <CardHeader className="pb-3">
            <CardTitle className="font-outfit text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-ayur-accent" /> Recovery Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {milestones.map((m: any) => (
                <div
                  key={m.id}
                  className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 ${
                    m.is_achieved
                      ? "bg-amber-50 border-amber-300 text-amber-800"
                      : "bg-ayur-light border-ayur-border text-ayur-muted"
                  }`}
                >
                  <span className="text-lg">{m.is_achieved ? "🏆" : "🎯"}</span>
                  <div>
                    <p className="text-sm font-semibold">{m.title}</p>
                    {m.target_session && (
                      <p className="text-xs opacity-70">After session {m.target_session}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Sessions */}
      <h2 className="text-xl font-bold font-outfit text-ayur-green-dark mb-4 mt-6">Session Timeline</h2>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ayur-green via-ayur-border to-transparent" />

        <div className="space-y-4">
          {sessions?.map((session: any, idx: number) => {
            const cfg = STATUS_CONFIG[session.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;

            return (
              <div key={session.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className={`absolute left-3 top-4 w-4 h-4 rounded-full ${cfg.dot} border-2 border-white shadow-sm z-10`} />

                <div className={`rounded-2xl border-2 ${cfg.border} bg-white overflow-hidden transition-all hover:shadow-md`}>
                  <div className={`px-5 py-4 ${cfg.bg} flex items-center justify-between gap-3`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${cfg.text}`} />
                      <div>
                        <p className={`font-semibold text-sm ${cfg.text}`}>Session #{session.session_number}</p>
                        {session.scheduled_date && (
                          <p className="text-xs text-ayur-muted">
                            {session.scheduled_date}
                            {session.start_time && ` · ${session.start_time}`}
                            {session.duration && ` · ${session.duration} mins`}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    {/* Pre-precautions */}
                    {session.pre_precautions && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 mb-1">
                          <Shield className="w-3.5 h-3.5" /> Pre-Procedure Precautions
                        </p>
                        <p className="text-xs text-blue-700 leading-relaxed whitespace-pre-line">{session.pre_precautions}</p>
                      </div>
                    )}

                    {/* Post-precautions */}
                    {session.post_precautions && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 mb-1">
                          <Shield className="w-3.5 h-3.5" /> Post-Procedure Precautions
                        </p>
                        <p className="text-xs text-amber-700 leading-relaxed whitespace-pre-line">{session.post_precautions}</p>
                      </div>
                    )}

                    {/* Practitioner Notes */}
                    {session.practitioner_notes && (
                      <div className="p-3 rounded-xl bg-ayur-green/5 border border-ayur-green/20">
                        <p className="text-xs font-semibold text-ayur-green flex items-center gap-1.5 mb-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Practitioner's Notes
                        </p>
                        <p className="text-xs text-ayur-text leading-relaxed">{session.practitioner_notes}</p>
                      </div>
                    )}

                    {/* Feedback for completed sessions */}
                    {session.status === "completed" && (
                      <SessionFeedback sessionId={session.id} />
                    )}

                    {/* Pending message */}
                    {session.status === "pending" && (
                      <p className="text-xs text-ayur-muted text-center py-2">
                        ⏳ Awaiting scheduling by your practitioner
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SessionFeedback({ sessionId }: { sessionId: number }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [improvementLevel, setImprovementLevel] = useState(3);
  const [showForm, setShowForm] = useState(false);

  const { data: feedback, isLoading } = useQuery({
    queryKey: ["session-feedback", sessionId],
    queryFn: async () => {
      try {
        const res = await api.get(`/feedback/sessions/${sessionId}`);
        return res.data;
      } catch (e: any) {
        if (e.response?.status === 404) return null;
        throw e;
      }
    },
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/feedback/sessions/${sessionId}`, {
        rating,
        comments: comments || null,
        symptoms_reported: selectedSymptoms.join(", ") || null,
        improvement_level: improvementLevel,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-feedback", sessionId] });
    },
  });

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  if (isLoading) return <div className="text-xs animate-pulse text-ayur-muted">Loading feedback...</div>;

  if (feedback) {
    return (
      <div className="p-4 rounded-xl bg-ayur-accent/5 border border-ayur-accent/20">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-semibold text-ayur-accent">Your Feedback</p>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-3.5 h-3.5 ${star <= feedback.rating ? "fill-ayur-accent text-ayur-accent" : "text-gray-300"}`} />
            ))}
          </div>
          {feedback.improvement_level && (
            <span className="text-xs text-ayur-muted">· Improvement: {feedback.improvement_level}/5</span>
          )}
        </div>
        {feedback.comments && <p className="text-xs text-ayur-text leading-relaxed">{feedback.comments}</p>}
        {feedback.symptoms_reported && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {feedback.symptoms_reported.split(", ").map((s: string) => (
              <span key={s} className="px-2 py-0.5 bg-white rounded-full text-xs text-ayur-muted border border-ayur-border">{s}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-ayur-border rounded-xl overflow-hidden">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-ayur-green bg-ayur-green/5 hover:bg-ayur-green/10 transition-colors"
      >
        <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Rate this session</span>
        {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showForm && (
        <div className="p-4 space-y-4 bg-white">
          {/* Star Rating */}
          <div>
            <p className="text-xs font-semibold text-ayur-text mb-2">Overall Rating</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-7 h-7 cursor-pointer transition-all ${star <= (hoverRating || rating) ? "fill-ayur-accent text-ayur-accent scale-110" : "text-gray-300"}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
              {rating > 0 && <span className="text-xs text-ayur-muted self-center ml-1">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}</span>}
            </div>
          </div>

          {/* Improvement Level */}
          <div>
            <p className="text-xs font-semibold text-ayur-text mb-2">Improvement Level: {improvementLevel}/5</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setImprovementLevel(n)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold border-2 transition-all
                    ${improvementLevel === n ? "bg-emerald-500 border-emerald-500 text-white scale-110" : "border-ayur-border text-ayur-muted hover:border-emerald-400"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms/Effects */}
          <div>
            <p className="text-xs font-semibold text-ayur-text mb-2">What did you notice? (select all that apply)</p>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_TAGS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all
                    ${selectedSymptoms.includes(s)
                      ? "bg-ayur-green/15 border-ayur-green text-ayur-green"
                      : "border-ayur-border text-ayur-muted hover:border-ayur-green"
                    }`}
                >
                  {selectedSymptoms.includes(s) && "✓ "}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-xs font-semibold text-ayur-text mb-1.5">Comments (optional)</p>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share anything about this session..."
              rows={2}
              className="ayur-input resize-none text-xs"
            />
          </div>

          <Button
            size="sm"
            disabled={rating === 0 || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            className="bg-ayur-green text-white gap-2 w-full"
          >
            <Star className="w-3.5 h-3.5" />
            {submitMutation.isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      )}
    </div>
  );
}
