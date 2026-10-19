"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function NewTherapyPlanContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patient_id");
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm();

  const createPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/therapy/plans", {
        patient_id: parseInt(patientId as string),
        title: data.title,
        description: data.description,
        number_of_sessions: parseInt(data.number_of_sessions),
        session_duration: parseInt(data.session_duration),
        notes: data.notes
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practitioner-plans"] });
      router.push("/practitioner/plans");
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Failed to create plan");
    }
  });

  const onSubmit = (data: any) => {
    if (!patientId) {
      setError("No patient selected.");
      return;
    }
    createPlanMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl animate-fade-in">
      <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark mb-6">Create Treatment Plan</h1>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl">Plan Details for Patient ID: {patientId}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="title">Therapy Plan Title</Label>
              <Input id="title" placeholder="e.g. 7-Day Panchakarma Detox" {...register("title", { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description" 
                className="flex w-full rounded-md border border-ayur-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ayur-green min-h-[100px]"
                placeholder="Describe the overall goal of the therapy..."
                {...register("description")} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number_of_sessions">Number of Sessions</Label>
                <Input id="number_of_sessions" type="number" defaultValue="5" {...register("number_of_sessions", { required: true, min: 1 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session_duration">Session Duration (mins)</Label>
                <Input id="session_duration" type="number" defaultValue="60" {...register("session_duration", { required: true, min: 15 })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Input id="notes" placeholder="Dietary restrictions, items to bring, etc." {...register("notes")} />
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-4" 
              disabled={createPlanMutation.isPending || !patientId}
            >
              {createPlanMutation.isPending ? "Creating..." : "Create Plan & Generate Sessions"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewTherapyPlanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ayur-muted">Loading plan form...</div>}>
      <NewTherapyPlanContent />
    </Suspense>
  );
}
