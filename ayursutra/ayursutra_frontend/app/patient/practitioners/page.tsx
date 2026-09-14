"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function PatientPractitionersPage() {
  const [requestedId, setRequestedId] = useState<number | null>(null);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [therapyType, setTherapyType] = useState("General Consultation");

  const PANCHAKARMA_CLASSES = [
    { name: "General Consultation", desc: "Standard Ayurvedic consultation" },
    { name: "Vamana (Emesis)", desc: "Therapeutic vomiting for Kapha disorders (e.g., asthma, chronic cough)" },
    { name: "Virechana (Purgation)", desc: "Therapeutic purgation for Pitta disorders (e.g., jaundice, skin diseases)" },
    { name: "Basti (Enema)", desc: "Herbal enema for Vata disorders (e.g., arthritis, neurological issues)" },
    { name: "Nasya (Nasal Admin)", desc: "Nasal administration of medicated oils for head/neck issues" },
    { name: "Raktamokshana (Bloodletting)", desc: "Therapeutic bloodletting to remove blood-borne toxins" }
  ];

  const { data: practitioners, isLoading } = useQuery({
    queryKey: ["practitioners"],
    queryFn: async () => {
      const res = await api.get("/practitioners");
      return res.data;
    },
  });

  const requestTreatmentMutation = useMutation({
    mutationFn: async (practitionerId: number) => {
      const finalMessage = `Preferred Therapy: ${therapyType}\n\nSymptoms/Details: ${message.trim() || "I would like to request an Ayurvedic consultation."}`;
      const res = await api.post("/treatment-requests", {
        practitioner_id: practitionerId,
        message: finalMessage
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      setRequestedId(variables);
      setSelectedPractitionerId(null);
      setMessage("");
      setTherapyType("General Consultation");
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading practitioners...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-fade-in">
      <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark mb-6">Find a Practitioner</h1>
      
      {practitioners && practitioners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practitioners.map((practitioner: any) => (
            <Card key={practitioner.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-ayur-green-dark">{practitioner.name}</CardTitle>
                <p className="text-sm text-ayur-green">{practitioner.specialization}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-ayur-muted space-y-1">
                  <p><strong>Qualification:</strong> {practitioner.qualification}</p>
                  <p><strong>Experience:</strong> {practitioner.experience}</p>
                </div>
                {selectedPractitionerId === practitioner.id ? (
                  <div className="space-y-3 mt-4 border-t pt-4">
                    <div className="space-y-1">
                      <Label className="text-sm">Preferred Therapy</Label>
                      <select 
                        className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ayur-green"
                        value={therapyType}
                        onChange={(e) => setTherapyType(e.target.value)}
                      >
                        {PANCHAKARMA_CLASSES.map(tc => (
                          <option key={tc.name} value={tc.name} title={tc.desc}>
                            {tc.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-ayur-muted mt-1 italic">
                        {PANCHAKARMA_CLASSES.find(tc => tc.name === therapyType)?.desc}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Describe your symptoms</Label>
                      <textarea 
                        className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ayur-green min-h-[80px]"
                        placeholder="E.g., I have been experiencing chronic back pain..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => requestTreatmentMutation.mutate(practitioner.id)}
                        disabled={requestTreatmentMutation.isPending || !message.trim()}
                      >
                        Send
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => {
                          setSelectedPractitionerId(null);
                          setMessage("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => setSelectedPractitionerId(practitioner.id)}
                    disabled={requestedId === practitioner.id}
                  >
                    {requestedId === practitioner.id ? "Request Sent" : "Request Treatment"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="text-center p-12">
            <p className="text-ayur-muted">No practitioners available at the moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
