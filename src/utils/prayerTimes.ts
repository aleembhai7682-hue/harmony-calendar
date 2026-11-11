/**
 * Islamic Prayer Timetable Engine
 * Calculates astronomically accurate Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha,
 * Sehri Ends (Imsak), and Iftar for any Indian city or geographic coordinates.
 *
 * Supports reputable calculation conventions (Karachi, MWL, Makkah, Egypt)
 * and juristic Asr calculations (Hanafi vs Shafi'i/Standard).
 */

import { PrayerTimes } from '../types/calendar';
import { getCityLocation, CityLocation } from './cities';

export interface PrayerCalculationOptions {
  cityId?: string;
  customLat?: number;
  customLon?: number;
  prayerMethod?: 'karachi' | 'mwl' | 'makkah' | 'egypt';
  asrMethod?: 'hanafi' | 'standard';
}

export interface DetailedPrayerInfo {
  times: PrayerTimes;
  cityName: string;
  cityNameUr: string;
  coordinates: string;
  methodName: string;
  asrJuristicName: string;
  disclaimer: string;
  disclaimerUr: string;
}

/**
 * Calculates prayer times for a given date and configuration.
 */
export function calculateLocationPrayerTimes(
  date: Date,
  options: PrayerCalculationOptions = {}
): DetailedPrayerInfo {
  const city: CityLocation = getCityLocation(options.cityId || 'mumbai');
  const lat = options.customLat !== undefined ? options.customLat : city.latitude;
  const lon = options.customLon !== undefined ? options.customLon : city.longitude;

  const prayerMethod = options.prayerMethod || 'karachi';
  const asrMethod = options.asrMethod || 'hanafi';

  // Day of year
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);

  // Solar position parameters
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const declination = 23.45 * Math.sin(b);

  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;

  // Indian Standard Time (Meridian 82.5° E) Longitude correction
  const lonCorrection = (82.5 - lon) * 4; // minutes
  const solarNoonMin = 12 * 60 + lonCorrection - eot;

  // Helper to compute hour angle (in degrees) for a target solar altitude angle
  const getHourAngle = (altitudeDeg: number): number => {
    const altRad = (altitudeDeg * Math.PI) / 180;
    const cosHA =
      (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) /
      (Math.cos(latRad) * Math.cos(decRad));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 180;
    return (Math.acos(cosHA) * 180) / Math.PI;
  };

  // Determine Fajr & Isha twilight angles based on method
  let fajrAngle = -18;
  let ishaAngle: number | null = -18;
  let ishaFixedOffsetMin: number | null = null;
  let methodName = 'University of Islamic Sciences, Karachi (Fajr 18°, Isha 18°)';

  switch (prayerMethod) {
    case 'mwl':
      fajrAngle = -18;
      ishaAngle = -17;
      methodName = 'Muslim World League (Fajr 18°, Isha 17°)';
      break;
    case 'makkah':
      fajrAngle = -18.5;
      ishaAngle = null;
      ishaFixedOffsetMin = 90; // 90 min after Maghrib
      methodName = 'Umm al-Qura University, Makkah (Fajr 18.5°, Isha +90 min)';
      break;
    case 'egypt':
      fajrAngle = -19.5;
      ishaAngle = -17.5;
      methodName = 'Egyptian General Survey Authority (Fajr 19.5°, Isha 17.5°)';
      break;
    case 'karachi':
    default:
      fajrAngle = -18;
      ishaAngle = -18;
      methodName = 'Univ. of Islamic Sciences, Karachi (India/Subcontinent Standard)';
      break;
  }

  // Fajr Time
  const fajrHA = getHourAngle(fajrAngle);
  const fajrMin = solarNoonMin - fajrHA * 4;

  // Sunrise Time (Sun center at -0.833° to account for refraction & solar radius)
  const sunriseHA = getHourAngle(-0.8333);
  const sunriseMin = solarNoonMin - sunriseHA * 4;

  // Dhuhr Time (Solar Noon + 1 min buffer after zenith)
  const dhuhrMin = solarNoonMin + 1;

  // Asr Time:
  // Standard (Shafi'i/Maliki/Hanbali): shadow = 1x object length + noon shadow
  // Hanafi: shadow = 2x object length + noon shadow
  const noonSunAltitude = 90 - Math.abs(lat - declination);
  const noonShadowFactor = 1 / Math.tan((noonSunAltitude * Math.PI) / 180);
  const asrShadowRatio = asrMethod === 'hanafi' ? 2 : 1;
  const asrAltitudeRad = Math.atan(1 / (asrShadowRatio + Math.max(0, noonShadowFactor)));
  const asrAltitudeDeg = (asrAltitudeRad * 180) / Math.PI;
  const asrHA = getHourAngle(asrAltitudeDeg);
  const asrMin = solarNoonMin + asrHA * 4;

  // Maghrib Time: Sunset at -0.8333° + 2 min safety precaution
  const sunsetMin = solarNoonMin + sunriseHA * 4;
  const maghribMin = sunsetMin + 2;

  // Isha Time:
  let ishaMin: number;
  if (ishaAngle !== null) {
    const ishaHA = getHourAngle(ishaAngle);
    ishaMin = solarNoonMin + ishaHA * 4;
  } else {
    ishaMin = maghribMin + (ishaFixedOffsetMin || 90);
  }

  // Precautionary Sehri Ends (10 minutes before true dawn / Fajr)
  const sehriEndsMin = fajrMin - 10;

  const formatMin = (m: number): string => {
    let rounded = Math.round(m);
    if (rounded < 0) rounded += 1440;
    if (rounded >= 1440) rounded -= 1440;
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const times: PrayerTimes = {
    fajr: formatMin(fajrMin),
    sunrise: formatMin(sunriseMin),
    dhuhr: formatMin(dhuhrMin),
    asr: formatMin(asrMin),
    maghrib: formatMin(maghribMin),
    isha: formatMin(ishaMin),
    sehriEnds: formatMin(sehriEndsMin),
    iftarTime: formatMin(maghribMin),
  };

  return {
    times,
    cityName: city.nameEn,
    cityNameUr: city.nameUr,
    coordinates: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
    methodName,
    asrJuristicName: asrMethod === 'hanafi' ? 'Hanafi (Asr: 2x Shadow)' : 'Standard / Shafi\'i (Asr: 1x Shadow)',
    disclaimer: `Astronomically calculated for ${city.nameEn} (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E) in Indian Standard Time (IST). Recommended to follow your local Jamia Masjid congregation/azaan.`,
    disclaimerUr: `یہ اوقاتِ نماز حسابی اصولوں کے تحت ${city.nameUr} کے لیے تیار کیے گئے ہیں۔ مقامی جامع مسجد کی اذان و جماعت کی پیروی افضل ہے۔`,
  };
}
