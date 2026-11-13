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
} from 'lucide-react';
import {
  getNotificationPermissionStatus,
  requestNotificationPermissionByUser,
  testNotificationChimeAndAlert,
  isNotificationSupported,
} from '../utils/notifications';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
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

          {/* Regional Indian State Selection for Holidays */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>
                {isChristianMode
                  ? 'Default Indian State for Regional Holidays'
                  : isHinduMode
                  ? 'क्षेत्रीय अवकाश हेतु भारतीय राज्य'
                  : language === 'ur'
                  ? 'ریاستی تعطیلات کے لیے صوبہ / ریاست'
                  : 'Default Indian State for Regional Holidays'}
              </span>
            </label>
            <select
              value={filters.selectedState}
              onChange={(e) => onFilterChange({ ...filters, selectedState: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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

          {/* Muslim Mode Specific: Moon Sighting Offset & Prayer Methods */}
          {isMuslimMode && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              
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

              {/* Asr Juristic Method & Calculation Convention */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asr Juristic Method (فقہی مسلک)
                  </label>
                  <select
                    value={filters.asrMethod || 'hanafi'}
                    onChange={(e) => onFilterChange({ ...filters, asrMethod: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold cursor-pointer"
                  >
                    <option value="hanafi">Hanafi (Shadow: 2x Object Length)</option>
                    <option value="standard">Standard / Shafi'i (Shadow: 1x Length)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Calculation Convention
                  </label>
                  <select
                    value={filters.prayerMethod || 'karachi'}
                    onChange={(e) => onFilterChange({ ...filters, prayerMethod: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold cursor-pointer"
                  >
                    <option value="karachi">Univ. of Karachi (Subcontinent 18°/18°)</option>
                    <option value="mwl">Muslim World League (MWL 18°/17°)</option>
                    <option value="makkah">Umm al-Qura University, Makkah</option>
                    <option value="egypt">Egyptian Survey Authority (19.5°/17.5°)</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* Mode-Aware Language Selector & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            
            {/* Language (Strictly mode-filtered) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isChristianMode ? 'Language (English Only)' : isHinduMode ? 'भाषा (Language)' : 'زبان (Language)'}
              </label>

              {isChristianMode ? (
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                  <span>English (Exclusively)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 font-semibold">Active</span>
                </div>
              ) : isHinduMode ? (
                <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => onLanguageChange('en')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => onLanguageChange('hinglish')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === 'hinglish' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    हिन्दी / Hinglish
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => onLanguageChange('ur')}
                    className={`py-1.5 rounded-lg text-xs font-bold font-serif transition-all cursor-pointer ${
                      language === 'ur' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    اردو
                  </button>
                  <button
                    onClick={() => onLanguageChange('hinglish')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === 'hinglish' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                    }`}
                  >
                    Hinglish
                  </button>
                  <button
                    onClick={() => onLanguageChange('en')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
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
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => onThemeChange('light')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    theme === 'light' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => onThemeChange('dark')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    theme === 'dark' ? 'bg-slate-700 shadow-sm text-amber-400' : 'text-slate-500'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Show Tasks & Checklists on Calendar Grid
              </span>
              <input
                type="checkbox"
                checked={filters.showTasksOnCalendar}
                onChange={(e) => onFilterChange({ ...filters, showTasksOnCalendar: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
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
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
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
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </>
            )}
          </div>

          {/* Desktop & In-App Notifications Management */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-500" />
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
                  className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
                className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  notificationStatus === 'granted' || !isNotificationSupported() ? 'sm:col-span-2' : ''
                }`}
              >
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <span>Test Audio Chime & Alert</span>
              </button>
            </div>
          </div>

          {/* Data Backup & Demo Data */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Backup, Sync & Data Control
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExportIcs}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-indigo-500" />
                <span>Export iCal (.ics)</span>
              </button>

              <button
                onClick={onExportBackup}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500" />
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
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-sky-500" />
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
                className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                title="Load sample demonstration events and tasks"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
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
