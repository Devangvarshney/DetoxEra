"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PractitionerRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["practitioner-requests"],
    queryFn: async () => {
      const res = await api.get("/treatment-requests/received");
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

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading requests...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark mb-6">Received Requests</h1>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl">Treatment Requests from Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <div key={request.id} className="p-4 border border-ayur-border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-ayur-green-dark">Patient ID: {request.patient_id}</h4>
                      <Badge variant={request.status === "pending" ? "warning" : request.status === "accepted" ? "success" : "destructive"}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-ayur-muted">Message: {request.message || "No message provided."}</p>
                    <p className="text-xs text-ayur-muted mt-3">Received on: {new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    {request.status === "accepted" && (
                      <Link href={`/practitioner/plans/new?patient_id=${request.patient_id}`}>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">Create Treatment Plan</Button>
                      </Link>
                    )}
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      {request.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="w-full bg-ayur-green hover:bg-ayur-green-dark text-white"
                            onClick={() => updateStatusMutation.mutate({ id: request.id, status: "accepted" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full"
                            onClick={() => updateStatusMutation.mutate({ id: request.id, status: "rejected" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed border-ayur-border rounded-lg">
              <p className="text-ayur-muted">No treatment requests received.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
