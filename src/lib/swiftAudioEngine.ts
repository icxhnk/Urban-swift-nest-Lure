import { SwiftCallPreset, SwiftCallPresetId } from "../types";

export const SWIFT_PRESETS: Record<SwiftCallPresetId, SwiftCallPreset> = {
  screaming_party: {
    id: "screaming_party",
    name: "Screaming Party Rush",
    subtitle: "High-speed aerial flock screams (5.2 - 7.8 kHz)",
    description: "Piercing, rapid multi-bird screaming passes that trigger social attraction and mobbing curiosity among prospecting swifts.",
    ecologicalPurpose: "Attracts non-breeding 2-3 year old prospecting swifts ('bangers') flying past buildings looking for active colonies.",
    baseFreqMin: 5200,
    baseFreqMax: 7600,
    callDuration: 0.75,
    callInterval: 0.25,
    harmonicRatio: 0.45,
    fmSweepDepth: 1800,
    flutterRate: 28,
    burstActiveSec: 90,
    burstRestSec: 30,
  },
  nest_duet: {
    id: "nest_duet",
    name: "Nest Cavity Duet",
    subtitle: "Male & Female pair greeting ('Peep-Screee')",
    description: "Alternating male lower-pitched chirps (~4.8 kHz) and female higher-pitched screaming duets (~7.2 kHz) emitted inside nest boxes.",
    ecologicalPurpose: "Signals that a safe, sheltered nesting chamber is actively occupied and stimulates adjacent empty box investigation.",
    baseFreqMin: 4800,
    baseFreqMax: 7200,
    callDuration: 0.55,
    callInterval: 0.35,
    harmonicRatio: 0.3,
    fmSweepDepth: 1200,
    flutterRate: 18,
    burstActiveSec: 120,
    burstRestSec: 45,
    isDuet: true,
  },
  chick_begging: {
    id: "chick_begging",
    name: "Nestling Chick Peeps",
    subtitle: "Gentle rhythmic begging pips (5.6 - 6.8 kHz)",
    description: "Delicate, rapid contact peeps produced by growing chicks waiting for parents delivering insect boluses.",
    ecologicalPurpose: "Conveys high reproductive success and microclimate suitability of the nesting box to prospecting pairs.",
    baseFreqMin: 5600,
    baseFreqMax: 6800,
    callDuration: 0.12,
    callInterval: 0.09,
    harmonicRatio: 0.2,
    fmSweepDepth: 600,
    flutterRate: 40,
    burstActiveSec: 60,
    burstRestSec: 20,
  },
  dawn_bangers: {
    id: "dawn_bangers",
    name: "Dawn Banger Prospector",
    subtitle: "High-intensity morning attraction bursts",
    description: "Dynamic crescendo sweeps designed specifically for morning light when young swifts tap on box entrance holes.",
    ecologicalPurpose: "Optimal during morning 05:30-08:30 window when prospecting birds are most receptive to discovering new boxes.",
    baseFreqMin: 5000,
    baseFreqMax: 8100,
    callDuration: 0.85,
    callInterval: 0.2,
    harmonicRatio: 0.5,
    fmSweepDepth: 2200,
    flutterRate: 32,
    burstActiveSec: 90,
    burstRestSec: 30,
  },
  dusk_swarm: {
    id: "dusk_swarm",
    name: "Dusk Roosting Swarm",
    subtitle: "Evening dive calls & roosting chatter",
    description: "Descending pitch sweeps with multi-bird flutter mimicking swifts swirling tightly and entering roof crevices before dark.",
    ecologicalPurpose: "Guides birds seeking overnight shelter or prospecting late roosting cavities between 19:30 and 22:00.",
    baseFreqMin: 4600,
    baseFreqMax: 7400,
    callDuration: 0.65,
    callInterval: 0.3,
    harmonicRatio: 0.4,
    fmSweepDepth: 1500,
    flutterRate: 22,
    burstActiveSec: 75,
    burstRestSec: 30,
  },
  mixed_colony: {
    id: "mixed_colony",
    name: "Full Colony Soundscape",
    subtitle: "Layered polyphonic screams & cavity duets",
    description: "Rich atmospheric mix of distant passing flocks combined with proximate chamber chatter.",
    ecologicalPurpose: "Provides maximum realism for large multi-box installations (swift bricks, towers, roof eaves arrays).",
    baseFreqMin: 4700,
    baseFreqMax: 7900,
    callDuration: 0.7,
    callInterval: 0.18,
    harmonicRatio: 0.45,
    fmSweepDepth: 1900,
    flutterRate: 26,
    burstActiveSec: 120,
    burstRestSec: 40,
  },
};

