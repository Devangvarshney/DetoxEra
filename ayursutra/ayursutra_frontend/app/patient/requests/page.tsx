"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PatientRequestsPage() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["patient-requests"],
    queryFn: async () => {
      const res = await api.get("/treatment-requests/sent");
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading requests...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      <h1 className="text-3xl font-outfit font-bold mb-6" style={{ color: "var(--accent-green, #085560)" }}>Treatment Requests</h1>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl" style={{ color: "var(--text-primary)" }}>Your Sent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <div
                  key={request.id}
                  className="p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4 transition-all"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                  }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold" style={{ color: "var(--accent-green, #0E7C86)" }}>
                        Dr. {request.practitioner.name.replace(/^Dr\.?\s*/i, "")}
                      </h3>
                      <Badge variant={
                        request.status === "accepted" ? "success" :
                        request.status === "rejected" ? "destructive" :
                        "secondary"
                      }>
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2" style={{ color: "var(--text-primary)" }}>
                      <strong>Specialization:</strong> {request.practitioner.specialization}
                    </p>
                    <p
                      className="text-sm p-3 rounded-lg italic"
                      style={{
                        color: "var(--text-muted)",
                        background: "var(--surface-muted)",
                        border: "1px solid var(--border-color)"
                      }}
                    >
                      &ldquo;{request.message}&rdquo;
                    </p>
                    <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                      Sent on: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed border-ayur-border rounded-lg">
              <p className="text-ayur-muted">You haven't sent any treatment requests yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
