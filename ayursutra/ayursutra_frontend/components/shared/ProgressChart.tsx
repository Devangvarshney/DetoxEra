"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function ProgressChart({ planId }: { planId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["feedback-chart", planId],
    queryFn: async () => {
      const res = await api.get(`/therapy/plans/${planId}/feedback-chart`);
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center animate-pulse text-ayur-muted">Loading chart data...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="glass-card mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-ayur-green" />
            Therapy Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-sm text-ayur-muted italic border border-dashed border-gray-200 rounded-lg">
            No feedback data available yet. Complete a session and submit feedback to see the progress chart!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-ayur-green" />
          Patient Satisfaction Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`${value} Stars`, 'Rating']}
              />
              <Line 
                type="monotone" 
                dataKey="rating" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 6, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 8, fill: '#059669', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