export class SwiftAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bandpassFilter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;

  private isRunning: boolean = false;
  private isBurstActive: boolean = true;
  private burstTimer: number | null = null;
  private callLoopTimer: number | null = null;

  private currentPreset: SwiftCallPreset = SWIFT_PRESETS.screaming_party;
  private volume: number = 0.75;
  private customAudioBuffer: AudioBuffer | null = null;
  private customSourceNode: AudioBufferSourceNode | null = null;
  private soundSource: "synthesizer" | "custom_audio" = "synthesizer";

  private onStateChangeCallback?: (state: {
    isPlaying: boolean;
    isBurstActive: boolean;
    activeSecondsRemaining: number;
  }) => void;

  private burstRemainingSeconds: number = 0;
  private countdownInterval: number | null = null;

  constructor() {}

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Bandpass filter centered around swift vocal range (approx 3500 Hz - 9000 Hz)
      this.bandpassFilter = this.ctx.createBiquadFilter();
      this.bandpassFilter.type = "bandpass";
      this.bandpassFilter.frequency.setValueAtTime(6200, this.ctx.currentTime);
      this.bandpassFilter.Q.setValueAtTime(0.85, this.ctx.currentTime);

      // Analyser for real-time visualization
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.8;

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // Wire together: Synth/Source -> Bandpass -> MasterGain -> Analyser -> Destination
      this.bandpassFilter.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setPreset(preset: SwiftCallPreset) {
    this.currentPreset = preset;
    if (this.isRunning && this.soundSource === "synthesizer") {
      // Re-trigger with new preset timings
      this.startBurstCycle();
    }
  }

  public setSoundSource(source: "synthesizer" | "custom_audio") {
    this.soundSource = source;
  }

  public async loadCustomAudioFile(file: File): Promise<string> {
    this.init();
    if (!this.ctx) throw new Error("Audio Context not available");

    const arrayBuffer = await file.arrayBuffer();
    this.customAudioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.soundSource = "custom_audio";
    return `Loaded ${file.name} (${this.customAudioBuffer.duration.toFixed(1)}s)`;
  }

  public setCustomAudioBuffer(buffer: AudioBuffer) {
    this.customAudioBuffer = buffer;
    this.soundSource = "custom_audio";
  }

  public setOnStateChange(cb: (state: { isPlaying: boolean; isBurstActive: boolean; activeSecondsRemaining: number }) => void) {
    this.onStateChangeCallback = cb;
  }

  private notifyState() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isPlaying: this.isRunning,
        isBurstActive: this.isBurstActive,
        activeSecondsRemaining: this.burstRemainingSeconds,
      });
    }
  }

  public start() {
    this.init();
    if (this.isRunning) return;

    this.isRunning = true;
    this.isBurstActive = true;
    this.notifyState();

    if (this.soundSource === "custom_audio" && this.customAudioBuffer) {
      this.playCustomAudioLoop();
    } else {
      this.startBurstCycle();
    }
  }

  public stop() {
    this.isRunning = false;
    this.clearTimers();
    if (this.customSourceNode) {
      try {
        this.customSourceNode.stop();
        this.customSourceNode.disconnect();
      } catch (_) {}
      this.customSourceNode = null;
    }
    this.notifyState();
  }

  public isAudioPlaying(): boolean {
    return this.isRunning;
  }

  private clearTimers() {
    if (this.burstTimer) {
      clearTimeout(this.burstTimer);
      this.burstTimer = null;
    }
    if (this.callLoopTimer) {
      clearTimeout(this.callLoopTimer);
      this.callLoopTimer = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private startBurstCycle() {
    this.clearTimers();
    if (!this.isRunning) return;

    const activeSec = this.currentPreset.burstActiveSec || 60;
    const restSec = this.currentPreset.burstRestSec || 20;

    // Start ACTIVE phase
    this.isBurstActive = true;
    this.burstRemainingSeconds = activeSec;
    this.notifyState();

    this.scheduleNextCall();

    this.countdownInterval = window.setInterval(() => {
      if (this.burstRemainingSeconds > 0) {
        this.burstRemainingSeconds--;
        this.notifyState();
      }
    }, 1000);

    this.burstTimer = window.setTimeout(() => {
      // Transition to REST phase
      this.isBurstActive = false;
      this.burstRemainingSeconds = restSec;
      this.notifyState();

      if (this.callLoopTimer) {
        clearTimeout(this.callLoopTimer);
        this.callLoopTimer = null;
      }

      this.burstTimer = window.setTimeout(() => {
        // Loop back to active
        if (this.isRunning) {
          this.startBurstCycle();
        }
      }, restSec * 1000);
    }, activeSec * 1000);
  }

  /**
   * Synthesize a bio-acoustically accurate Swift cry unit
   */
  private playSyntheticSwiftCall() {
    if (!this.ctx || !this.bandpassFilter || !this.isRunning || !this.isBurstActive) return;

    const now = this.ctx.currentTime;
    const p = this.currentPreset;

    const isDuetCall = p.isDuet && Math.random() > 0.45;
    const duration = p.callDuration * (0.85 + Math.random() * 0.3);
    const startFreq = isDuetCall
      ? 4800 + Math.random() * 400
      : p.baseFreqMin + Math.random() * (p.baseFreqMax - p.baseFreqMin) * 0.3;
    const peakFreq = isDuetCall
      ? 7400 + Math.random() * 500
      : p.baseFreqMax + (Math.random() - 0.5) * 600;

    // Primary Carrier Oscillator (Vocal Syrinx Membrane 1)
    const osc1 = this.ctx.createOscillator();
    osc1.type = "sine";

    // Secondary Harmonic Oscillator (Vocal Syrinx Membrane 2 - Duplex sound)
    const osc2 = this.ctx.createOscillator();
    osc2.type = "triangle";

    // Modulator for Frequency Flutter (Throat resonance & rapid trill)
    const modOsc = this.ctx.createOscillator();
    modOsc.type = "sine";
    modOsc.frequency.setValueAtTime(p.flutterRate + (Math.random() - 0.5) * 6, now);

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(p.fmSweepDepth * 0.35, now);
    modGain.gain.linearRampToValueAtTime(p.fmSweepDepth * 0.55, now + duration * 0.5);
    modGain.gain.linearRampToValueAtTime(p.fmSweepDepth * 0.2, now + duration);

    modOsc.connect(modGain);
    modGain.connect(osc1.frequency);
    modGain.connect(osc2.frequency);

    // Dynamic FM Sweep Curve (Characteristic swift 'srrriii-eee' rising inflection)
    osc1.frequency.setValueAtTime(startFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(peakFreq, now + duration * 0.45);
    osc1.frequency.exponentialRampToValueAtTime(startFreq * 0.95, now + duration);

    // Harmonic overtone frequency
    osc2.frequency.setValueAtTime(startFreq * 1.35, now);
    osc2.frequency.exponentialRampToValueAtTime(peakFreq * 1.25, now + duration * 0.45);
    osc2.frequency.exponentialRampToValueAtTime(startFreq * 1.2, now + duration);

    // Call Amplitude Envelope
    const callGain1 = this.ctx.createGain();
    const callGain2 = this.ctx.createGain();

    // Soft attack to avoid click, soaring crescendo, rapid natural release
    callGain1.gain.setValueAtTime(0.0001, now);
    callGain1.gain.exponentialRampToValueAtTime(0.7, now + duration * 0.25);
    callGain1.gain.setValueAtTime(0.65, now + duration * 0.7);
    callGain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    callGain2.gain.setValueAtTime(0.0001, now);
    callGain2.gain.exponentialRampToValueAtTime(0.35 * p.harmonicRatio, now + duration * 0.3);
    callGain2.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Spatial Doppler Panner (simulates bird flyby at 40-70 km/h)
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      const panStart = (Math.random() - 0.5) * 1.4;
      const panEnd = -panStart * (0.6 + Math.random() * 0.5);
      panner.pan.setValueAtTime(panStart, now);
      panner.pan.linearRampToValueAtTime(panEnd, now + duration);
    }

    // Connect node chain
    osc1.connect(callGain1);
    osc2.connect(callGain2);

    if (panner) {
      callGain1.connect(panner);
      callGain2.connect(panner);
      panner.connect(this.bandpassFilter);
    } else {
      callGain1.connect(this.bandpassFilter);
      callGain2.connect(this.bandpassFilter);
    }

    // Play call nodes
    modOsc.start(now);
    osc1.start(now);
    osc2.start(now);

    modOsc.stop(now + duration);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  private scheduleNextCall() {
    if (!this.isRunning || !this.isBurstActive) return;

    this.playSyntheticSwiftCall();

    // Interval before next call in the flock scream series
    const p = this.currentPreset;
    const nextInterval = (p.callDuration + p.callInterval) * (0.8 + Math.random() * 0.45) * 1000;

    this.callLoopTimer = window.setTimeout(() => {
      this.scheduleNextCall();
    }, nextInterval);
  }

  private playCustomAudioLoop() {
    if (!this.ctx || !this.customAudioBuffer || !this.bandpassFilter) return;

    if (this.customSourceNode) {
      try {
        this.customSourceNode.stop();
      } catch (_) {}
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.customAudioBuffer;
    source.loop = true;
    source.connect(this.bandpassFilter);
    source.start(0);

    this.customSourceNode = source;
  }

  /**
   * Play a short single test sample (1.2 seconds) to verify speakers without activating full schedule
   */
  public playTestChirp(): Promise<void> {
    return new Promise((resolve) => {
      this.init();
      if (!this.ctx || !this.bandpassFilter) {
        resolve();
        return;
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(5400, now);
      osc.frequency.exponentialRampToValueAtTime(7400, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(5800, now + 0.7);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(this.volume * 0.8, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

      osc.connect(gain);
      gain.connect(this.bandpassFilter);

      osc.start(now);
      osc.stop(now + 0.8);

      setTimeout(() => {
        resolve();
      }, 900);
    });
  }
}

// Global Singleton Engine
export const swiftAudioEngine = new SwiftAudioEngine();
