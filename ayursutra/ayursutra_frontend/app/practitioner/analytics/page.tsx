"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, PieChart, Pie, Cell, Area, AreaChart 
} from "recharts";
import { TrendingUp, Users, Star, CheckCircle, Calendar, Activity, Award, Target } from "lucide-react";

const STATUS_COLORS = {
  completed: "#4AA876",
  scheduled: "#3B82F6",
  pending: "#D4924A",
  cancelled: "#EF4444",
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["practitioner-analytics"],
    queryFn: async () => {
      const res = await api.get("/analytics/practitioner");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { overview, monthly_sessions, status_breakdown } = analytics;

  const pieData = Object.entries(status_breakdown).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val as number,
    color: STATUS_COLORS[key as keyof typeof STATUS_COLORS] || "#ccc",
  })).filter((d) => d.value > 0);

  const statCards = [
    { icon: Users, label: "Total Patients", value: overview.unique_patients, sub: `${overview.total_plans} plans`, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: CheckCircle, label: "Sessions Done", value: overview.completed_sessions, sub: `${overview.completion_rate}% completion rate`, color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Star, label: "Avg. Rating", value: overview.total_feedback > 0 ? overview.avg_rating.toFixed(1) : "—", sub: overview.total_feedback > 0 ? `From ${overview.total_feedback} reviews` : "No ratings yet", color: "text-amber-600", bg: "bg-amber-50" },
    { icon: TrendingUp, label: "Avg. Improvement", value: overview.avg_improvement.toFixed(1) + "/5", sub: "Patient-reported", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark">Analytics Dashboard</h1>
        <p className="text-ayur-muted mt-1">Track your practice performance and patient outcomes.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={card.label} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-outfit font-bold text-ayur-green-dark">{card.value}</p>
            <p className="text-sm font-medium text-ayur-text">{card.label}</p>
            <p className="text-xs text-ayur-muted mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Sessions Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-outfit text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-ayur-green" />
              Monthly Session Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthly_sessions} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3D6B56" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3D6B56" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4AA876" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4AA876" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7A70" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7A70" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #D3DDD6" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="sessions" name="Total Sessions" stroke="#3D6B56" fill="url(#gradSessions)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#4AA876" fill="url(#gradCompleted)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown Donut */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-outfit text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-ayur-green" />
              Session Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Bar Chart */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="font-outfit text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-ayur-green" />
            Sessions vs Completed — Monthly Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly_sessions} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7A70" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7A70" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #D3DDD6" }} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="sessions" name="Total" fill="#D4924A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#3D6B56" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card text-center">
          <CardContent className="p-6">
            <Award className="w-8 h-8 text-ayur-accent mx-auto mb-2" />
            <p className="text-3xl font-outfit font-bold text-ayur-green-dark">{overview.total_sessions}</p>
            <p className="text-sm text-ayur-muted">Total Sessions Managed</p>
          </CardContent>
        </Card>
        <Card className="glass-card text-center">
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-3xl font-outfit font-bold text-ayur-green-dark">{overview.completion_rate}%</p>
            <p className="text-sm text-ayur-muted">Therapy Completion Rate</p>
          </CardContent>
        </Card>
        <Card className="glass-card text-center">
          <CardContent className="p-6">
            <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-outfit font-bold text-ayur-green-dark">
              {overview.total_feedback > 0 ? "⭐".repeat(Math.round(overview.avg_rating)) : "No Ratings Yet"}
            </p>
            <p className="text-sm text-ayur-muted">
              {overview.total_feedback > 0 ? `${overview.avg_rating.toFixed(1)} average patient rating` : "Awaiting patient session feedback"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
