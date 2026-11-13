import React, { useState } from 'react';
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
import { getFestivalsForDate, getCategoryBadgeStyle } from '../utils/indianFestivals';
import { checkFridayFestivalCoincidence } from '../utils/coincidenceAlert';
import { isTaskVisibleInMode } from '../utils/taskFilter';
import { getHinduPanchang } from '../utils/panchang';
import { getEventsForDateAndMode } from '../utils/eventUtils';
import { getChristianObservancesForDate, getLiturgicalSeason } from '../utils/christianData';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  MapPin,
  Clock,
  Sparkles,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';

interface AgendaViewProps {
  currentDate: Date;
  onSelectDate: (d: Date) => void;
  events: CalendarEvent[];
  tasks: CalendarTask[];
  filters: CalendarFilterSettings;
  language: Language;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectFestival: (festival: IndianFestival) => void;
  onSelectIslamic: (occasion: IslamicOccasion) => void;
  onToggleTask: (taskId: string) => void;
  searchQuery?: string;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  currentDate,
  onSelectDate,
  events,
  tasks,
  filters,
  language,
  onSelectEvent,
  onSelectFestival,
  onSelectIslamic,
  onToggleTask,
  searchQuery = '',
}) => {
  const t = translations[language];
  const [filterType, setFilterType] = useState<'all' | 'festivals' | 'islamic' | 'events' | 'tasks'>('all');

  // Generate 45 days starting from the selected date (or start of month)
  const daysList: Date[] = [];
  const baseDate = new Date(currentDate);

  for (let i = 0; i < 45; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    daysList.push(d);
  }

  const query = searchQuery.toLowerCase().trim();
  const isChristianModeView = filters.calendarMode === 'christian';

  return (
    <div
      className={`flex-1 flex flex-col rounded-2xl border overflow-hidden transition-colors ${
        isChristianModeView
          ? 'bg-[#FCFBF8] dark:bg-[#0D182D] border-[#E4DDD0] dark:border-slate-800 shadow-[0_8px_28px_-12px_rgba(20,40,75,0.08)]'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
    >
      
      {/* Top Filter Chips */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isChristianModeView
            ? 'bg-[#F6F3EB]/80 dark:bg-[#101D36]/80 border-[#E4DDD0] dark:border-slate-800'
            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
        }`}
      >
        <div className="flex items-center gap-2 overflow-x-auto">
          {(
            filters.calendarMode === 'christian'
              ? [
                  { id: 'all', label: 'All Items' },
                  { id: 'festivals', label: 'Christian Feasts & Holidays' },
                  { id: 'events', label: 'My Events' },
                  { id: 'tasks', label: 'My Tasks' },
                ]
              : filters.calendarMode === 'hindu'
              ? [
                  { id: 'all', label: 'सभी (All Items)' },
                  { id: 'festivals', label: 'पर्व एवं त्यौहार' },
                  { id: 'events', label: 'मेरे कार्यक्रम' },
                  { id: 'tasks', label: 'मेरे कार्य' },
                ]
              : [
                  { id: 'all', label: language === 'ur' ? 'سبھی آئٹمز' : 'All Items' },
                  { id: 'islamic', label: language === 'ur' ? 'اسلامی مناسبات' : 'Islamic Occasions' },
                  { id: 'events', label: language === 'ur' ? 'میرے ایونٹس' : 'My Events' },
                  { id: 'tasks', label: language === 'ur' ? 'میرے ٹاسکس' : 'My Tasks' },
                ]
          ).map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterType(chip.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === chip.id
                  ? isChristianModeView
                    ? 'bg-[#14284B] dark:bg-sky-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing next 45 days
        </div>
      </div>

      {/* Agenda Chronological Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {daysList.map((dayObj) => {
          const year = dayObj.getFullYear();
          const month = dayObj.getMonth();
          const dayNum = dayObj.getDate();
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const dayOfWeekIndex = dayObj.getDay();

          const hijri = getHijriDate(dayObj, filters.hijriAdjustmentDays);
          const moon = getMoonPhase(dayObj);

          const isMuslimMode = filters.calendarMode === 'muslim';
          const isHinduMode = filters.calendarMode === 'hindu';
          const isChristianMode = filters.calendarMode === 'christian';

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

          let christianObs = isChristianMode
            ? getChristianObservancesForDate(dayObj).filter(
                (obs) => !dayFestivals.some((f) => f.nameEn.toLowerCase() === obs.name.toLowerCase())
              )
            : [];

          let islamicOccasion = isMuslimMode
            ? getIslamicOccasionForDate(dayObj, filters.hijriAdjustmentDays)
            : null;

          let dayEvents = getEventsForDateAndMode(events, dateStr, filters.calendarMode);

          let dayTasks = tasks.filter(
            (t) => t.dueDate === dateStr && isTaskVisibleInMode(t, filters.calendarMode)
          );

          // Apply search query filter if present
          if (query) {
            dayFestivals = dayFestivals.filter(
              (f) =>
                f.nameEn.toLowerCase().includes(query) ||
                f.nameHi.includes(query) ||
                f.descriptionEn.toLowerCase().includes(query)
            );
            christianObs = christianObs.filter(
              (o) =>
                o.name.toLowerCase().includes(query) ||
                o.description.toLowerCase().includes(query) ||
                o.season.toLowerCase().includes(query)
            );
            if (
              islamicOccasion &&
              !islamicOccasion.nameEn.toLowerCase().includes(query) &&
              !islamicOccasion.nameHi.includes(query) &&
              !islamicOccasion.descriptionEn.toLowerCase().includes(query)
            ) {
              islamicOccasion = null;
            }
            dayEvents = dayEvents.filter(
              (e) =>
                e.title.toLowerCase().includes(query) ||
                (e.description && e.description.toLowerCase().includes(query)) ||
                (e.location && e.location.toLowerCase().includes(query))
            );
            dayTasks = dayTasks.filter((t) => t.title.toLowerCase().includes(query));
          }

          // Apply chip filter
          if (filterType === 'festivals') {
            islamicOccasion = null;
            dayEvents = [];
            dayTasks = [];
          } else if (filterType === 'islamic') {
            dayFestivals = [];
            christianObs = [];
            dayEvents = [];
            dayTasks = [];
          } else if (filterType === 'events') {
            dayFestivals = [];
            christianObs = [];
            islamicOccasion = null;
            dayTasks = [];
          } else if (filterType === 'tasks') {
            dayFestivals = [];
            christianObs = [];
            islamicOccasion = null;
            dayEvents = [];
          }

          const hasContent =
            dayFestivals.length > 0 ||
            christianObs.length > 0 ||
            islamicOccasion !== null ||
            dayEvents.length > 0 ||
            dayTasks.length > 0;

          if (!hasContent) return null;

          return (
            <div
              key={dateStr}
              className={`rounded-2xl border p-4 shadow-xs transition-all ${
                isChristianMode
                  ? 'bg-white/90 dark:bg-[#101D36]/90 border-[#E5DFD2] dark:border-slate-700/80 hover:border-[#C69C44]/60 dark:hover:border-sky-500/50'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Day Date Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center font-bold ${
                      isChristianMode
                        ? 'bg-[#F2F6FC] dark:bg-sky-950/50 border-[#D5E0F0] dark:border-sky-800/60 text-[#14284B] dark:text-sky-200'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase">{t.daysShort[dayOfWeekIndex]}</span>
                    <span className="text-base font-mono-tabular leading-none">{dayNum}</span>
                  </div>
                  <div>
                    <h3
                      className={`text-slate-900 dark:text-white ${
                        isChristianMode
                          ? 'font-editorial text-xl font-semibold text-[#10203B]'
                          : 'font-bold text-base'
                      }`}
                    >
                      {t.months[month]} {dayNum}, {year}
                    </h3>
                    {isMuslimMode ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        <span>{moon.icon}</span>
                        <span>
                          {language === 'ur'
                            ? (hijri.formattedUr || hijri.formattedEn)
                            : hijri.formattedEn}
                        </span>
                      </div>
                    ) : isHinduMode ? (
                      <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-semibold">
                        <span>🪔</span>
                        <span>
                          {(() => {
                            const p = getHinduPanchang(
                              dayObj,
                              filters.selectedCity,
                              filters.customLatitude,
                              filters.customLongitude,
                              filters.customLocationName,
                              undefined,
                              filters.selectedCountry,
                              filters.selectedLocationTimezone
                            );
                            return `${p.pakshaHi} • ${p.tithiNameHi}`;
                          })()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-[#1E3A6E] dark:text-sky-300 font-medium">
                        <span>
                          {dayOfWeekIndex === 0
                            ? "The Lord's Day · Sunday Worship"
                            : dayObj.toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                        <span aria-hidden="true" className="text-slate-400">
                          ·
                        </span>
                        <span className="text-[#8C6418] dark:text-amber-300">
                          {getLiturgicalSeason(dayObj).seasonName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onSelectDate(dayObj)}
                  className="self-start sm:self-auto text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {isChristianMode
                    ? 'View Day Calendar →'
                    : isHinduMode
                    ? 'दिन का कैलेंडर देखें →'
                    : language === 'ur'
                    ? 'دن کا کیلنڈر دیکھیں ←'
                    : 'View Day Calendar →'}
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">

                {/* Friday + Holi Advisory Alert (Muslim Mode only) */}
                {(() => {
                  if (!isMuslimMode) return null;
                  const alert = checkFridayFestivalCoincidence(dayObj);
                  if (!alert) return null;
                  return (
                    <div className="p-3.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50 flex items-start gap-3 shadow-sm">
                      <div className="p-2 rounded-lg bg-red-600 text-white mt-0.5">
                        <AlertTriangle className="w-4 h-4 animate-bounce" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-red-950 dark:text-red-200">
                            {language === 'ur' ? 'انتباہ: جمعۃ المبارک + ہولی کا تہوار' : 'Red Advisory: Jummah Prayer + Holi Festival'}
                          </h4>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                            {language === 'ur' ? 'اہم الرٹ' : 'High Priority'}
                          </span>
                        </div>
                        <p className="text-xs text-red-800 dark:text-red-300 mt-1 leading-relaxed font-medium">
                          {language === 'ur' ? alert.warningUr : language === 'hinglish' ? alert.warningHinglish : alert.warningEn}
                        </p>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Islamic Occasion Card */}
                {islamicOccasion && (
                  <div
                    onClick={() => onSelectIslamic(islamicOccasion!)}
                    className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 cursor-pointer hover:shadow-md transition-all flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-emerald-600 text-white mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                          {language === 'ur' ? (islamicOccasion.nameUr || islamicOccasion.nameEn) : islamicOccasion.nameEn}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                          {language === 'ur' ? 'اسلامی ہجری مناسبت' : 'Islamic Lunar Occasion'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                        {language === 'ur' ? (islamicOccasion.descriptionUr || islamicOccasion.descriptionEn) : islamicOccasion.descriptionEn}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {islamicOccasion.practices.slice(0, 3).map((p, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                          >
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Christian Liturgical Observances */}
                {christianObs.map((obs) => (
                  <div
                    key={obs.id}
                    className="p-3.5 rounded-xl border border-[#E6D3A3] dark:border-amber-700/50 bg-[#FBF6EA] dark:bg-amber-950/30 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-[#8C6418] dark:bg-amber-600 text-white mt-0.5 shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="font-editorial text-lg font-semibold text-[#10203B] dark:text-[#FAF7F0]">
                          {obs.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-[#8C6418] dark:text-amber-300">
                          Christian Observance · {obs.season}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {obs.description}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Indian Festivals */}
                {dayFestivals.map((fest) => {
                  const badge = getCategoryBadgeStyle(fest.category);
                  return (
                    <div
                      key={fest.id}
                      onClick={() => onSelectFestival(fest)}
                      className={
                        isChristianMode
                          ? 'p-3.5 rounded-xl border border-[#D8E2F0] dark:border-sky-800/60 bg-gradient-to-br from-[#F7FAFE] to-[#FCFBF8] dark:from-sky-950/40 dark:to-[#0E1A30] cursor-pointer hover:border-[#1E3A6E]/50 transition-all flex items-start gap-3'
                          : `p-3.5 rounded-xl border ${badge.border} ${badge.bg} cursor-pointer hover:shadow-md transition-all flex items-start gap-3`
                      }
                    >
                      <div
                        className="p-2 rounded-lg text-white mt-0.5 shrink-0"
                        style={{
                          backgroundColor: isChristianMode
                            ? fest.category === 'christian'
                              ? '#8C6418'
                              : '#14284B'
                            : badge.dotColor,
                        }}
                      >
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4
                            className={
                              isChristianMode
                                ? 'font-editorial text-lg font-semibold text-[#10203B] dark:text-[#FAF7F0]'
                                : `text-sm font-bold ${badge.text}`
                            }
                          >
                            {isChristianMode
                              ? fest.nameEn
                              : isHinduMode
                              ? (fest.nameHi || fest.nameEn)
                              : language === 'ur'
                              ? (fest.nameUr || fest.nameHi)
                              : fest.nameEn}
                          </h4>
                          <span className="text-[11px] font-medium capitalize text-slate-500 dark:text-slate-400">
                            {fest.category} · {fest.holidayType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                          {isChristianMode || isHinduMode
                            ? fest.descriptionEn
                            : language === 'ur'
                            ? (fest.descriptionUr || fest.descriptionEn)
                            : fest.descriptionEn}
                        </p>
                        <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-1.5">
                          Significance: {fest.significance}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Personal Events */}
                {dayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between gap-3"
                    style={{ borderLeftColor: evt.color || '#4f46e5', borderLeftWidth: '4px' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {evt.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 capitalize">
                          {evt.category}
                        </span>
                      </div>
                      {evt.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {evt.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
                      {evt.startTime && (
                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}</span>
                        </div>
                      )}
                      {evt.location && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Tasks */}
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 flex items-center gap-3"
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-semibold flex-1 ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase">
                      Task
                    </span>
                  </div>
                ))}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
