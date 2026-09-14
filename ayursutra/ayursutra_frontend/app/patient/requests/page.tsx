"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { MessageSquare } from "lucide-react";
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
      <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark mb-6">Treatment Requests</h1>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl">Your Sent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <div key={request.id} className="p-4 border border-ayur-border rounded-lg bg-white shadow-sm flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-ayur-green-dark">Dr. {request.practitioner.name}</h3>
                      <Badge variant={
                        request.status === "accepted" ? "success" : 
                        request.status === "rejected" ? "destructive" : 
                        "secondary"
                      }>
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-ayur-text mb-2"><strong>Specialization:</strong> {request.practitioner.specialization}</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md italic">"{request.message}"</p>
                    <p className="text-xs text-ayur-muted mt-3">Sent on: {new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  {request.status === "accepted" && (
                    <div className="flex items-center">
                      <Link href={`/patient/chat/${request.id}`}>
                        <Button variant="default" className="gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </Button>
                      </Link>
                    </div>
                  )}
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
