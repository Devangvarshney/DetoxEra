"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PractitionerPlansPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["practitioner-plans"],
    queryFn: async () => {
      const res = await api.get("/therapy/plans");
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading therapy plans...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark">Active Therapy Plans</h1>
        <Button>Create New Plan</Button>
      </div>
      
      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan: any) => (
            <Card key={plan.id} className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-medium">{plan.title}</CardTitle>
                <p className="text-sm text-ayur-muted">Patient ID: {plan.patient_id}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ayur-muted mb-4">{plan.description}</p>
                <div className="bg-ayur-green/5 p-4 rounded-lg mb-4 text-sm">
                  <p><strong>Sessions:</strong> {plan.number_of_sessions}</p>
                  <p><strong>Duration:</strong> {plan.session_duration} mins/session</p>
                </div>
                <Link href={`/practitioner/plans/${plan.id}/sessions`}>
                  <Button className="w-full" variant="outline">Manage Sessions</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="text-center p-8">
            <p className="text-ayur-muted mb-4">You have not created any therapy plans yet.</p>
            <Button>Create First Plan</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
