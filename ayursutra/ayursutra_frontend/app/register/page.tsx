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
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  age: z.coerce.number().min(1, { message: "Age is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
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
      await api.post("/auth/register", {
        user_in: {
          email: data.email,
          password: data.password,
          role: "patient"
        },
        patient_in: {
          name: data.name,
          phone: data.phone,
          age: data.age,
          gender: data.gender,
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
      <div className="absolute inset-0 bg-ayur-green/5 blur-3xl rounded-full" />
      <Card className="w-full max-w-lg glass-card z-10 animate-slide-up">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-outfit text-ayur-green-dark">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started with AyurSutra</CardDescription>
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
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+1234567890" {...register("phone")} />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" {...register("age")} />
                {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select 
                id="gender" 
                className="flex h-10 w-full rounded-md border border-ayur-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ayur-green"
                {...register("gender")}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
            </div>
            
            <Button type="submit" className="w-full shadow-md" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm flex flex-col gap-2">
            <div>
              <span className="text-ayur-muted">Already have an account? </span>
              <Link href="/login" className="text-ayur-green font-medium hover:underline">Sign in</Link>
            </div>
            <div>
              <span className="text-ayur-muted">Are you a doctor? </span>
              <Link href="/register/practitioner" className="text-ayur-accent font-medium hover:underline">Register as Practitioner</Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
