import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { AudioSynthesizer } from "./components/AudioSynthesizer";
import { DawnDuskScheduler } from "./components/DawnDuskScheduler";
import { AiNestBoxVisualizer } from "./components/AiNestBoxVisualizer";
import { AiOrnithologyChat } from "./components/AiOrnithologyChat";
import { TtsAudioGuide } from "./components/TtsAudioGuide";
import { FieldGuide } from "./components/FieldGuide";
import { SwiftCallPresetId, BroadcastLogItem } from "./types";
import { swiftAudioEngine, SWIFT_PRESETS } from "./lib/swiftAudioEngine";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "synthesizer" | "scheduler" | "ai_visualizer" | "advisor" | "tts_announcer" | "field_guide"
  >("synthesizer");

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSchedulerArmed, setIsSchedulerArmed] = useState<boolean>(true);
  const [selectedPreset, setSelectedPreset] = useState<SwiftCallPresetId>("screaming_party");
  const [volume, setVolume] = useState<number>(0.75);
  const [logs, setLogs] = useState<BroadcastLogItem[]>([]);

  // Sync audio engine volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    swiftAudioEngine.setVolume(newVol);
  };

  // Sync Master Play / Stop
  const handleTogglePlay = () => {
    if (isPlaying) {
      swiftAudioEngine.stop();
      setIsPlaying(false);
      logEvent("broadcast_ended", "manual");
    } else {
      swiftAudioEngine.start();
      setIsPlaying(true);
      logEvent("broadcast_started", "manual");
    }
  };

  const handleStartBroadcast = (windowType: "dawn" | "dusk" | "manual" | "test") => {
    swiftAudioEngine.start();
    setIsPlaying(true);
    logEvent("broadcast_started", windowType);
  };

  const handleStopBroadcast = () => {
    swiftAudioEngine.stop();
    setIsPlaying(false);
    logEvent("broadcast_ended", "manual");
  };

  const logEvent = (
    event: "broadcast_started" | "broadcast_ended" | "scheduled_trigger" | "manual_trigger" | "test_played",
    windowType: "dawn" | "dusk" | "manual" | "test"
  ) => {
    const newLog: BroadcastLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      event,
      windowType,
      preset: SWIFT_PRESETS[selectedPreset]?.name || selectedPreset,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Sync Preset
  const handleSelectPreset = (id: SwiftCallPresetId) => {
    setSelectedPreset(id);
    swiftAudioEngine.setPreset(SWIFT_PRESETS[id]);
  };

  return (
    <div id="swift-acoustic-lure-app" className="min-h-screen bg-[#0c111d] text-slate-200 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPlaying={isPlaying}
        isSchedulerArmed={isSchedulerArmed}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        onTogglePlay={handleTogglePlay}
        countdownText={isPlaying ? "Broadcasting" : isSchedulerArmed ? "Solar Armed" : "Standby"}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === "synthesizer" && (
          <AudioSynthesizer
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            selectedPreset={selectedPreset}
            onSelectPreset={handleSelectPreset}
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        )}

        {activeTab === "scheduler" && (
          <DawnDuskScheduler
            isPlaying={isPlaying}
            onStartBroadcast={handleStartBroadcast}
            onStopBroadcast={handleStopBroadcast}
            selectedPreset={selectedPreset}
            logs={logs}
            isSchedulerArmed={isSchedulerArmed}
            setIsSchedulerArmed={setIsSchedulerArmed}
          />
        )}

        {activeTab === "ai_visualizer" && <AiNestBoxVisualizer />}

        {activeTab === "advisor" && <AiOrnithologyChat />}

        {activeTab === "tts_announcer" && <TtsAudioGuide />}

        {activeTab === "field_guide" && <FieldGuide />}
      </main>

      {/* Sleek Interface Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080c14] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-300">AeroNest Pro • ApusAcoustics</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="font-mono text-[11px] text-slate-400">Transmitter: 4.8 - 8.2 kHz Bandpass</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="font-mono text-[11px] text-slate-400">Solar Twilight Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
              System Telemetry Online
            </div>
            <span className="text-[11px] text-slate-500 font-mono">v2.4.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
