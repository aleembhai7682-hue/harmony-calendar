/**
 * Hindu Panchang & Vedic Astronomical Engine (Drik Ganita / Lahiri Siddhanta)
 * Calculates Tithi, Paksha, Nakshatra, Yoga, Karana, Vikram & Shaka Samvat,
 * and Adhan-calibrated astronomical Sunrise, Sunset, Solar Noon, Abhijit Muhurat, and Rahu Kaal.
 *
 * NOTE: Language rule strictly enforces Hindi, Sanskrit, and English only.
 * Zero Urdu text or typography is included in this module.
 */

import {
  Coordinates,
  CalculationMethod,
  HighLatitudeRule,
  PrayerTimes as AdhanPrayerTimes,
} from 'adhan';
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

export interface HinduPanchangInfo {
  hasLocation: boolean;
  timezoneMissing?: boolean;
  cityName: string;
  countryName: string;
  coordinates: string;
  timezoneName: string;
  timezoneOffsetStr: string;
  sunriseTime: string; // "06:42 AM" or "Location required"
  sunsetTime: string;  // "06:05 PM" or "Location required"
  solarNoonTime: string;
  vikramSamvat: number;
  shakaSamvat: number;
  tithiNumber: number; // 1 to 30
  tithiNameEn: string;
  tithiNameHi: string;
  pakshaEn: 'Shukla Paksha (Waxing)' | 'Krishna Paksha (Waning)';
  pakshaHi: 'शुक्ल पक्ष' | 'कृष्ण पक्ष';
  nakshatraNumber: number; // 1 to 27
  nakshatraNameEn: string;
  nakshatraNameHi: string;
  nakshatraDeityHi: string;
  yogaNumber: number; // 1 to 27
  yogaNameEn: string;
  yogaNameHi: string;
  yogaQualityEn: string;
  karanaNumber: number; // 1 to 60
  karanaNameEn: string;
  karanaNameHi: string;
  hinduMonthEn: string;
  hinduMonthHi: string;
  isEkadashi: boolean;
  isPurnima: boolean;
  isAmavasya: boolean;
  isPradosh: boolean;
  auspiciousTag?: string;
  auspiciousTagHi?: string;
  abhijitMuhurat: string;
  rahuKaal: string;
  calculationBasis: string;
}

const TITHIS_META = [
  { en: 'Pratipada (Padwa)', hi: 'प्रतिपदा (पड़वा)' },
  { en: 'Dwitiya (Dooj)', hi: 'द्वितीया (दूज)' },
  { en: 'Tritiya (Teej)', hi: 'तृतीया (तीज)' },
  { en: 'Chaturthi (Chauth)', hi: 'चतुर्थी (चौथ)' },
  { en: 'Panchami', hi: 'पंचमी' },
  { en: 'Shashthi (Chhath)', hi: 'षष्ठी (छठ)' },
  { en: 'Saptami', hi: 'सप्तमी' },
  { en: 'Ashtami', hi: 'अष्टमी' },
  { en: 'Navami', hi: 'नवमी' },
  { en: 'Dashami', hi: 'दशमी' },
  { en: 'Ekadashi (Gyaras)', hi: 'एकादशी (ग्यारस - पवित्र व्रत)' },
  { en: 'Dwadashi (Baras)', hi: 'द्वादशी (बारस)' },
  { en: 'Trayodashi (Teras - Pradosh)', hi: 'त्रयोदशी (तेरस - प्रदोष)' },
  { en: 'Chaturdashi (Chaudas)', hi: 'चतुर्दशी (चौदस)' },
  { en: 'Purnima (Full Moon)', hi: 'पूर्णिमा (सत्यनारायण पूजा)' },
  // Krishna Paksha 16-30
  { en: 'Pratipada (Krishna)', hi: 'प्रतिपदा (कृष्ण पक्ष)' },
  { en: 'Dwitiya', hi: 'द्वितीया' },
  { en: 'Tritiya', hi: 'तृतीया' },
  { en: 'Chaturthi (Sankashti)', hi: 'चतुर्थी (संकष्टी गणेश चतुर्थी)' },
  { en: 'Panchami', hi: 'पंचमी' },
  { en: 'Shashthi', hi: 'षष्ठी' },
  { en: 'Saptami', hi: 'सप्तमी' },
  { en: 'Ashtami (Kalaashtami)', hi: 'अष्टमी (कालाष्टमी)' },
  { en: 'Navami', hi: 'नवमी' },
  { en: 'Dashami', hi: 'दशमी' },
  { en: 'Ekadashi (Krishna Vrat)', hi: 'एकादशी (कृष्ण एकादशी व्रत)' },
  { en: 'Dwadashi', hi: 'द्वादशी' },
  { en: 'Trayodashi (Pradosh Vrat)', hi: 'त्रयोदशी (शिव प्रदोष व्रत)' },
  { en: 'Chaturdashi (Shivratri)', hi: 'चतुर्दशी (मासिक शिवरात्रि)' },
  { en: 'Amavasya (New Moon)', hi: 'अमावस्या (पितृ तर्पण एवं ध्यान)' },
];

