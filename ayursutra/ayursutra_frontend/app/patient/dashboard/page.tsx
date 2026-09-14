"use client";

import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Activity, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PatientDashboard() {
  const { user } = useAuth();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["patient-profile"],
    queryFn: async () => {
      const res = await api.get("/patients/me");
      return res.data;
    },
  });

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

  if (isProfileLoading || isPlansLoading || isSessionsLoading) {
    return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;
  }

  const upcomingSessions = sessions?.filter((s: any) => s.status === "scheduled")
    .sort((a: any, b: any) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()) || [];

  return (
    <div className="container mx-auto p-6 max-w-6xl animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark">Welcome, {profile?.name}</h1>
          <p className="text-ayur-muted">Here is an overview of your Ayurvedic journey.</p>
        </div>
        <Link href="/patient/practitioners">
          <Button>Find Practitioner</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-ayur-green/10 rounded-full text-ayur-green">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-ayur-muted">Age / Gender</p>
              <p className="font-semibold text-lg">{profile?.age} / {profile?.gender}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-ayur-accent/10 rounded-full text-ayur-accent">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-ayur-muted">Active Plans</p>
              <p className="font-semibold text-lg">{plans?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-ayur-muted">Upcoming Sessions</p>
              <p className="font-semibold text-lg">{upcomingSessions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-ayur-green" />
              Your Therapy Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plans && plans.length > 0 ? (
              <div className="space-y-4">
                {plans.map((plan: any) => (
                  <div key={plan.id} className="p-4 border border-ayur-border rounded-lg hover:border-ayur-green transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-ayur-green-dark">{plan.title}</h4>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <p className="text-sm text-ayur-muted mb-4">{plan.description || "No description provided."}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-ayur-muted">{plan.number_of_sessions} Sessions Total</span>
                      <Link href={`/patient/therapy/${plan.id}/sessions`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed border-ayur-border rounded-lg">
                <p className="text-ayur-muted mb-4">You don't have any active therapy plans.</p>
                <Link href="/patient/practitioners">
                  <Button variant="outline">Request Treatment</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-ayur-green" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.slice(0, 3).map((session: any) => (
                  <div key={session.id} className="p-4 bg-ayur-green/5 border border-ayur-green/20 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-ayur-green-dark">Session #{session.session_number}</p>
                      <p className="text-sm text-ayur-muted">{session.scheduled_date} at {session.start_time}</p>
                    </div>
                    <Link href={`/patient/therapy/${session.therapy_plan_id}/sessions`}>
                      <Button variant="ghost" size="icon" className="text-ayur-green">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed border-ayur-border rounded-lg">
                <p className="text-ayur-muted">No upcoming sessions scheduled.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
