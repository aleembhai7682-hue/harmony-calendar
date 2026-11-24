/**
 * Islamic Prayer Timetable Engine (Powered by Adhan.js astronomical algorithms)
 * Calculates high-precision Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha,
 * Sehri Ends (~10 min before Fajr), and Iftar (= Maghrib) for any city or geographic coordinates worldwide.
 *
 * Supports:
 * - Calculation methods: Karachi, Muslim World League (MWL), Umm al-Qura (Makkah), Egyptian
 * - Asr juristic schools: Hanafi (2x shadow) and Standard / Shafi'i (1x shadow)
 * - High-latitude rules via HighLatitudeRule.recommended(coordinates)
 * - Per-instant DST-aware formatting in the location's IANA timezone
 */

import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  Madhab,
  HighLatitudeRule,
  PrayerTimes as AdhanPrayerTimes,
} from 'adhan';
import { PrayerTimes } from '../types/calendar';
import {
  getCityLocation,
  getUnsetLocation,
  CityLocation,
  isValidCoordinatePair,
  formatCityCountryLabel,
} from './cities';
import {
  getDeviceTimezone,
  getTimezoneOffsetHoursForZone,
  formatUtcOffset,
  isValidIanaTimezone,
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
  locationExplicitlyConfirmed?: boolean;
}

export interface DetailedPrayerInfo {
  hasLocation: boolean;
  timezoneMissing?: boolean;
  times: PrayerTimes;
  cityName: string;
  countryName: string;
  cityNameUr: string;
  coordinates: string;
  timezoneName: string;
  timezoneOffsetStr: string;
  methodName: string;
  methodShortName: string;
  asrJuristicName: string;
  asrShortName: string;
  disclaimer: string;
  disclaimerUr: string;
}

function getAdhanParameters(
  prayerMethod: 'karachi' | 'mwl' | 'makkah' | 'egypt',
  asrMethod: 'hanafi' | 'standard',
  coordinates: Coordinates
): CalculationParameters {
  let params: CalculationParameters;
  switch (prayerMethod) {
    case 'mwl':
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 'makkah':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'egypt':
      params = CalculationMethod.Egyptian();
      break;
    case 'karachi':
    default:
      params = CalculationMethod.Karachi();
      break;
  }

  params.madhab = asrMethod === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  return params;
}

