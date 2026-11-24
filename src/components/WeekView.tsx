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
import { getHijriDate, getIslamicOccasionForDate } from '../utils/hijri';
import { getCategoryBadgeStyle } from '../utils/indianFestivals';
import { getGlobalHolidaysForDate } from '../utils/globalHolidays';
import { checkFridayFestivalCoincidence } from '../utils/coincidenceAlert';
import { isEventOnDate, isEventVisibleInMode } from '../utils/eventUtils';
import { getChristianObservancesForDate } from '../utils/christianData';
import { resolveWeekStartDay, formatTimePreference } from '../utils/localization';
import { getEffectiveCalendarTimezone, getEventDisplayInTimezone } from '../utils/timezoneService';
import { getConfirmedCountryCode } from '../utils/storage';
import { getModeTheme } from '../utils/modeTheme';
import { Clock, Plus } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  onSelectDate: (d: Date) => void;
  events: CalendarEvent[];
  tasks: CalendarTask[];
  filters: CalendarFilterSettings;
  language: Language;
  onOpenCreateEventOnDateAndTime: (dateStr: string, timeStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectFestival: (festival: IndianFestival) => void;
  onSelectIslamic: (occasion: IslamicOccasion) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  onSelectDate,
  events,
  filters,
  language,
  onOpenCreateEventOnDateAndTime,
  onSelectEvent,
  onSelectFestival,
  onSelectIslamic,
}) => {
  const t = translations[language];
  const effectiveTz = getEffectiveCalendarTimezone(filters);
  const weekStartDay = resolveWeekStartDay(filters.weekStartDay, filters.selectedCountryCode);

  // Calculate start of week respecting user/country weekStartDay preference
  const currentDayOfWeek = currentDate.getDay();
  const offsetFromStart = (currentDayOfWeek - weekStartDay + 7) % 7;
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - offsetFromStart);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 18 }).map((_, i) => i + 6); // 6:00 AM to 11:00 PM

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const modeTheme = getModeTheme(filters.calendarMode);

  return (
    <div
      className={`flex-1 flex flex-col rounded-2xl border overflow-hidden transition-colors shadow-xs ${modeTheme.cardSurface} ${modeTheme.cardBorder}`}
    >
      
      {/* Week Header */}
      <div
        className={`grid grid-cols-[60px_repeat(7,1fr)] border-b sticky top-0 z-20 ${modeTheme.cardSubSurface} ${modeTheme.cardBorder}`}
      >
        <div className={`p-3 text-center text-xs font-bold text-slate-400 border-r ${modeTheme.gridDivider} flex items-center justify-center`}>
          <Clock className="w-4 h-4" />
        </div>
        {weekDays.map((day, idx) => {
          const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(
            day.getDate()
          ).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isSelected =
            day.getDate() === currentDate.getDate() &&
            day.getMonth() === currentDate.getMonth() &&
            day.getFullYear() === currentDate.getFullYear();

          const isMuslimMode = filters.calendarMode === 'muslim';
          const isHinduMode = filters.calendarMode === 'hindu';
          const isChristianMode = filters.calendarMode === 'christian';

          const hijri = isMuslimMode ? getHijriDate(day, filters.hijriAdjustmentDays) : null;
          const confirmedCountryCode = getConfirmedCountryCode(filters);
          let dayFestivals: IndianFestival[] = [];
          if (isMuslimMode) {
            dayFestivals = [];
          } else if (isHinduMode || isChristianMode) {
            dayFestivals = getGlobalHolidaysForDate(dateStr, {
              countryCode: confirmedCountryCode,
              state: filters.selectedState,
              enabledCategories: filters.enabledCategories,
              showGazettedOnly: filters.showGazettedOnly,
              calendarMode: filters.calendarMode,
            });
          }
          const christianObs = isChristianMode
            ? getChristianObservancesForDate(day).filter(
                (obs) => !dayFestivals.some((f) => f.nameEn.toLowerCase() === obs.name.toLowerCase())
              )
            : [];
          const islamicOccasion = isMuslimMode
            ? getIslamicOccasionForDate(day, filters.hijriAdjustmentDays)
            : null;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(day)}
              className={`p-2 border-r text-center cursor-pointer transition-colors ${modeTheme.gridDivider} ${
                isSelected
                  ? modeTheme.selectedCell
                  : isChristianMode && day.getDay() === 0
                  ? modeTheme.specialDayCell
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div
                className={`text-[11px] font-bold uppercase ${
                  isChristianMode && day.getDay() === 0
                    ? 'text-[#1E40AF] dark:text-sky-300'
                    : isMuslimMode && day.getDay() === 5 && filters.highlightFridays
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : isHinduMode && day.getDay() === 0
                    ? 'text-amber-800 dark:text-amber-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isMuslimMode && language === 'hinglish' && day.getDay() === 5
                  ? 'Juma'
                  : t.daysShort[day.getDay()]}
              </div>
              <div className="flex items-center justify-center gap-1 my-0.5">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-mono-tabular font-bold ${
                    isToday
                      ? modeTheme.todayCircle
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              
              {/* Hijri day (Muslim Mode only) */}
              {isMuslimMode && hijri && filters.showHijri && (
                <div className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 truncate">
                  {hijri.day} {language === 'ur' ? (hijri.monthNameUr || hijri.monthNameEn) : hijri.monthNameEn}
                </div>
              )}

              {/* Day Festivals / Occasions in header */}
              <div className="mt-1 space-y-1">
                {/* Friday + Holi alert (Muslim Mode only) */}
                {(() => {
                  if (!isMuslimMode) return null;
                  const alert = checkFridayFestivalCoincidence(day);
                  if (!alert) return null;
                  return (
                    <div
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-300/80 dark:border-rose-700/70 shadow-xs truncate flex items-center justify-center gap-1"
                      title={language === 'ur' ? alert.warningUr : language === 'hinglish' ? alert.warningHinglish : alert.warningEn}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 shrink-0" />
                      <span>{language === 'ur' ? 'جمعہ+ہولی' : 'Jumma+Holi'}</span>
                    </div>
                  );
                })()}

                {islamicOccasion && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIslamic(islamicOccasion);
                    }}
                    className="text-[9px] px-1 py-0.5 rounded font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 truncate"
                  >
                    {language === 'ur' ? (islamicOccasion.nameUr || islamicOccasion.nameEn) : islamicOccasion.nameEn}
                  </div>
                )}
                {christianObs.slice(0, 1).map((obs) => (
                  <div
                    key={obs.id}
                    className="text-[9px] px-1 py-0.5 rounded font-semibold bg-[#FBF4E4] dark:bg-amber-950/50 text-[#7A5410] dark:text-amber-200 truncate"
                    title={obs.name}
                  >
                    {obs.name}
                  </div>
                ))}
                {dayFestivals.slice(0, 1).map((f) => {
                  const b = getCategoryBadgeStyle(f.category);
                  return (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFestival(f);
                      }}
                      className={
                        isChristianMode
                          ? 'text-[9px] px-1 py-0.5 rounded font-semibold bg-[#EDF3FC] dark:bg-sky-950/60 text-[#14284B] dark:text-sky-200 truncate'
                          : `text-[9px] px-1 py-0.5 rounded font-bold ${b.bg} ${b.text} truncate`
                      }
                    >
                      {isChristianMode ? f.nameEn : language === 'ur' ? (f.nameUr || f.nameHi) : f.nameEn}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Grid */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-230px)]">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {hours.map((hour) => {
            const timeLabelRaw = `${String(hour).padStart(2, '0')}:00`;
            const timeLabelDisplay = formatTimePreference(
              timeLabelRaw,
              filters.timeFormat,
              filters.selectedCountryCode
            );

            return (
              <React.Fragment key={hour}>
                {/* Time label */}
                <div className={`p-2 text-right text-[11px] font-mono-tabular font-semibold text-slate-400 border-b border-r ${modeTheme.gridDivider} ${modeTheme.cardSubSurface} select-none`}>
                  {timeLabelDisplay}
                </div>

                {/* Day hour cells */}
                {weekDays.map((day) => {
                  const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(
                    day.getDate()
                  ).padStart(2, '0')}`;

                  // Find events starting in this hour (supporting recurrence, mode filtering, & timezone conversion)
                  const slotEvents = events.filter((e) => {
                    if (!isEventVisibleInMode(e, filters.calendarMode)) return false;
                    if (!isEventOnDate(e, dateStr, effectiveTz)) return false;
                    const display = getEventDisplayInTimezone(e, effectiveTz);
                    if (!display.startTime) return false;
                    const eventHour = parseInt(display.startTime.split(':')[0], 10);
                    return eventHour === hour;
                  });

                  return (
                    <div
                      key={`${dateStr}-${hour}`}
                      onClick={() => onOpenCreateEventOnDateAndTime(dateStr, timeLabelRaw)}
                      className={`group relative min-h-[52px] p-1 border-b border-r ${modeTheme.gridDivider} hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer transition-colors`}
                    >
                      {/* Plus icon on hover */}
                      <div className={`absolute right-1 top-1 opacity-0 group-hover:opacity-100 ${modeTheme.accentText}`}>
                        <Plus className="w-3.5 h-3.5" />
                      </div>

                      {/* Events in slot */}
                      {slotEvents.map((evt) => {
                        const display = getEventDisplayInTimezone(evt, effectiveTz);
                        const timeTxt = display.startTime
                          ? formatTimePreference(
                              display.startTime,
                              filters.timeFormat,
                              filters.selectedCountryCode
                            )
                          : '';
                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEvent(evt);
                            }}
                            className="p-1 rounded-md text-[10px] font-semibold text-white shadow-sm truncate hover:scale-[1.02] transition-transform"
                            style={{
                              backgroundColor:
                                evt.color ||
                                (filters.calendarMode === 'muslim'
                                  ? '#047857'
                                  : filters.calendarMode === 'hindu'
                                  ? '#B45309'
                                  : '#14284B'),
                            }}
                            title={
                              display.isConverted && display.sourceTimeZone
                                ? `${evt.title} (Scheduled ${evt.startTime} in ${display.sourceTimeZone})`
                                : evt.title
                            }
                          >
                            <span className="font-bold mr-1">{timeTxt}</span>
                            <span>{evt.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

    </div>
  );
};