const NAKSHATRAS_META = [
  { en: 'Ashwini', hi: 'अश्विनी', deity: 'अश्विनी कुमार' },
  { en: 'Bharani', hi: 'भरणी', deity: 'यमराज' },
  { en: 'Krittika', hi: 'कृत्तिका', deity: 'अग्नि देव' },
  { en: 'Rohini', hi: 'रोहिणी', deity: 'ब्रह्मा जी' },
  { en: 'Mrigashira', hi: 'मृगशिरा', deity: 'चंद्र देव' },
  { en: 'Ardra', hi: 'आर्द्रा', deity: 'रुद्र (शिव)' },
  { en: 'Punarvasu', hi: 'पुनर्वसु', deity: 'अदिति माता' },
  { en: 'Pushya', hi: 'पुष्य (सर्वश्रेष्ठ नक्षत्र)', deity: 'बृहस्पति' },
  { en: 'Ashlesha', hi: 'आश्लेषा', deity: 'नाग देव' },
  { en: 'Magha', hi: 'मघा', deity: 'पितृगण' },
  { en: 'Purva Phalguni', hi: 'पूर्वा फाल्गुनी', deity: 'भग' },
  { en: 'Uttara Phalguni', hi: 'उत्तरा फाल्गुनी', deity: 'अर्यमा' },
  { en: 'Hasta', hi: 'हस्त', deity: 'सूर्य देव' },
  { en: 'Chitra', hi: 'चित्रा', deity: 'विश्वकर्मा' },
  { en: 'Swati', hi: 'स्वाती', deity: 'वायु देव' },
  { en: 'Vishakha', hi: 'विशाखा', deity: 'इंद्राग्नि' },
  { en: 'Anuradha', hi: 'अनुराधा', deity: 'मित्र' },
  { en: 'Jyeshtha', hi: 'ज्येष्ठा', deity: 'इंद्र देव' },
  { en: 'Mula', hi: 'मूल', deity: 'निऋति' },
  { en: 'Purva Ashadha', hi: 'पूर्वाषाढ़ा', deity: 'वरुण' },
  { en: 'Uttara Ashadha', hi: 'उत्तराषाढ़ा', deity: 'विश्वेदेव' },
  { en: 'Shravana', hi: 'श्रवण', deity: 'विष्णु भगवान' },
  { en: 'Dhanishta', hi: 'धनिष्ठा', deity: 'अष्ट वसु' },
  { en: 'Shatabhisha', hi: 'शतभिषा', deity: 'वरुण देव' },
  { en: 'Purva Bhadrapada', hi: 'पूर्वा भाद्रपद', deity: 'अजैकपाद' },
  { en: 'Uttara Bhadrapada', hi: 'उत्तरा भाद्रपद', deity: 'अहिर्बुध्न्य' },
  { en: 'Revati', hi: 'रेवती', deity: 'पूषा' },
];

const YOGAS_META = [
  { en: 'Vishkambha', hi: 'विष्कुम्भ', quality: 'Major Undertakings' },
  { en: 'Priti', hi: 'प्रीति (शुभ)', quality: 'Friendship & Goodwill' },
  { en: 'Ayushman', hi: 'आयुष्मान (अति शुभ)', quality: 'Longevity & Health' },
  { en: 'Saubhagya', hi: 'सौभाग्य (अति शुभ)', quality: 'Prosperity & Grace' },
  { en: 'Shobhana', hi: 'शोभन (शुभ)', quality: 'Beauty & Splendor' },
  { en: 'Atiganda', hi: 'अतिगण्ड', quality: 'Cautious Endeavors' },
  { en: 'Sukarma', hi: 'सुकर्मा (शुभ)', quality: 'Virtuous Actions' },
  { en: 'Dhriti', hi: 'धृति (शुभ)', quality: 'Patience & Fortitude' },
  { en: 'Shoola', hi: 'शूल', quality: 'Rest & Meditation' },
  { en: 'Ganda', hi: 'गण्ड', quality: 'Avoid New Agreements' },
  { en: 'Vriddhi', hi: 'वृद्धि (शुभ)', quality: 'Growth & Success' },
  { en: 'Dhruva', hi: 'ध्रुव (अति शुभ)', quality: 'Stability & Permanence' },
  { en: 'Vyaghata', hi: 'व्याघात', quality: 'Inner Contemplation' },
  { en: 'Harshana', hi: 'हर्षण (शुभ)', quality: 'Joy & Celebration' },
  { en: 'Vajra', hi: 'वज्र', quality: 'Inner Strength' },
  { en: 'Siddhi', hi: 'सिद्धि (अति शुभ)', quality: 'Spiritual Attainment' },
  { en: 'Vyatipata', hi: 'व्यतीपात', quality: 'Charity & Prayers' },
  { en: 'Variyan', hi: 'वरीयान् (शुभ)', quality: 'Comfort & Relief' },
  { en: 'Parigha', hi: 'परिघ', quality: 'Protective Routine' },
  { en: 'Shiva', hi: 'शिव (अति शुभ)', quality: 'Sacred Meditation' },
  { en: 'Siddha', hi: 'सिद्ध (शुभ)', quality: 'Accomplishment' },
  { en: 'Sadhya', hi: 'साध्य (शुभ)', quality: 'Fulfillment of Goals' },
  { en: 'Shubha', hi: 'शुभ (अति शुभ)', quality: 'Pure Auspiciousness' },
  { en: 'Shukla', hi: 'शुक्ल (शुभ)', quality: 'Clarity & Light' },
  { en: 'Brahma', hi: 'ब्रह्म (अति शुभ)', quality: 'Knowledge & Wisdom' },
  { en: 'Indra', hi: 'इन्द्र (शुभ)', quality: 'Leadership & Honor' },
  { en: 'Vaidhriti', hi: 'वैधृति', quality: 'Introspection & Puja' },
];

const KARANAS_NAMES = [
  { en: 'Bava', hi: 'बव' },
  { en: 'Balava', hi: 'बालव' },
  { en: 'Kaulava', hi: 'कौलव' },
  { en: 'Taitila', hi: 'तैतिल' },
  { en: 'Gara', hi: 'गर' },
  { en: 'Vanija', hi: 'वणिज' },
  { en: 'Vishti (Bhadra)', hi: 'विष्टि (भद्रा)' },
  { en: 'Shakuni', hi: 'शकुनि' },
  { en: 'Chatushpada', hi: 'चतुष्पद' },
  { en: 'Naga', hi: 'नाग' },
  { en: 'Kintughna', hi: 'किंस्तुघ्न' },
];

const HINDU_MONTHS = [
  { en: 'Chaitra', hi: 'चैत्र' },
  { en: 'Vaishakha', hi: 'वैशाख' },
  { en: 'Jyeshtha', hi: 'ज्येष्ठ' },
  { en: 'Ashadha', hi: 'आषाढ़' },
  { en: 'Shravana', hi: 'श्रावण (सावन)' },
  { en: 'Bhadrapada', hi: 'भाद्रपद (भादो)' },
  { en: 'Ashwina', hi: 'आश्विन (क्वार)' },
  { en: 'Kartika', hi: 'कार्तिक' },
  { en: 'Margashirsha', hi: 'मार्गशीर्ष (अगहन)' },
  { en: 'Pausha', hi: 'पौष (पूस)' },
  { en: 'Magha', hi: 'माघ' },
  { en: 'Phalguna', hi: 'फाल्गुन' },
];

