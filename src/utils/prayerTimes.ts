/**
 * Islamic Prayer Timetable Engine
 * Calculates astronomically accurate Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha,
 * Sehri Ends (Imsak), and Iftar for any city or geographic coordinates worldwide.
 *
 * Supports reputable calculation conventions (Karachi, MWL, Makkah, Egypt)
 * and juristic Asr calculations (Hanafi vs Shafi'i/Standard).
 */

import { PrayerTimes } from '../types/calendar';
import { getCityLocation, CityLocation, isValidCoordinatePair, formatCityCountryLabel } from './cities';
import {
  getDeviceTimezone,
  getTimezoneOffsetHoursForZone,
  formatUtcOffset,
} from './istTime';

export interface PrayerCalculationOptions {
  cityId?: string;
  customLat?: number;
  customLon?: number;
  customLocationName?: string;
  customCountry?: string;
  prayerMethod?: 'karachi' | 'mwl' | 'makkah' | 'egypt';
  asrMethod?: 'hanafi' | 'standard';
  timezoneOffsetHours?: number;
  timezoneName?: string;
}

export interface DetailedPrayerInfo {
  hasLocation: boolean;
  times: PrayerTimes;
  cityName: string;
  countryName: string;
  cityNameUr: string;
  coordinates: string;
  timezoneName: string;
  timezoneOffsetStr: string;
  methodName: string;
  asrJuristicName: string;
  disclaimer: string;
  disclaimerUr: string;
}

/**
 * Calculates prayer times for a given date and configuration.
 * Strictly uses selected location and its appropriate timezone (supporting DST).
 * Never hardcodes or silently falls back to Mumbai or IST.
 */