function formatUtcDateInLocationZone(
  utcDate: Date,
  tzName: string,
  explicitOffsetHours?: number
): string {
  if (!utcDate || Number.isNaN(utcDate.getTime())) {
    return '--:--';
  }

  if (explicitOffsetHours !== undefined && !Number.isNaN(explicitOffsetHours)) {
    const shifted = new Date(utcDate.getTime() + Math.round(explicitOffsetHours * 3600000));
    const h = shifted.getUTCHours();
    const m = shifted.getUTCMinutes();
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzName,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(utcDate);
    let hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    if (hour === 24) hour = 0;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  } catch {
    const h = utcDate.getHours();
    const m = utcDate.getMinutes();
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}

/**
 * Calculates astronomically accurate prayer times for a given date and configuration using Adhan.js.
 * Strictly uses selected & confirmed location and its appropriate geographical IANA timezone (supporting DST).
 * Never hardcodes or silently falls back to Mumbai or IST.
 */
export function calculateLocationPrayerTimes(
  date: Date,
  options: PrayerCalculationOptions = {}
): DetailedPrayerInfo {
  const isExplicitlyUnconfirmed = options.locationExplicitlyConfirmed === false;

  const city: CityLocation = isExplicitlyUnconfirmed
    ? getUnsetLocation()
    : getCityLocation(
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
    asrMethod === 'hanafi' ? 'Hanafi (Asr: 2x Shadow)' : "Standard / Shafi'i (Asr: 1x Shadow)";
  const asrShortName = asrMethod === 'hanafi' ? 'Hanafi (2x)' : 'Standard (1x)';
  const methodName =
    prayerMethod === 'mwl'
      ? 'Muslim World League (Fajr 18°, Isha 17°)'
      : prayerMethod === 'makkah'
      ? 'Umm al-Qura University, Makkah (Fajr 18.5°, Isha +90 min)'
      : prayerMethod === 'egypt'
      ? 'Egyptian General Survey Authority (Fajr 19.5°, Isha 17.5°)'
      : 'Univ. of Islamic Sciences, Karachi (Fajr 18°, Isha 18°)';
  const methodShortName =
    prayerMethod === 'mwl'
      ? 'MWL'
      : prayerMethod === 'makkah'
      ? 'Makkah'
      : prayerMethod === 'egypt'
      ? 'Egypt'
      : 'Karachi';

  if (city.id === 'unset' || !isValidCoordinatePair(city.latitude, city.longitude)) {
    const deviceTz = options.timezoneName && isValidIanaTimezone(options.timezoneName)
      ? options.timezoneName
      : getDeviceTimezone();
    const tzOffsetHours =
      options.timezoneOffsetHours !== undefined
        ? options.timezoneOffsetHours
        : getTimezoneOffsetHoursForZone(deviceTz, noonUtc);
    const tzOffsetStr = formatUtcOffset(tzOffsetHours);

    return {
      hasLocation: false,
      timezoneMissing: false,
      times: {
        fajr: 'Location required',
        sunrise: 'Location required',
        dhuhr: 'Location required',
        asr: 'Location required',
        maghrib: 'Location required',
        isha: 'Location required',
        sehriEnds: 'Location required',
        iftarTime: 'Location required',
      },
      cityName: 'Location not set',
      countryName: '',
      cityNameUr: 'مقام منتخب نہیں',
      coordinates: 'Not set',
      timezoneName: deviceTz,
      timezoneOffsetStr: tzOffsetStr,
      methodName,
      methodShortName,
      asrJuristicName,
      asrShortName,
      disclaimer:
        'Location required — Please select city or enable GPS to calculate prayer times. Always confirm prayer times with your local mosque.',
      disclaimerUr:
        'مقام درکار ہے۔ براہ کرم شہر منتخب کریں یا GPS فعال کریں۔ حتمی اوقات کے لیے اپنی مقامی مسجد سے تصدیق کریں۔',
    };
  }

  const lat = city.latitude;
  const lon = city.longitude;
  const displayLabel = formatCityCountryLabel(city);
  const coordStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

  // Resolve appropriate timezone for the geographical location (supporting DST).
  // Never silently fall back to the device timezone when geographical resolution fails.
  const explicitTz = options.timezoneName?.trim();
  const tzName =
    explicitTz && isValidIanaTimezone(explicitTz)
      ? explicitTz
      : city.timezone && isValidIanaTimezone(city.timezone)
      ? city.timezone
      : '';

  if (!tzName && options.timezoneOffsetHours === undefined) {
    return {
      hasLocation: true,
      timezoneMissing: true,
      times: {
        fajr: 'Timezone required',
        sunrise: 'Timezone required',
        dhuhr: 'Timezone required',
        asr: 'Timezone required',
        maghrib: 'Timezone required',
        isha: 'Timezone required',
        sehriEnds: 'Timezone required',
        iftarTime: 'Timezone required',
      },
      cityName: displayLabel,
      countryName: city.country,
      cityNameUr: city.nameUr,
      coordinates: coordStr,
      timezoneName: '',
      timezoneOffsetStr: 'Timezone required',
      methodName,
      methodShortName,
      asrJuristicName,
      asrShortName,
      disclaimer: `Geographical timezone could not be determined for ${displayLabel} (${coordStr}). Please select an IANA timezone manually before calculating prayer times.`,
      disclaimerUr: `${city.nameUr} (${coordStr}) کے لیے جغرافیائی ٹائم زون معلوم نہیں ہو سکا۔ درست اوقاتِ نماز کے لیے براہ کرم دستی طور پر IANA ٹائم زون منتخب کریں۔`,
    };
  }

  // Adhan calculation engine
  const coordinates = new Coordinates(lat, lon);
  const params = getAdhanParameters(prayerMethod, asrMethod, coordinates);
  const calcDate = new Date(year, month, day, 12, 0, 0);
  const adhanTimes = new AdhanPrayerTimes(coordinates, calcDate, params);

  const tzOffsetHours =
    options.timezoneOffsetHours !== undefined
      ? options.timezoneOffsetHours
      : getTimezoneOffsetHoursForZone(tzName, adhanTimes.dhuhr || noonUtc);
  const tzOffsetStr = formatUtcOffset(tzOffsetHours);

  // Sehri Ends (Imsak precautionary cutoff ~10 minutes before true dawn / Fajr)
  const sehriEndsDate = new Date(adhanTimes.fajr.getTime() - 10 * 60_000);
  // Iftar occurs strictly at Maghrib sunset
  const iftarDate = adhanTimes.maghrib;

  const fmt = (d: Date) =>
    formatUtcDateInLocationZone(d, tzName, options.timezoneOffsetHours);

  const times: PrayerTimes = {
    fajr: fmt(adhanTimes.fajr),
    sunrise: fmt(adhanTimes.sunrise),
    dhuhr: fmt(adhanTimes.dhuhr),
    asr: fmt(adhanTimes.asr),
    maghrib: fmt(adhanTimes.maghrib),
    isha: fmt(adhanTimes.isha),
    sehriEnds: fmt(sehriEndsDate),
    iftarTime: fmt(iftarDate),
  };

  return {
    hasLocation: true,
    timezoneMissing: false,
    times,
    cityName: displayLabel,
    countryName: city.country,
    cityNameUr: city.nameUr,
    coordinates: coordStr,
    timezoneName: tzName || tzOffsetStr,
    timezoneOffsetStr: tzOffsetStr,
    methodName,
    methodShortName,
    asrJuristicName,
    asrShortName,
    disclaimer: `Calculated via Adhan astronomical engine (${methodName}, ${asrJuristicName}) for ${displayLabel} (${coordStr}) in ${tzName || tzOffsetStr} (${tzOffsetStr}). Please confirm prayer times with your local mosque.`,
    disclaimerUr: `یہ اوقاتِ نماز فلکیاتی حساب سے ${city.nameUr} (${coordStr} • ${tzName || tzOffsetStr}، ${tzOffsetStr}) — طریقہ: ${methodName.split('(')[0].trim()} • عصر: ${asrMethod === 'hanafi' ? 'حنفی (2x)' : 'جمہور/شافعی (1x)'} کے مطابق تیار کیے گئے ہیں۔ حتمی اوقات کے لیے مقامی مسجد سے تصدیق کریں۔`,
  };
}
