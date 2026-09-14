"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PatientTherapyPage() {
  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ["patient-plans"],
    queryFn: async () => {
      const res = await api.get("/therapy/plans");
      return res.data;
    },
  });

  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["patient-sessions"],
    queryFn: async () => {
      const res = await api.get("/therapy/sessions");
      return res.data;
    },
  });

  if (isPlansLoading || isSessionsLoading) {
    return <div className="p-8 text-center animate-pulse">Loading therapy plans...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-fade-in">
      <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark mb-6">Your Therapy Plans</h1>
      
      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan: any) => {
            const planSessions = sessions?.filter((s: any) => s.therapy_plan_id === plan.id) || [];
            const completedCount = planSessions.filter((s: any) => s.status === "completed").length;
            const progress = plan.number_of_sessions > 0 ? (completedCount / plan.number_of_sessions) * 100 : 0;

            return (
              <Card key={plan.id} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xl font-medium">{plan.title}</CardTitle>
                  <Badge variant="success">Active</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-ayur-muted mb-4">{plan.description || "No specific instructions provided."}</p>
                  
                  <div className="bg-ayur-green/5 p-4 rounded-lg mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-ayur-green-dark">Progress</span>
                      <span className="text-ayur-green">{completedCount} / {plan.number_of_sessions} Sessions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-ayur-green h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  <Link href={`/patient/therapy/${plan.id}/sessions`}>
                    <Button className="w-full" variant="outline">View Sessions & Notes</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="text-center p-8">
            <p className="text-ayur-muted mb-4">You don't have any active therapy plans.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
