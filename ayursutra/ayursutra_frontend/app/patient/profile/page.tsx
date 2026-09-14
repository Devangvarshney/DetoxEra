"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

export default function PatientProfilePage() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["patient-profile"],
    queryFn: async () => {
      const res = await api.get("/patients/me");
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl animate-fade-in">
      <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark mb-6">My Profile</h1>
      
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-ayur-muted uppercase tracking-wider mb-1">Name</h3>
              <p className="text-lg font-medium text-ayur-green-dark">{profile?.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-ayur-muted uppercase tracking-wider mb-1">Email</h3>
              <p className="text-lg">{user?.email}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-ayur-muted uppercase tracking-wider mb-1">Age</h3>
                <p className="text-lg">{profile?.age}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-ayur-muted uppercase tracking-wider mb-1">Gender</h3>
                <p className="text-lg">{profile?.gender}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-ayur-muted uppercase tracking-wider mb-1">Phone</h3>
                <p className="text-lg">{profile?.phone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