export function calculateLocationPrayerTimes(
  date: Date,
  options: PrayerCalculationOptions = {}
): DetailedPrayerInfo {
  const city: CityLocation = getCityLocation(
    options.cityId,
    options.customLat,
    options.customLon,
    options.customLocationName,
    options.customCountry,
    options.timezoneName
  );

  const prayerMethod = options.prayerMethod || 'karachi';
  const asrMethod = options.asrMethod || 'hanafi';
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const noonUtc = new Date(Date.UTC(year, month, day, 12, 0, 0));

  const asrJuristicName =
    asrMethod === 'hanafi' ? 'Hanafi (Asr: 2x Shadow)' : 'Standard / Shafi\'i (Asr: 1x Shadow)';
  const methodName =
    prayerMethod === 'mwl'
      ? 'Muslim World League (Fajr 18°, Isha 17°)'
      : prayerMethod === 'makkah'
      ? 'Umm al-Qura University, Makkah (Fajr 18.5°, Isha +90 min)'
      : prayerMethod === 'egypt'
      ? 'Egyptian General Survey Authority (Fajr 19.5°, Isha 17.5°)'
      : 'Univ. of Islamic Sciences, Karachi (Fajr 18°, Isha 18°)';

  if (city.id === 'unset' || !isValidCoordinatePair(city.latitude, city.longitude)) {
    const deviceTz = options.timezoneName || getDeviceTimezone();
    const tzOffsetHours =
      options.timezoneOffsetHours !== undefined
        ? options.timezoneOffsetHours
        : getTimezoneOffsetHoursForZone(deviceTz, noonUtc);
    const tzOffsetStr = formatUtcOffset(tzOffsetHours);

    return {
      hasLocation: false,
      times: {
        fajr: '--:--',
        sunrise: '--:--',
        dhuhr: '--:--',
        asr: '--:--',
        maghrib: '--:--',
        isha: '--:--',
        sehriEnds: '--:--',
        iftarTime: '--:--',
      },
      cityName: 'Location not set',
      countryName: '',
      cityNameUr: 'مقام منتخب نہیں',
      coordinates: 'Not set',
      timezoneName: deviceTz,
      timezoneOffsetStr: tzOffsetStr,
      methodName,
      asrJuristicName,
      disclaimer: `Location not set. Select a city, enable geolocation, or enter coordinates to calculate prayer times (${deviceTz}, ${tzOffsetStr}).`,
      disclaimerUr: `مقام منتخب نہیں ہے۔ اوقاتِ نماز دیکھنے کے لیے شہر منتخب کریں یا لوکیشن فعال کریں۔ (${deviceTz})`,
    };
  }

  const lat = city.latitude;
  const lon = city.longitude;

  // Resolve appropriate timezone for the geographical location (supporting DST)
  const tzName = options.timezoneName || city.timezone || getDeviceTimezone();
  const tzOffsetHours =
    options.timezoneOffsetHours !== undefined
      ? options.timezoneOffsetHours
      : getTimezoneOffsetHoursForZone(tzName, noonUtc);

  const tzOffsetStr = formatUtcOffset(tzOffsetHours);

  // DST-safe integer day of year (1..366)
  const dayOfYear = Math.round(
    (Date.UTC(year, month, day) - Date.UTC(year, 0, 0)) / 86400000
  );

  // Solar position parameters
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const declination = 23.45 * Math.sin(b);

  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;

  // Local Timezone Meridian Longitude correction (standardMeridian = tzOffsetHours * 15°)
  const standardMeridian = tzOffsetHours * 15;
  const lonCorrection = (standardMeridian - lon) * 4; // minutes
  const solarNoonMin = 12 * 60 + lonCorrection - eot;

  // Helper to compute hour angle (in degrees) for a target solar altitude angle
  const getHourAngleInfo = (
    altitudeDeg: number
  ): { ha: number; neverReachesBelow: boolean } => {
    const altRad = (altitudeDeg * Math.PI) / 180;
    const cosHA =
      (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) /
      (Math.cos(latRad) * Math.cos(decRad));
    if (cosHA > 1) return { ha: 0, neverReachesBelow: false };
    if (cosHA < -1) return { ha: 180, neverReachesBelow: true };
    return {
      ha: (Math.acos(cosHA) * 180) / Math.PI,
      neverReachesBelow: false,
    };
  };

  // Determine Fajr & Isha twilight angles based on method
  let fajrAngle = -18;
  let ishaAngle: number | null = -18;
  let ishaFixedOffsetMin: number | null = null;

  switch (prayerMethod) {
    case 'mwl':
      fajrAngle = -18;
      ishaAngle = -17;
      break;
    case 'makkah':
      fajrAngle = -18.5;
      ishaAngle = null;
      ishaFixedOffsetMin = 90; // 90 min after Maghrib
      break;
    case 'egypt':
      fajrAngle = -19.5;
      ishaAngle = -17.5;
      break;
    case 'karachi':
    default:
      fajrAngle = -18;
      ishaAngle = -18;
      break;
  }

  // Sunrise & Sunset Times (Sun center at -0.8333° for atmospheric refraction & solar radius)
  const sunriseHA = getHourAngleInfo(-0.8333).ha;
  const sunriseMin = solarNoonMin - sunriseHA * 4;
  const sunsetMin = solarNoonMin + sunriseHA * 4;
  const nightMinutes = Math.max(0, 1440 - (sunsetMin - sunriseMin));

  // Fajr Time (uses Angle-Based high-latitude adjustment when sun stays above fajrAngle all night)
  const fajrInfo = getHourAngleInfo(fajrAngle);
  const fajrMin =
    fajrInfo.neverReachesBelow && nightMinutes > 0
      ? sunriseMin - (Math.abs(fajrAngle) / 60) * nightMinutes
      : solarNoonMin - fajrInfo.ha * 4;

  // Dhuhr Time (Solar Noon + 1 min buffer after zenith)
  const dhuhrMin = solarNoonMin + 1;

  // Asr Time:
  // Standard (Shafi'i/Maliki/Hanbali): shadow = 1x object length + noon shadow
  // Hanafi: shadow = 2x object length + noon shadow
  const asrShadowRatio = asrMethod === 'hanafi' ? 2 : 1;
  const noonShadowRatio = Math.tan(Math.abs(latRad - decRad));
  const asrAltitudeRad = Math.atan(1 / (asrShadowRatio + noonShadowRatio));
  const asrAltitudeDeg = (asrAltitudeRad * 180) / Math.PI;
  const asrHA = getHourAngleInfo(asrAltitudeDeg).ha;
  const asrMin = solarNoonMin + asrHA * 4;

  // Maghrib Time: Sunset + 2 min safety precaution
  const maghribMin = sunsetMin + 2;

  // Isha Time (uses Angle-Based high-latitude adjustment when sun stays above ishaAngle all night)
  let ishaMin: number;
  if (ishaAngle !== null) {
    const ishaInfo = getHourAngleInfo(ishaAngle);
    ishaMin =
      ishaInfo.neverReachesBelow && nightMinutes > 0
        ? sunsetMin + (Math.abs(ishaAngle) / 60) * nightMinutes
        : solarNoonMin + ishaInfo.ha * 4;
  } else {
    ishaMin = maghribMin + (ishaFixedOffsetMin || 90);
  }

  // Precautionary Sehri Ends (10 minutes before true dawn / Fajr)
  const sehriEndsMin = fajrMin - 10;

  const formatMin = (m: number): string => {
    let rounded = Math.round(m);
    while (rounded < 0) rounded += 1440;
    while (rounded >= 1440) rounded -= 1440;
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

  const displayLabel = formatCityCountryLabel(city);

  return {
    hasLocation: true,
    times,
    cityName: displayLabel,
    countryName: city.country,
    cityNameUr: city.nameUr,
    coordinates: `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`,
    timezoneName: tzName,
    timezoneOffsetStr: tzOffsetStr,
    methodName,
    asrJuristicName,
    disclaimer: `Estimated astronomical prayer times for ${displayLabel} (${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}) in ${tzName} (${tzOffsetStr}). Please confirm with your local mosque timetable.`,
    disclaimerUr: `یہ اوقاتِ نماز فلکیاتی حساب سے ${city.nameUr} (${tzName}) کے لیے تخمیناً تیار کیے گئے ہیں۔ حتمی اوقات کے لیے مقامی مسجد کی اذان و جماعت کی پیروی کریں۔`,
  };
}
