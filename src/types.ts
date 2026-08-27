export type SwiftCallPresetId =
  | "screaming_party"
  | "nest_duet"
  | "chick_begging"
  | "dawn_bangers"
  | "dusk_swarm"
  | "mixed_colony";

export interface SwiftCallPreset {
  id: SwiftCallPresetId;
  name: string;
  subtitle: string;
  description: string;
  ecologicalPurpose: string;
  baseFreqMin: number; // in Hz (e.g. 4800)
  baseFreqMax: number; // in Hz (e.g. 7800)
  callDuration: number; // in seconds (e.g. 0.65)
  callInterval: number; // in seconds (e.g. 0.4)
  harmonicRatio: number; // overtone strength 0.0 - 1.0
  fmSweepDepth: number; // frequency modulation depth
  flutterRate: number; // Hz of throat flutter
  burstActiveSec: number; // active play seconds
  burstRestSec: number; // rest seconds
  isDuet?: boolean;
}

export interface SolarTimes {
  astronomicalDawn: Date;
  nauticalDawn: Date;
  civilDawn: Date;
  sunrise: Date;
  solarNoon: Date;
  sunset: Date;
  civilDusk: Date;
  nauticalDusk: Date;
  astronomicalDusk: Date;
}

export interface CityPreset {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

export interface SchedulerConfig {
  enabled: boolean;
  city: string;
  lat: number;
  lng: number;
  dawnWindow: {
    enabled: boolean;
    startOffsetMinutes: number; // relative to sunrise (negative = before)
    durationMinutes: number;
  };
  duskWindow: {
    enabled: boolean;
    startOffsetMinutes: number; // relative to sunset (negative = before)
    durationMinutes: number;
  };
  burstCycle: {
    activeSeconds: number;
    restSeconds: number;
  };
  volume: number; // 0 to 1
  autoFade: boolean;
  selectedPreset: SwiftCallPresetId;
  soundSource: "synthesizer" | "custom_audio";
}

export interface BroadcastLogItem {
  id: string;
  timestamp: string;
  event: "broadcast_started" | "broadcast_ended" | "scheduled_trigger" | "manual_trigger" | "test_played";
  windowType: "dawn" | "dusk" | "manual" | "test";
  preset: string;
  durationSeconds?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  model?: string;
}

export interface GeneratedNestBoxImage {
  id: string;
  prompt: string;
  imageUrl: string;
  imageSize: "512px" | "1K" | "2K" | "4K";
  aspectRatio: string;
  timestamp: string;
  description?: string;
}