/**
 * Normalizes degrees to [0, 360)
 */
function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/**
 * Computes Julian Day from a UTC Date instant
 */
function getJulianDayFromUtcMs(utcMs: number): number {
  return utcMs / 86400000 + 2440587.5;
}

/**
 * Formats a UTC Date instant into "hh:mm AM/PM" strictly in the target IANA timezone (DST-aware),
 * or using explicit numeric UTC offset if provided.
 */
function formatUtcInstant12hInZone(
  utcDate: Date,
  tzName: string,
  explicitOffsetHours?: number
): string {
  if (!utcDate || Number.isNaN(utcDate.getTime())) {
    return 'Location required';
  }

  let hour24 = 0;
  let minute = 0;

  if (explicitOffsetHours !== undefined && !Number.isNaN(explicitOffsetHours)) {
    const shifted = new Date(utcDate.getTime() + Math.round(explicitOffsetHours * 3600000));
    hour24 = shifted.getUTCHours();
    minute = shifted.getUTCMinutes();
  } else {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzName,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const parts = formatter.formatToParts(utcDate);
      hour24 = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
      minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
      if (hour24 === 24) hour24 = 0;
    } catch {
      hour24 = utcDate.getHours();
      minute = utcDate.getMinutes();
    }
  }

  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
}

/**
 * Calculates Solar and Lunar Ecliptic Longitude (Lahiri Chitrapaksha ayanamsha)
 * and Adhan-calibrated astronomical Sunrise, Sunset, Solar Noon, Abhijit Muhurat, and Rahu Kaal.
 * Never silently falls back to Mumbai or IST.
 */
