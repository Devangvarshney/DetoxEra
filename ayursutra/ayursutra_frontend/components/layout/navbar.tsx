"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Bell, UserCircle, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useEffect, useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: async () => {
      if (!user) return { count: 0 };
      const res = await api.get("/notifications/unread-count");
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-ayur-border bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={user ? `/${user.role}/dashboard` : "/"} className="flex items-center gap-2">
          <span className="text-2xl font-outfit font-bold text-ayur-green-dark tracking-tight">AyurSutra</span>
        </Link>
        
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <div className="hidden md:flex gap-4 items-center mr-4">
                <Link href={`/${user.role}/dashboard`} className="text-sm font-medium hover:text-ayur-green transition-colors">Dashboard</Link>
                {user.role === "patient" ? (
                  <>
                    <Link href="/patient/practitioners" className="text-sm font-medium hover:text-ayur-green transition-colors">Practitioners</Link>
                    <Link href="/patient/requests" className="text-sm font-medium hover:text-ayur-green transition-colors">Requests</Link>
                    <Link href="/patient/therapy" className="text-sm font-medium hover:text-ayur-green transition-colors">Therapy</Link>
                  </>
                ) : (
                  <>
                    <Link href="/practitioner/patients" className="text-sm font-medium hover:text-ayur-green transition-colors">Patients</Link>
                    <Link href="/practitioner/requests" className="text-sm font-medium hover:text-ayur-green transition-colors">Requests</Link>
                    <Link href="/practitioner/plans" className="text-sm font-medium hover:text-ayur-green transition-colors">Plans</Link>
                  </>
                )}
              </div>
              
              <Link href="/notifications" className="relative">
                <Bell className="w-5 h-5 text-ayur-text hover:text-ayur-green transition-colors" />
                {unreadCount?.count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {unreadCount.count}
                  </span>
                )}
              </Link>
              <Link href={`/${user.role}/profile`}>
                <UserCircle className="w-5 h-5 text-ayur-text hover:text-ayur-green transition-colors" />
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-ayur-muted hover:text-red-500">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
