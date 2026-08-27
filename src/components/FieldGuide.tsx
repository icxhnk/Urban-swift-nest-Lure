import React from "react";
import {
  Bird,
  ShieldCheck,
  Volume2,
  Sun,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";

export const FieldGuide: React.FC = () => {
  return (
    <div id="urban-swift-field-guide" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 text-slate-100 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Ornithological Reference Manual
          </span>
        </div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Urban Swift (*Apus apus*) Acoustic Attraction Field Guide
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl mt-1">
          Common Swifts are loyal colonial breeders with high site fidelity. Because they nest in high, dark cavities, young non-breeding swifts ("bangers") rely heavily on hearing screaming colony calls to discover vacant nesting boxes.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Speaker Positioning */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">
                1. Speaker Placement & Siting
              </h3>
              <p className="text-xs text-slate-400">Crucial rule: Proximity to entrance</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Under 15cm distance:</strong> Mount the speaker right next to the entrance hole or inside an adjacent decoy chamber. Swifts locate holes with binaural sound localization.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Directional angle:</strong> Aim the speaker outwards and slightly downwards into open airspace where circling swifts can detect the sound beam.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Weatherproofing:</strong> Use mylar-cone mini outdoor speakers (e.g. 5W-10W mini tweeters) or place standard speakers sheltered underneath roof soffits.
              </span>
            </li>
          </ul>
        </div>

        {/* Pillar 2: Decibel Calibration & Neighbor Ethics */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">
                2. Volume Calibration & Ethics
              </h3>
              <p className="text-xs text-slate-400">Natural volume, avoid sound fatigue</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">70 - 75 dB at 1 meter:</strong> This replicates a real swift screaming party. Blasting at 90+ dB does not attract more birds and causes neighborhood friction.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Burst Duty Cycles:</strong> Always use intervals (e.g. 90 seconds of calling followed by 30 seconds of quiet). Constant continuous droning causes habituation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">High-pass filtering:</strong> Swift calls operate above 4.5 kHz. High-pass filtering removes low frequencies that transmit through residential walls.
              </span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: Solar Broadcast Timing */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">
                3. Solar Dawn & Dusk Broadcast Timing
              </h3>
              <p className="text-xs text-slate-400">Synchronized with prospecting behavior</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Morning Window (Sunrise -30m to +2.5h):</strong> Prime time for 2-3 year old bangers investigating new holes before high-altitude thermals develop.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Evening Window (Sunset -1.5h to +30m):</strong> Breeding adults return to feed chicks while bangers swoop close in high-speed screaming parties.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Midday Silence:</strong> Avoid broadcasting during hot afternoons when birds are foraging high in the sky and calls waste power.
              </span>
            </li>
          </ul>
        </div>

        {/* Pillar 4: Box Architecture & Siting */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">
                4. Nest Box Specifications
              </h3>
              <p className="text-xs text-slate-400">Dimensions, orientation, and clearance</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Entrance Slot:</strong> 65mm wide by 30mm high oval or 65x28mm rectangle. This strictly prevents common starlings and pigeons from occupying the box.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Height & Drop Line:</strong> Minimum 4.5 to 5 meters above ground with an unobstructed flight path (no trees or wires in front).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Orientation:</strong> North, North-East, or North-West to prevent fatal overheating under direct summer sun (unless sheltered under deep overhangs).
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Calendar Timeline */}
      <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm text-slate-100">
          Northern Hemisphere Swift Calendar & Attraction Strategy
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-slate-200">Late April - Early May</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">Breeders Arrive</div>
            <p className="text-slate-400 mt-1 text-[11px]">
              Mature breeding pairs return to their established nest holes. Audio lures are optional now.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
            <div className="font-bold text-emerald-100">Late May - Mid July</div>
            <div className="text-[11px] text-emerald-300 font-semibold mt-0.5 uppercase tracking-wide">PEAK ATTRACTION SEASON</div>
            <p className="text-slate-300 mt-1 text-[11px]">
              Young 2-3 year old non-breeders ("bangers") arrive in force looking for next year's territory. Broadcast dawn & dusk daily!
            </p>
          </div>

          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/50">
            <div className="font-bold text-sky-100">Late July - Early August</div>
            <div className="text-[11px] text-sky-300 font-semibold mt-0.5">Fledging & Roosting</div>
            <p className="text-slate-300 mt-1 text-[11px]">
              Chicks fledge directly into flight. Bangers claim empty chambers for the following spring.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="font-bold text-slate-200">Mid August</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Migration South</div>
            <p className="text-slate-400 mt-1 text-[11px]">
              Swifts depart for equatorial and southern Africa. Turn off sound broadcasters until next May.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
