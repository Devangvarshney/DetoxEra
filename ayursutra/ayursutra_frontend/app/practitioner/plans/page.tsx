"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Clock, ArrowRight, PlusCircle, CheckCircle, Calendar } from "lucide-react";

export default function PractitionerPlansPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["practitioner-plans"],
    queryFn: async () => {
      const res = await api.get("/therapy/plans");
      return res.data;
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["practitioner-sessions"],
    queryFn: async () => {
      const res = await api.get("/therapy/sessions");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark">Therapy Plans</h1>
          <p className="text-ayur-muted mt-1">Manage your patient therapy plans and sessions.</p>
        </div>
        <Link href="/practitioner/plans/new">
          <Button className="bg-ayur-green text-white gap-2">
            <PlusCircle className="w-4 h-4" /> Create New Plan
          </Button>
        </Link>
      </div>

      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {plans.map((plan: any) => {
            const planSessions = sessions.filter((s: any) => s.therapy_plan_id === plan.id);
            const completedCount = planSessions.filter((s: any) => s.status === "completed").length;
            const scheduledCount = planSessions.filter((s: any) => s.status === "scheduled").length;
            const progress = plan.number_of_sessions > 0
              ? Math.round((completedCount / plan.number_of_sessions) * 100)
              : 0;

            return (
              <Card key={plan.id} className="glass-card interactive-hover">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-outfit font-semibold text-ayur-green-dark text-base truncate">{plan.title}</h3>
                      <p className="text-xs text-ayur-muted mt-0.5">
                        Patient: {plan.patient?.name || `#${plan.patient_id}`}
                      </p>
                    </div>
                    <Badge variant="success" className="ml-2 flex-shrink-0">Active</Badge>
                  </div>

                  {plan.description && (
                    <p className="text-sm text-ayur-muted mb-3 line-clamp-2">{plan.description}</p>
                  )}

                  {/* Stats row */}
                  <div className="flex gap-4 text-xs text-ayur-muted mb-3">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{completedCount} done</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>{scheduledCount} scheduled</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-ayur-accent" />
                      <span>{plan.session_duration} mins</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-ayur-muted mb-1">
                      <span>Progress</span>
                      <span>{completedCount}/{plan.number_of_sessions} sessions · {progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <Link href={`/practitioner/plans/${plan.id}/sessions`}>
                    <Button className="w-full gap-2 bg-ayur-green text-white text-sm" size="sm">
                      Manage Sessions <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="glass-card mb-10">
          <CardContent className="text-center py-16">
            <FileText className="w-12 h-12 text-ayur-muted mx-auto mb-4" />
            <h3 className="text-xl font-outfit font-semibold text-ayur-green-dark mb-2">No Plans Yet</h3>
            <p className="text-ayur-muted mb-6">Accept a treatment request and create your first therapy plan for a patient.</p>
            <Link href="/practitioner/requests">
              <Button className="gap-2 bg-ayur-green text-white">View Treatment Requests</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
