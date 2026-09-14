"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  specialization: z.string().min(2, { message: "Specialization is required" }),
  qualification: z.string().min(2, { message: "Qualification is required" }),
  experience: z.string().min(1, { message: "Experience is required" }),
});

type FormData = z.infer<typeof schema>;

export default function PractitionerRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError("");
    try {
      await api.post("/auth/register/practitioner", {
        user_in: {
          email: data.email,
          password: data.password,
          role: "practitioner"
        },
        practitioner_in: {
          name: data.name,
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience,
        }
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card text-center py-10">
          <CardTitle className="text-2xl text-ayur-green mb-2">Registration Successful!</CardTitle>
          <CardDescription>Redirecting you to login...</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-10 relative">
      <div className="absolute inset-0 bg-ayur-accent/5 blur-3xl rounded-full" />
      <Card className="w-full max-w-lg glass-card z-10 animate-slide-up border-ayur-accent/20">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-outfit text-ayur-green-dark">Practitioner Registration</CardTitle>
          <CardDescription>Join AyurSutra as a certified practitioner</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name (with Title)</Label>
              <Input id="name" placeholder="Dr. John Doe" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="doctor@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" placeholder="e.g. Panchakarma" {...register("specialization")} />
              {errors.specialization && <p className="text-xs text-red-500">{errors.specialization.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" placeholder="BAMS, MD" {...register("qualification")} />
                {errors.qualification && <p className="text-xs text-red-500">{errors.qualification.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input id="experience" placeholder="e.g. 10 years" {...register("experience")} />
                {errors.experience && <p className="text-xs text-red-500">{errors.experience.message}</p>}
              </div>
            </div>
            
            <Button type="submit" className="w-full shadow-md bg-ayur-accent hover:bg-ayur-accent-hover text-white" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register as Practitioner"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-ayur-muted">Looking for a patient account? </span>
            <Link href="/register" className="text-ayur-green font-medium hover:underline">Register as Patient</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
