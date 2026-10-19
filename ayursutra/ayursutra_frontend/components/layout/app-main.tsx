"use client";

import { usePathname } from "next/navigation";

export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isReels = pathname?.startsWith("/panchakarma");

  return (
    <main
      className={`min-h-[calc(100vh-4rem)] flex flex-col ${
        isReels ? "pb-0 h-[calc(100dvh-4rem)] overflow-hidden" : "pb-20 lg:pb-0"
      }`}
    >
      {children}
    </main>
  );
}
