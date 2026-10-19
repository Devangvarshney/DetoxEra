"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PANCHAKARMA_THERAPIES } from "@/lib/data/panchakarma";
import { 
  Calendar, Activity, Bell, MessageCircle, BarChart2, 
  Leaf, Shield, Users, Star, ArrowRight, CheckCircle,
  Heart, Zap, Clock, Award
} from "lucide-react";

const STATS = [
  { value: "5", label: "Classical Panchakarmas" },
  { value: "100%", label: "Standardized Care" },
  { value: "24/7", label: "Automated Precautions" },
  { value: "All-India", label: "Hospitals & Doctors" },
];

const FEATURES = [
  {
    icon: Calendar,
    title: "Smart Therapy Scheduling",
    description: "Automated therapy scheduling with conflict detection ensures your Panchakarma sessions are timed and chronologically ordered.",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: Bell,
    title: "Pre & Post Procedure Precautions",
    description: "Receive automated alerts for preparatory oleation/fomentation and post-procedure dietary and lifestyle restrictions.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: Activity,
    title: "Recovery Milestones Tracking",
    description: "Track clinical recovery milestones across each stage of your treatment with progress indicators and status updates.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: Award,
    title: "Session Feedback & Quality",
    description: "Submit granular post-session feedback with improvement ratings and symptom logs to ensure therapy consistency.",
    color: "bg-purple-50 text-purple-700",
  },
  {
    icon: Users,
    title: "City-Based Doctor Discovery",
    description: "Find verified Ayurvedic practitioners and Panchakarma hospitals near your city with interactive simulated maps.",
    color: "bg-teal-50 text-teal-700",
  },
  {
    icon: Leaf,
    title: "Panchakarma Encyclopedia",
    description: "Comprehensive factsheets on Vamana, Virechana, Basti, Nasya, and Raktamokshana with indications and 3-stage protocols.",
    color: "bg-rose-50 text-rose-700",
  },
];

