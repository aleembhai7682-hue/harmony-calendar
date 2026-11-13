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
import { getFestivalsForDate, getCategoryBadgeStyle } from '../utils/indianFestivals';
import { checkFridayFestivalCoincidence } from '../utils/coincidenceAlert';
import { isEventOnDate, isEventVisibleInMode } from '../utils/eventUtils';
import { getChristianObservancesForDate } from '../utils/christianData';
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

  // Calculate start of week (Sunday)
  const currentDayOfWeek = currentDate.getDay();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

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

  const isChristianModeView = filters.calendarMode === 'christian';

  return (
    <div
      className={`flex-1 flex flex-col rounded-2xl border overflow-hidden transition-colors ${
        isChristianModeView
          ? 'bg-[#FCFBF8] dark:bg-[#0D182D] border-[#E4DDD0] dark:border-slate-800 shadow-[0_8px_28px_-12px_rgba(20,40,75,0.08)]'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
    >
      
      {/* Week Header */}
      <div
        className={`grid grid-cols-[60px_repeat(7,1fr)] border-b sticky top-0 z-20 ${
          isChristianModeView
            ? 'bg-[#F6F3EB]/95 dark:bg-[#101D36]/95 border-[#E4DDD0] dark:border-slate-800'
            : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="p-3 text-center text-xs font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center">
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
          let dayFestivals: IndianFestival[] = [];
          if (isMuslimMode) {
            dayFestivals = [];
          } else if (isHinduMode) {
            dayFestivals = getFestivalsForDate(
              dateStr,
              filters.selectedState,
              filters.enabledCategories,
              filters.showGazettedOnly
            ).filter((f) => f.category === 'hindu' || f.category === 'national');
          } else if (isChristianMode) {
            dayFestivals = getFestivalsForDate(
              dateStr,
              filters.selectedState,
              filters.enabledCategories,
              filters.showGazettedOnly
            ).filter((f) => f.category === 'christian' || f.category === 'national');
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
              className={`p-2 border-r text-center cursor-pointer transition-colors ${
                isChristianMode
                  ? 'border-[#EAE4D7] dark:border-slate-800/80'
                  : 'border-slate-200 dark:border-slate-700'
              } ${
                isSelected
                  ? isChristianMode
                    ? 'bg-[#EAF1FA]/90 dark:bg-sky-950/40'
                    : 'bg-indigo-50/50 dark:bg-indigo-950/40'
                  : isChristianMode && day.getDay() === 0
                  ? 'bg-[#F3F8FE]/70 dark:bg-sky-950/20 hover:bg-[#EAF1FA] dark:hover:bg-sky-950/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div
                className={`text-[11px] font-bold uppercase ${
                  isChristianMode && day.getDay() === 0
                    ? 'text-[#1E40AF] dark:text-sky-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isMuslimMode && language === 'hinglish' && idx === 5 ? 'Juma' : t.daysShort[idx]}
              </div>
              <div className="flex items-center justify-center gap-1 my-0.5">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-mono-tabular font-bold ${
                    isToday
                      ? isChristianMode
                        ? 'bg-[#14284B] dark:bg-sky-500 text-white shadow-xs ring-2 ring-[#C69C44]/50'
                        : 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              
              {/* Hijri day (Muslim Mode only) */}
              {isMuslimMode && hijri && filters.showHijri && (
                <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                  {hijri.day} {language === 'ur' ? (hijri.monthNameUr || hijri.monthNameEn) : language === 'hinglish' ? hijri.monthNameEn : hijri.monthNameEn}
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
                      className="text-[9px] px-1 py-0.5 rounded font-extrabold bg-red-600 text-white shadow-sm animate-pulse truncate flex items-center justify-center gap-0.5"
                      title={language === 'ur' ? alert.warningUr : language === 'hinglish' ? alert.warningHinglish : alert.warningEn}
                    >
                      <span>🚨</span>
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
            const timeLabel = `${String(hour).padStart(2, '0')}:00`;

            return (
              <React.Fragment key={hour}>
                {/* Time label */}
                <div className="p-2 text-right text-[11px] font-semibold text-slate-400 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 select-none">
                  {timeLabel}
                </div>

                {/* Day hour cells */}
                {weekDays.map((day) => {
                  const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(
                    day.getDate()
                  ).padStart(2, '0')}`;

                  // Find events starting in this hour (supporting recurrence & mode filtering)
                  const slotEvents = events.filter((e) => {
                    if (!isEventVisibleInMode(e, filters.calendarMode)) return false;
                    if (!isEventOnDate(e, dateStr)) return false;
                    if (!e.startTime) return false;
                    const eventHour = parseInt(e.startTime.split(':')[0], 10);
                    return eventHour === hour;
                  });

                  return (
                    <div
                      key={`${dateStr}-${hour}`}
                      onClick={() => onOpenCreateEventOnDateAndTime(dateStr, timeLabel)}
                      className="group relative min-h-[52px] p-1 border-b border-r border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      {/* Plus icon on hover */}
                      <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 text-indigo-500">
                        <Plus className="w-3.5 h-3.5" />
                      </div>

                      {/* Events in slot */}
                      {slotEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(evt);
                          }}
                          className="p-1 rounded-md text-[10px] font-semibold bg-indigo-600 text-white shadow-sm truncate hover:scale-[1.02] transition-transform"
                          style={{ backgroundColor: evt.color || '#4f46e5' }}
                        >
                          <span className="font-bold mr-1">{evt.startTime}</span>
                          <span>{evt.title}</span>
                        </div>
                      ))}
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
