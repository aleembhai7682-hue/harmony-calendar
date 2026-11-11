/**
 * Hindu Panchang & Vedic Astronomical Engine (Drik Ganita / Lahiri Siddhanta)
 * Provides high-precision calculation of Tithi, Paksha, Nakshatra, Yoga, Karana,
 * Vikram & Shaka Samvat, Solar Sunrise, Sunset, Abhijit Muhurat, and Rahu Kaal
 * calibrated to the user's selected Indian geographical location.
 *
 * NOTE: Language rule strictly enforces Hindi, Sanskrit, and English only.
 * Absolutely zero Urdu text or typography is included in this module.
 */

import { getCityLocation, CityLocation } from './cities';

export interface HinduPanchangInfo {
  cityName: string;
  coordinates: string;
  sunriseTime: string; // "06:42 AM"
  sunsetTime: string;  // "06:05 PM"
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
 * Computes Julian Day at given UTC hour
 */
function getJulianDay(date: Date, utcHour: number = 0.5): number {
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  const d = date.getDate() + utcHour / 24;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d +
    b -
    1524.5
  );
}

/**
 * Calculates Solar and Lunar Ecliptic Longitude and Panchang parameters
 * for any given date and geographical coordinates.
 */
export function getHinduPanchang(
  date: Date,
  cityId: string = 'mumbai',
  customLat?: number,
  customLon?: number
): HinduPanchangInfo {
  const city: CityLocation = getCityLocation(cityId);
  const lat = customLat !== undefined ? customLat : city.latitude;
  const lon = customLon !== undefined ? customLon : city.longitude;

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Day of year for solar calculations
  const startOfYear = new Date(year, 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);

  // Solar declination & Equation of Time (EoT)
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const declination = 23.45 * Math.sin(b);

  // Solar Noon in Indian Standard Time (IST, Meridian 82.5° E)
  // Longitude correction: (82.5 - longitude) * 4 minutes
  const lonCorrectionMin = (82.5 - lon) * 4;
  const solarNoonMin = 12 * 60 + lonCorrectionMin - eot;

  // Sunrise and Sunset calculation using horizon altitude -0.833°
  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const altRad = (-0.8333 * Math.PI) / 180;

  let cosHA =
    (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));
  if (cosHA > 1) cosHA = 1;
  if (cosHA < -1) cosHA = -1;
  const haHours = (Math.acos(cosHA) * 180) / Math.PI / 15; // in hours

  const sunriseMin = solarNoonMin - haHours * 60;
  const sunsetMin = solarNoonMin + haHours * 60;
  const dayDurationMin = Math.max(600, sunsetMin - sunriseMin);

  const formatMinToTime = (min: number): string => {
    let m = Math.round(min);
    if (m < 0) m += 1440;
    if (m >= 1440) m -= 1440;
    let h = Math.floor(m / 60);
    const mins = m % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
  };

  const sunriseStr = formatMinToTime(sunriseMin);
  const sunsetStr = formatMinToTime(sunsetMin);
  const solarNoonStr = formatMinToTime(solarNoonMin);

  // Astronomical Julian Day at standard sunrise epoch (06:00 IST = 00:30 UTC)
  const jd = getJulianDay(date, 0.5);
  const T = (jd - 2451545.0) / 36525; // centuries from J2000

  // Geometric Mean Longitude of the Sun
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  // Mean Anomaly of the Sun
  const M_sun = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const M_sunRad = (M_sun * Math.PI) / 180;
  // Sun Equation of the Center
  const C_sun =
    (1.914602 - 0.004817 * T) * Math.sin(M_sunRad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M_sunRad) +
    0.000289 * Math.sin(3 * M_sunRad);
  const sunLongSayana = normalizeDeg(L0 + C_sun);

  // Geometric Mean Longitude of the Moon
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const Mm = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;

  const MmRad = (Mm * Math.PI) / 180;
  const DRad = (D * Math.PI) / 180;
  const FRad = (F * Math.PI) / 180;

  // Major periodic lunar perturbations
  const moonPerturbations =
    6.288774 * Math.sin(MmRad) +
    1.274027 * Math.sin(2 * DRad - MmRad) +
    0.658314 * Math.sin(2 * DRad) +
    0.213618 * Math.sin(2 * MmRad) -
    0.185116 * Math.sin(M_sunRad) -
    0.114332 * Math.sin(2 * FRad);

  const moonLongSayana = normalizeDeg(Lp + moonPerturbations);

  // Standard Lahiri (Chitrapaksha) Ayanamsha: 23° 51' in 2000 + precession
  const ayanamsha = 23.856 + 1.396 * T;

  // Sidereal (Nirayana) longitudes for Vedic Astrology / Panchang
  const sunLongNirayana = normalizeDeg(sunLongSayana - ayanamsha);
  const moonLongNirayana = normalizeDeg(moonLongSayana - ayanamsha);

  // Lunar Elongation (Moon - Sun angle)
  const elongation = normalizeDeg(moonLongSayana - sunLongSayana);

  // Tithi calculation: 1 Tithi = 12 degrees of elongation
  const tithiIndex = Math.min(29, Math.floor(elongation / 12));
  const tithiNum = tithiIndex + 1; // 1 to 30
  const isShukla = tithiNum <= 15;
  const tithiMeta = TITHIS_META[tithiIndex] || TITHIS_META[0];

  // Nakshatra calculation: 1 Nakshatra = 13° 20' = 13.333333° of Nirayana Moon
  const nakshatraIndex = Math.min(26, Math.floor(moonLongNirayana / (360 / 27)));
  const nakshatraMeta = NAKSHATRAS_META[nakshatraIndex] || NAKSHATRAS_META[0];

  // Yoga calculation: (Nirayana Sun + Nirayana Moon) / 13° 20'
  const yogaIndex = Math.min(
    26,
    Math.floor(normalizeDeg(sunLongNirayana + moonLongNirayana) / (360 / 27))
  );
  const yogaMeta = YOGAS_META[yogaIndex] || YOGAS_META[0];

  // Karana calculation: 1 Karana = 6 degrees of elongation (half a Tithi)
  const karanaIndexTotal = Math.min(59, Math.floor(elongation / 6));
  let karanaMeta: { en: string; hi: string };
  if (karanaIndexTotal === 0) {
    karanaMeta = KARANAS_NAMES[10]; // Kintughna
  } else if (karanaIndexTotal >= 57) {
    // Fixed Karanas: 57=Shakuni, 58=Chatushpada, 59=Naga
    karanaMeta = KARANAS_NAMES[7 + (karanaIndexTotal - 57)] || KARANAS_NAMES[0];
  } else {
    // 7 recurring Karanas (Bava to Vishti/Bhadra)
    const cyclic = (karanaIndexTotal - 1) % 7;
    karanaMeta = KARANAS_NAMES[cyclic];
  }

  // Vikram Samvat & Shaka Samvat
  const isAfterChaitra = month > 2 || (month === 2 && day >= 22);
  const vikramSamvat = year + (isAfterChaitra ? 57 : 56);
  const shakaSamvat = year - (isAfterChaitra ? 78 : 79);

  // Hindu Lunar Month estimate based on solar transit / sidereal sun
  const solarRashiIndex = Math.floor(sunLongNirayana / 30);
  const hinduMonth = HINDU_MONTHS[solarRashiIndex] || HINDU_MONTHS[0];

  // Fasting days
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

  // 🌟 Dynamic Rahu Kaal Calculation from Actual Sunrise & Sunset
  // The daytime is divided into 8 equal parts (Ashtama-Bhagas)
  const partDurationMin = dayDurationMin / 8;
  const dayOfWeek = date.getDay(); // 0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat

  // Weekday to 1-based Ashtama-Bhaga index:
  // Sun: 8, Mon: 2, Tue: 7, Wed: 5, Thu: 6, Fri: 4, Sat: 1
  const rahuKaalParts = [8, 2, 7, 5, 6, 4, 1];
  const partNum = rahuKaalParts[dayOfWeek];
  const rahuStartMin = sunriseMin + (partNum - 1) * partDurationMin;
  const rahuEndMin = sunriseMin + partNum * partDurationMin;
  const rahuKaalStr = `${formatMinToTime(rahuStartMin)} - ${formatMinToTime(rahuEndMin)}`;

  // 🌟 Dynamic Abhijit Muhurat Calculation from Actual Solar Noon
  // Abhijit is the 8th Muhurta of the day, centered exactly on Solar Noon
  // Duration is approx 1/15th of the day (2 Ghatis = 48 minutes on equinox)
  const abhijitHalfDuration = dayDurationMin / 30;
  const abhijitStartMin = solarNoonMin - abhijitHalfDuration;
  const abhijitEndMin = solarNoonMin + abhijitHalfDuration;

  // On Wednesdays, Abhijit is traditionally considered less suitable due to planetary clash
  const isWednesday = dayOfWeek === 3;
  const abhijitStr = isWednesday
    ? `${formatMinToTime(abhijitStartMin)} - ${formatMinToTime(abhijitEndMin)} (Subdued on Wed)`
    : `${formatMinToTime(abhijitStartMin)} - ${formatMinToTime(abhijitEndMin)} (Auspicious)`;

  return {
    cityName: city.nameEn,
    coordinates: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
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
    calculationBasis: `Astronomical Vedic Ephemeris (Drik Siddhanta, Lahiri Ayanamsha) calibrated for ${city.nameEn}. Subject to local temple Panchangam horizon variations.`,
  };
}
