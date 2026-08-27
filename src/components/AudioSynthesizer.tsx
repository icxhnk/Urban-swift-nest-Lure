import React, { useEffect, useRef, useState } from "react";
import {
  SwiftCallPreset,
  SwiftCallPresetId,
} from "../types";
import { SWIFT_PRESETS, swiftAudioEngine } from "../lib/swiftAudioEngine";
import {
  Play,
  Square,
  Volume2,
  Sliders,
  Activity,
  Upload,
  Radio,
  Sparkles,
  Info,
  Clock,
  Waves,
  Zap,
} from "lucide-react";

interface AudioSynthesizerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  selectedPreset: SwiftCallPresetId;
  onSelectPreset: (id: SwiftCallPresetId) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const AudioSynthesizer: React.FC<AudioSynthesizerProps> = ({
  isPlaying,
  onTogglePlay,
  selectedPreset,
  onSelectPreset,
  volume,
  onVolumeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<"frequency" | "waveform">("frequency");
  const [engineState, setEngineState] = useState<{
    isPlaying: boolean;
    isBurstActive: boolean;
    activeSecondsRemaining: number;
  }>({
    isPlaying: false,
    isBurstActive: true,
    activeSecondsRemaining: 0,
  });

  const [soundSource, setSoundSource] = useState<"synthesizer" | "custom_audio">("synthesizer");
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [customFileError, setCustomFileError] = useState<string | null>(null);
  const [isTestingChirp, setIsTestingChirp] = useState(false);

  // Subscribe to audio engine state
  useEffect(() => {
    swiftAudioEngine.setOnStateChange((state) => {
      setEngineState(state);
    });
  }, []);

  // Handle Preset change
  const handlePresetSelect = (id: SwiftCallPresetId) => {
    onSelectPreset(id);
    swiftAudioEngine.setPreset(SWIFT_PRESETS[id]);
  };

  // Handle Test Chirp
  const handleTestChirp = async () => {
    if (isTestingChirp) return;
    setIsTestingChirp(true);
    await swiftAudioEngine.playTestChirp();
    setIsTestingChirp(false);
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCustomFileError(null);
      const msg = await swiftAudioEngine.loadCustomAudioFile(file);
      setCustomFileName(file.name);
      setSoundSource("custom_audio");
    } catch (err: any) {
      setCustomFileError(err.message || "Failed to decode audio file.");
    }
  };

  // Visualizer Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const analyser = swiftAudioEngine.getAnalyser();

      // Ensure canvas matches resolution
      const width = canvas.width;
      const height = canvas.height;

      // Sleek Dark Canvas background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, width, height);

      // Subtle Grid lines
      ctx.strokeStyle = "#131b2e";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 30) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      if (!analyser || !engineState.isPlaying) {
        // Draw idle baseline
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        ctx.fillStyle = "#64748b";
        ctx.font = "11px ui-monospace, monospace";
        ctx.fillText("Awaiting Audio Broadcast • Swift Syrinx Filter: 3.5kHz - 9.5kHz Bandpass", 16, height / 2 - 10);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      if (visualizerMode === "frequency") {
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;

          // Frequency mapping coloring: 4.8kHz-8.2kHz (Swift screaming zone) gets vivid emerald mint glow
          const freqEst = (i * 24000) / bufferLength; // approximate Hz
          const isSwiftRange = freqEst >= 4500 && freqEst <= 8500;

          if (isSwiftRange) {
            ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + (dataArray[i] / 255) * 0.6})`;
          } else {
            ctx.fillStyle = `rgba(56, 189, 248, ${0.2 + (dataArray[i] / 255) * 0.4})`;
          }

          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }

        // Overlay Swift Optimal Auditory Band Marker
        ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
        const markerXStart = width * 0.18;
        const markerXEnd = width * 0.72;
        ctx.fillRect(markerXStart, 0, markerXEnd - markerXStart, height);

        ctx.fillStyle = "#10b981";
        ctx.font = "10px ui-sans-serif, system-ui";
        ctx.fillText("▲ Optimal Swift Acoustic Band (4.8 kHz - 8.2 kHz)", markerXStart + 8, 20);
      } else {
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = engineState.isBurstActive ? "#10b981" : "#38bdf8";
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [visualizerMode, engineState.isPlaying, engineState.isBurstActive]);

  const activePresetData = SWIFT_PRESETS[selectedPreset];

  return (
    <div id="audio-synthesizer-panel" className="space-y-6">
      {/* Visualizer & Live Broadcast Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-2xl text-slate-100 relative overflow-hidden">
        {/* Header Info inside Box */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                Real-Time Bioacoustic Oscilloscope & Spectrogram
              </h2>
              <p className="text-xs text-slate-400">
                Apus apus Syrinx Resonance (Dual FM Carrier + Acoustic Flutter)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs">
              <button
                id="viz-mode-freq"
                onClick={() => setVisualizerMode("frequency")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  visualizerMode === "frequency"
                    ? "bg-emerald-500 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                FFT Spectrogram
              </button>
              <button
                id="viz-mode-wave"
                onClick={() => setVisualizerMode("waveform")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  visualizerMode === "waveform"
                    ? "bg-emerald-500 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Waveform
              </button>
            </div>

            <button
              id="test-chirp-btn"
              onClick={handleTestChirp}
              disabled={isTestingChirp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 transition-colors"
              title="Plays a single 0.8s swift call chirp to test speaker wiring"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isTestingChirp ? "Testing..." : "Test Speaker Chirp"}</span>
            </button>
          </div>
        </div>

        {/* Canvas Visualizer */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#090d16]">
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full h-44 sm:h-52 block"
          />

          {/* Burst Cycle Overlay Tag */}
          {isPlaying && (
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs shadow-md">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium">
                {engineState.isBurstActive ? "Active Call Burst" : "Silent Rest Window"}:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {engineState.activeSecondsRemaining}s
              </span>
            </div>
          )}
        </div>

        {/* Main Audio Control Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="synthesizer-main-toggle-btn"
              onClick={onTogglePlay}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
                isPlaying
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  Stop Sound Broadcast
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Start Swift Sound Broadcast
                </>
              )}
            </button>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Source:</span>
              <button
                id="source-synth-btn"
                onClick={() => {
                  setSoundSource("synthesizer");
                  swiftAudioEngine.setSoundSource("synthesizer");
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  soundSource === "synthesizer"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Bioacoustic Synthesizer
              </button>
              <button
                id="source-custom-btn"
                onClick={() => {
                  setSoundSource("custom_audio");
                  swiftAudioEngine.setSoundSource("custom_audio");
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  soundSource === "custom_audio"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Custom Field Audio
              </button>
            </div>
          </div>

          {/* Volume Calibration Box */}
          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Output Gain:</span>
              <input
                id="synth-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-24 sm:w-32 accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-xs font-mono font-semibold text-emerald-400 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 border-l border-slate-800 pl-3">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Target: ~70-75 dB at 1m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Cards Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Swift Call Bioacoustic Attraction Presets
            </h3>
            <p className="text-xs text-slate-400">
              Ornithologically tuned frequency sweeps and duty cycles modeled after natural *Apus apus* vocalizations
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
            {Object.keys(SWIFT_PRESETS).length} Presets Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(SWIFT_PRESETS) as SwiftCallPresetId[]).map((presetId) => {
            const preset = SWIFT_PRESETS[presetId];
            const isSelected = selectedPreset === presetId;

            return (
              <div
                key={preset.id}
                id={`preset-card-${preset.id}`}
                onClick={() => handlePresetSelect(preset.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-900 border-emerald-500 shadow-lg ring-1 ring-emerald-500/30 text-white"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-bl-lg">
                    Active
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-slate-100">
                      {preset.name}
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-400 font-medium mb-2">
                    {preset.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Frequencies:</span>
                    <span className="font-semibold text-slate-200">
                      {preset.baseFreqMin}Hz - {preset.baseFreqMax}Hz
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Burst Interval:</span>
                    <span className="font-semibold text-slate-200">
                      {preset.burstActiveSec}s on / {preset.burstRestSec}s rest
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-300 bg-emerald-950/40 rounded-md p-1.5 border border-emerald-900/60">
                    <span className="font-semibold text-emerald-400">Goal:</span> {preset.ecologicalPurpose}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Field Audio Dropzone */}
      <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300 mt-0.5">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Custom Field Recording Audio Uploader
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mt-0.5">
                Have official RSPB, Swift Conservation, or local Apus apus WAV/MP3 field recordings? Upload them here to broadcast them directly through the scheduled solar dawn/dusk engine.
              </p>
            </div>
          </div>

          <label
            htmlFor="custom-audio-file-input"
            className="cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-2 whitespace-nowrap shadow-md shadow-emerald-600/20"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select MP3/WAV File</span>
          </label>
          <input
            id="custom-audio-file-input"
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {customFileName && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs">
            <span className="font-medium text-emerald-300">
              Loaded: <strong>{customFileName}</strong> (Ready for broadcast)
            </span>
            <button
              id="switch-to-custom-audio-btn"
              onClick={() => {
                setSoundSource("custom_audio");
                swiftAudioEngine.setSoundSource("custom_audio");
              }}
              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-500"
            >
              Use this Audio
            </button>
          </div>
        )}

        {customFileError && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
            {customFileError}
          </div>
        )}
      </div>

      {/* Urban Acoustic Attraction Best Practices */}
      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Bioacoustic Tip:</strong> Swifts respond strongest when speakers are mounted directly at or inside the entrance hole (within 15 cm). Never place the speaker far away from the box entrance, or birds may fly into the wrong part of the wall!
          </span>
        </div>
      </div>
    </div>
  );
};
