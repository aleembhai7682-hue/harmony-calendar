import React, { useState, useEffect } from 'react';
import { Language } from '../types/calendar';
import { getHijriDate, getDailyWisdom } from '../utils/hijri';
import { getDeviceTimezone, getTimePartsInZone } from '../utils/istTime';
import { hasExplicitLocation } from '../utils/cities';
import { detectDeviceGpsLocation } from '../utils/locationService';
import { TimeFormatOption } from '../utils/localization';
import { calculateLocationPrayerTimes, DetailedPrayerInfo } from '../utils/prayerTimes';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Compass,
  SlidersHorizontal,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import {
  PrayerLocationPrompt,
  PrayerLocationUpdatePayload,
} from './prayer/PrayerLocationPrompt';
import { PrayerCountdownGrid, PrayerSlot } from './prayer/PrayerCountdownGrid';
import { PrayerWisdomTasbeeh } from './prayer/PrayerWisdomTasbeeh';

interface IslamicPrayerWidgetProps {
  currentDate: Date;
  hijriOffset?: number;
  language?: Language;
  selectedCity?: string;
  selectedCountry?: string;
  selectedCountryCode?: string;
  selectedLocationTimezone?: string;
  locationSource?: 'detected' | 'manual';
  locationExplicitlyConfirmed?: boolean;
  customLat?: number;
  customLon?: number;
  customName?: string;
  timeFormat?: TimeFormatOption;
  prayerMethod?: 'karachi' | 'mwl' | 'makkah' | 'egypt';
  asrMethod?: 'hanafi' | 'standard';
  onLocationChange?: (loc: PrayerLocationUpdatePayload) => void;
  onOpenSettings?: () => void;
}

