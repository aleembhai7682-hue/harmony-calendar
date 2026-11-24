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
import { getConfirmedCountryCode } from '../utils/storage';
import { getModeTheme } from '../utils/modeTheme';
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
  const modeTheme = getModeTheme(filters.calendarMode);

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

    // Hindu Panchang info (only in Hindu mode, strictly location confirmed)
    const panchang = isHinduMode
      ? getHinduPanchang(
          cellDate,
          filters.selectedCity,
          filters.customLatitude,
          filters.customLongitude,
          filters.customLocationName,
          undefined,
          filters.selectedCountry,
          filters.selectedLocationTimezone,
          filters.locationExplicitlyConfirmed
        )
      : null;

    const confirmedCountryCode = getConfirmedCountryCode(filters);

    // Festivals & Country Holidays (Strictly segregated by active faith mode)
    let dayFestivals: IndianFestival[] = [];
    if (isMuslimMode) {
      dayFestivals = []; // Strictly NO non-Islamic festivals in Muslim mode
    } else if (isHinduMode || isChristianMode) {
      dayFestivals = getGlobalHolidaysForDate(dateStr, {
        countryCode: confirmedCountryCode,
        state: filters.selectedState,
        enabledCategories: filters.enabledCategories,
        showGazettedOnly: filters.showGazettedOnly,
        calendarMode: filters.calendarMode,
      });
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

    const cellSurfaceClass = !isCurrentMonth
      ? `${modeTheme.cardSubSurface} opacity-65 text-slate-400 dark:text-slate-600`
      : isSelected
      ? modeTheme.selectedCell
      : (isChristianMode && isSunday) ||
        (isMuslimMode && isFriday && filters.highlightFridays) ||
        (isHinduMode && panchang && (panchang.isEkadashi || panchang.isPurnima))
      ? modeTheme.specialDayCell
      : `${modeTheme.cardSurface} hover:brightness-[0.985] dark:hover:brightness-110`;

    return (
      <div
        key={dateStr}
        onClick={() => onSelectDate(cellDate)}
        className={`group relative min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 border-b border-r transition-all flex flex-col justify-between ${modeTheme.gridDivider} ${cellSurfaceClass} ${
          isMuslimMode && isFriday && filters.highlightFridays && isCurrentMonth
            ? modeTheme.specialDayTopBorder
            : isHinduMode && panchang && (panchang.isEkadashi || panchang.isPurnima) && isCurrentMonth
            ? modeTheme.specialDayTopBorder
            : isChristianMode && isSunday && isCurrentMonth
            ? modeTheme.specialDayTopBorder
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
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                    isToday
                      ? modeTheme.todayCircle
                      : isSelected
                      ? 'bg-[#064E3B] dark:bg-emerald-200 text-white dark:text-slate-950'
                      : isCurrentMonth
                      ? 'bg-[#EFF6F2] dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-[#C6DDD1] dark:border-emerald-800'
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
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/40 font-bold">
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
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono-tabular font-bold transition-all ${
                    isToday
                      ? modeTheme.todayCircle
                      : isSelected
                      ? 'bg-[#9A3412] dark:bg-amber-300 text-white dark:text-slate-950'
                      : isCurrentMonth
                      ? 'text-[#3D240B] dark:text-amber-100 font-semibold'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {dayNum}
                </span>
                {panchang.isEkadashi && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/40 font-bold">
                    एकादशी
                  </span>
                )}
              </div>

              <div className="text-[10px] font-bold text-amber-900 dark:text-amber-300 bg-[#FAF1DE] dark:bg-amber-950/70 px-1.5 py-0.5 rounded border border-[#E5D3B0] dark:border-amber-800/50 truncate max-w-[80px]">
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
                      ? modeTheme.todayCircle
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
            className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-md ${modeTheme.cardSurface} shadow-xs border ${modeTheme.cardBorder} ${modeTheme.accentText} hover:scale-110 transition-all z-10 cursor-pointer`}
            title={`${t.actions.addEvent} on ${dateStr}`}
          >
            <Plus className="w-3 h-3" />
          </button>

          {/* Badges / Events Stack */}
          <div className="space-y-1 mt-1 overflow-hidden">
            
            {/* Friday + Holi Coincidence Advisory Badge */}
            {fridayAlert && (
              <div
                className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/75 text-rose-900 dark:text-rose-200 border border-rose-300/80 dark:border-rose-700/70 truncate flex items-center gap-1 shadow-xs"
                title={
                  language === 'ur'
                    ? fridayAlert.warningUr
                    : language === 'hinglish'
                    ? fridayAlert.warningHinglish
                    : fridayAlert.warningEn
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 shrink-0" />
                <span className="truncate">
                  {language === 'ur'
                    ? 'انتباہ: جمعہ + ہولی'
                    : language === 'hinglish'
                    ? 'Alert: Jumma + Holi'
                    : 'Advisory: Jummah + Holi'}
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
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${modeTheme.cardSurface} text-slate-900 dark:text-slate-100 border ${modeTheme.cardBorder} truncate cursor-pointer hover:brightness-97 dark:hover:brightness-110 transition-colors flex items-center gap-1.5`}
                  title={`${formattedStart ? formattedStart + ' ' : ''}${evt.title}${
                    display.isConverted && display.sourceTimeZone
                      ? ` (Originally ${evt.startTime} ${display.sourceTimeZone})`
                      : ''
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        evt.color ||
                        (isChristianMode ? '#1E3A6E' : isMuslimMode ? '#047857' : '#B45309'),
                    }}
                  />
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
            <div
              key={e.id}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  e.color ||
                  (filters.calendarMode === 'muslim'
                    ? '#047857'
                    : filters.calendarMode === 'hindu'
                    ? '#B45309'
                    : '#14284B'),
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const isChristianModeView = filters.calendarMode === 'christian';
  const isHinduModeView = filters.calendarMode === 'hindu';

  return (
    <div
      className={`flex-1 flex flex-col rounded-2xl border overflow-hidden transition-colors shadow-xs ${modeTheme.cardSurface} ${modeTheme.cardBorder}`}
    >
      
      {/* Weekday Names Header */}
      <div
        className={`grid grid-cols-7 border-b ${modeTheme.cardSubSurface} ${modeTheme.cardBorder}`}
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
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : isChristianModeView && isSundayHeader
                  ? 'text-[#1E40AF] dark:text-sky-300'
                  : isHinduModeView && isSundayHeader
                  ? 'text-amber-800 dark:text-amber-300'
                  : isChristianModeView
                  ? 'text-[#14284B]/80 dark:text-slate-300'
                  : 'text-slate-700 dark:text-slate-300'
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
        className={`grid grid-cols-7 flex-1 border-l border-t auto-rows-fr ${modeTheme.gridDivider}`}
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
