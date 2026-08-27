import React, { useState } from "react";
import { playPcmAudio } from "../lib/pcmPlayer";
import {
  Volume2,
  Play,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Mic,
  Radio,
  FileAudio,
} from "lucide-react";

const TTS_PRESETS = [
  {
    title: "System Armed Announcement",
    text: "Urban swift attraction broadcast system is armed. Solar dawn and dusk schedule is actively tracking local twilight times.",
  },
  {
    title: "Speaker Calibration & Decibel Check",
    text: "Acoustic caller speaker output calibrated. Bioacoustic frequency filter engaged at 5 to 8 kilohertz. Volume set to safe urban ambient levels.",
  },
  {
    title: "Nest Box Siting & Banger Guide",
    text: "Swifts prospecting for new nests will investigate entrance holes between 6 AM and 9 AM. Keep clear aerial drop lines below the boxes.",
  },
  {
    title: "Neighborhood Biodiversity Notice",
    text: "Notice: This building hosts an artificial swift nesting colony. Calls are played at natural colony volume during dawn and dusk to restore urban swift populations.",
  },
];

export const TtsAudioGuide: React.FC = () => {
  const [text, setText] = useState<string>(TTS_PRESETS[0].text);
  const [voice, setVoice] = useState<string>("Kore");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedAudio, setLastGeneratedAudio] = useState<string | null>(null);

  const handleGenerateAndPlay = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate TTS audio.");
      }

      setLastGeneratedAudio(data.audio);
      setIsLoading(false);

      // Play audio via PCM player
      setIsPlayingAudio(true);
      await playPcmAudio(data.audio, data.sampleRate || 24000);
      setIsPlayingAudio(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "TTS generation failed.");
      setIsLoading(false);
      setIsPlayingAudio(false);
    }
  };

  const handleReplay = async () => {
    if (!lastGeneratedAudio || isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await playPcmAudio(lastGeneratedAudio, 24000);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div id="tts-audio-guide-panel" className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 text-slate-100 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            TTS Engine (gemini-3.1-flash-tts-preview)
          </span>
        </div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Text-to-Speech Spoken Prompts & Audio Field Notes
        </h2>
        <p className="text-xs text-slate-400 max-w-2xl mt-1">
          Generate natural human voice alerts, field installation walkthroughs, and audio logs for the swift attraction system using high-fidelity prebuilt voices.
        </p>
      </div>

      {/* Main Generator Form */}
      <div className="bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm space-y-4">
        <div>
          <label htmlFor="tts-text-input" className="block text-xs font-semibold text-slate-200 mb-1.5">
            Spoken Script / Announcement Prompt:
          </label>
          <textarea
            id="tts-text-input"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type text to synthesize into spoken audio..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-950 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-100 placeholder-slate-500"
          />
        </div>

        {/* Preset Cards */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Preset Voice Scripts:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TTS_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                id={`tts-preset-btn-${idx}`}
                onClick={() => setText(preset.text)}
                className="text-left p-2.5 rounded-lg border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 bg-slate-950/60 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-200 mb-0.5">
                  {preset.title}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {preset.text}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Controls & Voice Selection */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="tts-voice-select" className="text-xs font-semibold text-slate-300">
              Voice Persona:
            </label>
            <select
              id="tts-voice-select"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 font-medium text-slate-200 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Kore" className="bg-slate-900 text-slate-200">Kore (Clear & Natural)</option>
              <option value="Fenrir" className="bg-slate-900 text-slate-200">Fenrir (Authoritative & Deep)</option>
              <option value="Puck" className="bg-slate-900 text-slate-200">Puck (Energetic & Crisp)</option>
              <option value="Charon" className="bg-slate-900 text-slate-200">Charon (Calm & Low)</option>
              <option value="Zephyr" className="bg-slate-900 text-slate-200">Zephyr (Warm & Conversational)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {lastGeneratedAudio && (
              <button
                id="tts-replay-btn"
                onClick={handleReplay}
                disabled={isPlayingAudio}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <FileAudio className="w-3.5 h-3.5" />
                <span>{isPlayingAudio ? "Playing..." : "Replay Audio"}</span>
              </button>
            )}

            <button
              id="tts-generate-submit-btn"
              onClick={handleGenerateAndPlay}
              disabled={isLoading || isPlayingAudio || !text.trim()}
              className="px-6 py-2 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Speech...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Synthesize & Play Speech</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