export const IslamicPrayerWidget: React.FC<IslamicPrayerWidgetProps> = ({
  currentDate,
  hijriOffset = 0,
  language = 'en',
  selectedCity = '',
  selectedCountry,
  selectedCountryCode,
  selectedLocationTimezone,
  locationSource,
  locationExplicitlyConfirmed,
  customLat,
  customLon,
  customName,
  timeFormat = 'auto',
  prayerMethod = 'karachi',
  asrMethod = 'hanafi',
  onLocationChange,
  onOpenSettings,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const hasLocation = hasExplicitLocation(selectedCity, customLat, customLon);
  const needsMumbaiConfirm =
    selectedCity?.trim().toLowerCase() === 'mumbai' && locationExplicitlyConfirmed !== true;
  const isLocationReady = hasLocation && !needsMumbaiConfirm;
  const deviceTz = getDeviceTimezone();

  // Live timer tick every second synchronized to device local clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEnableGeolocation = async () => {
    setIsLocating(true);
    setGeoError(null);
    const detected = await detectDeviceGpsLocation();
    setIsLocating(false);

    if (!detected.success || detected.latitude === undefined || detected.longitude === undefined) {
      setGeoError(
        detected.errorMessage ||
          (language === 'ur'
            ? 'مقام تک رسائی ممکن نہیں ہو سکی۔ براہ کرم اپنا شہر منتخب کریں۔'
            : 'Unable to determine your GPS location. Please choose a city below.')
      );
      return;
    }

    if (!detected.timezone) {
      setGeoError(
        language === 'ur'
          ? 'GPS کوآرڈینیٹس مل گئے لیکن جغرافیائی ٹائم زون معلوم نہیں ہو سکا۔ براہ کرم نیچے دستی طور پر IANA ٹائم زون منتخب کریں۔'
          : 'GPS coordinates were detected, but the geographical timezone could not be determined automatically. Please select your IANA timezone manually below.'
      );
    }

    onLocationChange?.({
      selectedCity: 'custom',
      selectedCountry: detected.place?.country || undefined,
      selectedCountryCode: detected.place?.countryCode || undefined,
      selectedRegion: detected.place?.region || undefined,
      selectedLocationTimezone: detected.timezone || '',
      locationSource: 'detected',
      locationExplicitlyConfirmed: true,
      customLatitude: detected.latitude,
      customLongitude: detected.longitude,
      customLocationName: detected.place?.city || 'GPS Coordinates',
    });
  };

  // Compute location-aware astronomical prayer times (never evaluate unconfirmed legacy Mumbai)
  const prayerData: DetailedPrayerInfo = calculateLocationPrayerTimes(currentDate, {
    cityId: isLocationReady ? selectedCity : '',
    customLat: isLocationReady ? customLat : undefined,
    customLon: isLocationReady ? customLon : undefined,
    customLocationName: isLocationReady ? customName : undefined,
    customCountry: isLocationReady ? selectedCountry : undefined,
    timezoneName: isLocationReady ? selectedLocationTimezone : undefined,
    prayerMethod,
    asrMethod,
    locationExplicitlyConfirmed: isLocationReady,
  });

  const needsManualTimezone = isLocationReady && Boolean(prayerData.timezoneMissing);

  const activeTimeParts = getTimePartsInZone(
    isLocationReady && !needsManualTimezone ? prayerData.timezoneName : deviceTz,
    now
  );

  const prayerTimes = prayerData.times;
  const hijri = getHijriDate(currentDate, hijriOffset);
  const wisdom = getDailyWisdom(currentDate);
  const isFriday = currentDate.getDay() === 5;

  const parseTimeToMinutes = (tStr: string): number => {
    const parts = tStr.split(':').map(Number);
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return 0;
    return parts[0] * 60 + parts[1];
  };

  const slots: PrayerSlot[] = [
    {
      id: 'fajr',
      nameEn: 'Fajr',
      nameHinglish: 'Fajr (Subah)',
      nameUr: 'فجر',
      nameAr: 'فجر',
      timeStr: prayerTimes.fajr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.fajr),
    },
    {
      id: 'dhuhr',
      nameEn: isFriday ? 'Jummah / Dhuhr' : 'Dhuhr',
      nameHinglish: isFriday ? 'Jummah Prayer' : 'Dhuhr (Dopahar)',
      nameUr: isFriday ? 'نمازِ جمعہ / ظہر' : 'ظہر',
      nameAr: isFriday ? 'جمعة / ظهر' : 'ظهر',
      timeStr: prayerTimes.dhuhr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.dhuhr),
      isJummah: isFriday,
    },
    {
      id: 'asr',
      nameEn: 'Asr',
      nameHinglish: 'Asr (Teesra Pehar)',
      nameUr: 'عصر',
      nameAr: 'عصر',
      timeStr: prayerTimes.asr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.asr),
    },
    {
      id: 'maghrib',
      nameEn: 'Maghrib',
      nameHinglish: 'Maghrib (Iftar)',
      nameUr: 'مغرب',
      nameAr: 'مغرب',
      timeStr: prayerTimes.maghrib,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.maghrib),
    },
    {
      id: 'isha',
      nameEn: 'Isha',
      nameHinglish: 'Isha (Raat)',
      nameUr: 'عشاء',
      nameAr: 'عشاء',
      timeStr: prayerTimes.isha,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.isha),
    },
  ];

  const currentMinutes = activeTimeParts.hours * 60 + activeTimeParts.minutes;
  const currentSeconds = activeTimeParts.seconds;

  let nextPrayer = slots.find((s) => s.minutesFromMidnight > currentMinutes);
  let isTomorrowFajr = false;

  if (!nextPrayer) {
    nextPrayer = slots[0];
    isTomorrowFajr = true;
  }

  const targetTotalSeconds = isTomorrowFajr
    ? (24 * 60 + nextPrayer.minutesFromMidnight) * 60
    : nextPrayer.minutesFromMidnight * 60;

  const nowTotalSeconds = currentMinutes * 60 + currentSeconds;
  const remainingSeconds = Math.max(0, targetTotalSeconds - nowTotalSeconds);

  const nextPrayerIdx = slots.findIndex((s) => s.id === nextPrayer.id);
  const prevSlot = isTomorrowFajr
    ? slots[slots.length - 1]
    : nextPrayerIdx > 0
    ? slots[nextPrayerIdx - 1]
    : slots[slots.length - 1];
  const prevStartSeconds = isTomorrowFajr
    ? prevSlot.minutesFromMidnight * 60
    : nextPrayerIdx === 0
    ? prevSlot.minutesFromMidnight * 60 - 24 * 3600
    : prevSlot.minutesFromMidnight * 60;
  const intervalSpanSeconds = Math.max(1, targetTotalSeconds - prevStartSeconds);
  const intervalProgressPct = Math.min(
    100,
    Math.max(0, Math.round(((intervalSpanSeconds - remainingSeconds) / intervalSpanSeconds) * 100))
  );

  const hoursLeft = Math.floor(remainingSeconds / 3600);
  const minutesLeft = Math.floor((remainingSeconds % 3600) / 60);
  const secondsLeft = remainingSeconds % 60;
  const countdownFormatted = `${String(hoursLeft).padStart(2, '0')}:${String(
    minutesLeft
  ).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#FAFDFB] via-[#FCFDFC] to-[#EFF6F2] dark:from-[#0B1914] dark:via-[#0A1713] dark:to-[#08130F] border border-[#D5E4DC] dark:border-[#1B382E] text-slate-900 dark:text-slate-100 shadow-lg dark:shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#EFF6F2] via-[#FAFDFB] to-[#F7F4EA] dark:from-[#0E211A] dark:via-[#0B1914] dark:to-[#0A1612] border-b border-[#D5E4DC] dark:border-[#1B382E] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 dark:border-emerald-500/30 flex items-center justify-center shadow-xs">
            <span className="text-xl">🌙</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-white tracking-tight">
                {language === 'ur'
                  ? 'اوقاتِ نماز و اسلامی تقویم'
                  : 'Islamic Prayer Times & Hijri Calendar'}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FBF5E6] dark:bg-amber-950/60 text-[#8C6418] dark:text-amber-300 border border-[#E5D3A7] dark:border-amber-700/50 font-bold">
                {language === 'ur' ? hijri.formattedUr : hijri.formattedEn}
              </span>

              {/* Prominent Glassmorphic Calculation Method (Botanical Emerald) & Asr (Champagne Brass) Badges */}
              <button
                type="button"
                onClick={onOpenSettings}
                disabled={!onOpenSettings}
                title={`${prayerData.methodName} — Click to change in Settings`}
                className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full backdrop-blur-md bg-emerald-50/80 dark:bg-emerald-900/35 border border-emerald-400/55 dark:border-emerald-400/35 ring-1 ring-inset ring-white/75 dark:ring-white/10 font-bold tracking-wide shadow-xs ${
                  onOpenSettings
                    ? 'hover:bg-emerald-100/90 dark:hover:bg-emerald-800/45 hover:border-emerald-500/70 dark:hover:border-emerald-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-300 cursor-pointer transition-all'
                    : ''
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-300 shrink-0" />
                <span className="text-emerald-900 dark:text-emerald-200 font-semibold">Method:</span>
                <span className="text-emerald-950 dark:text-white">{prayerData.methodShortName}</span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                disabled={!onOpenSettings}
                title={`${prayerData.asrJuristicName} — Click to change in Settings`}
                className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full backdrop-blur-md bg-amber-50/80 dark:bg-amber-900/30 border border-amber-400/55 dark:border-amber-400/35 ring-1 ring-inset ring-white/75 dark:ring-white/10 font-bold tracking-wide shadow-xs ${
                  onOpenSettings
                    ? 'hover:bg-amber-100/90 dark:hover:bg-amber-800/40 hover:border-amber-500/70 dark:hover:border-amber-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 dark:focus-visible:ring-amber-300 cursor-pointer transition-all'
                    : ''
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300 shrink-0" />
                <span className="text-amber-900 dark:text-amber-200 font-semibold">Asr:</span>
                <span className="text-amber-950 dark:text-white">{prayerData.asrShortName}</span>
              </button>

              {isLocationReady ? (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${
                    needsManualTimezone
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60'
                      : 'bg-white/90 dark:bg-[#10231C] text-emerald-900 dark:text-emerald-300 border-[#C6DDD1] dark:border-[#1B382E]'
                  }`}
                >
                  <MapPin
                    className={`w-3 h-3 ${
                      needsManualTimezone
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  />
                  <span>
                    {needsManualTimezone
                      ? `${prayerData.cityName} (${prayerData.coordinates}) • Timezone required`
                      : `${language === 'ur' ? prayerData.cityNameUr : prayerData.cityName} (${
                          locationSource === 'detected' ? 'GPS' : 'Manual'
                        })`}
                  </span>
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span>
                    {needsMumbaiConfirm
                      ? language === 'ur'
                        ? 'مقام کی تصدیق درکار ہے'
                        : 'Location required • Confirm Mumbai'
                      : language === 'ur'
                      ? `مقام درکار ہے (${deviceTz})`
                      : 'Location required'}
                  </span>
                </span>
              )}

              {isFriday && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-400/50 font-bold flex items-center gap-1 shadow-xs">
                  <span>✨</span>
                  <span>{language === 'ur' ? 'جمعۃ المبارک' : 'Blessed Jummah'}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 font-medium flex items-center gap-2 flex-wrap">
              <span>
                {language === 'ur'
                  ? 'وقت'
                  : isLocationReady && !needsManualTimezone
                  ? 'City Time'
                  : 'Device Time'}
                : <strong className="font-mono text-emerald-800 dark:text-emerald-300">{activeTimeParts.formatted}</strong>
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-[11px] font-mono text-slate-600 dark:text-emerald-200/90">
                {prayerData.timezoneName || deviceTz} ({prayerData.timezoneOffsetStr})
              </span>
              {isLocationReady && !needsManualTimezone && (
                <>
                  <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-[#EFF6F2] dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-[#C6DDD1] dark:border-[#1B382E]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span>{language === 'ur' ? 'Adhan درست حساب' : 'Adhan Verified'}</span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="Change prayer method, Asr school, or location"
              className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-[#EFF6F2] dark:bg-[#10231C] dark:hover:bg-[#163026] text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#C6DDD1] dark:border-[#1B382E] cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'ur' ? 'طریقہ / مقام' : 'Method & Location'}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-[#EFF6F2] dark:bg-[#10231C] dark:hover:bg-[#163026] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#C6DDD1] dark:border-[#1B382E] cursor-pointer shadow-xs"
          >
            <span>
              {isCollapsed
                ? language === 'ur'
                  ? 'اوقات دکھائیں'
                  : 'Show Timetable'
                : language === 'ur'
                ? 'چھپائیں'
                : 'Minimize'}
            </span>
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isCollapsed && (
        <div className="p-5 space-y-4">
          {!isLocationReady || needsManualTimezone ? (
            <PrayerLocationPrompt
              language={language}
              needsMumbaiConfirm={needsMumbaiConfirm}
              needsManualTimezone={needsManualTimezone}
              isLocating={isLocating}
              geoError={geoError}
              deviceTz={deviceTz}
              prayerData={prayerData}
              selectedCity={selectedCity}
              selectedCountry={selectedCountry}
              customLat={customLat}
              customLon={customLon}
              customName={customName}
              onEnableGeolocation={handleEnableGeolocation}
              onClearGeoError={() => setGeoError(null)}
              onLocationChange={onLocationChange}
              onOpenSettings={onOpenSettings}
            />
          ) : (
            <PrayerCountdownGrid
              language={language}
              slots={slots}
              nextPrayer={nextPrayer}
              isTomorrowFajr={isTomorrowFajr}
              countdownFormatted={countdownFormatted}
              intervalProgressPct={intervalProgressPct}
              prayerTimes={prayerTimes}
              prayerData={prayerData}
              timeFormat={timeFormat}
              selectedCountryCode={selectedCountryCode}
            />
          )}

          <PrayerWisdomTasbeeh language={language} wisdom={wisdom} />

          {/* Transparent Metadata Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2.5 border-t border-[#D5E4DC] dark:border-[#1B382E] flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Compass className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>
                {isLocationReady && !needsManualTimezone
                  ? `${prayerData.methodName} • ${prayerData.asrJuristicName}`
                  : language === 'ur'
                  ? `مقام درکار ہے۔ منتخب طریقہ: ${prayerData.methodShortName} • ${prayerData.asrShortName} • حتمی اوقات کے لیے مقامی مسجد سے تصدیق کریں۔`
                  : `Location required — Selected: ${prayerData.methodShortName} • ${prayerData.asrShortName}. Always confirm with your local mosque.`}
              </span>
            </span>
            <span className="text-emerald-800 dark:text-emerald-400 font-semibold font-mono text-[10px]">
              {isLocationReady && !needsManualTimezone
                ? `${prayerData.coordinates} • ${prayerData.timezoneName} (${prayerData.timezoneOffsetStr})`
                : `${deviceTz} (${prayerData.timezoneOffsetStr})`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
