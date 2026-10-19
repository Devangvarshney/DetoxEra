"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Leaf,
  HeartPulse,
  ClipboardList,
  Users,
  BarChart2,
  Search,
} from "lucide-react";

const patientTabs = [
  {
    href: "/patient/dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    href: "/panchakarma",
    label: "Panchakarma",
    icon: Leaf,
  },
  {
    href: "/patient/practitioners",
    label: "Practitioners",
    icon: Search,
  },
  {
    href: "/patient/therapy",
    label: "Therapies",
    icon: HeartPulse,
  },
  {
    href: "/patient/requests",
    label: "Requests",
    icon: ClipboardList,
  },
];

const practitionerTabs = [
  {
    href: "/practitioner/dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    href: "/practitioner/patients",
    label: "Patients",
    icon: Users,
  },
  {
    href: "/practitioner/requests",
    label: "Requests",
    icon: ClipboardList,
  },
  {
    href: "/practitioner/analytics",
    label: "Analytics",
    icon: BarChart2,
  },
];

export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || pathname?.startsWith("/panchakarma")) return null;

  const tabs = user.role === "patient" ? patientTabs : practitionerTabs;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border-color)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="flex items-center justify-around px-1 py-1 pb-safe">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl min-w-[56px] transition-all duration-200 ${
                isActive
                  ? "text-ayur-green"
                  : "text-ayur-muted hover:text-ayur-green"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-ayur-green/12 scale-110"
                    : "hover:bg-ayur-green/8"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-all ${
                    isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium leading-none transition-all ${
                  isActive ? "font-bold" : ""
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-ayur-green mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
