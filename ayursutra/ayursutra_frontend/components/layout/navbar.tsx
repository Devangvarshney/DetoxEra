"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Bell, UserCircle, LogOut, Leaf, Sun, Moon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useEffect, useState, useRef } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const patientLinks = [
    { href: "/patient/dashboard", label: "Dashboard" },
    { href: "/panchakarma", label: "Panchakarma Guide" },
    { href: "/patient/practitioners", label: "Practitioners" },
    { href: "/patient/therapy", label: "My Therapies" },
    { href: "/patient/requests", label: "Requests" },
  ];

  const practitionerLinks = [
    { href: "/practitioner/dashboard", label: "Dashboard" },
    { href: "/practitioner/patients", label: "Patients" },
    { href: "/practitioner/requests", label: "Requests" },
    { href: "/practitioner/plans", label: "Plans" },
    { href: "/practitioner/analytics", label: "Analytics" },
  ];

  const navLinks = user?.role === "patient" ? patientLinks : practitionerLinks;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-ayur-border backdrop-blur-md shadow-sm transition-colors duration-300"
      style={{ background: "var(--navbar-bg)" }}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={user ? `/${user.role}/dashboard` : "/"} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-outfit font-bold text-ayur-green-dark tracking-tight">AyurSutra</span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <div className="hidden lg:flex gap-1 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-ayur-muted hover:text-ayur-green hover:bg-ayur-green/8 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg hover:bg-ayur-green/10 transition-colors text-ayur-muted hover:text-ayur-green"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-ayur-accent" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {user ? (
            <>
              <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-ayur-green/8 transition-colors">
                <Bell className="w-5 h-5 text-ayur-muted hover:text-ayur-green transition-colors" />
                {(unreadCount?.count ?? 0) > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                    {unreadCount.count > 9 ? "9+" : unreadCount.count}
                  </span>
                )}
              </Link>
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-ayur-green/10 transition-colors border border-ayur-border/60 hover:border-ayur-green group"
                  aria-label="User profile menu"
                  aria-expanded={profileOpen}
                >
                  <div className="w-8 h-8 rounded-full hero-gradient text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.email ? user.email[0].toUpperCase() : <UserCircle className="w-4 h-4" />}
                  </div>
                  <UserCircle className="w-4 h-4 text-ayur-muted group-hover:text-ayur-green transition-colors sm:block hidden" />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-2xl p-2 z-50 shadow-2xl border border-ayur-border animate-slide-up"
                    style={{
                      background: "var(--surface)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      boxShadow: "0 12px 36px -4px rgba(0,0,0,0.18)",
                    }}
                  >
                    {/* User Info Header */}
                    <div className="px-3 py-2.5 mb-1.5 rounded-xl bg-ayur-green/8 border border-ayur-green/15">
                      <p className="text-xs font-semibold text-ayur-text truncate" title={user.email}>
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-ayur-green/15 text-ayur-green">
                        {user.role}
                      </span>
                    </div>

                    {/* My Profile Link */}
                    <Link
                      href={`/${user.role}/profile`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-ayur-text hover:bg-ayur-green/10 hover:text-ayur-green transition-colors"
                    >
                      <UserCircle className="w-4 h-4 text-ayur-muted" />
                      <span>View Profile</span>
                    </Link>

                    <div className="my-1 border-t border-ayur-border" />

                    {/* Logout Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/panchakarma" className="hidden sm:inline-flex text-sm font-medium text-ayur-green hover:text-ayur-green-dark">
                Panchakarma Guide
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-ayur-green font-medium">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="btn-primary text-white rounded-lg px-4 py-2 text-sm font-semibold bg-ayur-green hover:bg-ayur-green-dark">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
