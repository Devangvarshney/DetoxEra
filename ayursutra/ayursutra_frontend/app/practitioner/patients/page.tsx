"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users } from "lucide-react";

export default function PractitionerPatientsPage() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["practitioner-requests"],
    queryFn: async () => {
      const res = await api.get("/treatment-requests/received");
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading patients...</div>;
  }

  // Active patients are derived from accepted treatment requests
  const activePatients = requests?.filter((req: any) => req.status === "accepted") || [];

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-fade-in">
      <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark mb-6">My Patients</h1>
      
      {activePatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePatients.map((req: any) => (
            <Card key={req.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-ayur-green/10 rounded-full text-ayur-green">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-ayur-green-dark">Patient ID: {req.patient_id}</h3>
                    <p className="text-sm text-ayur-muted">Accepted on {new Date(req.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <Link href={`/practitioner/plans/new?patient_id=${req.patient_id}`}>
                  <Button className="w-full">Create Treatment Plan</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="text-center p-12">
            <p className="text-ayur-muted mb-4">You don't have any active patients right now. Accept treatment requests to add patients here.</p>
            <Link href="/practitioner/requests">
              <Button variant="outline">View Treatment Requests</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
