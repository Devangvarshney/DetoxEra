"use client";

import { useState, useRef } from "react";
import { 
  Play, 
  Pause, 
  Maximize, 
  Maximize2, 
  ExternalLink, 
  X, 
  Volume2, 
  VolumeX,
  Sparkles,
  Film
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TherapyVideoPlayerProps {
  videoUrl: string;
  title: string;
  posterImage?: string;
  compact?: boolean;
}

export function TherapyVideoPlayer({
  videoUrl,
  title,
  posterImage,
  compact = false,
}: TherapyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNativeFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      }
    }
  };

  const handleModalNativeFullscreen = () => {
    if (modalVideoRef.current) {
      if (modalVideoRef.current.requestFullscreen) {
        modalVideoRef.current.requestFullscreen();
      } else if ((modalVideoRef.current as any).webkitRequestFullscreen) {
        (modalVideoRef.current as any).webkitRequestFullscreen();
      }
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-3 md:p-4 shadow-sm space-y-3">
      {/* Header with Title and Fullscreen actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
            <Film className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-900 block leading-tight">
              Clinical Procedure Video
            </span>
            <span className="text-[10px] text-gray-500">Real Panchakarma Demonstration</span>
          </div>
        </div>

        {/* Action Buttons: Native Fullscreen, Cinema Modal & Link to Real Full Video */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleNativeFullscreen}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs"
            title="Open in Native Full Screen"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Full Screen</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs"
            title="Open Cinema Popout Modal"
          >
            <Maximize className="w-3 h-3" />
            <span className="hidden sm:inline">Cinema</span>
          </button>

          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs"
            title="Open direct real full video file in new tab"
          >
            <ExternalLink className="w-3 h-3 text-emerald-700" />
            <span>Real File ↗</span>
          </a>
        </div>
      </div>

      {/* Embedded HTML5 Video Player */}
      <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video max-h-[360px] shadow-inner group flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterImage}
          controls
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Footer bar with direct file link */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-emerald-100/60">
        <span className="truncate">Source: Original AyurSutra Clinical Video</span>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 font-bold hover:underline shrink-0 flex items-center gap-1"
        >
          <span>Open Full Video</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* ─── Immersive Full Screen Modal Player ─── */}
      {isModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-scale-in"
        >
          {/* Top modal bar */}
          <div className="w-full max-w-4xl flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
                Full Screen View
              </span>
              <h3 className="font-outfit font-bold text-base md:text-lg">{title}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleModalNativeFullscreen}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-colors"
                title="Expand to monitor full screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Monitor Fullscreen</span>
              </button>

              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Open real full video file in browser"
              >
                <span>Real Full Video</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20"
                title="Close Full Screen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Large Cinema Video */}
          <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
            <video
              ref={modalVideoRef}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Modal bottom info */}
          <div className="w-full max-w-4xl pt-3 flex items-center justify-between text-xs text-white/60">
            <span>Click outside or press X to exit full screen view.</span>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Direct Link: {videoUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
