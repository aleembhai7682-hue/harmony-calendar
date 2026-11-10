import React, { useRef } from 'react';
import { CalendarFilterSettings, Language, Theme } from '../types/calendar';
import { translations, INDIAN_STATES } from '../translations/i18n';
import {
  X,
  Moon,
  Compass,
  Download,
  Upload,
  RotateCcw,
  Palette,
  Check,
  FileDown,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CalendarFilterSettings;
  onFilterChange: (filters: CalendarFilterSettings) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onExportIcs: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => void;
  onResetDefaults: () => void;
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
  onExportIcs,
  onExportBackup,
  onImportBackup,
  onResetDefaults,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>⚙️</span>
            <span>{t.actions.settings}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          
          {/* Islamic Moon Sighting Offset */}
          <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Moon className="w-4 h-4 text-amber-600" />
                <span>{t.hijri.offsetLabel}</span>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                {filters.hijriAdjustmentDays > 0
                  ? `+${filters.hijriAdjustmentDays} Day`
                  : filters.hijriAdjustmentDays < 0
                  ? `${filters.hijriAdjustmentDays} Day`
                  : '0 (Astronomical)'}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed mb-3">
              {t.hijri.offsetHelp}
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {[-2, -1, 0, 1, 2].map((val) => (
                <button
                  key={val}
                  onClick={() => onFilterChange({ ...filters, hijriAdjustmentDays: val })}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filters.hijriAdjustmentDays === val
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Regional Indian State Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>{language === 'en' ? 'Default Indian State for Holidays' : 'अवकाश हेतु डिफ़ॉल्ट भारतीय राज्य'}</span>
            </label>
            <select
              value={filters.selectedState}
              onChange={(e) => onFilterChange({ ...filters, selectedState: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {language === 'en' ? st.nameEn : st.nameHi}
                </option>
              ))}
            </select>
          </div>

          {/* Language & Theme Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Language
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => onLanguageChange('ur')}
                  className={`py-1.5 rounded-lg text-xs font-bold font-serif transition-all ${
                    language === 'ur' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  اردو
                </button>
                <button
                  onClick={() => onLanguageChange('hinglish')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    language === 'hinglish' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                  }`}
                >
                  Hinglish
                </button>
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => onThemeChange('light')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === 'light' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => onThemeChange('dark')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === 'dark' ? 'bg-slate-700 shadow-sm text-amber-400' : 'text-slate-500'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  🌙 Muslim Mode (صرف اسلامی تقویم اور مناسبتیں)
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  {language === 'ur'
                    ? 'ہندو تہوار اور ٹاسک چھپا دیے جاتے ہیں، نماز اور افطار کے اوقات ظاہر ہوتے ہیں'
                    : 'Hides Hindu festivals & tasks; shows daily Namaz prayer times, Roza & Iftar schedule'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={filters.muslimOnlyMode}
                onChange={(e) => onFilterChange({ ...filters, muslimOnlyMode: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Highlight Fridays (Jummah Mubarak)
              </span>
              <input
                type="checkbox"
                checked={filters.highlightFridays}
                onChange={(e) => onFilterChange({ ...filters, highlightFridays: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
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
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Show Tasks & Checklists on Calendar
              </span>
              <input
                type="checkbox"
                checked={filters.showTasksOnCalendar}
                onChange={(e) => onFilterChange({ ...filters, showTasksOnCalendar: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>
          </div>

          {/* Data Export & Backup */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Backup, Sync & Exports
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExportIcs}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileDown className="w-4 h-4 text-indigo-500" />
                <span>Export iCal (.ics)</span>
              </button>

              <button
                onClick={onExportBackup}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
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
                className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4 text-sky-500" />
                <span>Restore JSON</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Reset calendar events and tasks to sample defaults?')) {
                    onResetDefaults();
                  }
                }}
                className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold text-red-600 transition-colors"
                title="Reset to default sample data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
