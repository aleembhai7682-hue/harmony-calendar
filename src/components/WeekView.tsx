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

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Week Header */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
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
          const islamicOccasion = isMuslimMode
            ? getIslamicOccasionForDate(day, filters.hijriAdjustmentDays)
            : null;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(day)}
              className={`p-2 border-r border-slate-200 dark:border-slate-700 text-center cursor-pointer transition-colors ${
                isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                {t.daysShort[idx]}
              </div>
              <div className="flex items-center justify-center gap-1 my-0.5">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    isToday
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
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
                {/* Friday + Holi alert */}
                {(() => {
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
                {dayFestivals.slice(0, 1).map((f) => {
                  const b = getCategoryBadgeStyle(f.category);
                  return (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFestival(f);
                      }}
                      className={`text-[9px] px-1 py-0.5 rounded font-bold ${b.bg} ${b.text} truncate`}
                    >
                      {language === 'ur' ? (f.nameUr || f.nameHi) : f.nameEn}
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

                  // Find events starting in this hour
                  const slotEvents = events.filter((e) => {
                    if (e.startDate !== dateStr) return false;
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
