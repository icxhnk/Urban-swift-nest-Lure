import React from "react";
import { Volume2, VolumeX, Sparkles, Sun, Moon, Radio, Bird, ShieldCheck } from "lucide-react";

interface HeaderProps {
  activeTab: "synthesizer" | "scheduler" | "ai_visualizer" | "advisor" | "tts_announcer" | "field_guide";
  setActiveTab: (tab: "synthesizer" | "scheduler" | "ai_visualizer" | "advisor" | "tts_announcer" | "field_guide") => void;
  isPlaying: boolean;
  isSchedulerArmed: boolean;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onTogglePlay: () => void;
  countdownText: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isPlaying,
  isSchedulerArmed,
  volume,
  onVolumeChange,
  onTogglePlay,
  countdownText,
}) => {
  return (
    <header id="main-header" className="border-b border-slate-800 bg-[#0c111d] text-slate-100 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
            <Bird className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AeroNest Pro
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Apus apus
              </span>
            </div>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">
              Urban Swift Conservation & Bioacoustics
            </p>
          </div>
        </div>

        {/* Status Badge & Master Controls */}
        <div className="flex items-center gap-3">
          {/* Status Pill with Glowing Dot */}
          <div
            id="status-pill"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isPlaying
                ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : isSchedulerArmed
                ? "bg-slate-900 border-slate-700 text-slate-300"
                : "bg-slate-900/60 border-slate-800 text-slate-500"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isPlaying
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse"
                  : isSchedulerArmed
                  ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                  : "bg-slate-600"
              }`}
            />
            <span className="font-mono text-[11px]">
              {isPlaying
                ? "Transmitter Active"
                : isSchedulerArmed
                ? `Solar Armed: ${countdownText || "Awaiting Window"}`
                : "Standby"}
            </span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <button
              id="volume-toggle-btn"
              onClick={() => onVolumeChange(volume > 0 ? 0 : 0.75)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <input
              id="header-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
            <span className="text-xs font-mono text-emerald-400 w-7 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Master Play / Stop Button */}
          <button
            id="master-play-toggle-btn"
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg ${
              isPlaying
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
            }`}
          >
            <Radio className={`w-4 h-4 ${isPlaying ? "animate-spin" : ""}`} />
            <span>{isPlaying ? "System Halt" : "Broadcast Sound"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-800 bg-[#090d16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 py-1.5 scrollbar-none">
          <button
            id="tab-btn-synthesizer"
            onClick={() => setActiveTab("synthesizer")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "synthesizer"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            Bioacoustic Sound Generator
          </button>

          <button
            id="tab-btn-scheduler"
            onClick={() => setActiveTab("scheduler")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "scheduler"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Sun className="w-4 h-4 text-emerald-400" />
            <Moon className="w-4 h-4 text-sky-400 -ml-1" />
            Dawn & Dusk Solar Scheduler
          </button>

          <button
            id="tab-btn-ai-visualizer"
            onClick={() => setActiveTab("ai_visualizer")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "ai_visualizer"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Nest Box Architect (1K-4K)
          </button>

          <button
            id="tab-btn-advisor"
            onClick={() => setActiveTab("advisor")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "advisor"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Bird className="w-4 h-4" />
            Ornithology AI Advisor
          </button>

          <button
            id="tab-btn-tts"
            onClick={() => setActiveTab("tts_announcer")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "tts_announcer"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            TTS Audio Prompts & Notes
          </button>

          <button
            id="tab-btn-guide"
            onClick={() => setActiveTab("field_guide")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "field_guide"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Urban Swift Field Guide
          </button>
        </div>
      </div>
    </header>
  );
};
