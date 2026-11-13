import React from 'react';
import {
  CalendarEvent,
  CalendarTask,
  CalendarFilterSettings,
  Language,
  IndianFestival,
  IslamicOccasion,
} from '../types/calendar';
import { translations } from '../translations/i18n';
import { getHijriDate, getIslamicOccasionForDate, getMoonPhase } from '../utils/hijri';
import { getCategoryBadgeStyle } from '../utils/indianFestivals';
import { getGlobalHolidaysForDate } from '../utils/globalHolidays';
import { getHinduPanchang } from '../utils/panchang';
import { checkFridayFestivalCoincidence } from '../utils/coincidenceAlert';
import { isTaskVisibleInMode } from '../utils/taskFilter';
import { getEventsForDateAndMode } from '../utils/eventUtils';
import { getChristianObservancesForDate } from '../utils/christianData';
import {
  getLocaleTag,
  resolveWeekStartDay,
  getWeekdayOrder,
  formatTimePreference,
} from '../utils/localization';
import { getEffectiveCalendarTimezone, getEventDisplayInTimezone } from '../utils/timezoneService';
import { Plus, CheckCircle2 } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  onSelectDate: (d: Date) => void;
  events: CalendarEvent[];
  tasks: CalendarTask[];
  filters: CalendarFilterSettings;
  language: Language;
  onOpenCreateEventOnDate: (dateStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectFestival: (festival: IndianFestival) => void;
  onSelectIslamic: (occasion: IslamicOccasion) => void;
  onToggleTask: (taskId: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  onSelectDate,
  events,
  tasks,
  filters,
  language,
  onOpenCreateEventOnDate,
  onSelectEvent,
  onSelectFestival,
  onSelectIslamic,
  onToggleTask,
}) => {
  const t = translations[language];
  const locale = getLocaleTag(language, filters.selectedCountryCode);
  const effectiveTz = getEffectiveCalendarTimezone(filters);
  const weekStartDay = resolveWeekStartDay(filters.weekStartDay, filters.selectedCountryCode);
  const weekdayOrder = getWeekdayOrder(weekStartDay);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = (firstDayOfMonth.getDay() - weekStartDay + 7) % 7;
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const trailingDaysCount = startingDayOfWeek;

  // Next month leading days to complete full 35 or 42 grid cells
  const totalCells = Math.ceil((startingDayOfWeek + totalDaysInMonth) / 7) * 7;
  const leadingDaysCount = totalCells - (startingDayOfWeek + totalDaysInMonth);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const renderDayCell = (
    cellYear: number,
    cellMonth: number,
    dayNum: number,
    isCurrentMonth: boolean
  ) => {
    const cellDate = new Date(cellYear, cellMonth, dayNum);
    const dateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isSelected =
      cellDate.getDate() === currentDate.getDate() &&
      cellDate.getMonth() === currentDate.getMonth() &&
      cellDate.getFullYear() === currentDate.getFullYear();

    const isFriday = cellDate.getDay() === 5;
    const isSunday = cellDate.getDay() === 0;

    const isMuslimMode = filters.calendarMode === 'muslim';
    const isHinduMode = filters.calendarMode === 'hindu';
    const isChristianMode = filters.calendarMode === 'christian';

    // Hijri info (only in Muslim mode)
    const hijri = isMuslimMode ? getHijriDate(cellDate, filters.hijriAdjustmentDays) : null;
    const islamicOccasion = isMuslimMode
      ? getIslamicOccasionForDate(cellDate, filters.hijriAdjustmentDays)
      : null;
    const moon = isMuslimMode && filters.showMoonPhases ? getMoonPhase(cellDate) : null;
    const fridayAlert = isMuslimMode ? checkFridayFestivalCoincidence(cellDate) : null;

    // Hindu Panchang info (only in Hindu mode, location calibrated)
    const panchang = isHinduMode
      ? getHinduPanchang(
          cellDate,
          filters.selectedCity,
          filters.customLatitude,
          filters.customLongitude,
          filters.customLocationName,
          undefined,
          filters.selectedCountry,
          filters.selectedLocationTimezone
        )
      : null;

    // Festivals & Country Holidays (Strictly segregated by active faith mode)
    let dayFestivals: IndianFestival[] = [];
    if (isMuslimMode) {
      dayFestivals = []; // Strictly NO non-Islamic festivals in Muslim mode
    } else if (isHinduMode) {
      dayFestivals = getGlobalHolidaysForDate(dateStr, {
        countryCode: filters.selectedCountryCode,
        state: filters.selectedState,
        enabledCategories: filters.enabledCategories,
        showGazettedOnly: filters.showGazettedOnly,
      }).filter((f) => f.category === 'hindu' || f.category === 'national');
    } else if (isChristianMode) {
      dayFestivals = getGlobalHolidaysForDate(dateStr, {
        countryCode: filters.selectedCountryCode,
        state: filters.selectedState,
        enabledCategories: filters.enabledCategories,
        showGazettedOnly: filters.showGazettedOnly,
      }).filter((f) => f.category === 'christian' || f.category === 'national');
    }

    const christianObservances = isChristianMode
      ? getChristianObservancesForDate(cellDate).filter(
          (obs) => !dayFestivals.some((f) => f.nameEn.toLowerCase() === obs.name.toLowerCase())
        )
      : [];

    // User Events for this day (supporting recurring events, mode tags, and timezone conversion)
    const dayEvents = getEventsForDateAndMode(events, dateStr, filters.calendarMode, effectiveTz);

    // User Tasks for this day (Strictly filtered by active mode)
    const dayTasks = tasks.filter(
      (task) => task.dueDate === dateStr && isTaskVisibleInMode(task, filters.calendarMode)
    );

    const cellSurfaceClass = isChristianMode
      ? !isCurrentMonth
        ? 'bg-[#F6F3EC]/60 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600'
        : isSelected
        ? 'bg-[#EDF3FC] dark:bg-sky-950/35 ring-1 ring-inset ring-[#1E3A6E]/25 dark:ring-sky-500/30'
        : isSunday
        ? 'bg-[#F4F8FE]/80 dark:bg-sky-950/15 hover:bg-[#EBF2FC] dark:hover:bg-sky-950/25'
        : 'bg-[#FCFBF8] dark:bg-[#0D182D] hover:bg-[#F5F1E8]/80 dark:hover:bg-slate-800/60'
      : !isCurrentMonth
      ? 'bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600'
      : isSelected
      ? 'bg-indigo-50/30 dark:bg-indigo-950/20'
      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60';

    return (
      <div
        key={dateStr}
        onClick={() => onSelectDate(cellDate)}
        className={`group relative min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 border-b border-r transition-all flex flex-col justify-between ${
          isChristianMode
            ? 'border-[#EAE4D7] dark:border-slate-800/80'
            : 'border-slate-200 dark:border-slate-800'
        } ${cellSurfaceClass} ${
          isMuslimMode && isFriday && filters.highlightFridays && isCurrentMonth
            ? 'border-t-2 border-t-emerald-500 shadow-xs'
            : isHinduMode && panchang && (panchang.isEkadashi || panchang.isPurnima) && isCurrentMonth
            ? 'border-t-2 border-t-amber-500 shadow-xs'
            : isChristianMode && isSunday && isCurrentMonth
            ? 'border-t-2 border-t-[#C69C44]/70 dark:border-t-sky-500/70'
            : ''
        }`}
      >
        {/* Top header inside cell */}
        <div>
          {/* 1. Muslim Mode Header */}
          {isMuslimMode && hijri ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                    isToday
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 dark:ring-emerald-600'
                      : isSelected
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                      : isCurrentMonth
                      ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {hijri.day}
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 leading-tight">
                    {language === 'en' ? hijri.monthNameEn : hijri.monthNameHi}
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold leading-none">
                    Greg: {dayNum}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isFriday && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold">
                    جمعہ
                  </span>
                )}
                {moon && (
                  <span title={moon.nameEn} className="text-xs">
                    {moon.icon}
                  </span>
                )}
              </div>
            </div>
          ) : isHinduMode && panchang ? (
            /* 2. Hindu Mode Header */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isToday
                      ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300 dark:ring-amber-700'
                      : isSelected
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                      : isCurrentMonth
                      ? 'text-slate-800 dark:text-slate-200 font-semibold'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {dayNum}
                </span>
                {panchang.isEkadashi && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                    एकादशी
                  </span>
                )}
              </div>

              <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-900/40 truncate max-w-[80px]">
                {panchang.tithiNameHi.split(' ')[0]}
              </div>
            </div>
          ) : (
            /* 3. Christian Mode Header */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono-tabular font-bold transition-all ${
                    isToday
                      ? 'bg-[#14284B] dark:bg-sky-500 text-white shadow-xs ring-2 ring-[#C69C44]/50'
                      : isSelected
                      ? 'bg-[#254A8A] dark:bg-sky-300 text-white dark:text-slate-950'
                      : isCurrentMonth
                      ? 'text-[#13223D] dark:text-slate-200 font-semibold'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {dayNum}
                </span>
                {isSunday && isCurrentMonth && (
                  <span className="text-[10px] font-semibold text-[#1E40AF] dark:text-sky-300">
                    Sunday
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {cellDate.toLocaleDateString(locale, { weekday: 'short' })}
              </span>
            </div>
          )}

          {/* Quick Add button on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCreateEventOnDate(dateStr);
            }}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-white dark:bg-slate-800 shadow border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-all z-10"
            title={`${t.actions.addEvent} on ${dateStr}`}
          >
            <Plus className="w-3 h-3" />
          </button>

          {/* Badges / Events Stack */}
          <div className="space-y-1 mt-1 overflow-hidden">
            
            {/* 🚨 Friday + Holi Coincidence Red Alert Badge */}
            {fridayAlert && (
              <div
                className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800 truncate flex items-center gap-1 shadow-sm animate-pulse"
                title={
                  language === 'ur'
                    ? fridayAlert.warningUr
                    : language === 'hinglish'
                    ? fridayAlert.warningHinglish
                    : fridayAlert.warningEn
                }
              >
                <span>🚨</span>
                <span className="truncate">
                  {language === 'ur'
                    ? 'انتباہ: جمعہ + ہولی'
                    : language === 'hinglish'
                    ? 'Alert: Jumma + Holi'
                    : 'Alert: Jummah + Holi'}
                </span>
              </div>
            )}

            {/* Islamic Occasion highlight */}
            {islamicOccasion && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectIslamic(islamicOccasion);
                }}
                className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 truncate cursor-pointer hover:brightness-95 transition-all flex items-center gap-1"
                title={islamicOccasion.nameEn}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span className="truncate">
                  {language === 'ur'
                    ? (islamicOccasion.nameUr || islamicOccasion.nameEn)
                    : language === 'hinglish'
                    ? (islamicOccasion.nameUr ? `${islamicOccasion.nameEn} (${islamicOccasion.nameUr})` : islamicOccasion.nameEn)
                    : islamicOccasion.nameEn}
                </span>
              </div>
            )}

            {/* Christian Liturgical Observances */}
            {christianObservances.slice(0, 1).map((obs) => (
              <div
                key={obs.id}
                className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#FBF4E4] dark:bg-amber-950/40 text-[#7A5410] dark:text-amber-200 border border-[#E9D7AD] dark:border-amber-700/50 truncate flex items-center gap-1"
                title={`${obs.name} (${obs.season}) — ${obs.description}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C69C44] flex-shrink-0" />
                <span className="truncate">{obs.name}</span>
              </div>
            ))}

            {/* Indian Festivals */}
            {dayFestivals.slice(0, 2).map((fest) => {
              const badge = getCategoryBadgeStyle(fest.category);
              return (
                <div
                  key={fest.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFestival(fest);
                  }}
                  className={
                    isChristianMode
                      ? 'px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#EDF3FC] dark:bg-sky-950/60 text-[#14284B] dark:text-sky-200 border border-[#D1DFF2] dark:border-sky-800/60 truncate cursor-pointer hover:bg-[#E2ECFA] dark:hover:bg-sky-900/60 transition-colors flex items-center gap-1'
                      : `px-1.5 py-0.5 rounded-md text-[10px] font-bold ${badge.bg} ${badge.text} border ${badge.border} truncate cursor-pointer hover:brightness-95 transition-all flex items-center gap-1`
                  }
                  title={`${fest.nameEn} - ${fest.significance}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: isChristianMode
                        ? fest.category === 'christian'
                          ? '#C69C44'
                          : '#1E3A6E'
                        : badge.dotColor,
                    }}
                  />
                  <span className="truncate">
                    {isChristianMode
                      ? fest.nameEn
                      : isHinduMode
                      ? (fest.nameHi || fest.nameEn)
                      : language === 'ur'
                      ? (fest.nameUr || fest.nameEn)
                      : fest.nameEn}
                  </span>
                </div>
              );
            })}

            {/* User Events */}
            {dayEvents.slice(0, 2).map((evt) => {
              const display = getEventDisplayInTimezone(evt, effectiveTz);
              const formattedStart =
                display.startTime && !evt.allDay
                  ? formatTimePreference(display.startTime, filters.timeFormat, filters.selectedCountryCode)
                  : '';
              return (
                <div
                  key={evt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent(evt);
                  }}
                  className={
                    isChristianMode
                      ? 'px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-slate-800/90 text-[#14284B] dark:text-slate-100 border border-[#DFD8CA] dark:border-slate-700 truncate cursor-pointer hover:border-[#1E3A6E]/50 dark:hover:border-sky-500/60 transition-colors flex items-center gap-1.5'
                      : 'px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 truncate cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1'
                  }
                  style={
                    isChristianMode
                      ? undefined
                      : {
                          borderLeftColor: evt.color || '#4f46e5',
                          borderLeftWidth: '3px',
                        }
                  }
                  title={`${formattedStart ? formattedStart + ' ' : ''}${evt.title}${
                    display.isConverted && display.sourceTimeZone
                      ? ` (Originally ${evt.startTime} ${display.sourceTimeZone})`
                      : ''
                  }`}
                >
                  {isChristianMode && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: evt.color || '#1E3A6E' }}
                    />
                  )}
                  {formattedStart && (
                    <span className="text-[9px] font-mono-tabular opacity-75">{formattedStart}</span>
                  )}
                  <span className="truncate">{evt.title}</span>
                </div>
              );
            })}

            {/* Tasks preview indicator */}
            {filters.showTasksOnCalendar && dayTasks.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium px-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                <span>
                  {dayTasks.filter((t) => t.completed).length}/{dayTasks.length} {t.views.day} tasks
                </span>
              </div>
            )}

            {/* More count if day is packed */}
            {dayFestivals.length + dayEvents.length > 3 && (
              <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 px-1 hover:underline cursor-pointer">
                +{dayFestivals.length + dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>

        {/* Small bottom dot row for mobile compactness */}
        <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/60 sm:hidden">
          {islamicOccasion && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          {dayFestivals.map((f) => (
            <div
              key={f.id}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: getCategoryBadgeStyle(f.category).dotColor }}
            />
          ))}
          {dayEvents.map((e) => (
            <div key={e.id} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          ))}
        </div>
      </div>
    );
  };

  const isChristianModeView = filters.calendarMode === 'christian';

  return (
    <div
      className={`flex-1 flex flex-col rounded-2xl border overflow-hidden transition-colors ${
        isChristianModeView
          ? 'bg-[#FCFBF8] dark:bg-[#0D182D] border-[#E4DDD0] dark:border-slate-800 shadow-[0_8px_28px_-12px_rgba(20,40,75,0.08)]'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
    >
      
      {/* Weekday Names Header */}
      <div
        className={`grid grid-cols-7 border-b ${
          isChristianModeView
            ? 'bg-[#F6F3EB] dark:bg-[#101D36] border-[#E4DDD0] dark:border-slate-800'
            : 'bg-slate-100/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
        }`}
      >
        {weekdayOrder.map((dow) => {
          const day = t.days[dow];
          const isFriday = dow === 5;
          const isSundayHeader = dow === 0;
          const isMuslimHinglishFriday =
            isFriday && filters.calendarMode === 'muslim' && language === 'hinglish';
          const desktopLabel = isMuslimHinglishFriday ? 'Jumma Mubarak' : day;
          const mobileLabel = isMuslimHinglishFriday ? 'Juma' : t.daysShort[dow];
          return (
            <div
              key={`${dow}-${day}`}
              className={`py-2.5 text-center text-xs font-bold uppercase tracking-wider ${
                isFriday && filters.highlightFridays && filters.calendarMode === 'muslim'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : isChristianModeView && isSundayHeader
                  ? 'text-[#1E40AF] dark:text-sky-300'
                  : isChristianModeView
                  ? 'text-[#14284B]/80 dark:text-slate-300'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="hidden sm:inline">{desktopLabel}</span>
              <span className="sm:hidden">{mobileLabel}</span>
            </div>
          );
        })}
      </div>

      {/* 7-column Calendar Grid */}
      <div
        className={`grid grid-cols-7 flex-1 border-l border-t auto-rows-fr ${
          isChristianModeView
            ? 'border-[#EAE4D7] dark:border-slate-800/80'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Trailing days from previous month */}
        {Array.from({ length: trailingDaysCount }).map((_, i) => {
          const d = prevMonthLastDay - trailingDaysCount + i + 1;
          const prevMonthIndex = month === 0 ? 11 : month - 1;
          const prevYear = month === 0 ? year - 1 : year;
          return renderDayCell(prevYear, prevMonthIndex, d, false);
        })}

        {/* Days of current month */}
        {Array.from({ length: totalDaysInMonth }).map((_, i) => {
          return renderDayCell(year, month, i + 1, true);
        })}

        {/* Leading days into next month */}
        {Array.from({ length: leadingDaysCount }).map((_, i) => {
          const nextMonthIndex = month === 11 ? 0 : month + 1;
          const nextYear = month === 11 ? year + 1 : year;
          return renderDayCell(nextYear, nextMonthIndex, i + 1, false);
        })}
      </div>
    </div>
  );
};
