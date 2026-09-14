import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AyurSutra | Ayurvedic Therapy Management",
  description: "Personalized Ayurvedic Care, Connected. Connect with top practitioners and manage your therapies.",
};

import { Navbar } from "@/components/layout/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-ayur-light text-ayur-text`}>
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)] flex flex-col">
              {children}
            </main>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
