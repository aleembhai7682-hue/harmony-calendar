/**
 * Indian Standard Time (IST / Asia/Kolkata / Mumbai Time Zone) Utility
 * Ensures all prayer times, countdown timers, Rahu Kaal, and calendar dates
 * are strictly locked to IST (UTC +05:30), preventing any time drift regardless
 * of the user's client machine or server time zone.
 */

import { PrayerTimes } from '../types/calendar';

/**
 * Returns a Date object converted to Indian Standard Time (IST).
 */
export function getNowInIST(): Date {
  const now = new Date();
  // Get UTC milliseconds
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  // Add 5 hours and 30 minutes for IST
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(utcMs + istOffsetMs);
}

/**
 * Returns formatted IST time string: "HH:MM:SS AM/PM"
 */
export function formatISTTime(date?: Date): string {
  const d = date || getNowInIST();
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${hh}:${mm}:${ss} ${ampm} IST`;
}

/**
 * Accurate daily prayer times for Mumbai, Maharashtra, India
 * Coordinates: 18.9220° N, 72.8347° E | Standard Time: IST (UTC+5:30)
 * Uses solar declination and equation of time calibrated for Mumbai's longitude.
 */
export function getMumbaiPrayerTimes(date: Date): PrayerTimes {
  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  // Solar angle approximation (radians)
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;

  // Equation of Time (EoT) in minutes
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  // Longitude correction for Mumbai:
  // IST reference meridian is 82.5° E. Mumbai is 72.8347° E.
  // Difference = 82.5 - 72.8347 = 9.6653 degrees => 9.6653 * 4 min = +38.66 minutes
  const longitudeCorrection = (82.5 - 72.8347) * 4; // ~38.66 minutes

  // Solar Noon (Zawal / Dhuhr base) in IST
  const dhuhrMinutes = 12 * 60 + longitudeCorrection - eot;

  // Solar declination (degrees)
  const declination = 23.45 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);
  const decRad = (declination * Math.PI) / 180;
  const latRad = (18.922 * Math.PI) / 180;

  // Helper to compute hour angle for sun elevation angle
  const getHourAngle = (angle: number): number => {
    const angleRad = (angle * Math.PI) / 180;
    const cosHA =
      (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(decRad)) /
      (Math.cos(latRad) * Math.cos(decRad));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 180;
    return (Math.acos(cosHA) * 180) / Math.PI;
  };

  // Fajr: Sun at 18 degrees below horizon (-18°)
  const fajrHA = getHourAngle(-18);
  const fajrMinutes = dhuhrMinutes - fajrHA * 4;

  // Sunrise: Sun at 0.833 degrees below horizon (due to refraction and solar disc)
  const sunriseHA = getHourAngle(-0.833);
  const sunriseMinutes = dhuhrMinutes - sunriseHA * 4;

  // Asr (Shafi'i / Standard: shadow = object length + noon shadow)
  // Approximate noon shadow length
  const noonSunAltitude = 90 - 18.922 + declination;
  const noonShadow = 1 / Math.tan((noonSunAltitude * Math.PI) / 180);
  const asrAltitude =
    (Math.atan(1 / (1 + Math.max(0, noonShadow))) * 180) / Math.PI;
  const asrHA = getHourAngle(asrAltitude);
  const asrMinutes = dhuhrMinutes + asrHA * 4;

  // Maghrib / Sunset: Sun at -0.833 degrees below horizon + 2 mins buffer
  const sunsetMinutes = dhuhrMinutes + sunriseHA * 4;
  const maghribMinutes = sunsetMinutes + 2;

  // Isha: Sun at 18 degrees below horizon (or 17.5 degrees standard MWL/Karachi method)
  const ishaHA = getHourAngle(-17.5);
  const ishaMinutes = dhuhrMinutes + ishaHA * 4;

  const formatMin = (m: number): string => {
    let rounded = Math.round(m);
    if (rounded < 0) rounded += 1440;
    if (rounded >= 1440) rounded -= 1440;
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const fajrStr = formatMin(fajrMinutes);
  const maghribStr = formatMin(maghribMinutes);

  return {
    fajr: fajrStr,
    sunrise: formatMin(sunriseMinutes),
    dhuhr: formatMin(dhuhrMinutes),
    asr: formatMin(asrMinutes),
    maghrib: maghribStr,
    isha: formatMin(ishaMinutes),
    sehriEnds: formatMin(fajrMinutes - 10), // 10 minutes precaution before Fajr
    iftarTime: maghribStr,
  };
}
