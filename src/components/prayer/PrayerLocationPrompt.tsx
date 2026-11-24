import React from 'react';
import { Globe, Navigation, Check } from 'lucide-react';
import { Language } from '../../types/calendar';
import {
  ALL_CITIES,
  INDIAN_CITIES,
  INTERNATIONAL_CITIES,
  getCityLocation,
} from '../../utils/cities';
import { getSupportedTimezones, isValidIanaTimezone } from '../../utils/istTime';
import { DetailedPrayerInfo } from '../../utils/prayerTimes';

export interface PrayerLocationUpdatePayload {
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
}

interface PrayerLocationPromptProps {
  language: Language;
  needsMumbaiConfirm: boolean;
  needsManualTimezone: boolean;
  isLocating: boolean;
  geoError: string | null;
  deviceTz: string;
  prayerData: DetailedPrayerInfo;
  selectedCity: string;
  selectedCountry?: string;
  customLat?: number;
  customLon?: number;
  customName?: string;
  onEnableGeolocation: () => void;
  onClearGeoError: () => void;
  onLocationChange?: (loc: PrayerLocationUpdatePayload) => void;
  onOpenSettings?: () => void;
}

export const PrayerLocationPrompt: React.FC<PrayerLocationPromptProps> = ({
  language,
  needsMumbaiConfirm,
  needsManualTimezone,
  isLocating,
  geoError,
  deviceTz,
  prayerData,
  selectedCity,
  selectedCountry,
  customLat,
  customLon,
  customName,
  onEnableGeolocation,
  onClearGeoError,
  onLocationChange,
  onOpenSettings,
}) => {
  if (needsManualTimezone) {
    return (
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-600/60 space-y-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 dark:border-amber-500/40 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {language === 'ur'
                ? 'جغرافیائی ٹائم زون دستی طور پر منتخب کریں'
                : 'Geographical Timezone Could Not Be Determined'}
            </h3>
            <p className="text-xs text-amber-900 dark:text-amber-100/90 mt-1 leading-relaxed">
              {language === 'ur' ? prayerData.disclaimerUr : prayerData.disclaimer}
            </p>
          </div>
        </div>

        {geoError && (
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 font-medium">
            {geoError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value=""
            onChange={(e) => {
              const tz = e.target.value;
              if (tz && isValidIanaTimezone(tz)) {
                onClearGeoError();
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
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/60 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">
              {language === 'ur'
                ? 'IANA ٹائم زون منتخب کریں...'
                : 'Select IANA Timezone Manually...'}
            </option>
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
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F7FBF8] via-[#FCFDFC] to-[#FBF6E8] dark:from-[#0E211A] dark:via-[#0B1914] dark:to-[#18140B] border border-[#E5D3A7] dark:border-amber-700/50 space-y-3 shadow-xs">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/50 dark:border-amber-500/40 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
              <span>Location required</span>
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {needsMumbaiConfirm
                ? language === 'ur'
                  ? 'مقام کی تصدیق درکار ہے — براہ کرم ممبئی کی تصدیق کریں یا اپنا شہر منتخب کریں'
                  : 'Location required — Confirm Saved Mumbai or Select Your City'
                : language === 'ur'
                ? 'مقام درکار ہے — براہ کرم شہر منتخب کریں یا GPS فعال کریں'
                : 'Location required — Please select your city or enable GPS'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {needsMumbaiConfirm
                ? language === 'ur'
                  ? 'ممبئی پہلے سے بطور ڈیفالٹ محفوظ تھا۔ جب تک آپ تصدیق یا تبدیلی نہیں کرتے، اوقاتِ نماز حساب نہیں کیے جائیں گے۔'
                  : 'Mumbai, India was saved as an old default. Prayer times remain paused until you confirm Mumbai, choose another city, or enable GPS below.'
                : language === 'ur'
                ? `درست فجر، ظہر، عصر، مغرب، عشاء اور سحری/افطار کے حساب کے لیے جغرافیائی عرض و طول درکار ہیں۔ (ڈیوائس ٹائم زون: ${deviceTz} • ${prayerData.timezoneOffsetStr})`
                : `Prayer times, Sehri Ends, and Iftar depend on your geographic latitude and longitude. No default city is assumed. (Device timezone: ${deviceTz}, ${prayerData.timezoneOffsetStr})`}
            </p>
          </div>
        </div>
      </div>

      {geoError && (
        <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 font-medium">
          {geoError}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
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
            className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {language === 'ur' ? 'ممبئی، بھارت کی تصدیق کریں' : 'Confirm Mumbai, India'}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onEnableGeolocation}
          disabled={isLocating}
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>
            {isLocating
              ? language === 'ur'
                ? 'تلاش جاری ہے...'
                : 'Detecting GPS...'
              : language === 'ur'
              ? 'میری موجودہ لوکیشن استعمال کریں'
              : 'Detect my location'}
          </span>
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
          className="px-3 py-2 rounded-xl bg-[#FCFDFC] dark:bg-[#0B1914] border border-[#D5E4DC] dark:border-[#1B382E] text-xs font-semibold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          <option value="">
            {language === 'ur' ? 'فہرست سے شہر منتخب کریں...' : 'Choose a City Manually...'}
          </option>
          <optgroup label="India">
            {INDIAN_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {language === 'ur' ? `${c.nameUr} (${c.nameEn})` : `${c.nameEn}, ${c.country}`}
              </option>
            ))}
          </optgroup>
          <optgroup label="International">
            {INTERNATIONAL_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {language === 'ur' ? `${c.nameUr} (${c.nameEn})` : `${c.nameEn}, ${c.country}`}
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
            {language === 'ur' ? 'دستی مقام منتخب کریں / تلاش' : 'Choose Location Manually'}
          </button>
        )}
      </div>
    </div>
  );
};
