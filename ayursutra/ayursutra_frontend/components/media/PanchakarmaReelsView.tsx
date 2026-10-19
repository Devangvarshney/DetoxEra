"use client";

import { useState, useRef, useEffect } from "react";
import { PanchakarmaTherapy } from "@/lib/data/panchakarma";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  FileText, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ArrowRight,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

interface PanchakarmaReelsViewProps {
  therapies: PanchakarmaTherapy[];
  initialTherapyId?: string;
  onExitReels?: () => void;
}

export function PanchakarmaReelsView({
  therapies,
  initialTherapyId,
  onExitReels,
}: PanchakarmaReelsViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeFactsheet, setActiveFactsheet] = useState<PanchakarmaTherapy | null>(null);
  const [showPlayIcon, setShowPlayIcon] = useState<boolean>(false);

  // Close factsheet when back button is pressed
  useEffect(() => {
    const handleCloseModal = () => {
      setActiveFactsheet(null);
    };
    window.addEventListener("closeFactsheetModal", handleCloseModal);
    return () => window.removeEventListener("closeFactsheetModal", handleCloseModal);
  }, []);

  // Initialize index if initialTherapyId is provided
  useEffect(() => {
    if (initialTherapyId) {
      const idx = therapies.findIndex((t) => t.id === initialTherapyId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setTimeout(() => {
          scrollToReel(idx);
        }, 150);
      }
    }
  }, [initialTherapyId, therapies]);

  // Scroll to specific reel
  const scrollToReel = (index: number) => {
    if (containerRef.current) {
      const targetSlide = containerRef.current.children[index] as HTMLElement;
      if (targetSlide) {
        targetSlide.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // IntersectionObserver to detect currently active reel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index) && index !== currentIndex) {
              setCurrentIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.65, // At least 65% of the slide is visible
      }
    );

    Array.from(container.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [currentIndex]);

  // Play/Pause active video when currentIndex changes or factsheet opens
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === currentIndex && !activeFactsheet) {
        video.muted = isMuted;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Autoplay policy fallback: keep muted
              video.muted = true;
              setIsMuted(true);
              video.play().catch(() => {});
            });
        }
      } else {
        video.pause();
        // Reset non-active videos slightly to preserve memory
        video.currentTime = 0;
      }
    });
  }, [currentIndex, isMuted, activeFactsheet]);

  // Toggle Play/Pause on single tap on video
  const handleTogglePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 700);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.muted = nextMuted;
    }
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden select-none">
      {/* ─── Top Floating Utility Bar (Mute Audio) ─── */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={handleToggleMute}
          className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
          title={isMuted ? "Tap to Unmute" : "Mute Video"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-amber-300" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-400" />
          )}
        </button>
      </div>

      {/* ─── Vertical Snap Scroll Reels Container ─── */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {therapies.map((therapy, index) => {
          const isThisActive = index === currentIndex;

          return (
            <div
              key={therapy.id}
              data-index={index}
              className="relative w-full max-w-[480px] mx-auto h-full snap-start snap-always shrink-0 bg-black flex items-center justify-center overflow-hidden"
              onClick={() => handleTogglePlay(index)}
            >
              {/* Real Video Element */}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={therapy.videoUrl}
                poster={therapy.image}
                playsInline
                loop
                muted={isMuted}
                preload={Math.abs(index - currentIndex) <= 1 ? "auto" : "none"}
                className="w-full h-full object-cover sm:object-contain bg-black pointer-events-none"
              />

              {/* Play/Pause Animated Feedback Indicator */}
              {isThisActive && showPlayIcon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-scale-in">
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl">
                    {isPlaying ? (
                      <Play className="w-8 h-8 fill-white ml-1" />
                    ) : (
                      <Pause className="w-8 h-8 fill-white" />
                    )}
                  </div>
                </div>
              )}

              {/* ─── Top Left Corner: Name of Therapy ─── */}
              <div className="absolute top-0 left-0 right-16 p-5 pt-7 z-20 pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm">
                    {therapy.dosha}
                  </span>
                  <span className="text-white/80 text-xs font-serif italic drop-shadow-sm">
                    {therapy.sanskrit}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-outfit font-extrabold text-white tracking-tight drop-shadow-md">
                  {therapy.name}
                </h2>
                <p className="text-white/80 text-xs font-medium line-clamp-1 drop-shadow-sm mt-0.5">
                  {therapy.meaning}
                </p>
              </div>

              {/* ─── Bottom Right Corner: Only Full Factsheet Button ─── */}
              <div className="absolute bottom-6 right-5 z-20 flex items-center justify-end pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFactsheet(therapy);
                  }}
                  className="group relative px-5 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-outfit font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-2xl border border-emerald-300/40 backdrop-blur-md active:scale-95 transition-all duration-200"
                  title={`Open Full Factsheet for ${therapy.name}`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
                  </span>
                  <FileText className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wide">Full Factsheet</span>
                </button>
              </div>

              {/* Subtle Scroll Hint on First Reel */}
              {index === 0 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 text-white/70 text-[11px] font-medium flex items-center gap-1.5 pointer-events-none animate-bounce px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                  <span>Swipe up for next reel</span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Over-the-Video Full Factsheet Modal / Bottom Sheet ─── */}
      {activeFactsheet && (
        <div 
          data-factsheet-open="true"
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex flex-col justify-end items-center animate-fade-in"
          onClick={() => setActiveFactsheet(null)}
        >
          <div 
            className="w-full max-w-[480px] max-h-[88vh] bg-stone-950 text-white rounded-t-3xl border-t border-emerald-500/40 shadow-2xl p-6 pb-12 overflow-y-auto space-y-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto -mt-2 mb-2" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${activeFactsheet.badgeBg}`}>
                    {activeFactsheet.dosha}
                  </span>
                  <span className="text-emerald-400 text-xs font-serif">{activeFactsheet.sanskrit}</span>
                </div>
                <h3 className="text-2xl font-outfit font-extrabold text-white">
                  {activeFactsheet.name}
                </h3>
                <p className="text-white/60 text-xs mt-0.5">{activeFactsheet.meaning}</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveFactsheet(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/15 shrink-0"
                title="Close Factsheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Classical Description */}
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Classical Medical Overview
              </h4>
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                {activeFactsheet.clinicalExplanation}
              </p>
            </div>

            {/* The 3 Classical Stages (Purva, Pradhana, Paschat) */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                The Three Classical Stages (Kriyas)
              </h4>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-xs">
                <p className="font-bold text-emerald-300">Stage 1: Purvakarma (Preparation & Oleation)</p>
                <p className="text-white/70 leading-relaxed">{activeFactsheet.purvakarma}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-xs">
                <p className="font-bold text-emerald-300">Stage 2: Pradhanakarma (Therapeutic Elimination)</p>
                <p className="text-white/70 leading-relaxed">{activeFactsheet.pradhanakarma}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-xs">
                <p className="font-bold text-emerald-300">Stage 3: Paschatkarma (Dietary & Restorative Regimen)</p>
                <p className="text-white/70 leading-relaxed">{activeFactsheet.paschatkarma}</p>
              </div>
            </div>

            {/* Subtypes (e.g. Basti Anuvasana/Niruha) */}
            {activeFactsheet.types && activeFactsheet.types.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 space-y-2 text-xs">
                <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                  Classical Modalities & Types
                </p>
                {activeFactsheet.types.map((type) => (
                  <div key={type.name} className="space-y-0.5">
                    <span className="font-bold text-amber-200">{type.name}: </span>
                    <span className="text-white/80">{type.desc}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Key Benefits */}
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Key Therapeutic Benefits
              </h4>
              <ul className="space-y-2">
                {activeFactsheet.keyBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Indications Tags */}
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Target Conditions & Indications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeFactsheet.indications.map((ind) => (
                  <span
                    key={ind}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-200 font-medium"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            {/* Duration & Consultation CTA */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-white/60 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Duration: <strong className="text-white">{activeFactsheet.duration}</strong></span>
              </div>

              <Link
                href="/patient/practitioners"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>Find Certified Practitioners</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