const THERAPIES = [
  { name: "Vamana", emoji: "🌿", desc: "Kapha detox" },
  { name: "Virechana", emoji: "🔥", desc: "Pitta cleanse" },
  { name: "Basti", emoji: "💧", desc: "Vata balance" },
  { name: "Nasya", emoji: "🌬️", desc: "Nasal therapy" },
  { name: "Shirodhara", emoji: "🕊️", desc: "Mind calm" },
  { name: "Abhyanga", emoji: "✨", desc: "Oil massage" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Select Your City", desc: "Browse verified Ayurvedic doctors and hospitals located in your city or region." },
  { step: "02", title: "Request Treatment", desc: "Submit your preferred therapy (Vamana, Virechana, Basti, etc.) and describe your symptoms." },
  { step: "03", title: "Personalized Therapy Plan", desc: "Your practitioner formulates a customized multi-session Panchakarma plan with dates and precautions." },
  { step: "04", title: "Follow Precautions & Recover", desc: "Receive automated pre/post alerts, attend supervised sessions, and achieve complete recovery." },
];

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ayur-green-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-ayur-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-white/80 text-sm font-medium">Loading AyurSutra...</p>
        </div>
      </div>
    );
  }
  if (user) return null;

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="hero-gradient relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full border border-white/8 top-[-100px] right-[-100px] animate-spin-slow" />
          <div className="absolute w-[320px] h-[320px] rounded-full border border-white/6 top-[50px] right-[50px] animate-spin-slow" style={{animationDirection:'reverse', animationDuration:'12s'}} />
          <div className="absolute w-96 h-96 rounded-full bg-ayur-accent/5 bottom-[-80px] left-[-80px]" />
          <div className="absolute w-64 h-64 rounded-full bg-white/4 bottom-[80px] right-[200px]" />
        </div>

        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/80 text-sm font-medium mb-8 animate-fade-in">
              <Leaf className="w-4 h-4 text-ayur-accent" />
              Ministry of Ayush — MedTech Solution 2024
            </div>

            <h1 className="text-5xl md:text-7xl font-outfit font-bold text-white mb-6 leading-tight animate-slide-up">
              Ancient Wisdom,
              <br />
              <span className="gradient-text-gold">Modern Care</span>
            </h1>

            <p className="text-xl text-white/75 mb-10 max-w-2xl leading-relaxed animate-slide-up delay-100">
              AyurSutra digitizes Panchakarma therapy management — from dosha assessment and automated scheduling to real-time health tracking and personalized recovery milestones.
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up delay-200">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-ayur-accent text-white font-semibold text-lg transition-all hover:bg-ayur-accent-hover hover:scale-105 shadow-lg shadow-ayur-accent/30"
              >
                Begin Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold text-lg border border-white/20 transition-all hover:bg-white/20 backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-12 animate-slide-up delay-300">
              {[
                { icon: Shield, text: "HIPAA-style Privacy" },
                { icon: Award, text: "Authentic Panchakarma" },
                { icon: CheckCircle, text: "Certified Practitioners" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-white/60 text-sm">
                  <badge.icon className="w-4 h-4 text-ayur-accent" />
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating therapy cards */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 space-y-3 animate-float">
          {THERAPIES.slice(0,3).map((t, i) => (
            <div
              key={t.name}
              className="glass-card-dark rounded-2xl px-5 py-3 flex items-center gap-3 min-w-[180px]"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-white/50 text-xs">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="bg-white border-b border-ayur-border">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-outfit font-bold gradient-text">{stat.value}</p>
                <p className="text-ayur-muted text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="section-gradient py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ayur-green/10 text-ayur-green text-sm font-medium mb-4">
              <Zap className="w-4 h-4" /> Platform Features
            </div>
            <h2 className="section-title mb-4">Everything You Need for Holistic Care</h2>
            <p className="text-ayur-muted max-w-2xl mx-auto text-lg">
              A comprehensive digital platform that bridges traditional Ayurvedic wisdom with modern healthcare efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-6 interactive-hover animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-outfit font-semibold text-ayur-green-dark text-lg mb-2">{feature.title}</h3>
                <p className="text-ayur-muted text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── The 5 Main Panchakarma Therapies (Showcase Cards) ─── */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ayur-green/10 text-ayur-green text-xs font-semibold uppercase tracking-wider mb-4">
                <Leaf className="w-3.5 h-3.5" /> Shodhana Chikitsa
              </div>
              <h2 className="section-title mb-4">
                The 5 Main Panchakarma Therapies
              </h2>
              <p className="text-ayur-muted text-base leading-relaxed">
                Classical Ayurveda uses five targeted elimination procedures to purge deep-rooted toxins (Ama), pacify vitiated doshas, and restore cellular equilibrium.
              </p>
            </div>

            <Link
              href="/panchakarma"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ayur-green hover:text-ayur-green-dark border-b-2 border-ayur-green pb-0.5 self-start md:self-auto transition-colors"
            >
              <span>Explore Complete Encyclopedia & Protocols</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 5 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PANCHAKARMA_THERAPIES.map((therapy, i) => (
              <div
                key={therapy.id}
                className="rounded-3xl border border-ayur-border/80 bg-white overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col group interactive-hover"
              >
                {/* Therapy Image */}
                <div className="relative h-56 w-full overflow-hidden bg-ayur-green-dark">
                  <Image
                    src={therapy.image}
                    alt={therapy.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center justify-center border border-white/25">
                      0{i + 1}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border ${therapy.badgeBg}`}>
                      {therapy.dosha}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-outfit font-bold">{therapy.name}</h3>
                      <span className="text-ayur-accent text-xs font-serif">{therapy.sanskrit}</span>
                    </div>
                    <p className="text-white/75 text-[11px]">{therapy.meaning}</p>
                  </div>
                </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-ayur-muted text-xs leading-relaxed line-clamp-3">
                      {therapy.clinicalExplanation}
                    </p>

                    {/* YouTube Shorts Video Iframe for Vamana */}
                    {therapy.videoEmbedUrl && (
                      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-2.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold">▶</span>
                            Procedure Demonstration
                          </span>
                          <a
                            href={therapy.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-red-600 font-bold hover:underline"
                          >
                            YouTube Short ↗
                          </a>
                        </div>
                        <div className="relative w-full max-w-[220px] mx-auto aspect-[9/16] rounded-xl overflow-hidden shadow-md bg-black">
                          {therapy.videoEmbedUrl.startsWith("/") ? (
                            <video
                              src={therapy.videoEmbedUrl}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              loop
                              controls
                            />
                          ) : (
                            <iframe
                              src={therapy.videoEmbedUrl.includes("?")
                                ? `${therapy.videoEmbedUrl}&mute=1`
                                : `${therapy.videoEmbedUrl}?mute=1`}
                              title={`${therapy.name} Demonstration`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          )}
                        </div>
                      </div>
                    )}

                  {/* Key highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-ayur-border/60">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ayur-green-dark">
                      Recommended For:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {therapy.indications.slice(0, 3).map((ind) => (
                        <span
                          key={ind}
                          className="px-2 py-0.5 rounded-md bg-ayur-light text-[11px] text-ayur-muted font-medium border border-ayur-border/60"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-ayur-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-ayur-muted font-medium">
                      Duration: {therapy.duration.split("(")[0]}
                    </span>
                    <Link
                      href="/panchakarma"
                      className="inline-flex items-center gap-1 text-xs font-bold text-ayur-green hover:text-ayur-accent transition-colors"
                    >
                      <span>Full Factsheet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* 6th Card: Interactive Dosha & Guide Promo */}
            <div className="rounded-3xl hero-gradient p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-ayur-accent/20 blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Leaf className="w-6 h-6 text-ayur-accent" />
                </div>
                <h3 className="text-2xl font-outfit font-bold">
                  Personalized Panchakarma Protocol
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Discover which of these 5 therapies matches your unique constitution (Prakriti) and current health conditions.
                </p>
              </div>

              <div className="relative z-10 pt-6 space-y-3">
                <Link
                  href="/panchakarma"
                  className="w-full py-3 rounded-xl bg-ayur-accent hover:bg-ayur-accent-hover text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Explore Encyclopedia</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all border border-white/20 flex items-center justify-center gap-2"
                >
                  Create Patient Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="section-gradient py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="section-title mb-3">How AyurSutra Works</h2>
            <p className="text-ayur-muted max-w-xl mx-auto">Your journey from registration to recovery in four simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-0.5 bg-gradient-to-r from-ayur-green/20 via-ayur-accent/30 to-ayur-green/20 z-0" />
            
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative z-10 text-center animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-ayur-green/20">
                  <span className="text-white font-outfit font-bold text-lg">{step.step}</span>
                </div>
                <h3 className="font-outfit font-semibold text-ayur-green-dark text-base mb-2">{step.title}</h3>
                <p className="text-ayur-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-outfit font-bold text-white mb-4">
              Start Your Panchakarma Journey Today
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Join patients and practitioners who are transforming Ayurvedic care with AyurSutra.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register?role=patient" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-ayur-accent text-white font-semibold text-base transition-all hover:bg-ayur-accent-hover hover:scale-105 shadow-lg">
                <Users className="w-5 h-5" /> Register as Patient
              </Link>
              <Link href="/register?role=practitioner" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/15 text-white font-semibold text-base border border-white/20 transition-all hover:bg-white/25 backdrop-blur-sm">
                <Heart className="w-5 h-5" /> Join as Practitioner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-ayur-green-dark py-10 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-white font-outfit font-bold text-xl">AyurSutra</p>
              <p className="text-white/50 text-sm mt-1">Panchakarma Patient Management Software</p>
            </div>
            <p className="text-white/40 text-sm">
              Ministry of Ayush · Problem Statement ID: 25023 · © 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
