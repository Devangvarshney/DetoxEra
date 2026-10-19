"use client";

import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Activity, FileText, ArrowRight, BookOpen, Leaf, TrendingUp, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  const upcomingSessions = sessions
    ?.filter((s: any) => s.status === "scheduled")
    .sort((a: any, b: any) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()) || [];

  const completedSessions = sessions?.filter((s: any) => s.status === "completed").length || 0;
  const totalSessions = sessions?.length || 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-6">
        <p className="text-ayur-muted text-sm mb-1 font-medium">Welcome back</p>
        <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark">{profile?.name || "Patient"}</h1>
        {(profile?.age || profile?.gender) && (
          <p className="text-ayur-muted text-sm mt-1">
            {profile?.age ? `${profile.age} yrs` : ""}{profile?.age && profile?.gender ? " · " : ""}{profile?.gender || ""}
          </p>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: FileText, label: "Active Plans", value: plans?.length || 0, color: "text-ayur-green", bg: "bg-ayur-green/10", href: "/patient/therapy" },
          { icon: Calendar, label: "Upcoming Sessions", value: upcomingSessions.length, color: "text-blue-600", bg: "bg-blue-50", href: "/patient/therapy" },
          { icon: Activity, label: "Completed", value: completedSessions, color: "text-emerald-600", bg: "bg-emerald-50", href: "/patient/therapy" },
          { icon: TrendingUp, label: "Total Sessions", value: totalSessions, color: "text-ayur-accent", bg: "bg-ayur-accent/10", href: "/patient/therapy" },
        ].map((stat, i) => (
          <Link key={stat.label} href={stat.href}>
            <div className="stat-card cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-outfit font-bold text-ayur-green-dark">{stat.value}</p>
              <p className="text-xs text-ayur-muted">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Panchakarma Spotlight */}
        <div className="rounded-2xl p-6 hero-gradient text-white relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-ayur-accent text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Classical Healing
            </div>
            <h3 className="text-xl font-outfit font-bold">5 Main Panchakarma Therapies</h3>
            <p className="text-white/80 text-xs leading-relaxed">
              Vamana, Virechana, Basti, Nasya, and Raktamokshana — explore clinical procedures, benefits, and indications.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <Link href="/panchakarma">
              <Button size="sm" className="w-full bg-ayur-accent hover:bg-ayur-accent-hover text-white text-xs font-semibold rounded-xl">
                Explore Full Guide →
              </Button>
            </Link>
          </div>
        </div>

        {/* Therapy Plans */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-outfit flex items-center gap-2">
              <FileText className="w-5 h-5 text-ayur-green" /> Your Therapy Plans
            </CardTitle>
            <Link href="/patient/therapy">
              <Button variant="ghost" size="sm" className="text-ayur-green text-xs gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {plans && plans.length > 0 ? (
              <div className="space-y-3">
                {plans.slice(0, 3).map((plan: any) => {
                  const planSessions = sessions?.filter((s: any) => s.therapy_plan_id === plan.id) || [];
                  const done = planSessions.filter((s: any) => s.status === "completed").length;
                  const progress = plan.number_of_sessions > 0 ? (done / plan.number_of_sessions) * 100 : 0;
                  return (
                    <div key={plan.id} className="p-4 rounded-xl border border-ayur-border hover:border-ayur-green transition-colors bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-ayur-green-dark text-sm">{plan.title}</h4>
                        <Badge variant="success" className="text-xs">Active</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-ayur-muted mb-1.5">
                        <span>{done} / {plan.number_of_sessions} sessions</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <Link href={`/patient/therapy/${plan.id}/sessions`}>
                        <button className="text-xs text-ayur-green hover:underline mt-2">View Sessions →</button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-ayur-border rounded-xl">
                <p className="text-ayur-muted text-sm mb-3">No active therapy plans yet.</p>
                <Link href="/patient/practitioners">
                  <Button variant="outline" size="sm">Find Doctors Near You</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-outfit flex items-center gap-2">
              <Calendar className="w-5 h-5 text-ayur-green" /> Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 4).map((session: any) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      #{session.session_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-blue-800 truncate">Session #{session.session_number}</p>
                      <p className="text-xs text-blue-600">{session.scheduled_date}</p>
                      {session.start_time && <p className="text-xs text-blue-500">{session.start_time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ayur-muted text-sm text-center py-6">No upcoming sessions.</p>
            )}
          </CardContent>
        </Card>

        {/* Find Doctors Map Quick Banner */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-outfit flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ayur-green" /> Ayurvedic Hospitals & Doctors
            </CardTitle>
            <Link href="/patient/practitioners">
              <Button variant="ghost" size="sm" className="text-ayur-green text-xs gap-1">
                Open Map <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-ayur-light/80 border border-ayur-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm text-ayur-green-dark">Find Doctors in Delhi, Punjab, Kerala & more</p>
                <p className="text-xs text-ayur-muted mt-0.5">Explore certified Panchakarma practitioners and hospitals near your city on our interactive simulated map.</p>
              </div>
              <Link href="/patient/practitioners" className="shrink-0">
                <Button className="btn-primary text-white text-xs">
                  Search by City
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
