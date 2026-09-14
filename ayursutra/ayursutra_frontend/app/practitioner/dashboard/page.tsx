"use client";

import { useAuth } from "@/providers/auth-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Activity } from "lucide-react";

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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await api.patch(`/treatment-requests/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practitioner-requests"] });
    },
  });

  if (isProfileLoading || isRequestsLoading || isSessionsLoading) {
    return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;
  }

  const pendingRequests = requests?.filter((r: any) => r.status === "pending") || [];
  
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysSessions = sessions?.filter((s: any) => s.scheduled_date === todayStr && s.status === "scheduled") || [];

  return (
    <div className="container mx-auto p-6 max-w-6xl animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark">Welcome, {profile?.name}</h1>
          <p className="text-ayur-muted">{profile?.specialization} | {profile?.qualification}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-ayur-accent/10 rounded-full text-ayur-accent">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-ayur-muted">Pending Requests</p>
              <p className="font-semibold text-lg">{pendingRequests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-ayur-green/10 rounded-full text-ayur-green">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-ayur-muted">Active Patients</p>
              <p className="font-semibold text-lg">{requests?.filter((r: any) => r.status === "accepted").length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-ayur-muted">Today's Sessions</p>
              <p className="font-semibold text-lg">{todaysSessions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-ayur-green" />
              Recent Treatment Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((req: any) => (
                  <div key={req.id} className="p-4 border border-ayur-border rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-ayur-green-dark">Patient ID: {req.patient_id}</h4>
                      <p className="text-sm text-ayur-muted">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => updateStatusMutation.mutate({ id: req.id, status: "accepted" })}
                        disabled={updateStatusMutation.isPending}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed border-ayur-border rounded-lg">
                <p className="text-ayur-muted">No pending treatment requests.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
