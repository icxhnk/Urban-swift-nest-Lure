import { SolarTimes, CityPreset } from "../types";

export const POPULAR_SWIFT_CITIES: CityPreset[] = [
  { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, timezone: "Europe/London" },
  { name: "Bristol", country: "United Kingdom", lat: 51.4545, lng: -2.5879, timezone: "Europe/London" },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405, timezone: "Europe/Berlin" },
  { name: "Munich", country: "Germany", lat: 48.1351, lng: 11.582, timezone: "Europe/Berlin" },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, timezone: "Europe/Paris" },
  { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038, timezone: "Europe/Madrid" },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, timezone: "Europe/Rome" },
  { name: "Zurich", country: "Switzerland", lat: 47.3769, lng: 8.5417, timezone: "Europe/Zurich" },
  { name: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738, timezone: "Europe/Vienna" },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, timezone: "Europe/Amsterdam" },
  { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, timezone: "Asia/Shanghai" },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo" },
  { name: "New York", country: "USA (Chimney Swifts)", lat: 40.7128, lng: -74.006, timezone: "America/New_York" },
  { name: "San Francisco", country: "USA (Vaux's Swifts)", lat: 37.7749, lng: -122.4194, timezone: "America/Los_Angeles" },
];

/**
 * Standard astronomical solar position calculations based on NOAA Solar Calculator formulas
 */
export function calculateSolarTimes(date: Date, lat: number, lng: number): SolarTimes {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  // Day of year
  const start = new Date(Date.UTC(date.getFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

  // Equation of time in minutes
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));

  // Solar declination angle in radians
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

  // Time offset in minutes from UTC
  // Standard solar noon in UTC minutes
  const solarNoonUtcMinutes = 720 - 4 * lng - eqtime;

  function getTimeForZenith(zenithDeg: number, isSunrise: boolean): Date {
    const latRad = lat * rad;
    const zenithRad = zenithDeg * rad;

    const cosH = (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));

    let hourAngleMinutes = 0;
    if (cosH > 1) {
      // Sun never rises (polar night)
      hourAngleMinutes = 0;
    } else if (cosH < -1) {
      // Sun never sets (midnight sun)
      hourAngleMinutes = 720;
    } else {
      const H = Math.acos(cosH) * deg;
      hourAngleMinutes = H * 4;
    }

    const targetUtcMinutes = isSunrise
      ? solarNoonUtcMinutes - hourAngleMinutes
      : solarNoonUtcMinutes + hourAngleMinutes;

    const targetDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    ));
    targetDate.setUTCMinutes(Math.round(targetUtcMinutes));
    return targetDate;
  }

  // Official zenith: 90.833° (standard sunrise/sunset accounting for atmospheric refraction and solar radius)
  // Civil twilight: 96° (Civil dawn/dusk)
  // Nautical twilight: 102°
  // Astronomical twilight: 108°

  const sunrise = getTimeForZenith(90.833, true);
  const sunset = getTimeForZenith(90.833, false);

  const civilDawn = getTimeForZenith(96, true);
  const civilDusk = getTimeForZenith(96, false);

  const nauticalDawn = getTimeForZenith(102, true);
  const nauticalDusk = getTimeForZenith(102, false);

  const astronomicalDawn = getTimeForZenith(108, true);
  const astronomicalDusk = getTimeForZenith(108, false);

  const solarNoon = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0
  ));
  solarNoon.setUTCMinutes(Math.round(solarNoonUtcMinutes));

  return {
    astronomicalDawn,
    nauticalDawn,
    civilDawn,
    sunrise,
    solarNoon,
    sunset,
    civilDusk,
    nauticalDusk,
    astronomicalDusk,
  };
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatMinutesAgoOrIn(targetDate: Date, now = new Date()): string {
  const diffMs = targetDate.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 1) return "Just now";
  if (diffMinutes > 0) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours > 0) return `in ${hours}h ${mins}m`;
    return `in ${mins}m`;
  } else {
    const absMins = Math.abs(diffMinutes);
    const hours = Math.floor(absMins / 60);
    const mins = absMins % 60;
    if (hours > 0) return `${hours}h ${mins}m ago`;
    return `${mins}m ago`;
  }
}
