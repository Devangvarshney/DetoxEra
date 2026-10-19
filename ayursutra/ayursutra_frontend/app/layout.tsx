import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { GoogleProvider } from "@/providers/google-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BackButtonHandler } from "@/components/layout/back-button-handler";
import { AppMain } from "@/components/layout/app-main";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AyurSutra | Ayurvedic Therapy Management",
  description: "Personalized Ayurvedic Care, Connected. Connect with top practitioners and manage your therapies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-ayur-light text-ayur-text`}>
        <ThemeProvider>
          <QueryProvider>
            <GoogleProvider>
              <AuthProvider>
                <BackButtonHandler />
                <Navbar />
                <AppMain>{children}</AppMain>
                <BottomNav />
              </AuthProvider>
            </GoogleProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