export function getHinduPanchang(
  date: Date,
  cityId?: string,
  customLat?: number,
  customLon?: number,
  customName?: string,
  customTzOffsetHours?: number,
  customCountry?: string,
  customTimezone?: string,
  locationExplicitlyConfirmed?: boolean
): HinduPanchangInfo {
  const isExplicitlyUnconfirmed = locationExplicitlyConfirmed === false;

  const city: CityLocation = isExplicitlyUnconfirmed
    ? getUnsetLocation()
    : getCityLocation(
        cityId,
        customLat,
        customLon,
        customName,
        customCountry,
        customTimezone
      );
  const hasLocation = city.id !== 'unset' && isValidCoordinatePair(city.latitude, city.longitude);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const noonUtc = new Date(Date.UTC(year, month, day, 12, 0, 0));

  const explicitTz = customTimezone?.trim();
  const resolvedLocationTz =
    explicitTz && isValidIanaTimezone(explicitTz)
      ? explicitTz
      : city.timezone && isValidIanaTimezone(city.timezone)
      ? city.timezone
      : '';

  const timezoneMissing =
    hasLocation && !resolvedLocationTz && customTzOffsetHours === undefined;

  const tzName = hasLocation ? resolvedLocationTz : getDeviceTimezone();

  // Compute astronomical Sunrise, Sunset, Solar Noon using Adhan.js when location & timezone exist
  let sunriseUtc: Date | null = null;
  let sunsetUtc: Date | null = null;
  let solarNoonUtc: Date | null = null;

  if (hasLocation && !timezoneMissing) {
    const coordinates = new Coordinates(city.latitude, city.longitude);
    const solarParams = CalculationMethod.MuslimWorldLeague();
    solarParams.methodAdjustments.dhuhr = 0;
    solarParams.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
    const calcDate = new Date(year, month, day, 12, 0, 0);
    const solarTimes = new AdhanPrayerTimes(coordinates, calcDate, solarParams);

    if (
      solarTimes.sunrise &&
      solarTimes.sunset &&
      !Number.isNaN(solarTimes.sunrise.getTime()) &&
      !Number.isNaN(solarTimes.sunset.getTime())
    ) {
      sunriseUtc = solarTimes.sunrise;
      sunsetUtc = solarTimes.sunset;
      solarNoonUtc =
        solarTimes.dhuhr && !Number.isNaN(solarTimes.dhuhr.getTime())
          ? solarTimes.dhuhr
          : new Date((sunriseUtc.getTime() + sunsetUtc.getTime()) / 2);
    }
  }

  const offsetRefDate = sunriseUtc || noonUtc;
  const tzOffsetHours = timezoneMissing
    ? 0
    : customTzOffsetHours !== undefined
    ? customTzOffsetHours
    : getTimezoneOffsetHoursForZone(tzName, offsetRefDate);

  const tzOffsetStr = timezoneMissing ? 'Timezone required' : formatUtcOffset(tzOffsetHours);

  // Calibrate Panchang Julian Day to exact local sunrise when confirmed, or local 06:00 morning otherwise
  const panchangaEpochUtcMs = sunriseUtc
    ? sunriseUtc.getTime()
    : Date.UTC(year, month, day, 6, 0, 0) - Math.round(tzOffsetHours * 3600000);

  const jd = getJulianDayFromUtcMs(panchangaEpochUtcMs);
  const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000.0

  // High-precision Apparent Solar Longitude (Meeus Ch. 25)
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M_sun = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const M_sunRad = (M_sun * Math.PI) / 180;
  const C_sun =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_sunRad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M_sunRad) +
    0.000289 * Math.sin(3 * M_sunRad);
  const omega = 125.04 - 1934.136 * T;
  const omegaRad = (omega * Math.PI) / 180;
  const sunApparentSayana = normalizeDeg(L0 + C_sun - 0.00569 - 0.00478 * Math.sin(omegaRad));

  // Lunar Ecliptic Longitude (Meeus principal periodic terms)
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841;
  const Mm = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868;

  const MmRad = (Mm * Math.PI) / 180;
  const DRad = (D * Math.PI) / 180;
  const FRad = (F * Math.PI) / 180;

  const moonPerturbations =
    6.288774 * Math.sin(MmRad) +
    1.274027 * Math.sin(2 * DRad - MmRad) +
    0.658314 * Math.sin(2 * DRad) +
    0.213618 * Math.sin(2 * MmRad) -
    0.185116 * Math.sin(M_sunRad) -
    0.114332 * Math.sin(2 * FRad) +
    0.058793 * Math.sin(2 * (DRad - MmRad)) +
    0.057066 * Math.sin(2 * DRad - M_sunRad - MmRad) +
    0.053322 * Math.sin(2 * DRad + MmRad) +
    0.045758 * Math.sin(2 * DRad - M_sunRad) -
    0.040923 * Math.sin(M_sunRad - MmRad) -
    0.03472 * Math.sin(DRad) -
    0.030383 * Math.sin(M_sunRad + MmRad);

  const moonLongSayana = normalizeDeg(Lp + moonPerturbations - 0.00478 * Math.sin(omegaRad));

  // Lahiri (Chitrapaksha) Ayanamsha (J2000 reference 23°51'25.53" = 23.857092°)
  const ayanamsha = 23.857092 + 1.396042 * T + 0.000308 * T * T;
  const sunLongNirayana = normalizeDeg(sunApparentSayana - ayanamsha);
  const moonLongNirayana = normalizeDeg(moonLongSayana - ayanamsha);

  // Tithi, Nakshatra, Yoga, Karana
  const elongation = normalizeDeg(moonLongSayana - sunApparentSayana);
  const tithiIndex = Math.min(29, Math.floor(elongation / 12));
  const tithiNum = tithiIndex + 1;
  const isShukla = tithiNum <= 15;
  const tithiMeta = TITHIS_META[tithiIndex] || TITHIS_META[0];

  const nakshatraIndex = Math.min(26, Math.floor(moonLongNirayana / (360 / 27)));
  const nakshatraMeta = NAKSHATRAS_META[nakshatraIndex] || NAKSHATRAS_META[0];

  const yogaIndex = Math.min(
    26,
    Math.floor(normalizeDeg(sunLongNirayana + moonLongNirayana) / (360 / 27))
  );
  const yogaMeta = YOGAS_META[yogaIndex] || YOGAS_META[0];

  const karanaIndexTotal = Math.min(59, Math.floor(elongation / 6));
  let karanaMeta: { en: string; hi: string };
  if (karanaIndexTotal === 0) {
    karanaMeta = KARANAS_NAMES[10];
  } else if (karanaIndexTotal >= 57) {
    karanaMeta = KARANAS_NAMES[7 + (karanaIndexTotal - 57)] || KARANAS_NAMES[0];
  } else {
    karanaMeta = KARANAS_NAMES[(karanaIndexTotal - 1) % 7];
  }

  const isAfterChaitra = month > 2 || (month === 2 && day >= 22);
  const vikramSamvat = year + (isAfterChaitra ? 57 : 56);
  const shakaSamvat = year - (isAfterChaitra ? 78 : 79);

  const solarRashiIndex = Math.floor(sunLongNirayana / 30);
  const hinduMonth = HINDU_MONTHS[solarRashiIndex] || HINDU_MONTHS[0];

  const isEkadashi = tithiNum === 11 || tithiNum === 26;
  const isPurnima = tithiNum === 15;
  const isAmavasya = tithiNum === 30;
  const isPradosh = tithiNum === 13 || tithiNum === 28;

  let auspiciousTag: string | undefined;
  let auspiciousTagHi: string | undefined;

  if (isEkadashi) {
    auspiciousTag = 'Holy Ekadashi Vrat (Lord Vishnu Fasting)';
    auspiciousTagHi = 'पवित्र एकादशी व्रत (भगवान विष्णु की आराधना)';
  } else if (isPurnima) {
    auspiciousTag = 'Purnima (Satyanarayan Puja & Full Moon)';
    auspiciousTagHi = 'सत्यनारायण पूजा एवं पवित्र पूर्णिमा स्नान';
  } else if (isAmavasya) {
    auspiciousTag = 'Amavasya (Ancestral Peace & Meditation)';
    auspiciousTagHi = 'पितृ शांति, दान एवं अमावस्या ध्यान';
  } else if (isPradosh) {
    auspiciousTag = 'Pradosh Vrat (Shiva Sandhya Aradhana)';
    auspiciousTagHi = 'प्रदोष व्रत (संध्या कालीन शिव आराधना)';
  }

  // Solar Timings (strictly computed only when confirmed coordinates + valid geographical IANA timezone exist)
  let sunriseStr = timezoneMissing ? 'Timezone required' : 'Location required';
  let sunsetStr = timezoneMissing ? 'Timezone required' : 'Location required';
  let solarNoonStr = timezoneMissing ? 'Timezone required' : 'Location required';
  let rahuKaalStr = timezoneMissing
    ? 'Timezone required'
    : 'Please select city or enable GPS';
  let abhijitStr = timezoneMissing
    ? 'Timezone required'
    : 'Please select city or enable GPS';
  let coordLabel = hasLocation
    ? `${Math.abs(city.latitude).toFixed(2)}°${city.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(city.longitude).toFixed(2)}°${city.longitude >= 0 ? 'E' : 'W'}`
    : 'Not set';

  if (hasLocation && !timezoneMissing && sunriseUtc && sunsetUtc && solarNoonUtc) {
    const dayDurationMs = Math.max(360 * 60_000, sunsetUtc.getTime() - sunriseUtc.getTime());

    sunriseStr = formatUtcInstant12hInZone(sunriseUtc, tzName, customTzOffsetHours);
    sunsetStr = formatUtcInstant12hInZone(sunsetUtc, tzName, customTzOffsetHours);
    solarNoonStr = formatUtcInstant12hInZone(solarNoonUtc, tzName, customTzOffsetHours);

    const partDurationMs = dayDurationMs / 8;
    const dayOfWeek = date.getDay();
    const rahuKaalParts = [8, 2, 7, 5, 6, 4, 1];
    const partNum = rahuKaalParts[dayOfWeek];
    const rahuStart = new Date(sunriseUtc.getTime() + (partNum - 1) * partDurationMs);
    const rahuEnd = new Date(sunriseUtc.getTime() + partNum * partDurationMs);
    rahuKaalStr = `${formatUtcInstant12hInZone(rahuStart, tzName, customTzOffsetHours)} - ${formatUtcInstant12hInZone(rahuEnd, tzName, customTzOffsetHours)}`;

    const abhijitHalfMs = dayDurationMs / 30;
    const abhijitStart = new Date(solarNoonUtc.getTime() - abhijitHalfMs);
    const abhijitEnd = new Date(solarNoonUtc.getTime() + abhijitHalfMs);
    const isWednesday = dayOfWeek === 3;
    abhijitStr = isWednesday
      ? `${formatUtcInstant12hInZone(abhijitStart, tzName, customTzOffsetHours)} - ${formatUtcInstant12hInZone(abhijitEnd, tzName, customTzOffsetHours)} (Subdued on Wed)`
      : `${formatUtcInstant12hInZone(abhijitStart, tzName, customTzOffsetHours)} - ${formatUtcInstant12hInZone(abhijitEnd, tzName, customTzOffsetHours)} (Auspicious)`;
  }

  const displayLabel = hasLocation ? formatCityCountryLabel(city) : 'Location not set';

  return {
    hasLocation,
    timezoneMissing,
    cityName: displayLabel,
    countryName: city.country,
    coordinates: coordLabel,
    timezoneName: tzName,
    timezoneOffsetStr: tzOffsetStr,
    sunriseTime: sunriseStr,
    sunsetTime: sunsetStr,
    solarNoonTime: solarNoonStr,
    vikramSamvat,
    shakaSamvat,
    tithiNumber: tithiNum,
    tithiNameEn: tithiMeta.en,
    tithiNameHi: tithiMeta.hi,
    pakshaEn: isShukla ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)',
    pakshaHi: isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष',
    nakshatraNumber: nakshatraIndex + 1,
    nakshatraNameEn: nakshatraMeta.en,
    nakshatraNameHi: nakshatraMeta.hi,
    nakshatraDeityHi: nakshatraMeta.deity,
    yogaNumber: yogaIndex + 1,
    yogaNameEn: yogaMeta.en,
    yogaNameHi: yogaMeta.hi,
    yogaQualityEn: yogaMeta.quality,
    karanaNumber: karanaIndexTotal + 1,
    karanaNameEn: karanaMeta.en,
    karanaNameHi: karanaMeta.hi,
    hinduMonthEn: hinduMonth.en,
    hinduMonthHi: hinduMonth.hi,
    isEkadashi,
    isPurnima,
    isAmavasya,
    isPradosh,
    auspiciousTag,
    auspiciousTagHi,
    abhijitMuhurat: abhijitStr,
    rahuKaal: rahuKaalStr,
    calculationBasis: timezoneMissing
      ? `Geographical timezone could not be determined for ${displayLabel} (${coordLabel}). Please select an IANA timezone manually before calculating Sunrise, Sunset, Abhijit Muhurat, and Rahu Kaal. For general guidance only.`
      : hasLocation
      ? `For general guidance only: Drik Ganita astronomical estimate (Lahiri Chitrapaksha Ayanamsha) with Adhan solar horizon timings for ${displayLabel} (${tzName}, ${tzOffsetStr}). Regional temple observances and local Panchang traditions may differ slightly.`
      : `Location required — Please select city or enable GPS for Sunrise, Sunset, Abhijit Muhurat, and Rahu Kaal. Lunar estimate shown in ${tzName} (${tzOffsetStr}) for general guidance only.`,
  };
}

