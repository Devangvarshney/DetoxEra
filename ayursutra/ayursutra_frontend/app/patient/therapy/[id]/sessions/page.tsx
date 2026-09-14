"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Star } from "lucide-react";
import { useParams } from "next/navigation";
import { ProgressChart } from "@/components/shared/ProgressChart";

export default function PatientPlanSessionsPage() {
  const params = useParams();
  const planId = params.id;

  const { data: plan, isLoading: isPlanLoading } = useQuery({
    queryKey: ["patient-plan", planId],
    queryFn: async () => {
      const res = await api.get(`/therapy/plans/${planId}`);
      return res.data;
    },
  });

  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["patient-plan-sessions", planId],
    queryFn: async () => {
      const res = await api.get(`/therapy/plans/${planId}/sessions`);
      return res.data;
    },
  });

  if (isPlanLoading || isSessionsLoading) {
    return <div className="p-8 text-center animate-pulse">Loading sessions...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark">{plan?.title}</h1>
      </div>

      <ProgressChart planId={Number(planId)} />

      <h2 className="text-xl font-bold font-outfit text-ayur-green-dark mb-4 mt-8">Therapy Sessions</h2>

      <div className="space-y-4">
        {sessions?.map((session: any) => (
          <Card key={session.id} className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Session #{session.session_number}</CardTitle>
                <Badge variant={session.status === "completed" ? "success" : session.status === "scheduled" ? "default" : "warning"}>
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.status === "scheduled" || session.status === "completed" ? (
                <div className="text-sm bg-gray-50 p-4 rounded-md border border-gray-100 flex gap-12">
                  <div>
                    <span className="text-ayur-muted block mb-1">Scheduled Date</span>
                    <strong className="text-ayur-green-dark">{session.scheduled_date}</strong>
                  </div>
                  <div>
                    <span className="text-ayur-muted block mb-1">Time</span>
                    <strong className="text-ayur-green-dark">{session.start_time} ({session.duration} mins)</strong>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-ayur-muted bg-ayur-accent/5 p-4 rounded-md">
                  This session has not been scheduled yet by your practitioner.
                </div>
              )}

              {session.status === "completed" && session.practitioner_notes && (
                <div className="text-sm bg-ayur-green/5 p-4 rounded-md border border-ayur-green/20">
                  <h4 className="font-semibold text-ayur-green mb-2">Practitioner's Notes:</h4>
                  <p className="text-ayur-text leading-relaxed">{session.practitioner_notes}</p>
                </div>
              )}

              {session.status === "completed" && (
                <SessionFeedback sessionId={session.id} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SessionFeedback({ sessionId }: { sessionId: number }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

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

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/feedback/sessions/${sessionId}`, {
        rating,
        comments
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-feedback", sessionId] });
    }
  });

  if (isLoading) return <div className="text-sm animate-pulse text-ayur-muted">Loading feedback...</div>;

  if (feedback) {
    return (
      <div className="text-sm bg-ayur-accent/5 p-4 rounded-md border border-ayur-accent/20">
        <h4 className="font-semibold text-ayur-accent mb-2 flex items-center gap-2">
          Your Feedback
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-3 h-3 ${star <= feedback.rating ? "fill-ayur-accent text-ayur-accent" : "text-gray-300"}`} />
            ))}
          </div>
        </h4>
        <p className="text-ayur-text leading-relaxed">{feedback.comments}</p>
      </div>
    );
  }

  return (
    <div className="text-sm bg-gray-50 p-4 rounded-md border border-gray-200">
      <h4 className="font-semibold text-gray-700 mb-3">How was this session?</h4>
      <div className="flex items-center gap-2 mb-3 cursor-pointer">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-6 h-6 transition-colors ${star <= (hoverRating || rating) ? "fill-ayur-accent text-ayur-accent" : "text-gray-300"}`} 
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      <textarea 
        className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ayur-green min-h-[60px] mb-3"
        placeholder="Share your thoughts with your practitioner..."
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />
      <Button 
        size="sm" 
        disabled={rating === 0 || submitMutation.isPending}
        onClick={() => submitMutation.mutate()}
      >
        Submit Feedback
      </Button>
    </div>
  );
}
