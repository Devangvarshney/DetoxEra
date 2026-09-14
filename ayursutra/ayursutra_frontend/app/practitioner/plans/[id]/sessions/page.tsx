"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import { ProgressChart } from "@/components/shared/ProgressChart";

export default function PractitionerPlanSessionsPage() {
  const params = useParams();
  const planId = params.id;
  const queryClient = useQueryClient();

  const [schedulingSessionId, setSchedulingSessionId] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [prePrecautions, setPrePrecautions] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [completingSessionId, setCompletingSessionId] = useState<number | null>(null);
  const [practitionerNotes, setPractitionerNotes] = useState("");
  const [postPrecautions, setPostPrecautions] = useState("");

  const { data: plan, isLoading: isPlanLoading } = useQuery({
    queryKey: ["practitioner-plan", planId],
    queryFn: async () => {
      const res = await api.get(`/therapy/plans/${planId}`);
      return res.data;
    },
  });

  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["practitioner-plan-sessions", planId],
    queryFn: async () => {
      const res = await api.get(`/therapy/plans/${planId}/sessions`);
      return res.data;
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async ({ id, date, time, prePrecautions }: { id: number; date: string; time: string; prePrecautions: string }) => {
      const res = await api.patch(`/therapy/sessions/${id}/schedule`, {
        scheduled_date: date,
        start_time: time + ":00",
        pre_precautions: prePrecautions || null
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practitioner-plan-sessions", planId] });
      setSchedulingSessionId(null);
      setScheduleError(null);
    },
    onError: (error: any) => {
      setScheduleError(error.response?.data?.detail || "Failed to schedule session");
    }
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, notes, postPrecautions }: { id: number; notes: string; postPrecautions: string }) => {
      const res = await api.patch(`/therapy/sessions/${id}/complete`, {
        practitioner_notes: notes || null,
        post_precautions: postPrecautions || null
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practitioner-plan-sessions", planId] });
      setCompletingSessionId(null);
      setPractitionerNotes("");
      setPostPrecautions("");
    },
  });

  if (isPlanLoading || isSessionsLoading) {
    return <div className="p-8 text-center animate-pulse">Loading sessions...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark">Manage Sessions</h1>
        <p className="text-ayur-muted text-lg mt-1">{plan?.title}</p>
      </div>

      <ProgressChart planId={Number(planId)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions?.map((session: any) => (
          <Card key={session.id} className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Session #{session.session_number}</CardTitle>
                <Badge variant={session.status === "completed" ? "success" : session.status === "scheduled" ? "default" : "warning"}>
                  {session.status}
                </Badge>
              </div>
              <div className="space-y-2 mt-4 text-sm text-ayur-muted">
                {session.scheduled_date && (
                  <p><strong>Scheduled Date:</strong> {session.scheduled_date}</p>
                )}
                {session.start_time && (
                  <p><strong>Time:</strong> {session.start_time}{session.end_time ? ` to ${session.end_time}` : ""}</p>
                )}
                {session.pre_precautions && (
                  <p><strong>Pre-Precautions:</strong> {session.pre_precautions}</p>
                )}
                {session.status === "completed" && session.completed_at && (
                  <p><strong>Completed At:</strong> {new Date(session.completed_at).toLocaleString()}</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.status === "completed" && session.practitioner_notes && (
                <div className="text-sm bg-ayur-green/5 p-3 rounded-md border border-ayur-green/20 mt-3">
                  <p><strong>Notes:</strong> {session.practitioner_notes}</p>
                </div>
              )}
              {session.status === "completed" && session.post_precautions && (
                <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-md border border-yellow-200 mt-2">
                  <p><strong>Post-Precautions given:</strong> {session.post_precautions}</p>
                </div>
              )}

              {session.status === "completed" && (
                <SessionFeedback sessionId={session.id} />
              )}

              {/* Action Buttons */}
              {session.status === "pending" && schedulingSessionId !== session.id && (
                <Button className="w-full" variant="outline" onClick={() => setSchedulingSessionId(session.id)}>
                  Schedule Session
                </Button>
              )}

              {session.status === "scheduled" && completingSessionId !== session.id && schedulingSessionId !== session.id && (
                <div className="flex gap-2">
                  <Button className="w-full" variant="outline" onClick={() => {
                    setScheduleDate(session.scheduled_date || "");
                    setScheduleTime(session.start_time ? session.start_time.slice(0, 5) : "");
                    setPrePrecautions(session.pre_precautions || "");
                    setSchedulingSessionId(session.id);
                  }}>
                    Reschedule
                  </Button>
                  <Button className="w-full" variant="default" onClick={() => {
                    setPractitionerNotes("");
                    setPostPrecautions("");
                    setCompletingSessionId(session.id);
                  }}>
                    Mark Completed
                  </Button>
                </div>
              )}

              {/* Schedule Form */}
              {schedulingSessionId === session.id && (
                <div className="space-y-3 p-3 bg-ayur-accent/5 rounded-md border border-ayur-accent/20">
                  {scheduleError && (
                    <div className="p-2 text-xs text-red-500 bg-red-50 rounded border border-red-100 mb-2">
                      {scheduleError}
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Time</Label>
                        <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1 mt-2">
                      <Label className="text-xs">Pre-Procedure Precautions (Optional)</Label>
                      <Input 
                        placeholder="E.g., Fast for 12 hours prior" 
                        value={prePrecautions} 
                        onChange={(e) => setPrePrecautions(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1" 
                      disabled={!scheduleDate || !scheduleTime || scheduleMutation.isPending}
                      onClick={() => scheduleMutation.mutate({ id: session.id, date: scheduleDate, time: scheduleTime, prePrecautions })}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setSchedulingSessionId(null);
                      setScheduleError(null);
                    }}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Complete Form */}
              {completingSessionId === session.id && (
                <div className="space-y-3 p-3 bg-ayur-green/5 rounded-md border border-ayur-green/20">
                  <div className="space-y-1">
                    <Label className="text-xs">Session Notes (Optional)</Label>
                    <textarea 
                      className="flex w-full rounded-md border border-ayur-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ayur-green min-h-[80px]"
                      value={practitionerNotes} 
                      onChange={(e) => setPractitionerNotes(e.target.value)} 
                      placeholder="Enter details about the session..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Post-Procedure Precautions (Optional)</Label>
                    <Input 
                      placeholder="E.g., Avoid cold water for 24 hours" 
                      value={postPrecautions} 
                      onChange={(e) => setPostPrecautions(e.target.value)} 
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1" 
                      disabled={completeMutation.isPending}
                      onClick={() => completeMutation.mutate({ id: session.id, notes: practitionerNotes, postPrecautions })}
                    >
                      Complete Session
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setCompletingSessionId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SessionFeedback({ sessionId }: { sessionId: number }) {
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
    retry: false
  });

  if (isLoading) return <div className="text-xs animate-pulse text-ayur-muted">Loading feedback...</div>;

  if (feedback) {
    return (
      <div className="text-sm bg-ayur-accent/5 p-3 rounded-md border border-ayur-accent/20">
        <h4 className="font-semibold text-ayur-accent mb-1 flex items-center justify-between">
          Patient Feedback
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-3 h-3 ${star <= feedback.rating ? "fill-ayur-accent text-ayur-accent" : "text-gray-300"}`} />
            ))}
          </div>
        </h4>
        <p className="text-ayur-text">{feedback.comments || "No comments provided."}</p>
      </div>
    );
  }

  return (
    <div className="text-xs text-ayur-muted italic">
      Patient has not submitted feedback yet.
    </div>
  );
}
