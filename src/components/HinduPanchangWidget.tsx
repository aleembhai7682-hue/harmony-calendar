import React, { useState, useEffect } from 'react';
import {
  getHinduPanchang,
  getVedicMuhuratTimeline,
  HinduPanchangInfo,
  VedicMuhuratTimeline,
} from '../utils/panchang';
import { getDailyGitaVerse, GitaVerse } from '../utils/gitaData';
import { getDeviceTimezone, getTimePartsInZone, getSupportedTimezones, isValidIanaTimezone } from '../utils/istTime';
import {
  ALL_CITIES,
  INDIAN_CITIES,
  INTERNATIONAL_CITIES,
  hasExplicitLocation,
  getCityLocation,
} from '../utils/cities';
import { detectDeviceGpsLocation } from '../utils/locationService';
import { formatTimePreference, TimeFormatOption } from '../utils/localization';
import { ChoghadiyaClockDial } from './hindu/ChoghadiyaClockDial';
import {
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Compass,
  BookOpen,
  Navigation,
  Globe,
  Check,
} from 'lucide-react';

interface HinduPanchangWidgetProps {
  currentDate: Date;
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
  onLocationChange?: (loc: {
    selectedCity: string;
    selectedCountry?: string;
    selectedCountryCode?: string;
    selectedRegion?: string;
    selectedLocationTimezone?: string;
    locationSource?: 'detected' | 'manual';
    locationExplicitlyConfirmed?: boolean;
    customLatitude?: number;
    customLongitude?: number;
    customLocationName?: string;
  }) => void;
  onOpenSettings?: () => void;
}

