import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Moon,
  Sun,
  Settings,
  CalendarCheck,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { ViewMode, Language, Theme, HijriDateInfo, CalendarFaithMode } from '../types/calendar';
import { translations } from '../translations/i18n';
import { getDeviceTimezone } from '../utils/istTime';
import { getCityLocation, hasExplicitLocation, formatCityCountryLabel } from '../utils/cities';

interface NavbarProps {
  currentDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (view: ViewMode) => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeToggle: () => void;
  todayHijri: HijriDateInfo;
  calendarMode: CalendarFaithMode;
  onModeChange: (mode: CalendarFaithMode) => void;
  onOpenQuickAdd: () => void;
  onOpenNewEvent: () => void;
  onOpenNewTask: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCity?: string;
  selectedCountry?: string;
  selectedLocationTimezone?: string;
  locationExplicitlyConfirmed?: boolean;
  customLatitude?: number;
  customLongitude?: number;
  customLocationName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  todayHijri,
  calendarMode,
  onModeChange,
  onOpenQuickAdd,
  onOpenNewEvent,
  onOpenNewTask,
  onOpenSettings,
  onOpenShortcuts,
  searchQuery,
  onSearchChange,
  selectedCity,
  selectedCountry,
  selectedLocationTimezone,
  locationExplicitlyConfirmed,
  customLatitude,
  customLongitude,
  customLocationName,
}) => {
  const t = translations[language] || translations['en'];
  const hasLoc = hasExplicitLocation(selectedCity, customLatitude, customLongitude);
  const needsMumbaiConfirm =
    selectedCity?.trim().toLowerCase() === 'mumbai' && locationExplicitlyConfirmed !== true;
  const activeLoc = hasLoc
    ? getCityLocation(
        selectedCity,
        customLatitude,
        customLongitude,
        customLocationName,
        selectedCountry,
        selectedLocationTimezone
      )
    : null;
  const deviceTz = getDeviceTimezone();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const monthName = t.months[currentDate.getMonth()];
  const yearNum = currentDate.getFullYear();

  const views: { id: ViewMode; label: string }[] = [
    { id: 'month', label: t.views.month || 'Month' },
    { id: 'week', label: t.views.week || 'Week' },
    { id: 'day', label: t.views.day || 'Day' },
    { id: 'year', label: t.views.year || 'Year' },
    { id: 'agenda', label: t.views.agenda || 'Agenda' },
  ];

  const modes: {
    id: CalendarFaithMode;
    label: string;
    icon: string;
    colorClasses: string;
    activeBorder: string;
    badge: string;
  }[] = [
    {
      id: 'muslim',
      label: 'Muslim Mode',
      icon: '🌙',
      colorClasses: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400',
      activeBorder: 'border-emerald-500',
      badge: 'Hijri & Namaz',
    },
    {
      id: 'hindu',
      label: 'Hindu Mode',
      icon: '🕉️',
      colorClasses: 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400',
      activeBorder: 'border-amber-500',
      badge: 'Panchang & Gita',
    },
    {
      id: 'christian',
      label: 'Christian Mode',
      icon: '✝️',
      colorClasses: 'bg-[#14284B] text-[#FAF8F3] shadow-sm ring-1 ring-[#C69C44]/50 dark:bg-sky-600 dark:text-white',
      activeBorder: 'border-[#14284B]',
      badge: 'Bible & Sunday',
    },
  ];

  const isChristianMode = calendarMode === 'christian';

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md transition-colors ${
        isChristianMode
          ? 'bg-[#FCFBF8]/92 dark:bg-[#0B1528]/92 border-b border-[#E5DFD2] dark:border-slate-800/80 shadow-[0_2px_12px_rgba(20,40,75,0.04)]'
          : 'bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Top Row */}
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Left Brand & Gregorian Date Controls */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={() => onNavigate('today')}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform ${
                  isChristianMode
                    ? 'bg-gradient-to-tr from-[#14284B] via-[#1E3A6E] to-[#C69C44] shadow-[#14284B]/20'
                    : 'bg-gradient-to-tr from-emerald-600 via-indigo-600 to-amber-500 shadow-indigo-500/20'
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                  <span>Harmony Calendar</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Multi-Faith & Smart Lifestyle
                </div>
              </div>
            </div>

            {/* Previous / Today / Next Navigation buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onNavigate('prev')}
                title="Previous"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('today')}
                className="px-3 py-1 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => onNavigate('next')}
                title="Next"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Current Gregorian Date Title */}
            <div className="flex flex-col min-w-0">
              <h1
                className={`text-base sm:text-lg text-slate-900 dark:text-white leading-tight truncate ${
                  isChristianMode ? 'font-editorial sm:text-xl font-bold tracking-tight text-[#10203B]' : 'font-black'
                }`}
              >
                {monthName} {yearNum}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                <span>{currentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span
                  className={`font-mono-tabular text-[11px] font-bold ${
                    isChristianMode
                      ? 'text-[#8C6418] dark:text-amber-300'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Middle: 3-Faith Safe Mode Switcher (Desktop/Tablet) */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
            {modes.map((m) => {
              const isActive = calendarMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? m.colorClasses
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                  title={`Switch to ${m.label}`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Actions, Search, Theme, Settings */}
          <div className="flex items-center gap-2">
            
            {/* Search Bar */}
            <div className="relative">
              <div className={`flex items-center transition-all ${showSearchInput ? 'w-44 sm:w-56' : 'w-8'}`}>
                {showSearchInput ? (
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder="Search events & tasks..."
                      className="w-full pl-9 pr-7 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setShowSearchInput(false);
                        onSearchChange('');
                      }}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearchInput(true)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title="Search (/)"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={onOpenQuickAdd}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-xs font-semibold transition-colors cursor-pointer"
              title="Quick Add (K)"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Quick Add</span>
            </button>

            {/* New Event Button */}
            <button
              onClick={onOpenNewEvent}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isChristianMode
                  ? 'bg-[#14284B] hover:bg-[#1D396A] dark:bg-sky-600 dark:hover:bg-sky-500'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Event</span>
            </button>

            {/* Add Task Button */}
            <button
              onClick={onOpenNewTask}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Add Task"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden md:inline">Add Task</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Bar: Mode Switcher (on mobile) & Calendar View Tabs (Month, Week, Day, Year, Agenda) */}
        <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto gap-3">
          
          {/* Mode Switcher on Mobile / Smaller Screens */}
          <div className="flex lg:hidden items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            {modes.map((m) => {
              const isActive = calendarMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? m.colorClasses
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span className="hidden sm:inline">{m.label.replace(' Mode', '')}</span>
                </button>
              );
            })}
          </div>

          {/* Calendar View Mode Tabs (Month, Week, Day, Year, Agenda) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 ml-auto">
            {views.map((v) => {
              const active = viewMode === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onViewModeChange(v.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? isChristianMode
                        ? 'bg-white dark:bg-slate-900 text-[#14284B] dark:text-sky-300 shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>

          {/* Active Location & Device Timezone Indicator */}
          <div
            onClick={onOpenSettings}
            title="Click to configure geographical location or preferences in Settings"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                hasLoc && !needsMumbaiConfirm ? 'bg-emerald-500' : 'bg-amber-500'
              } ${isChristianMode ? '' : 'animate-pulse'}`}
            />
            <span>
              {needsMumbaiConfirm
                ? `Confirm location • ${deviceTz.replace(/_/g, ' ')}`
                : activeLoc
                ? `${formatCityCountryLabel(activeLoc)} • ${deviceTz.replace(/_/g, ' ')}`
                : `Location not set • ${deviceTz.replace(/_/g, ' ')}`}
            </span>
          </div>

        </div>

      </div>
    </header>
  );
};
