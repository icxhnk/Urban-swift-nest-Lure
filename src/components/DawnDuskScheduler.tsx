import React, { useEffect, useState } from "react";
import {
  CityPreset,
  SolarTimes,
  BroadcastLogItem,
  SwiftCallPresetId,
} from "../types";
import {
  POPULAR_SWIFT_CITIES,
  calculateSolarTimes,
  formatClockTime,
  formatMinutesAgoOrIn,
} from "../lib/solarCalculator";
import { SWIFT_PRESETS } from "../lib/swiftAudioEngine";
import {
  Sun,
  Moon,
  Clock,
  MapPin,
  Compass,
  Play,
  Square,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  History,
  Timer,
} from "lucide-react";

interface DawnDuskSchedulerProps {
  isPlaying: boolean;
  onStartBroadcast: (windowType: "dawn" | "dusk" | "manual") => void;
  onStopBroadcast: () => void;
  selectedPreset: SwiftCallPresetId;
  logs: BroadcastLogItem[];
  isSchedulerArmed: boolean;
  setIsSchedulerArmed: (armed: boolean) => void;
}

export const DawnDuskScheduler: React.FC<DawnDuskSchedulerProps> = ({
  isPlaying,
  onStartBroadcast,
  onStopBroadcast,
  selectedPreset,
  logs,
  isSchedulerArmed,
  setIsSchedulerArmed,
}) => {
  // Location state
  const [selectedCity, setSelectedCity] = useState<string>("London");
  const [lat, setLat] = useState<number>(51.5074);
  const [lng, setLng] = useState<number>(-0.1278);
  const [locationStatus, setLocationStatus] = useState<string>("");

  // Solar Times State
  const [solarTimes, setSolarTimes] = useState<SolarTimes | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Window Configuration
  const [dawnEnabled, setDawnEnabled] = useState<boolean>(true);
  const [dawnStartOffset, setDawnStartOffset] = useState<number>(-30); // minutes relative to sunrise
  const [dawnDuration, setDawnDuration] = useState<number>(150); // minutes (2.5 hours)

  const [duskEnabled, setDuskEnabled] = useState<boolean>(true);
  const [duskStartOffset, setDuskStartOffset] = useState<number>(-90); // minutes relative to sunset
  const [duskDuration, setDuskDuration] = useState<number>(120); // minutes (2 hours)

  // Recalculate Solar Times
  useEffect(() => {
    const times = calculateSolarTimes(currentTime, lat, lng);
    setSolarTimes(times);
  }, [lat, lng, currentTime.toDateString()]);

  // Live Clock Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Active or Next Broadcast Window
  const getWindowIntervals = () => {
    if (!solarTimes) return null;

    // Dawn Window: Sunrise + offset
    const dawnStart = new Date(solarTimes.sunrise.getTime() + dawnStartOffset * 60000);
    const dawnEnd = new Date(dawnStart.getTime() + dawnDuration * 60000);

    // Dusk Window: Sunset + offset
    const duskStart = new Date(solarTimes.sunset.getTime() + duskStartOffset * 60000);
    const duskEnd = new Date(duskStart.getTime() + duskDuration * 60000);

    return { dawnStart, dawnEnd, duskStart, duskEnd };
  };

  const windowIntervals = getWindowIntervals();

  // Determine current window status
  const isInsideDawn =
    dawnEnabled &&
    windowIntervals &&
    currentTime >= windowIntervals.dawnStart &&
    currentTime <= windowIntervals.dawnEnd;

  const isInsideDusk =
    duskEnabled &&
    windowIntervals &&
    currentTime >= windowIntervals.duskStart &&
    currentTime <= windowIntervals.duskEnd;

  const isInsideAnyWindow = isInsideDawn || isInsideDusk;

  // Automated Scheduler watcher
  useEffect(() => {
    if (!isSchedulerArmed) return;

    if (isInsideAnyWindow && !isPlaying) {
      const windowName = isInsideDawn ? "dawn" : "dusk";
      onStartBroadcast(windowName);
    } else if (!isInsideAnyWindow && isPlaying) {
      onStopBroadcast();
    }
  }, [isSchedulerArmed, isInsideAnyWindow, isPlaying, isInsideDawn]);

  // Next upcoming window calculation
  const getNextUpcomingWindow = () => {
    if (!windowIntervals) return null;

    const now = currentTime.getTime();
    const list: { name: string; type: "dawn" | "dusk"; start: Date; end: Date }[] = [];

    if (dawnEnabled) {
      list.push({ name: "Dawn Prospecting Window", type: "dawn", start: windowIntervals.dawnStart, end: windowIntervals.dawnEnd });
    }
    if (duskEnabled) {
      list.push({ name: "Dusk Roosting Window", type: "dusk", start: windowIntervals.duskStart, end: windowIntervals.duskEnd });
    }

    // Find first one that ends in the future
    for (const w of list) {
      if (now <= w.end.getTime()) {
        return w;
      }
    }

    // Otherwise it's tomorrow's dawn
    const tomorrowDawnStart = new Date(windowIntervals.dawnStart.getTime() + 86400000);
    const tomorrowDawnEnd = new Date(windowIntervals.dawnEnd.getTime() + 86400000);
    return { name: "Tomorrow's Dawn Window", type: "dawn" as const, start: tomorrowDawnStart, end: tomorrowDawnEnd };
  };

  const nextWindow = getNextUpcomingWindow();

  // Geolocation trigger
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported by browser.");
      return;
    }
    setLocationStatus("Locating GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(parseFloat(pos.coords.latitude.toFixed(4)));
        setLng(parseFloat(pos.coords.longitude.toFixed(4)));
        setSelectedCity("Custom GPS Location");
        setLocationStatus("GPS Location successfully detected!");
      },
      (err) => {
        setLocationStatus(`Could not acquire GPS: ${err.message}. Using city preset.`);
      }
    );
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    const city = POPULAR_SWIFT_CITIES.find((c) => c.name === cityName);
    if (city) {
      setLat(city.lat);
      setLng(city.lng);
      setLocationStatus("");
    }
  };

  return (
    <div id="dawn-dusk-scheduler-panel" className="space-y-6">
      {/* Top Banner Status Card */}
      <div className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 text-slate-100 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Astronomical Solar Controller
              </span>
              <span className="text-xs font-mono text-slate-400">
                Live Clock: {formatClockTime(currentTime)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Automated Dawn & Dusk Acoustic Broadcaster
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Prospecting swifts inspect prospective nest boxes primarily during morning emergence and evening roosting. This scheduler synchronizes calls precisely with local solar twilight.
            </p>
          </div>

          {/* Master Arm Switch */}
          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-right">
              <div className="text-xs font-semibold text-white">
                {isSchedulerArmed ? "Scheduler ARMED" : "Scheduler INACTIVE"}
              </div>
              <div className="text-[11px] text-slate-400">
                {isSchedulerArmed ? "Autonomous Auto-Broadcast" : "Manual Activation"}
              </div>
            </div>
            <button
              id="arm-scheduler-toggle-btn"
              onClick={() => setIsSchedulerArmed(!isSchedulerArmed)}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-2 ${
                isSchedulerArmed
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
            >
              <Shield className={`w-4 h-4 ${isSchedulerArmed ? "fill-current" : ""}`} />
              <span>{isSchedulerArmed ? "Disarm" : "Arm Scheduler"}</span>
            </button>
          </div>
        </div>

        {/* Current Window Status Alert */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-emerald-400" />
              <span>Local Sunrise</span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {solarTimes ? formatClockTime(solarTimes.sunrise) : "--:--"}
            </div>
            <div className="text-[10px] text-slate-500">
              Civil Dawn: {solarTimes ? formatClockTime(solarTimes.civilDawn) : "--"}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span>Local Sunset</span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {solarTimes ? formatClockTime(solarTimes.sunset) : "--:--"}
            </div>
            <div className="text-[10px] text-slate-500">
              Civil Dusk: {solarTimes ? formatClockTime(solarTimes.civilDusk) : "--"}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Next Active Window</span>
            </div>
            <div className="text-sm font-semibold text-emerald-300 mt-1 truncate">
              {nextWindow?.name || "None"}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {nextWindow ? formatMinutesAgoOrIn(nextWindow.start, currentTime) : "--"}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate Broadcast</span>
            </div>
            <button
              id="simulate-broadcast-test-btn"
              onClick={() => {
                if (isPlaying) {
                  onStopBroadcast();
                } else {
                  onStartBroadcast("test");
                }
              }}
              className="mt-1 w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? "Stop Test" : "Trigger Test Lure"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Columns: Location/Solar Timeline & Window Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Geographic Settings & Solar Twilight Times */}
        <div className="bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100">
                  Geographic Solar Coordinates
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates exact sun angle and twilight curves
                </p>
              </div>
            </div>
          </div>

          {/* City Selector & GPS Detect */}
          <div className="space-y-3">
            <div>
              <label htmlFor="city-preset-select" className="block text-xs font-medium text-slate-300 mb-1">
                Select Urban Center Preset:
              </label>
              <select
                id="city-preset-select"
                value={selectedCity}
                onChange={handleCityChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 text-slate-200"
              >
                {POPULAR_SWIFT_CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}, {city.country} ({city.lat.toFixed(2)}°N, {city.lng.toFixed(2)}°E)
                  </option>
                ))}
                <option value="Custom GPS Location">Custom GPS Coordinates</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="auto-gps-detect-btn"
                onClick={handleAutoDetectLocation}
                className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto-Detect My GPS</span>
              </button>
              {locationStatus && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  {locationStatus}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label htmlFor="lat-input" className="block text-[11px] font-mono text-slate-400 mb-1">
                  Latitude:
                </label>
                <input
                  id="lat-input"
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => {
                    setLat(parseFloat(e.target.value) || 0);
                    setSelectedCity("Custom GPS Location");
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-700 bg-slate-950 text-slate-200"
                />
              </div>
              <div>
                <label htmlFor="lng-input" className="block text-[11px] font-mono text-slate-400 mb-1">
                  Longitude:
                </label>
                <input
                  id="lng-input"
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => {
                    setLng(parseFloat(e.target.value) || 0);
                    setSelectedCity("Custom GPS Location");
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-700 bg-slate-950 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Full Solar Table */}
          {solarTimes && (
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Today's Solar Milestones
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Nautical Dawn</span>
                  <span className="font-mono font-semibold text-slate-300">
                    {formatClockTime(solarTimes.nauticalDawn)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
                  <span className="text-[10px] text-emerald-400 block font-medium">Civil Dawn</span>
                  <span className="font-mono font-semibold text-emerald-200">
                    {formatClockTime(solarTimes.civilDawn)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/60">
                  <span className="text-[10px] text-emerald-300 block font-medium">Sunrise (Lure Starts)</span>
                  <span className="font-mono font-bold text-emerald-100">
                    {formatClockTime(solarTimes.sunrise)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Solar Noon</span>
                  <span className="font-mono font-semibold text-slate-300">
                    {formatClockTime(solarTimes.solarNoon)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-sky-950/30 border border-sky-900/40">
                  <span className="text-[10px] text-sky-400 block font-medium">Sunset (Lure Active)</span>
                  <span className="font-mono font-bold text-sky-200">
                    {formatClockTime(solarTimes.sunset)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-sky-950/50 border border-sky-800/60">
                  <span className="text-[10px] text-sky-300 block font-medium">Civil Dusk</span>
                  <span className="font-mono font-semibold text-sky-100">
                    {formatClockTime(solarTimes.civilDusk)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Broadcast Window Tuning */}
        <div className="bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">
                Dawn & Dusk Broadcast Windows
              </h3>
              <p className="text-xs text-slate-400">
                Customize trigger offsets relative to sunrise and sunset
              </p>
            </div>
          </div>

          {/* Dawn Window Setup */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs text-slate-200">
                  Morning Dawn Prospecting Window
                </span>
              </div>
              <input
                id="dawn-window-enabled-checkbox"
                type="checkbox"
                checked={dawnEnabled}
                onChange={(e) => setDawnEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </div>

            {windowIntervals && (
              <div className="text-xs text-slate-400">
                Scheduled:{" "}
                <strong className="font-mono text-emerald-300">
                  {formatClockTime(windowIntervals.dawnStart)} - {formatClockTime(windowIntervals.dawnEnd)}
                </strong>{" "}
                ({dawnDuration} mins)
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label htmlFor="dawn-offset-input" className="block text-[11px] text-slate-400 mb-1">
                  Start Offset (mins from Sunrise):
                </label>
                <input
                  id="dawn-offset-input"
                  type="number"
                  value={dawnStartOffset}
                  onChange={(e) => setDawnStartOffset(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
                />
                <span className="text-[10px] text-slate-500">e.g. -30 (30m before sunrise)</span>
              </div>
              <div>
                <label htmlFor="dawn-duration-input" className="block text-[11px] text-slate-400 mb-1">
                  Duration (mins):
                </label>
                <input
                  id="dawn-duration-input"
                  type="number"
                  min="15"
                  max="300"
                  value={dawnDuration}
                  onChange={(e) => setDawnDuration(parseInt(e.target.value) || 60)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
                />
                <span className="text-[10px] text-slate-500">Default: 150m (2.5 hours)</span>
              </div>
            </div>
          </div>

          {/* Dusk Window Setup */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-sky-400" />
                <span className="font-semibold text-xs text-slate-200">
                  Evening Dusk Roosting Window
                </span>
              </div>
              <input
                id="dusk-window-enabled-checkbox"
                type="checkbox"
                checked={duskEnabled}
                onChange={(e) => setDuskEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </div>

            {windowIntervals && (
              <div className="text-xs text-slate-400">
                Scheduled:{" "}
                <strong className="font-mono text-sky-300">
                  {formatClockTime(windowIntervals.duskStart)} - {formatClockTime(windowIntervals.duskEnd)}
                </strong>{" "}
                ({duskDuration} mins)
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label htmlFor="dusk-offset-input" className="block text-[11px] text-slate-400 mb-1">
                  Start Offset (mins from Sunset):
                </label>
                <input
                  id="dusk-offset-input"
                  type="number"
                  value={duskStartOffset}
                  onChange={(e) => setDuskStartOffset(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
                />
                <span className="text-[10px] text-slate-500">e.g. -90 (90m before sunset)</span>
              </div>
              <div>
                <label htmlFor="dusk-duration-input" className="block text-[11px] text-slate-400 mb-1">
                  Duration (mins):
                </label>
                <input
                  id="dusk-duration-input"
                  type="number"
                  min="15"
                  max="300"
                  value={duskDuration}
                  onChange={(e) => setDuskDuration(parseInt(e.target.value) || 60)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
                />
                <span className="text-[10px] text-slate-500">Default: 120m (2 hours)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History & Logs */}
      <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Broadcast Activity Log
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {logs.length} logged events
          </span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No broadcast sessions recorded yet. Arm the scheduler or start manual sound playback.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.event === "broadcast_started"
                        ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                        : log.event === "test_played"
                        ? "bg-emerald-500"
                        : "bg-slate-500"
                    }`}
                  />
                  <span className="font-medium text-slate-200">
                    {log.event === "broadcast_started"
                      ? "Acoustic Broadcast Initiated"
                      : log.event === "broadcast_ended"
                      ? "Broadcast Finished"
                      : log.event === "test_played"
                      ? "Speaker Test Chirp"
                      : log.event}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                    Window: {log.windowType}
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
