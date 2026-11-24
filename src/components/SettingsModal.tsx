import React, { useRef, useState } from 'react';
import { CalendarFilterSettings, Language, Theme, CalendarFaithMode } from '../types/calendar';
import { translations, INDIAN_STATES } from '../translations/i18n';
import { LocationSelector } from './LocationSelector';
import {
  X,
  Moon,
  Compass,
  Download,
  Upload,
  RotateCcw,
  FileDown,
  Sparkles,
  Bell,
  Volume2,
  Globe,
  CalendarDays,
  Check,
  Scale,
} from 'lucide-react';
import { getCountryHolidaySummary } from '../utils/globalHolidays';
import { getConfirmedCountryCode } from '../utils/storage';
import {
  getNotificationPermissionStatus,
  requestNotificationPermissionByUser,
  testNotificationChimeAndAlert,
  isNotificationSupported,
} from '../utils/notifications';
import { getModeTheme } from '../utils/modeTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CalendarFilterSettings;
  onFilterChange: (filters: CalendarFilterSettings) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  calendarMode: CalendarFaithMode;
  onExportIcs: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => void;
  onResetDefaults: () => void;
  onLoadDemoData: () => void;
  onClearAllData?: () => void;
  onTestReminder?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  calendarMode,
  onExportIcs,
  onExportBackup,
  onImportBackup,
  onResetDefaults,
  onLoadDemoData,
  onClearAllData,
  onTestReminder,
}) => {
  const t = translations[language] || translations['en'];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notificationStatus, setNotificationStatus] = useState<string>(() =>
    getNotificationPermissionStatus()
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
  };

  const isChristianMode = calendarMode === 'christian';
  const isHinduMode = calendarMode === 'hindu';
  const isMuslimMode = calendarMode === 'muslim';
  const modeTheme = getModeTheme(calendarMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${modeTheme.cardSurface} rounded-3xl max-w-lg w-full p-6 shadow-2xl border ${modeTheme.cardBorder} max-h-[90vh] overflow-y-auto`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${modeTheme.gridDivider}`}>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>⚙️</span>
            <span>
              {isChristianMode
                ? 'Preferences & Settings'
                : isHinduMode
                ? 'सेटिंग्स एवं प्राथमिकताएं'
                : language === 'ur'
                ? 'سیٹنگز اور ترجیحات'
                : 'Preferences & Settings'}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          
          {/* Global Geographical Location & Device Timezone Section */}
          <LocationSelector
            filters={filters}
            onLocationUpdate={(updates) => onFilterChange({ ...filters, ...updates })}
            calendarMode={calendarMode}
            language={language}
          />

          {/* Country / Regional Holiday Notice & State Selector (India Only) */}
          {(() => {
            const confirmedCountryCode = getConfirmedCountryCode(filters);
            const countrySummary = getCountryHolidaySummary(confirmedCountryCode);
            if (confirmedCountryCode === 'IN') {
              return (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Compass className={`w-4 h-4 ${modeTheme.accentText}`} />
                    <span>
                      {isChristianMode
                        ? 'Indian State for Regional Holidays'
                        : isHinduMode
                        ? 'क्षेत्रीय अवकाश हेतु भारतीय राज्य'
                        : language === 'ur'
                        ? 'ریاستی تعطیلات کے لیے صوبہ / ریاست'
                        : 'Indian State for Regional Holidays'}
                    </span>
                  </label>
                  <select
                    value={filters.selectedState}
                    onChange={(e) => onFilterChange({ ...filters, selectedState: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl ${modeTheme.cardSubSurface} border ${modeTheme.cardBorder} text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 ${modeTheme.focusRing} cursor-pointer`}
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st.code} value={st.code}>
                        {isChristianMode
                          ? st.nameEn
                          : isHinduMode
                          ? st.nameHi
                          : language === 'ur'
                          ? (st.nameUr || st.nameEn)
                          : st.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
            return (
              <div className={`p-3 rounded-2xl ${modeTheme.cardSubSurface} border ${modeTheme.cardBorder} text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5`}>
                <Globe className={`w-4 h-4 ${modeTheme.accentText} shrink-0 mt-0.5`} />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Public Holidays {countrySummary.countryName ? `(${countrySummary.countryName})` : ''}
                  </div>
                  <div className="text-[11px] mt-0.5 leading-relaxed">{countrySummary.notice}</div>
                </div>
              </div>
            );
          })()}

          {/* Regional & Format Preferences (Week Start, Clock 12h/24h, Date Order) */}
          <div className={`pt-2 border-t ${modeTheme.gridDivider} space-y-2.5`}>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <CalendarDays className={`w-4 h-4 ${modeTheme.accentText}`} />
              <span>Regional Calendar Formats</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  First Day of Week
                </label>
                <select
                  value={filters.weekStartDay === undefined ? 'auto' : String(filters.weekStartDay)}
                  onChange={(e) => {
                    const v = e.target.value;
                    onFilterChange({
                      ...filters,
                      weekStartDay: v === 'auto' ? 'auto' : (Number(v) as 0 | 1 | 6),
                    });
                  }}
                  className={`w-full px-2.5 py-2 text-xs rounded-xl ${modeTheme.cardSubSurface} border ${modeTheme.cardBorder} text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 ${modeTheme.focusRing} cursor-pointer`}
                >
                  <option value="auto">Auto (Country/Locale)</option>
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Time Format
                </label>
                <select
                  value={filters.timeFormat || 'auto'}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      timeFormat: e.target.value as 'auto' | '12h' | '24h',
                    })
                  }
                  className={`w-full px-2.5 py-2 text-xs rounded-xl ${modeTheme.cardSubSurface} border ${modeTheme.cardBorder} text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 ${modeTheme.focusRing} cursor-pointer`}
                >
                  <option value="auto">Auto (Locale)</option>
                  <option value="12h">12-Hour (AM/PM)</option>
                  <option value="24h">24-Hour</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Date Format
                </label>
                <select
                  value={filters.dateFormat || 'auto'}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      dateFormat: e.target.value as 'auto' | 'DMY' | 'MDY' | 'YMD',
                    })
                  }
                  className={`w-full px-2.5 py-2 text-xs rounded-xl ${modeTheme.cardSubSurface} border ${modeTheme.cardBorder} text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 ${modeTheme.focusRing} cursor-pointer`}
                >
                  <option value="auto">Auto (Locale)</option>
                  <option value="DMY">DD/MM/YYYY</option>
                  <option value="MDY">MM/DD/YYYY</option>
                  <option value="YMD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Muslim Mode Specific: Prayer Methods, Asr School & Moon Sighting Offset */}
          {isMuslimMode && (
            <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Islamic Prayer Calculation Section */}
              <div className="bg-emerald-50/75 dark:bg-emerald-950/35 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-4 shadow-xs">
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-emerald-200/70 dark:border-emerald-800/50">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                      <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        {language === 'ur'
                          ? 'اسلامی اوقاتِ نماز کا حساب'
                          : 'Islamic Prayer Calculation'}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                      {language === 'ur'
                        ? 'اپنے علاقے اور فقہی مسلک کے مطابق حساب کا طریقہ منتخب کریں۔'
                        : 'Choose the regional convention and Asr juristic rule used for daily prayer times.'}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200/85 dark:bg-emerald-900/90 text-emerald-900 dark:text-emerald-200 border border-emerald-300/70 dark:border-emerald-700/60">
                    Adhan Engine
                  </span>
                </div>

                {/* Calculation Convention Options with Helper Text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {language === 'ur'
                          ? 'حسابی طریقہ (Calculation Method)'
                          : 'Calculation Method'}
                      </span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                      {(filters.prayerMethod || 'karachi').toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'karachi' as const,
                        title: 'Karachi',
                        subtitle: 'Univ. of Islamic Sciences',
                        helper: 'Fajr 18°, Isha 18° — Standard across India, Pakistan & South Asia.',
                      },
                      {
                        id: 'mwl' as const,
                        title: 'MWL (Muslim World League)',
                        subtitle: 'Global Standard',
                        helper: 'Fajr 18°, Isha 17° — Widely used across Europe, North America & globally.',
                      },
                      {
                        id: 'makkah' as const,
                        title: 'Makkah (Umm al-Qura)',
                        subtitle: 'Arabian Peninsula',
                        helper: 'Fajr 18.5°, Isha +90 min — Official calendar in Saudi Arabia & Gulf.',
                      },
                      {
                        id: 'egypt' as const,
                        title: 'Egypt (Egyptian Survey)',
                        subtitle: 'General Authority of Survey',
                        helper: 'Fajr 19.5°, Isha 17.5° — Standard across Egypt, Africa & Middle East.',
                      },
                    ].map((opt) => {
                      const active = (filters.prayerMethod || 'karachi') === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            onFilterChange({ ...filters, prayerMethod: opt.id })
                          }
                          className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            active
                              ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/50 shadow-sm'
                              : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-extrabold leading-tight">{opt.title}</div>
                              <div
                                className={`text-[10px] font-medium mt-0.5 ${
                                  active ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {opt.subtitle}
                              </div>
                            </div>
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                                active
                                  ? 'bg-white text-emerald-700 border-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                          </div>
                          <div
                            className={`text-[10px] mt-1.5 leading-snug ${
                              active
                                ? 'text-emerald-50/95'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {opt.helper}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Asr Juristic Method with Helper Text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {language === 'ur'
                          ? 'عصر کا فقہی مسلک (Asr Method)'
                          : 'Asr Juristic Method'}
                      </span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                      {(filters.asrMethod || 'hanafi') === 'hanafi' ? '2× Shadow' : '1× Shadow'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'hanafi' as const,
                        title: 'Hanafi',
                        helper: 'Hanafi = 2× shadow length (later Asr start; South Asia & Turkey).',
                      },
                      {
                        id: 'standard' as const,
                        title: "Standard / Shafi'i",
                        helper: "Standard / Shafi'i = 1× shadow length (earlier Asr start; Maliki & Hanbali).",
                      },
                    ].map((opt) => {
                      const active = (filters.asrMethod || 'hanafi') === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            onFilterChange({ ...filters, asrMethod: opt.id })
                          }
                          className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            active
                              ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/50 shadow-sm'
                              : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-extrabold">{opt.title}</div>
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                                active
                                  ? 'bg-white text-emerald-700 border-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                          </div>
                          <div
                            className={`text-[10px] mt-1.5 leading-snug ${
                              active
                                ? 'text-emerald-50/95'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {opt.helper}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Islamic Moon Sighting Offset */}
              <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                    <Moon className="w-4 h-4 text-amber-600" />
                    <span>{language === 'ur' ? 'رویتِ ہلال ایڈجسٹمنٹ (قمری دن)' : 'Moon Sighting Offset (Hilal Adjustment)'}</span>
                  </div>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono">
                    {filters.hijriAdjustmentDays > 0
                      ? `+${filters.hijriAdjustmentDays} Day`
                      : filters.hijriAdjustmentDays < 0
                      ? `${filters.hijriAdjustmentDays} Day`
                      : '0 (Astronomical)'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed mb-3">
                  {language === 'ur'
                    ? 'اگر آپ کے علاقے میں چاند دیکھنے کا اعلان ایک دن آگے یا پیچھے ہو تو یہاں سے تاریخ ایڈجسٹ کریں۔'
                    : 'Adjust the Hijri calendar date by ±1 or ±2 days to match your verified local Hilal / moon sighting committee.'}
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {[-2, -1, 0, 1, 2].map((val) => (
                    <button
                      key={val}
                      onClick={() => onFilterChange({ ...filters, hijriAdjustmentDays: val })}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        filters.hijriAdjustmentDays === val
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                      }`}
                    >
                      {val > 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mode-Aware Language Selector & Theme */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t ${modeTheme.gridDivider}`}>
            
            {/* Language (Strictly mode-filtered) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isChristianMode ? 'Language (English Only)' : isHinduMode ? 'भाषा (Language)' : 'زبان (Language)'}
              </label>

              {isChristianMode ? (
                <div className={`p-2 rounded-xl ${modeTheme.cardSubSurface} text-xs font-bold ${modeTheme.accentText} flex items-center justify-between border ${modeTheme.cardBorder}`}>
                  <span>English (Exclusively)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${modeTheme.subtleActionBtn}`}>Active</span>
                </div>
              ) : isHinduMode ? (
                <div className={`grid grid-cols-2 gap-1 ${modeTheme.cardSubSurface} p-1 rounded-xl border ${modeTheme.cardBorder}`}>
                  <button
                    onClick={() => onLanguageChange('en')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === 'en' ? modeTheme.activeTab : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => onLanguageChange('hinglish')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === 'hinglish' ? modeTheme.activeTab : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    हिन्दी / Hinglish
                  </button>
                </div>
              ) : (
                <div className={`grid grid-cols-3 gap-1 ${modeTheme.cardSubSurface} p-1 rounded-xl border ${modeTheme.cardBorder}`}>
                  <button
                    onClick={() => onLanguageChange('ur')}
                    className={`py-1.5 rounded-lg text-xs font-bold font-serif transition-all cursor-pointer ${
                      language === 'ur' ? modeTheme.activeTab : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    اردو
                  </button>
                  <button
                    onClick={() => onLanguageChange('hinglish')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === 'hinglish' ? modeTheme.activeTab : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Hinglish
                  </button>
                  <button
                    onClick={() => onLanguageChange('en')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === 'en' ? modeTheme.activeTab : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Theme */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Theme
              </label>
              <div className={`grid grid-cols-2 gap-1 ${modeTheme.cardSubSurface} p-1 rounded-xl border ${modeTheme.cardBorder}`}>
                <button
                  onClick={() => onThemeChange('light')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    theme === 'light' ? modeTheme.activeTab : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => onThemeChange('dark')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    theme === 'dark' ? modeTheme.activeTab : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Toggles */}
          <div className={`space-y-2.5 pt-2 border-t ${modeTheme.gridDivider}`}>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Show Tasks & Checklists on Calendar Grid
              </span>
              <input
                type="checkbox"
                checked={filters.showTasksOnCalendar}
                onChange={(e) => onFilterChange({ ...filters, showTasksOnCalendar: e.target.checked })}
                className={`rounded w-4 h-4 cursor-pointer ${
                  isMuslimMode
                    ? 'accent-emerald-700 dark:accent-emerald-500'
                    : isHinduMode
                    ? 'accent-amber-700 dark:accent-amber-500'
                    : 'accent-[#14284B] dark:accent-sky-500'
                }`}
              />
            </label>

            {isMuslimMode && (
              <>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Highlight Fridays (Jummah Mubarak)
                  </span>
                  <input
                    type="checkbox"
                    checked={filters.highlightFridays}
                    onChange={(e) => onFilterChange({ ...filters, highlightFridays: e.target.checked })}
                    className="rounded accent-emerald-700 dark:accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Show Moon Phases & Hilal Symbols
                  </span>
                  <input
                    type="checkbox"
                    checked={filters.showMoonPhases}
                    onChange={(e) => onFilterChange({ ...filters, showMoonPhases: e.target.checked })}
                    className="rounded accent-emerald-700 dark:accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </>
            )}
          </div>

          {/* Desktop & In-App Notifications Management */}
          <div className={`pt-3 border-t ${modeTheme.gridDivider} space-y-2.5`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bell className={`w-3.5 h-3.5 ${modeTheme.accentText}`} />
                <span>Notifications & Sound Chimes</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  notificationStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : notificationStatus === 'denied'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {notificationStatus === 'granted'
                  ? 'Browser: Active'
                  : notificationStatus === 'denied'
                  ? 'Browser: Blocked'
                  : notificationStatus === 'unsupported'
                  ? 'Browser: Unsupported'
                  : 'Browser: Optional'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {notificationStatus === 'granted'
                ? 'Desktop notifications are active. You will receive gentle alerts before upcoming scheduled events and tasks.'
                : notificationStatus === 'denied'
                ? 'Browser notifications are blocked in your browser site permissions. In-app audio chimes and visual toast banners remain active.'
                : notificationStatus === 'unsupported'
                ? 'Browser push notifications are not supported in this client. Peaceful in-app synthesizer chimes and visual banners will alert you.'
                : 'Click below to enable desktop pop-ups. If declined, in-app harmonic audio chimes and visual banners will notify you without pop-ups.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {notificationStatus !== 'granted' && isNotificationSupported() && (
                <button
                  type="button"
                  onClick={async () => {
                    const status = await requestNotificationPermissionByUser();
                    setNotificationStatus(status);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${modeTheme.subtleActionBtn}`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Enable Desktop Alerts</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (onTestReminder) {
                    onTestReminder();
                  } else {
                    testNotificationChimeAndAlert();
                  }
                }}
                className={`p-2.5 rounded-xl border ${modeTheme.cardBorder} hover:${modeTheme.cardSubSurface} text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  notificationStatus === 'granted' || !isNotificationSupported() ? 'sm:col-span-2' : ''
                }`}
              >
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Test Audio Chime & Alert</span>
              </button>
            </div>
          </div>

          {/* Data Backup & Demo Data */}
          <div className={`pt-3 border-t ${modeTheme.gridDivider} space-y-2.5`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Backup, Sync & Data Control
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExportIcs}
                className={`p-2.5 rounded-xl border ${modeTheme.cardBorder} hover:${modeTheme.cardSubSurface} text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer`}
              >
                <FileDown className={`w-4 h-4 ${modeTheme.accentText}`} />
                <span>Export iCal (.ics)</span>
              </button>

              <button
                onClick={onExportBackup}
                className={`p-2.5 rounded-xl border ${modeTheme.cardBorder} hover:${modeTheme.cardSubSurface} text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer`}
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>JSON Backup</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-2.5 rounded-xl border ${modeTheme.cardBorder} hover:${modeTheme.cardSubSurface} text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer`}
              >
                <Upload className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Restore JSON Backup</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  if (confirm('Load sample demonstration events and tasks into your calendar?')) {
                    onLoadDemoData();
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${modeTheme.subtleActionBtn}`}
                title="Load sample demonstration events and tasks"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Sample Demo Data</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all your events and tasks to a clean slate?')) {
                    if (onClearAllData) {
                      onClearAllData();
                    } else {
                      onResetDefaults();
                    }
                  }
                }}
                className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-xs font-bold text-rose-700 dark:text-rose-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                title="Clear all events and tasks"
              >
                <RotateCcw className="w-4 h-4 text-rose-500" />
                <span>Clear Data (Clean Slate)</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