export type ChoghadiyaType = 'Amrit' | 'Shubh' | 'Laabh' | 'Chal' | 'Udveg' | 'Rog' | 'Kaal';
export type ChoghadiyaTier = 'best' | 'good' | 'gain' | 'neutral' | 'avoid';

export interface ChoghadiyaDialSegment {
  id: string;
  period: 'beforeNoon' | 'afterNoon';
  name: ChoghadiyaType;
  nameHi: string;
  meaning: string;
  tier: ChoghadiyaTier;
  isDay: boolean;
  /** Minute offset within the 12-hour half-day dial [0..720] */
  startMin12h: number;
  endMin12h: number;
  /** Full unclipped slot label in target timezone */
  startTimeStr: string;
  endTimeStr: string;
  /** Clipped dial window label in target timezone */
  dialRangeStr: string;
  fullRangeStr: string;
  startUtcMs: number;
  endUtcMs: number;
}

export interface HoraSlotInfo {
  planetEn: string;
  planetHi: string;
  guidance: string;
  isAuspicious: boolean;
  isDay: boolean;
  startTimeStr: string;
  endTimeStr: string;
}

export interface GowriSlotInfo {
  nameEn: string;
  nameHi: string;
  meaning: string;
  tier: 'good' | 'moderate' | 'avoid';
  startTimeStr: string;
  endTimeStr: string;
}

export interface VedicMuhuratTimeline {
  hasLocation: boolean;
  timezoneMissing: boolean;
  timezoneName: string;
  timezoneOffsetStr: string;
  cityName: string;
  sunriseMinOfDay: number;
  sunsetMinOfDay: number;
  currentMinOfDay: number;
  currentPeriod: 'beforeNoon' | 'afterNoon';
  beforeNoonSegments: ChoghadiyaDialSegment[];
  afterNoonSegments: ChoghadiyaDialSegment[];
  currentHora: HoraSlotInfo | null;
  currentGowri: GowriSlotInfo | null;
}

const CHOGHADIYA_META: Record<
  ChoghadiyaType,
  { hi: string; meaning: string; tier: ChoghadiyaTier }
> = {
  Amrit: { hi: 'अमृत', meaning: 'Best', tier: 'best' },
  Shubh: { hi: 'शुभ', meaning: 'Auspicious', tier: 'good' },
  Laabh: { hi: 'लाभ', meaning: 'Gain', tier: 'gain' },
  Chal: { hi: 'चल', meaning: 'Neutral', tier: 'neutral' },
  Udveg: { hi: 'उद्वेग', meaning: 'Avoid', tier: 'avoid' },
  Rog: { hi: 'रोग', meaning: 'Avoid', tier: 'avoid' },
  Kaal: { hi: 'काल', meaning: 'Avoid', tier: 'avoid' },
};

