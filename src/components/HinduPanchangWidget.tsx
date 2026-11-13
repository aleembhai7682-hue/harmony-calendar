import React, { useState, useEffect } from 'react';
import { getHinduPanchang, HinduPanchangInfo } from '../utils/panchang';
import { getDailyGitaVerse, GitaVerse } from '../utils/gitaData';
import { getDeviceTimezone, getTimePartsInZone } from '../utils/istTime';
import {
  ALL_CITIES,
  INDIAN_CITIES,
  INTERNATIONAL_CITIES,
  hasExplicitLocation,
  getCityLocation,
  resolveTimezoneFromCoordinates,
} from '../utils/cities';
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
  selectedLocationTimezone?: string;
  locationExplicitlyConfirmed?: boolean;
  customLat?: number;
  customLon?: number;
  customName?: string;
  onLocationChange?: (loc: {
    selectedCity: string;
    selectedCountry?: string;
    selectedLocationTimezone?: string;
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
  selectedLocationTimezone,
  locationExplicitlyConfirmed,
  customLat,
  customLon,
  customName,
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

  const handleEnableGeolocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please select a city below.');
      return;
    }
    setIsLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        const resolvedTz = resolveTimezoneFromCoordinates(lat, lon);
        onLocationChange?.({
          selectedCity: 'custom',
          selectedCountry: '',
          selectedLocationTimezone: resolvedTz,
          locationExplicitlyConfirmed: true,
          customLatitude: lat,
          customLongitude: lon,
          customLocationName: 'Device GPS Location',
        });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(
            'Location permission denied. Calendar, Tithi, Nakshatra, and events continue working normally; select a city below or enter custom coordinates in Settings for Sunrise, Sunset, Abhijit Muhurat, and Rahu Kaal.'
          );
        } else {
          setGeoError('Unable to determine your GPS location. Please choose a city below.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const panchang: HinduPanchangInfo = getHinduPanchang(
    currentDate,
    selectedCity,
    customLat,
    customLon,
    customName,
    undefined,
    selectedCountry,
    selectedLocationTimezone
  );
  const gitaVerse: GitaVerse = getDailyGitaVerse(currentDate);
  const activeTime = getTimePartsInZone(
    isLocationReady ? panchang.timezoneName : deviceTz,
    now
  );

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#16120c] via-slate-900 to-[#181108] border border-amber-600/35 text-slate-100 shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-950/90 via-slate-900 to-[#140f09] border-b border-amber-600/30 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-xs">
            <span className="text-xl">🕉️</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Vedic Panchang & Bhagavad Gita Shloka
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-900/80 text-amber-200 border border-amber-600/50 font-bold">
                {panchang.pakshaHi} • {panchang.tithiNameHi}
              </span>
              {isLocationReady ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>
                    {panchang.cityName} ({panchang.coordinates}) • {panchang.timezoneName} ({panchang.timezoneOffsetStr})
                  </span>
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/50 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>
                    {needsMumbaiConfirm ? `Confirm location • Saved: Mumbai, India` : `Location not set • ${deviceTz}`}
                  </span>
                </span>
              )}
              {panchang.auspiciousTag && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 font-bold flex items-center gap-1 animate-pulse shadow-xs">
                  <span>🪔</span>
                  <span>{panchang.auspiciousTagHi || panchang.auspiciousTag}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium flex items-center gap-2 flex-wrap">
              <span>Vikram Samvat {panchang.vikramSamvat} • Shaka {panchang.shakaSamvat}</span>
              <span className="text-slate-500">•</span>
              <span>मास: <strong className="text-amber-200">{panchang.hinduMonthHi} ({panchang.hinduMonthEn})</strong></span>
              <span className="text-slate-500">•</span>
              <span>{isLocationReady ? 'City Time' : 'Device Time'}: <strong className="font-mono text-amber-300">{activeTime.formatted}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-600/30 cursor-pointer shadow-xs"
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
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-amber-600/25">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 tracking-wider">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>Tithi (तिथि)</span>
              </div>
              <div className="text-sm font-black text-amber-300 mt-1 truncate">
                {panchang.tithiNameEn}
              </div>
              <div className="text-xs text-slate-300 mt-0.5 truncate font-medium">
                {panchang.tithiNameHi}
              </div>
            </div>

            {/* Nakshatra */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-amber-600/25">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Nakshatra (नक्षत्र)</span>
              </div>
              <div className="text-sm font-black text-white mt-1 truncate">
                {panchang.nakshatraNameEn}
              </div>
              <div className="text-xs text-amber-200 mt-0.5 truncate font-medium">
                {panchang.nakshatraNameHi} (देवता: {panchang.nakshatraDeityHi})
              </div>
            </div>

            {/* Yoga */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-amber-600/25">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 tracking-wider">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Yoga (योग)</span>
              </div>
              <div className="text-sm font-black text-amber-300 mt-1 truncate">
                {panchang.yogaNameEn}
              </div>
              <div className="text-xs text-slate-300 mt-0.5 truncate font-medium">
                {panchang.yogaNameHi} • {panchang.yogaQualityEn}
              </div>
            </div>

            {/* Karana */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-amber-600/25">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Karana (करण)</span>
              </div>
              <div className="text-sm font-black text-white mt-1 truncate">
                {panchang.karanaNameEn}
              </div>
              <div className="text-xs text-amber-200 mt-0.5 truncate font-medium">
                {panchang.karanaNameHi}
              </div>
            </div>

            {/* Sunrise & Sunset */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-700/35">
              <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 tracking-wider">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Sunrise & Sunset (सूर्योदय / सूर्यास्त)</span>
              </div>
              {isLocationReady ? (
                <>
                  <div className="text-xs font-mono font-bold text-white mt-1">
                    🌅 {panchang.sunriseTime} | 🌇 {panchang.sunsetTime}
                  </div>
                  <div className="text-[10px] text-amber-300/80 mt-0.5 font-mono">
                    Noon: {panchang.solarNoonTime}
                  </div>
                </>
              ) : (
                <div className="text-xs text-amber-200/90 mt-1 font-medium">
                  {needsMumbaiConfirm ? 'Confirm location below' : 'Select location below'}
                </div>
              )}
            </div>

            {/* Paksha */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-amber-600/25">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 tracking-wider">
                <span>🌓 Lunar Fortnight (पक्ष)</span>
              </div>
              <div className="text-sm font-black text-white mt-1 truncate">
                {panchang.pakshaHi}
              </div>
              <div className="text-xs text-amber-200 mt-0.5 truncate font-medium">
                {panchang.pakshaEn}
              </div>
            </div>

            {/* Abhijit Muhurat */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
              <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 tracking-wider">
                <span>✨ Abhijit Muhurat (अभिजीत मुहूर्त)</span>
              </div>
              {isLocationReady ? (
                <>
                  <div className="text-xs sm:text-sm font-black font-mono text-emerald-200 mt-1">
                    {panchang.abhijitMuhurat}
                  </div>
                  <div className="text-[10px] text-emerald-300/80 mt-0.5">
                    Ideal for starting positive ventures & prayer
                  </div>
                </>
              ) : (
                <div className="text-xs text-emerald-200/80 mt-1 font-medium">
                  Requires confirmed city or GPS coordinates
                </div>
              )}
            </div>

            {/* Rahu Kaal */}
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60">
              <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1 tracking-wider">
                <span>⚠️ Rahu Kaal (राहु काल)</span>
              </div>
              {isLocationReady ? (
                <>
                  <div className="text-xs sm:text-sm font-black font-mono text-rose-200 mt-1">
                    {panchang.rahuKaal}
                  </div>
                  <div className="text-[10px] text-rose-300/80 mt-0.5">
                    Calculated dynamically from local sunrise & sunset
                  </div>
                </>
              ) : (
                <div className="text-xs text-rose-200/80 mt-1 font-medium">
                  Requires confirmed city or GPS coordinates
                </div>
              )}
            </div>

          </div>

          {/* Interactive Location Selection / Legacy Confirmation Prompt */}
          {!isLocationReady && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-800/70 to-slate-900 border border-amber-500/50 space-y-3 shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/40 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {needsMumbaiConfirm
                      ? 'Confirm Your Location (Saved as Mumbai, India)'
                      : 'Select or Enable Location for Sunrise, Sunset, Rahu Kaal & Abhijit Muhurat'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {needsMumbaiConfirm
                      ? 'Mumbai, India was previously saved as the default. Please confirm if you live in Mumbai, or choose your city below.'
                      : `Solar Panchang timings depend on your geographic latitude and longitude. No default city is assumed. (Device timezone: ${deviceTz})`}
                  </p>
                </div>
              </div>

              {geoError && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-700/60 text-xs text-rose-200 font-medium">
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
                        selectedLocationTimezone: mumbai.timezone,
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
                        selectedLocationTimezone: city.timezone,
                        locationExplicitlyConfirmed: true,
                        customLatitude: city.latitude,
                        customLongitude: city.longitude,
                        customLocationName: city.nameEn,
                      });
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-amber-600/50 text-xs font-semibold text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                  >
                    Search All Cities / Custom
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Calculation Basis Disclaimer */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span>🔭</span>
              <span>
                {isLocationReady
                  ? panchang.calculationBasis
                  : `Calculated astronomical lunar estimate (Drik Siddhanta, Lahiri Ayanamsha). Select a city or enable GPS above for location-calibrated Sunrise, Sunset, Rahu Kaal & Abhijit Muhurat (${deviceTz}).`}
              </span>
            </span>
            <span className="text-amber-400 font-semibold">
              {isLocationReady ? `${panchang.cityName} • ${panchang.timezoneName} (${panchang.timezoneOffsetStr})` : deviceTz}
            </span>
          </div>

          {/* Inspiring Bhagavad Gita Shloka Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-[#120e09] border border-amber-600/40 shadow-inner">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  Shrimad Bhagavad Gita Verse of the Day
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-900/80 text-amber-200 font-bold border border-amber-600/50">
                  {gitaVerse.citation}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-300">
                Theme: <strong className="text-amber-200">{gitaVerse.theme}</strong>
              </span>
            </div>

            {/* Sanskrit Devanagari */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 text-center my-2.5">
              <div className="font-serif text-base sm:text-lg font-bold text-amber-200 whitespace-pre-line leading-relaxed">
                {gitaVerse.sanskrit}
              </div>
              <div className="text-xs font-mono text-slate-300 mt-1.5 italic">
                {gitaVerse.transliteration}
              </div>
            </div>

            {/* Meanings & Practical Life Lesson */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-amber-900/40">
              <div>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Hindi Meaning (भावार्थ)
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {gitaVerse.meaningHi}
                </p>
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  English Translation & Life Lesson
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  "{gitaVerse.meaningEn}"
                </p>
                <div className="text-[11px] text-amber-300 bg-amber-950/60 p-2.5 rounded-xl border border-amber-800/40">
                  <strong className="text-amber-200">🎯 Daily Application: </strong>
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
