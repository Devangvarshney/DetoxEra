"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressRef = useRef<number>(0);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const userRef = useRef(user);
  userRef.current = user;

  const handleBack = useCallback(async () => {
    const currentPath = pathnameRef.current;
    const currentUser = userRef.current;

    // 1. If factsheet modal is open, close it first
    const factsheetOpen = document.querySelector('[data-factsheet-open="true"]');
    if (factsheetOpen) {
      window.dispatchEvent(new CustomEvent("closeFactsheetModal"));
      return;
    }

    // 2. If any general modal is open with a close button
    const modalCloseBtn = document.querySelector<HTMLButtonElement>('[data-close-modal="true"]');
    if (modalCloseBtn) {
      modalCloseBtn.click();
      return;
    }

    // 3. Determine if current page is the main landing or dashboard
    const dashboardPath = currentUser ? `/${currentUser.role}/dashboard` : "/";
    const isRootOrDashboard =
      currentPath === "/" ||
      currentPath === "/login" ||
      currentPath === "/register" ||
      currentPath === "/patient/dashboard" ||
      currentPath === "/practitioner/dashboard";

    // 4. If on any feature page (e.g. /panchakarma reels, therapy, practitioners, requests), return to dashboard
    if (!isRootOrDashboard) {
      router.push(dashboardPath);
      return;
    }

    // 5. If already on the dashboard or root screen, require double-press to exit
    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      try {
        const { App } = await import("@capacitor/app");
        App.exitApp();
      } catch {
        // Fallback if not running in native Capacitor
      }
    } else {
      lastBackPressRef.current = now;
      setShowExitToast(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setShowExitToast(false);
      }, 2000);
    }
  }, [router]);

  useEffect(() => {
    let appListenerHandle: { remove: () => void } | null = null;

    // Capacitor App plugin listener
    async function setupCapacitor() {
      try {
        const { App } = await import("@capacitor/app");
        appListenerHandle = await App.addListener("backButton", () => {
          handleBack();
        });
      } catch {
        // Not in Capacitor environment
      }
    }

    setupCapacitor();

    // Standard document 'backbutton' event (Cordova / Capacitor webview fallback)
    const onDocumentBackButton = (e: Event) => {
      e.preventDefault();
      handleBack();
    };
    document.addEventListener("backbutton", onDocumentBackButton);

    return () => {
      appListenerHandle?.remove();
      document.removeEventListener("backbutton", onDocumentBackButton);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [handleBack]);

  if (!showExitToast) return null;

  return (
    <div
      className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-full bg-stone-900/90 text-white text-xs font-medium shadow-2xl border border-white/15 backdrop-blur-md animate-fade-in pointer-events-none select-none tracking-wide"
      style={{
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      Press back again to exit
    </div>
  );
}