export const HinduPanchangWidget: React.FC<HinduPanchangWidgetProps> = ({
  currentDate,
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

  // Live timer tick strictly synchronized to user's device local time
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
        detected.errorMessage || 'Unable to determine your GPS location. Please choose a city below.'
      );
      return;
    }

    if (!detected.timezone) {
      setGeoError(
        'GPS coordinates were detected, but the geographical timezone could not be determined automatically. Please select your IANA timezone manually below.'
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

  const panchang: HinduPanchangInfo = getHinduPanchang(
    currentDate,
    isLocationReady ? selectedCity : '',
    isLocationReady ? customLat : undefined,
    isLocationReady ? customLon : undefined,
    isLocationReady ? customName : undefined,
    undefined,
    isLocationReady ? selectedCountry : undefined,
    isLocationReady ? selectedLocationTimezone : undefined,
    isLocationReady
  );

  const muhuratTimeline: VedicMuhuratTimeline = getVedicMuhuratTimeline(
    currentDate,
    now,
    isLocationReady ? selectedCity : '',
    isLocationReady ? customLat : undefined,
    isLocationReady ? customLon : undefined,
    isLocationReady ? customName : undefined,
    isLocationReady ? selectedCountry : undefined,
    isLocationReady ? selectedLocationTimezone : undefined,
    isLocationReady
  );

  const needsManualTimezone = isLocationReady && Boolean(panchang.timezoneMissing);
  const gitaVerse: GitaVerse = getDailyGitaVerse(currentDate);
  const activeTime = getTimePartsInZone(
    isLocationReady && !needsManualTimezone ? panchang.timezoneName : deviceTz,
    now
  );

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F5E9D4] dark:from-[#18130D] dark:via-[#15110C] dark:to-[#110D09] border border-[#E8D9BE] dark:border-[#34281B] text-slate-900 dark:text-slate-100 shadow-lg dark:shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#FAF1DF] via-[#FFFDF8] to-[#F6EAD2] dark:from-[#211910] dark:via-[#18130D] dark:to-[#130F0A] border-b border-[#E8D9BE] dark:border-[#34281B] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-700/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-600/30 dark:border-amber-500/35 flex items-center justify-center shadow-xs">
            <span className="text-xl">🕉️</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-[#2D1B09] dark:text-amber-50 tracking-tight">
                Vedic Panchang &amp; Bhagavad Gita Shloka
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-900/70 text-amber-950 dark:text-amber-200 border border-amber-400/60 dark:border-amber-600/50 font-bold">
                {panchang.pakshaHi} • {panchang.tithiNameHi}
              </span>
              {isLocationReady ? (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${
                    needsManualTimezone
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-600/60'
                      : 'bg-[#FFFDF9]/90 dark:bg-[#1D1710] text-amber-900 dark:text-amber-300 border-[#DFC9A1] dark:border-[#3D2F20]'
                  }`}
                >
                  <MapPin
                    className={`w-3 h-3 ${
                      needsManualTimezone
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  />
                  <span>
                    {needsManualTimezone
                      ? `${panchang.cityName} (${panchang.coordinates}) • Timezone required`
                      : `${panchang.cityName} (${locationSource === 'detected' ? 'GPS' : 'Manual'} • ${panchang.coordinates}) • ${panchang.timezoneName} (${panchang.timezoneOffsetStr})`}
                  </span>
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span>
                    {needsMumbaiConfirm ? `Confirm location • Saved: Mumbai, India` : `Location not set • ${deviceTz}`}
                  </span>
                </span>
              )}
              {panchang.auspiciousTag && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 shadow-xs">
                  <span>🪔</span>
                  <span>{panchang.auspiciousTagHi || panchang.auspiciousTag}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium flex items-center gap-2 flex-wrap">
              <span>
                Vikram Samvat {panchang.vikramSamvat} • Shaka {panchang.shakaSamvat}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span>
                मास:{' '}
                <strong className="text-amber-900 dark:text-amber-200">
                  {panchang.hinduMonthHi} ({panchang.hinduMonthEn})
                </strong>
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span>
                {isLocationReady && !needsManualTimezone ? 'City Time' : 'Device Time'}:{' '}
                <strong className="font-mono text-amber-800 dark:text-amber-300">{activeTime.formatted}</strong>
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-[11px] font-mono text-slate-600 dark:text-amber-200/80">
                {panchang.timezoneName || deviceTz} ({panchang.timezoneOffsetStr})
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3.5 py-1.5 rounded-xl bg-[#FFFDF9]/90 hover:bg-[#FAF1DF] dark:bg-[#1D1710] dark:hover:bg-[#271F16] text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#DFC9A1] dark:border-[#3D2F20] cursor-pointer shadow-xs"
          >
            <span>{isCollapsed ? 'Show Full Panchang & Gita' : 'Minimize'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isCollapsed && (
        <div className="p-5 space-y-4">
          {/* Panchang Grid: Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset, Abhijit, Rahu Kaal */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Tithi */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9]/90 dark:bg-[#1D1710]/85 border border-[#E8D9BE] dark:border-[#34281B] shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 tracking-wider">
                <Moon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Tithi (तिथि)</span>
              </div>
              <div className="text-sm font-black text-amber-800 dark:text-amber-300 mt-1 truncate">
                {panchang.tithiNameEn}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate font-medium">
                {panchang.tithiNameHi}
              </div>
            </div>

            {/* Nakshatra */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9]/90 dark:bg-[#1D1710]/85 border border-[#E8D9BE] dark:border-[#34281B] shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Nakshatra (नक्षत्र)</span>
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                {panchang.nakshatraNameEn}
              </div>
              <div className="text-xs text-amber-900 dark:text-amber-200 mt-0.5 truncate font-medium">
                {panchang.nakshatraNameHi} (देवता: {panchang.nakshatraDeityHi})
              </div>
            </div>

            {/* Yoga */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9]/90 dark:bg-[#1D1710]/85 border border-[#E8D9BE] dark:border-[#34281B] shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 tracking-wider">
                <Compass className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Yoga (योग)</span>
              </div>
              <div className="text-sm font-black text-amber-800 dark:text-amber-300 mt-1 truncate">
                {panchang.yogaNameEn}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate font-medium">
                {panchang.yogaNameHi} • {panchang.yogaQualityEn}
              </div>
            </div>

            {/* Karana */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9]/90 dark:bg-[#1D1710]/85 border border-[#E8D9BE] dark:border-[#34281B] shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Karana (करण)</span>
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                {panchang.karanaNameEn}
              </div>
              <div className="text-xs text-amber-900 dark:text-amber-200 mt-0.5 truncate font-medium">
                {panchang.karanaNameHi}
              </div>
            </div>

            {/* Sunrise & Sunset */}
            <div className="p-3.5 rounded-2xl bg-[#FAF1DE] dark:bg-[#241B10] border border-[#E2C899] dark:border-amber-700/40 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1 tracking-wider">
                <Sun className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Sunrise &amp; Sunset</span>
              </div>
              {isLocationReady && !needsManualTimezone ? (
                <>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
                    🌅 {formatTimePreference(panchang.sunriseTime, timeFormat, selectedCountryCode)} | 🌇{' '}
                    {formatTimePreference(panchang.sunsetTime, timeFormat, selectedCountryCode)}
                  </div>
                  <div className="text-[10px] text-amber-900 dark:text-amber-300/80 mt-0.5 font-mono">
                    Noon: {formatTimePreference(panchang.solarNoonTime, timeFormat, selectedCountryCode)}
                  </div>
                </>
              ) : (
                <div className="mt-1">
                  <div className="text-xs text-amber-950 dark:text-amber-300 font-bold">
                    {needsManualTimezone ? 'Timezone required' : 'Location required'}
                  </div>
                  <div className="text-[10px] text-amber-900/85 dark:text-amber-200/80 mt-0.5">
                    {needsManualTimezone
                      ? 'Select an IANA timezone below'
                      : 'Please select city or enable GPS'}
                  </div>
                </div>
              )}
            </div>

            {/* Paksha */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9]/90 dark:bg-[#1D1710]/85 border border-[#E8D9BE] dark:border-[#34281B] shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 tracking-wider">
                <span>🌓 Lunar Fortnight (पक्ष)</span>
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                {panchang.pakshaHi}
              </div>
              <div className="text-xs text-amber-900 dark:text-amber-200 mt-0.5 truncate font-medium">
                {panchang.pakshaEn}
              </div>
            </div>

            {/* Abhijit Muhurat */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 tracking-wider">
                <span>✨ Abhijit Muhurat (अभिजीत)</span>
              </div>
              {isLocationReady && !needsManualTimezone ? (
                <>
                  <div className="text-xs sm:text-sm font-black font-mono text-emerald-900 dark:text-emerald-200 mt-1">
                    {panchang.abhijitMuhurat}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                    Ideal for starting positive ventures &amp; prayer
                  </div>
                </>
              ) : (
                <div className="mt-1">
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                    {needsManualTimezone ? 'Timezone required' : 'Location required'}
                  </div>
                  <div className="text-[10px] text-emerald-700/85 dark:text-emerald-200/80 mt-0.5">
                    {needsManualTimezone
                      ? 'Select an IANA timezone below'
                      : 'Please select city or enable GPS'}
                  </div>
                </div>
              )}
            </div>

            {/* Rahu Kaal */}
            <div className="p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 tracking-wider">
                <span>⚠️ Rahu Kaal (राहु काल)</span>
              </div>
              {isLocationReady && !needsManualTimezone ? (
                <>
                  <div className="text-xs sm:text-sm font-black font-mono text-rose-900 dark:text-rose-200 mt-1">
                    {panchang.rahuKaal}
                  </div>
                  <div className="text-[10px] text-rose-700 dark:text-rose-300/80 mt-0.5">
                    Calculated dynamically from local sunrise &amp; sunset
                  </div>
                </>
              ) : (
                <div className="mt-1">
                  <div className="text-xs text-rose-800 dark:text-rose-300 font-bold">
                    {needsManualTimezone ? 'Timezone required' : 'Location required'}
                  </div>
                  <div className="text-[10px] text-rose-700/85 dark:text-rose-200/80 mt-0.5">
                    {needsManualTimezone
                      ? 'Select an IANA timezone below'
                      : 'Please select city or enable GPS'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warning & Manual IANA Timezone Selector when coordinate lookup fails */}
          {needsManualTimezone && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-500/50 space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-950 dark:text-white">
                    Geographical Timezone Could Not Be Determined
                  </h3>
                  <p className="text-xs text-rose-800 dark:text-rose-100/90 mt-0.5 leading-relaxed">
                    {panchang.calculationBasis}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value=""
                  onChange={(e) => {
                    const tz = e.target.value;
                    if (tz && isValidIanaTimezone(tz)) {
                      setGeoError(null);
                      onLocationChange?.({
                        selectedCity,
                        selectedCountry,
                        selectedLocationTimezone: tz,
                        locationExplicitlyConfirmed: true,
                        customLatitude: customLat,
                        customLongitude: customLon,
                        customLocationName: customName,
                      });
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-400/60 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="">Select IANA Timezone Manually...</option>
                  {getSupportedTimezones().map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Open Location Settings
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Interactive Location Selection / Legacy Confirmation Prompt */}
          {!isLocationReady && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100/80 via-white to-orange-50/70 dark:from-amber-950/60 dark:via-slate-800/70 dark:to-slate-900 border border-amber-300 dark:border-amber-500/50 space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/15 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-400/50 dark:border-amber-500/40 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {needsMumbaiConfirm
                      ? 'Location required — Confirm Saved Mumbai or Select Your City'
                      : 'Location required — Please select city or enable GPS'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {needsMumbaiConfirm
                      ? 'Mumbai, India was previously saved as the default. Sunrise, Sunset, Rahu Kaal, and Abhijit Muhurat stay paused until you confirm Mumbai or select your city below.'
                      : `Solar Panchang timings depend on your geographic latitude and longitude. No default city is assumed. (Device timezone: ${deviceTz}, ${panchang.timezoneOffsetStr})`}
                  </p>
                </div>
              </div>

              {geoError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/60 text-xs text-rose-800 dark:text-rose-200 font-medium">
                  {geoError}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5">
                {needsMumbaiConfirm && (
                  <button
                    type="button"
                    onClick={() => {
                      const mumbai = getCityLocation('mumbai');
                      onLocationChange?.({
                        selectedCity: 'mumbai',
                        selectedCountry: mumbai.country,
                        selectedCountryCode: mumbai.countryCode,
                        selectedRegion: mumbai.stateOrRegion,
                        selectedLocationTimezone: mumbai.timezone,
                        locationSource: 'manual',
                        locationExplicitlyConfirmed: true,
                        customLatitude: mumbai.latitude,
                        customLongitude: mumbai.longitude,
                        customLocationName: mumbai.nameEn,
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Mumbai, India</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleEnableGeolocation}
                  disabled={isLocating}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Detecting GPS...' : 'Detect my location'}</span>
                </button>

                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    if (val === 'custom') {
                      onOpenSettings?.();
                      return;
                    }
                    const city = ALL_CITIES.find((c) => c.id === val);
                    if (city) {
                      onLocationChange?.({
                        selectedCity: city.id,
                        selectedCountry: city.country,
                        selectedCountryCode: city.countryCode,
                        selectedRegion: city.stateOrRegion,
                        selectedLocationTimezone: city.timezone,
                        locationSource: 'manual',
                        locationExplicitlyConfirmed: true,
                        customLatitude: city.latitude,
                        customLongitude: city.longitude,
                        customLocationName: city.nameEn,
                      });
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-600/50 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Choose a City Manually...</option>
                  <optgroup label="India">
                    {INDIAN_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameHi} ({c.nameEn}, {c.country})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="International">
                    {INTERNATIONAL_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameHi} ({c.nameEn}, {c.country})
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom">Enter Custom Latitude / Longitude...</option>
                </select>

                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Choose Location Manually
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Shubh Panchang Interactive Choghadiya Clock + Hora Muhurt + Gowri Panchang */}
          <ChoghadiyaClockDial
            currentDate={currentDate}
            panchang={panchang}
            timeline={muhuratTimeline}
            timeFormat={timeFormat}
            selectedCountryCode={selectedCountryCode}
          />

          {/* Calculation Basis Disclaimer */}
          <div className="px-3.5 py-2 rounded-xl bg-[#FFFDF9]/90 dark:bg-[#1D1710]/80 border border-[#E8D9BE] dark:border-[#34281B] text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between gap-2 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span>🔭</span>
              <span>
                {isLocationReady
                  ? panchang.calculationBasis
                  : `Calculated astronomical lunar estimate (Drik Siddhanta, Lahiri Ayanamsha). Select a city or enable GPS above for location-calibrated Sunrise, Sunset, Rahu Kaal & Abhijit Muhurat (${deviceTz}).`}
              </span>
            </span>
            <span className="text-amber-800 dark:text-amber-400 font-semibold">
              {isLocationReady ? `${panchang.cityName} • ${panchang.timezoneName} (${panchang.timezoneOffsetStr})` : deviceTz}
            </span>
          </div>

          {/* Inspiring Bhagavad Gita Shloka Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F6E9D0] dark:from-[#1D1710] dark:via-[#15110C] dark:to-[#110D09] border border-[#E8D9BE] dark:border-[#34281B] shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-700/10 dark:bg-amber-600/20 text-amber-800 dark:text-amber-300 border border-amber-600/30 dark:border-amber-500/30">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Shrimad Bhagavad Gita Verse of the Day
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/75 text-amber-950 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-600/50">
                  {gitaVerse.citation}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Theme: <strong className="text-amber-900 dark:text-amber-200">{gitaVerse.theme}</strong>
              </span>
            </div>

            {/* Sanskrit Devanagari */}
            <div className="p-4 rounded-xl bg-[#FAF1DF]/80 dark:bg-[#241B10]/80 border border-[#E6D3AF] dark:border-[#3B2C1B] text-center my-2.5">
              <div className="font-serif text-base sm:text-lg font-bold text-[#3D240B] dark:text-amber-200 whitespace-pre-line leading-relaxed">
                {gitaVerse.sanskrit}
              </div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1.5 italic">
                {gitaVerse.transliteration}
              </div>
            </div>

            {/* Meanings & Practical Life Lesson */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-amber-200/80 dark:border-amber-900/40">
              <div>
                <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">
                  Hindi Meaning (भावार्थ)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                  {gitaVerse.meaningHi}
                </p>
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">
                  English Translation &amp; Life Lesson
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                  &ldquo;{gitaVerse.meaningEn}&rdquo;
                </p>
                <div className="text-[11px] text-amber-900 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/40">
                  <strong className="text-amber-950 dark:text-amber-200">🎯 Daily Application: </strong>
                  <span>{gitaVerse.practicalLesson}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