const DAY_CHOGHADIYA_BY_DOW: ChoghadiyaType[][] = [
  ['Udveg', 'Chal', 'Laabh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sun
  ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Laabh', 'Amrit'], // Mon
  ['Rog', 'Udveg', 'Chal', 'Laabh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Tue
  ['Laabh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Laabh'], // Wed
  ['Shubh', 'Rog', 'Udveg', 'Chal', 'Laabh', 'Amrit', 'Kaal', 'Shubh'], // Thu
  ['Chal', 'Laabh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal'], // Fri
  ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Laabh', 'Amrit', 'Kaal'], // Sat
];

const NIGHT_CHOGHADIYA_BY_DOW: ChoghadiyaType[][] = [
  ['Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Laabh', 'Udveg', 'Shubh'], // Sun
  ['Chal', 'Rog', 'Kaal', 'Laabh', 'Udveg', 'Shubh', 'Amrit', 'Chal'], // Mon
  ['Kaal', 'Laabh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal'], // Tue
  ['Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Laabh', 'Udveg'], // Wed
  ['Amrit', 'Chal', 'Rog', 'Kaal', 'Laabh', 'Udveg', 'Shubh', 'Amrit'], // Thu
  ['Rog', 'Kaal', 'Laabh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog'], // Fri
  ['Laabh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Laabh'], // Sat
];

const CHALDEAN_PLANETS = [
  { en: 'Sun', hi: 'सूर्य', guidance: 'Leadership & Vitality', auspicious: true },
  { en: 'Venus', hi: 'शुक्र', guidance: 'Harmony, Art & Comfort', auspicious: true },
  { en: 'Mercury', hi: 'बुध', guidance: 'Study, Trade & Clarity', auspicious: true },
  { en: 'Moon', hi: 'चंद्र', guidance: 'Calm & Nurturing Tasks', auspicious: true },
  { en: 'Saturn', hi: 'शनि', guidance: 'Discipline & Routine Work', auspicious: false },
  { en: 'Jupiter', hi: 'गुरु', guidance: 'Wisdom, Prayer & Growth', auspicious: true },
  { en: 'Mars', hi: 'मंगल', guidance: 'Courage & Decisive Action', auspicious: false },
];

const SUNRISE_HORA_INDEX_BY_DOW = [0, 3, 6, 2, 5, 1, 4];

const GOWRI_DAY_BY_DOW: string[][] = [
  ['Uthi', 'Amirtham', 'Rogam', 'Labam', 'Dhanam', 'Sugam', 'Soram', 'Visham'],
  ['Amirtham', 'Sugam', 'Uthi', 'Dhanam', 'Soram', 'Rogam', 'Visham', 'Labam'],
  ['Rogam', 'Dhanam', 'Amirtham', 'Sugam', 'Uthi', 'Visham', 'Labam', 'Soram'],
  ['Labam', 'Uthi', 'Dhanam', 'Amirtham', 'Rogam', 'Soram', 'Sugam', 'Visham'],
  ['Dhanam', 'Labam', 'Sugam', 'Rogam', 'Amirtham', 'Uthi', 'Visham', 'Soram'],
  ['Sugam', 'Visham', 'Labam', 'Uthi', 'Dhanam', 'Amirtham', 'Soram', 'Rogam'],
  ['Visham', 'Soram', 'Sugam', 'Labam', 'Rogam', 'Dhanam', 'Uthi', 'Amirtham'],
];

const GOWRI_NIGHT_BY_DOW: string[][] = [
  ['Sugam', 'Amirtham', 'Dhanam', 'Labam', 'Uthi', 'Rogam', 'Soram', 'Visham'],
  ['Amirtham', 'Dhanam', 'Labam', 'Sugam', 'Visham', 'Uthi', 'Rogam', 'Soram'],
  ['Dhanam', 'Labam', 'Uthi', 'Amirtham', 'Soram', 'Sugam', 'Visham', 'Rogam'],
  ['Labam', 'Sugam', 'Amirtham', 'Dhanam', 'Rogam', 'Visham', 'Uthi', 'Soram'],
  ['Amirtham', 'Uthi', 'Sugam', 'Soram', 'Dhanam', 'Labam', 'Rogam', 'Visham'],
  ['Sugam', 'Labam', 'Dhanam', 'Amirtham', 'Visham', 'Rogam', 'Uthi', 'Soram'],
  ['Uthi', 'Dhanam', 'Sugam', 'Visham', 'Amirtham', 'Labam', 'Soram', 'Rogam'],
];

const GOWRI_META: Record<string, { hi: string; meaning: string; tier: 'good' | 'moderate' | 'avoid' }> = {
  Amirtham: { hi: 'अमृतम्', meaning: 'Best / Auspicious', tier: 'good' },
  Dhanam: { hi: 'धनम्', meaning: 'Prosperity & Wealth', tier: 'good' },
  Sugam: { hi: 'सुखम्', meaning: 'Peace & Comfort', tier: 'good' },
  Labam: { hi: 'लाभम्', meaning: 'Gain & Success', tier: 'good' },
  Uthi: { hi: 'उन्नति', meaning: 'Rising / Moderate', tier: 'moderate' },
  Rogam: { hi: 'रोगम्', meaning: 'Avoid New Starts', tier: 'avoid' },
  Soram: { hi: 'शोरम्', meaning: 'Avoid Risk', tier: 'avoid' },
  Visham: { hi: 'विषम्', meaning: 'Inauspicious', tier: 'avoid' },
};

function getMinutesRelativeToTargetDate(
  utcDate: Date,
  targetYear: number,
  targetMonthZeroBased: number,
  targetDay: number,
  tzName: string
): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzName,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(utcDate);
    const y = Number(parts.find((p) => p.type === 'year')?.value ?? targetYear);
    const m = Number(parts.find((p) => p.type === 'month')?.value ?? targetMonthZeroBased + 1);
    const d = Number(parts.find((p) => p.type === 'day')?.value ?? targetDay);
    let h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const min = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    if (h === 24) h = 0;

    const targetMidnightUtc = Date.UTC(targetYear, targetMonthZeroBased, targetDay);
    const actualMidnightUtc = Date.UTC(y, m - 1, d);
    const dayDiff = Math.round((actualMidnightUtc - targetMidnightUtc) / 86400000);
    return dayDiff * 1440 + h * 60 + min;
  } catch {
    return utcDate.getHours() * 60 + utcDate.getMinutes();
  }
}

