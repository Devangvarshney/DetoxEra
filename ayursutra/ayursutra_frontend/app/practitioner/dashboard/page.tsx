"use client";

import { useAuth } from "@/providers/auth-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Activity, BarChart2, Calendar, Check, X, ArrowRight, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function PractitionerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["practitioner-profile"],
    queryFn: async () => {
      const res = await api.get("/practitioners/me/profile");
      return res.data;
    },
  });

  const { data: requests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ["practitioner-requests"],
    queryFn: async () => {
      const res = await api.get("/treatment-requests/received");
      return res.data;
    },
  });

  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["practitioner-sessions"],
    queryFn: async () => {
      const res = await api.get("/therapy/sessions");
      return res.data;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["practitioner-analytics"],
    queryFn: async () => {
      try {
        const res = await api.get("/analytics/practitioner");
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await api.patch(`/treatment-requests/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practitioner-requests"] });
    },
  });

  if (isProfileLoading || isRequestsLoading || isSessionsLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="h-28 rounded-2xl shimmer mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  const pendingRequests = requests?.filter((r: any) => r.status === "pending") || [];
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysSessions = sessions?.filter((s: any) => s.scheduled_date === todayStr && s.status === "scheduled") || [];
  const completedCount = sessions?.filter((s: any) => s.status === "completed").length || 0;
  const totalPlans = new Set(sessions?.map((s: any) => s.therapy_plan_id)).size;

  const chartData = analytics?.monthly_sessions?.slice(-6) || [];

  return (
    <div className="container mx-auto p-6 max-w-6xl animate-fade-in">
      {/* Hero Welcome */}
      <div className="hero-gradient rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute right-4 top-4 text-[80px] opacity-10 leading-none">🏥</div>
        <div className="relative z-10 flex justify-between items-start flex-wrap gap-4">
          <div>
            <p className="text-white/60 text-sm mb-1">Good day, Doctor</p>
            <h1 className="text-2xl font-outfit font-bold text-white">{profile?.name}</h1>
            <p className="text-white/60 text-sm mt-1">{profile?.specialization} · {profile?.qualification}</p>
          </div>
          <Link href="/practitioner/analytics">
            <Button className="bg-ayur-accent text-white hover:bg-ayur-accent-hover gap-2">
              <BarChart2 className="w-4 h-4" /> View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: FileText, label: "Pending Requests", value: pendingRequests.length, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: Users, label: "Accepted Patients", value: requests?.filter((r: any) => r.status === "accepted").length || 0, color: "text-ayur-green", bg: "bg-ayur-green/10" },
          { icon: Calendar, label: "Today's Sessions", value: todaysSessions.length, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Activity, label: "Completed Sessions", value: completedCount, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <div key={stat.label} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-outfit font-bold text-ayur-green-dark">{stat.value}</p>
            <p className="text-xs text-ayur-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-outfit flex items-center gap-2">
              <FileText className="w-5 h-5 text-ayur-green" />
              Treatment Requests
              {pendingRequests.length > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {pendingRequests.length} pending
                </span>
              )}
            </CardTitle>
            <Link href="/practitioner/requests">
              <Button variant="ghost" size="sm" className="text-ayur-green text-xs gap-1">
                All Requests <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.slice(0, 5).map((req: any) => (
                  <div key={req.id} className="p-4 rounded-xl border border-amber-100 bg-amber-50 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-ayur-green text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {req.patient?.name?.[0] || "P"}
                        </div>
                        <div>
                          <p className="font-semibold text-ayur-green-dark text-sm">
                            {req.patient?.name || `Patient #${req.patient_id}`}
                          </p>
                          <p className="text-xs text-ayur-muted">{new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {req.message && <p className="text-xs text-ayur-muted mt-1 ml-10 line-clamp-1">{req.message}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: req.id, status: "accepted" })}
                        disabled={updateStatusMutation.isPending}
                        className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: req.id, status: "rejected" })}
                        disabled={updateStatusMutation.isPending}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-ayur-border rounded-xl">
                <p className="text-ayur-muted text-sm">No pending treatment requests.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-outfit flex items-center gap-2">
              <Calendar className="w-5 h-5 text-ayur-green" /> Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysSessions.length > 0 ? (
              <div className="space-y-3">
                {todaysSessions.map((session: any) => (
                  <div key={session.id} className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                        #{session.session_number}
                      </div>
                      <span className="text-xs font-semibold text-blue-800">Session #{session.session_number}</span>
                    </div>
                    {session.start_time && (
                      <p className="text-xs text-blue-600 ml-9">{session.start_time} – {session.end_time}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-ayur-muted mx-auto mb-2" />
                <p className="text-ayur-muted text-sm">No sessions scheduled today.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Sessions Chart */}
        {chartData.length > 0 && (
          <Card className="glass-card lg:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-outfit flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-ayur-green" /> Session Activity (6 months)
              </CardTitle>
              <Link href="/practitioner/analytics">
                <Button variant="ghost" size="sm" className="text-ayur-green text-xs">Full Analytics →</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D4" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B7A70" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#6B7A70" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "11px", border: "1px solid #D3DDD6" }} />
                  <Bar dataKey="sessions" name="Sessions" fill="#D4924A" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#3D6B56" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-outfit">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/practitioner/plans">
              <div className="p-3 rounded-xl border border-ayur-border hover:border-ayur-green hover:bg-ayur-green/5 transition-all cursor-pointer flex items-center gap-3">
                <FileText className="w-4 h-4 text-ayur-green" />
                <span className="text-sm font-medium text-ayur-text">Manage Plans</span>
                <ArrowRight className="w-3.5 h-3.5 text-ayur-muted ml-auto" />
              </div>
            </Link>
            <Link href="/practitioner/patients">
              <div className="p-3 rounded-xl border border-ayur-border hover:border-ayur-green hover:bg-ayur-green/5 transition-all cursor-pointer flex items-center gap-3">
                <Users className="w-4 h-4 text-ayur-green" />
                <span className="text-sm font-medium text-ayur-text">View Patients</span>
                <ArrowRight className="w-3.5 h-3.5 text-ayur-muted ml-auto" />
              </div>
            </Link>
            <Link href="/practitioner/analytics">
              <div className="p-3 rounded-xl border border-ayur-border hover:border-ayur-green hover:bg-ayur-green/5 transition-all cursor-pointer flex items-center gap-3">
                <BarChart2 className="w-4 h-4 text-ayur-green" />
                <span className="text-sm font-medium text-ayur-text">Analytics</span>
                <ArrowRight className="w-3.5 h-3.5 text-ayur-muted ml-auto" />
              </div>
            </Link>
            {analytics && (
              <div className="mt-4 p-3 rounded-xl bg-ayur-green/5 border border-ayur-green/20">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-ayur-green-dark">
                    {analytics.overview.total_feedback > 0
                      ? `${analytics.overview.avg_rating.toFixed(1)} Rating`
                      : "No ratings yet"}
                  </span>
                </div>
                <p className="text-xs text-ayur-muted">
                  {analytics.overview.completion_rate}% completion rate · {analytics.overview.total_feedback} {analytics.overview.total_feedback === 1 ? "review" : "reviews"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