function getAdhanSunriseSunset(lat: number, lon: number, dateObj: Date): { sunrise: Date; sunset: Date } | null {
  const coordinates = new Coordinates(lat, lon);
  const solarParams = CalculationMethod.MuslimWorldLeague();
  solarParams.methodAdjustments.dhuhr = 0;
  solarParams.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  const calcDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 12, 0, 0);
  const times = new AdhanPrayerTimes(coordinates, calcDate, solarParams);
  if (
    !times.sunrise ||
    !times.sunset ||
    Number.isNaN(times.sunrise.getTime()) ||
    Number.isNaN(times.sunset.getTime())
  ) {
    return null;
  }
  return { sunrise: times.sunrise, sunset: times.sunset };
}

/**
 * Computes full-day Before 12 PM & After 12 PM Choghadiya dial segments plus
 * active Planetary Hora and Gowri Panchang slot using Adhan astronomical sunrise/sunset.
 * Never silently falls back to Mumbai/IST when location or timezone is missing.
 */
export function getVedicMuhuratTimeline(
  targetDate: Date,
  nowInstant: Date,
  cityId?: string,
  customLat?: number,
  customLon?: number,
  customName?: string,
  customCountry?: string,
  customTimezone?: string,
  locationExplicitlyConfirmed?: boolean
): VedicMuhuratTimeline {
  const isExplicitlyUnconfirmed = locationExplicitlyConfirmed === false;
  const city: CityLocation = isExplicitlyUnconfirmed
    ? getUnsetLocation()
    : getCityLocation(cityId, customLat, customLon, customName, customCountry, customTimezone);

  const hasLocation = city.id !== 'unset' && isValidCoordinatePair(city.latitude, city.longitude);
  const explicitTz = customTimezone?.trim();
  const resolvedTz =
    explicitTz && isValidIanaTimezone(explicitTz)
      ? explicitTz
      : city.timezone && isValidIanaTimezone(city.timezone)
      ? city.timezone
      : '';
  const timezoneMissing = hasLocation && !resolvedTz;
  const tzName = hasLocation ? resolvedTz : getDeviceTimezone();
  const displayLabel = hasLocation ? formatCityCountryLabel(city) : 'Location not set';

  const currentMinRaw = getMinutesRelativeToTargetDate(
    nowInstant,
    nowInstant.getFullYear(),
    nowInstant.getMonth(),
    nowInstant.getDate(),
    tzName || getDeviceTimezone()
  );
  const currentMinOfDay = ((currentMinRaw % 1440) + 1440) % 1440;
  const currentPeriod: 'beforeNoon' | 'afterNoon' = currentMinOfDay < 720 ? 'beforeNoon' : 'afterNoon';

  if (!hasLocation || timezoneMissing) {
    return {
      hasLocation,
      timezoneMissing,
      timezoneName: tzName,
      timezoneOffsetStr: timezoneMissing
        ? 'Timezone required'
        : formatUtcOffset(getTimezoneOffsetHoursForZone(tzName, targetDate)),
      cityName: displayLabel,
      sunriseMinOfDay: 360,
      sunsetMinOfDay: 1080,
      currentMinOfDay,
      currentPeriod,
      beforeNoonSegments: [],
      afterNoonSegments: [],
      currentHora: null,
      currentGowri: null,
    };
  }

  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const d = targetDate.getDate();
  const dow = targetDate.getDay();
  const prevDate = new Date(y, m, d - 1, 12, 0, 0);
  const nextDate = new Date(y, m, d + 1, 12, 0, 0);

  const todaySolar = getAdhanSunriseSunset(city.latitude, city.longitude, targetDate);
  const prevSolar = getAdhanSunriseSunset(city.latitude, city.longitude, prevDate);
  const nextSolar = getAdhanSunriseSunset(city.latitude, city.longitude, nextDate);

  if (!todaySolar || !prevSolar || !nextSolar) {
    return {
      hasLocation,
      timezoneMissing: false,
      timezoneName: tzName,
      timezoneOffsetStr: formatUtcOffset(getTimezoneOffsetHoursForZone(tzName, targetDate)),
      cityName: displayLabel,
      sunriseMinOfDay: 360,
      sunsetMinOfDay: 1080,
      currentMinOfDay,
      currentPeriod,
      beforeNoonSegments: [],
      afterNoonSegments: [],
      currentHora: null,
      currentGowri: null,
    };
  }

  const tzOffsetStr = formatUtcOffset(getTimezoneOffsetHoursForZone(tzName, todaySolar.sunrise));
  const sunriseMinOfDay = getMinutesRelativeToTargetDate(todaySolar.sunrise, y, m, d, tzName);
  const sunsetMinOfDay = getMinutesRelativeToTargetDate(todaySolar.sunset, y, m, d, tzName);

  interface RawWindow {
    id: string;
    name: ChoghadiyaType;
    isDay: boolean;
    startUtc: Date;
    endUtc: Date;
    startMin: number;
    endMin: number;
  }

  const rawWindows: RawWindow[] = [];

  const pushEqualWindows = (
    prefix: string,
    startUtc: Date,
    endUtc: Date,
    names: ChoghadiyaType[],
    isDay: boolean
  ) => {
    const stepMs = (endUtc.getTime() - startUtc.getTime()) / names.length;
    for (let i = 0; i < names.length; i++) {
      const sUtc = new Date(startUtc.getTime() + i * stepMs);
      const eUtc = new Date(startUtc.getTime() + (i + 1) * stepMs);
      const startMin = getMinutesRelativeToTargetDate(sUtc, y, m, d, tzName);
      const endMin = getMinutesRelativeToTargetDate(eUtc, y, m, d, tzName);
      rawWindows.push({
        id: `${prefix}-${i}`,
        name: names[i],
        isDay,
        startUtc: sUtc,
        endUtc: eUtc,
        startMin,
        endMin,
      });
    }
  };

  // Pre-sunrise early morning (previous day's night Choghadiya)
  const prevDow = prevDate.getDay();
  pushEqualWindows('prev-night', prevSolar.sunset, todaySolar.sunrise, NIGHT_CHOGHADIYA_BY_DOW[prevDow], false);
  // Today's daytime Choghadiya
  pushEqualWindows('day', todaySolar.sunrise, todaySolar.sunset, DAY_CHOGHADIYA_BY_DOW[dow], true);
  // Today's post-sunset night Choghadiya
  pushEqualWindows('night', todaySolar.sunset, nextSolar.sunrise, NIGHT_CHOGHADIYA_BY_DOW[dow], false);

  const beforeNoonSegments: ChoghadiyaDialSegment[] = [];
  const afterNoonSegments: ChoghadiyaDialSegment[] = [];

  for (const w of rawWindows) {
    const meta = CHOGHADIYA_META[w.name];
    const startTimeStr = formatUtcInstant12hInZone(w.startUtc, tzName);
    const endTimeStr = formatUtcInstant12hInZone(w.endUtc, tzName);
    const fullRangeStr = `${startTimeStr} - ${endTimeStr}`;

    // Clip to Before 12 PM [0, 720]
    const bStart = Math.max(0, w.startMin);
    const bEnd = Math.min(720, w.endMin);
    if (bEnd - bStart >= 1) {
      beforeNoonSegments.push({
        id: `${w.id}-am`,
        period: 'beforeNoon',
        name: w.name,
        nameHi: meta.hi,
        meaning: meta.meaning,
        tier: meta.tier,
        isDay: w.isDay,
        startMin12h: bStart,
        endMin12h: bEnd,
        startTimeStr,
        endTimeStr,
        dialRangeStr: fullRangeStr,
        fullRangeStr,
        startUtcMs: w.startUtc.getTime(),
        endUtcMs: w.endUtc.getTime(),
      });
    }

    // Clip to After 12 PM [720, 1440]
    const aStart = Math.max(720, w.startMin);
    const aEnd = Math.min(1440, w.endMin);
    if (aEnd - aStart >= 1) {
      afterNoonSegments.push({
        id: `${w.id}-pm`,
        period: 'afterNoon',
        name: w.name,
        nameHi: meta.hi,
        meaning: meta.meaning,
        tier: meta.tier,
        isDay: w.isDay,
        startMin12h: aStart - 720,
        endMin12h: aEnd - 720,
        startTimeStr,
        endTimeStr,
        dialRangeStr: fullRangeStr,
        fullRangeStr,
        startUtcMs: w.startUtc.getTime(),
        endUtcMs: w.endUtc.getTime(),
      });
    }
  }

  // Determine Reference Instant inside selected targetDate for Hora & Gowri (matching active clock time on that date)
  const refTargetMs =
    todaySolar.sunrise.getTime() + (currentMinOfDay - sunriseMinOfDay) * 60_000;

  // Planetary Hora lookup across prev-night / day / tonight
  const computeHoraAtMs = (ms: number): HoraSlotInfo | null => {
    const checkSpan = (
      spanStart: Date,
      spanEnd: Date,
      startPlanetIdx: number,
      isDay: boolean
    ): HoraSlotInfo | null => {
      if (ms < spanStart.getTime() || ms >= spanEnd.getTime()) return null;
      const stepMs = (spanEnd.getTime() - spanStart.getTime()) / 12;
      const idx = Math.min(11, Math.max(0, Math.floor((ms - spanStart.getTime()) / stepMs)));
      const planet = CHALDEAN_PLANETS[(startPlanetIdx + idx) % 7];
      const s = new Date(spanStart.getTime() + idx * stepMs);
      const e = new Date(spanStart.getTime() + (idx + 1) * stepMs);
      return {
        planetEn: planet.en,
        planetHi: planet.hi,
        guidance: planet.guidance,
        isAuspicious: planet.auspicious,
        isDay,
        startTimeStr: formatUtcInstant12hInZone(s, tzName),
        endTimeStr: formatUtcInstant12hInZone(e, tzName),
      };
    };

    const prevSunriseStartIdx = SUNRISE_HORA_INDEX_BY_DOW[prevDow];
    const todaySunriseStartIdx = SUNRISE_HORA_INDEX_BY_DOW[dow];

    return (
      checkSpan(prevSolar.sunset, todaySolar.sunrise, (prevSunriseStartIdx + 12) % 7, false) ||
      checkSpan(todaySolar.sunrise, todaySolar.sunset, todaySunriseStartIdx, true) ||
      checkSpan(todaySolar.sunset, nextSolar.sunrise, (todaySunriseStartIdx + 12) % 7, false)
    );
  };

  // Gowri Panchang lookup across prev-night / day / tonight
  const computeGowriAtMs = (ms: number): GowriSlotInfo | null => {
    const checkSpan = (spanStart: Date, spanEnd: Date, list: string[]): GowriSlotInfo | null => {
      if (ms < spanStart.getTime() || ms >= spanEnd.getTime()) return null;
      const stepMs = (spanEnd.getTime() - spanStart.getTime()) / 8;
      const idx = Math.min(7, Math.max(0, Math.floor((ms - spanStart.getTime()) / stepMs)));
      const gName = list[idx] || 'Amirtham';
      const meta = GOWRI_META[gName] || GOWRI_META.Amirtham;
      const s = new Date(spanStart.getTime() + idx * stepMs);
      const e = new Date(spanStart.getTime() + (idx + 1) * stepMs);
      return {
        nameEn: gName,
        nameHi: meta.hi,
        meaning: meta.meaning,
        tier: meta.tier,
        startTimeStr: formatUtcInstant12hInZone(s, tzName),
        endTimeStr: formatUtcInstant12hInZone(e, tzName),
      };
    };

    return (
      checkSpan(prevSolar.sunset, todaySolar.sunrise, GOWRI_NIGHT_BY_DOW[prevDow]) ||
      checkSpan(todaySolar.sunrise, todaySolar.sunset, GOWRI_DAY_BY_DOW[dow]) ||
      checkSpan(todaySolar.sunset, nextSolar.sunrise, GOWRI_NIGHT_BY_DOW[dow])
    );
  };

  const currentHora = computeHoraAtMs(refTargetMs) || computeHoraAtMs(todaySolar.sunrise.getTime());
  const currentGowri = computeGowriAtMs(refTargetMs) || computeGowriAtMs(todaySolar.sunrise.getTime());

  return {
    hasLocation,
    timezoneMissing: false,
    timezoneName: tzName,
    timezoneOffsetStr: tzOffsetStr,
    cityName: displayLabel,
    sunriseMinOfDay,
    sunsetMinOfDay,
    currentMinOfDay,
    currentPeriod,
    beforeNoonSegments,
    afterNoonSegments,
    currentHora,
    currentGowri,
  };
}

