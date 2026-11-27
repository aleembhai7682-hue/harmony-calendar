import React, { useMemo, useState } from 'react';
import { pie as d3Pie, arc as d3Arc, PieArcDatum } from 'd3-shape';
import {
  CalendarEvent,
  CalendarTask,
  CalendarFilterSettings,
  Language,
  IndianFestival,
  IslamicOccasion,
} from '../types/calendar';
import { getIslamicOccasionForDate } from '../utils/hijri';
import { getGlobalHolidaysForDate } from '../utils/globalHolidays';
import { getChristianObservancesForDate } from '../utils/christianData';
import { isTaskVisibleInMode } from '../utils/taskFilter';
import { getEventsForDateAndMode } from '../utils/eventUtils';
import { getConfirmedCountryCode } from '../utils/storage';
import { getModeTheme } from '../utils/modeTheme';
import { getLocaleTag } from '../utils/localization';
import { Plus, ChevronRight } from 'lucide-react';

type MetricKey = 'tasks' | 'festivals' | 'events';

interface SliceDatum {
  key: MetricKey;
  label: string;
  value: number;
  colorLight: string;
  colorDark: string;
}

interface UpcomingFestivalItem {
  id: string;
  name: string;
  dateStr: string;
  dayNum: number;
  festivalRef?: IndianFestival;
  islamicRef?: IslamicOccasion;
}

interface WeekBucket {
  weekIndex: number;
  label: string;
  firstDayNum: number;
  completedTasks: number;
  festivals: number;
  events: number;
}

interface MonthSummaryBarProps {
  year: number;
  month: number;
  startingDayOfWeek: number;
  totalDaysInMonth: number;
  todayStr: string;
  events: CalendarEvent[];
  tasks: CalendarTask[];
  filters: CalendarFilterSettings;
  language: Language;
  effectiveTz: string;
  onSelectDate: (d: Date) => void;
  onSelectFestival: (festival: IndianFestival) => void;
  onSelectIslamic: (occasion: IslamicOccasion) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenCreateEventOnDate: (dateStr: string) => void;
}

export const MonthSummaryBar: React.FC<MonthSummaryBarProps> = ({
  year,
  month,
  startingDayOfWeek,
  totalDaysInMonth,
  todayStr,
  events,
  tasks,
  filters,
  language,
  effectiveTz,
  onSelectDate,
  onSelectFestival,
  onSelectIslamic,
  onSelectEvent,
  onOpenCreateEventOnDate,
}) => {
  const [hoveredKey, setHoveredKey] = useState<MetricKey | null>(null);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  const isMuslimMode = filters.calendarMode === 'muslim';
  const isHinduMode = filters.calendarMode === 'hindu';
  const isChristianMode = filters.calendarMode === 'christian';
  const modeTheme = getModeTheme(filters.calendarMode);
  const confirmedCountryCode = getConfirmedCountryCode(filters);

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;

  // Strict language isolation: Christian uses English only; Hindu uses EN/HI; Muslim uses EN/UR/Hinglish
  const effectiveLang: 'en' | 'hi' | 'ur' | 'hinglish' = isChristianMode
    ? 'en'
    : isHinduMode
    ? language === 'en'
      ? 'en'
      : 'hi'
    : language === 'ur'
    ? 'ur'
    : language === 'hinglish'
    ? 'hinglish'
    : 'en';

  const copy = useMemo(() => {
    if (effectiveLang === 'ur') {
      return {
        overview: 'ماہانہ خلاصہ',
        completedTasks: 'مکمل کام',
        upcomingFestivals: 'آنے والے تہوار / مواقع',
        activeEvents: 'فعال ایونٹس',
        items: 'کل اندراجات',
        ofTotal: 'از',
        done: 'مکمل',
        noTasks: 'اس ماہ کوئی کام نہیں',
        inMonth: 'اس ماہ میں',
        upcoming: 'آنے والے',
        daysLabel: 'دن',
        emptyHint: 'اس ماہ کوئی کام، تہوار یا ایونٹ درج نہیں ہے۔',
        addEvent: 'ایونٹ شامل کریں',
        weeklyRhythm: 'ہفتہ وار سرگرمی',
        pastMonth: 'گزشتہ ماہ',
      };
    }
    if (effectiveLang === 'hi') {
      return {
        overview: 'मासिक सारांश',
        completedTasks: 'पूर्ण कार्य',
        upcomingFestivals: 'आगामी पर्व / उत्सव',
        activeEvents: 'सक्रिय कार्यक्रम',
        items: 'कुल मदें',
        ofTotal: 'में से',
        done: 'पूर्ण',
        noTasks: 'कोई कार्य निर्धारित नहीं',
        inMonth: 'इस माह में',
        upcoming: 'आगामी',
        daysLabel: 'दिन',
        emptyHint: 'इस माह में कोई पूर्ण कार्य, पर्व या कार्यक्रम नहीं है।',
        addEvent: 'कार्यक्रम जोड़ें',
        weeklyRhythm: 'साप्ताहिक गतिविधि',
        pastMonth: 'पिछला माह',
      };
    }
    if (effectiveLang === 'hinglish') {
      return {
        overview: 'Mahine Ka Khulasa',
        completedTasks: 'Completed Tasks',
        upcomingFestivals: 'Aane Wale Occasions',
        activeEvents: 'Active Events',
        items: 'Items',
        ofTotal: 'of',
        done: 'done',
        noTasks: 'No tasks this month',
        inMonth: 'in month',
        upcoming: 'upcoming',
        daysLabel: 'days',
        emptyHint: 'Is mahine koi completed tasks, occasions ya events nahi hain.',
        addEvent: 'Add Event',
        weeklyRhythm: 'Weekly Activity',
        pastMonth: 'Past month',
      };
    }
    return {
      overview: 'Monthly Breakdown',
      completedTasks: 'Completed Tasks',
      upcomingFestivals: isMuslimMode ? 'Upcoming Occasions' : 'Upcoming Festivals',
      activeEvents: 'Active Events',
      items: 'Items',
      ofTotal: 'of',
      done: 'done',
      noTasks: 'No tasks scheduled',
      inMonth: 'in month',
      upcoming: 'upcoming',
      daysLabel: 'scheduled days',
      emptyHint: 'No completed tasks, upcoming festivals, or active events in this month yet.',
      addEvent: 'Add Event',
      weeklyRhythm: 'Weekly Rhythm',
      pastMonth: 'Past month',
    };
  }, [effectiveLang, isMuslimMode]);

  const summary = useMemo(() => {
    const monthTasks = tasks.filter(
      (task) => task.dueDate.startsWith(monthPrefix) && isTaskVisibleInMode(task, filters.calendarMode)
    );
    const completedTasksCount = monthTasks.filter((t) => t.completed).length;
    const totalTasksCount = monthTasks.length;

    const totalWeeks = Math.ceil((startingDayOfWeek + totalDaysInMonth) / 7);
    const weekBuckets: WeekBucket[] = Array.from({ length: totalWeeks }, (_, idx) => ({
      weekIndex: idx,
      label: `W${idx + 1}`,
      firstDayNum: idx === 0 ? 1 : Math.min(totalDaysInMonth, idx * 7 - startingDayOfWeek + 1),
      completedTasks: 0,
      festivals: 0,
      events: 0,
    }));

    const seenFestivalKeys = new Set<string>();
    let totalMonthFestivalsCount = 0;
    const upcomingFestivalsList: UpcomingFestivalItem[] = [];

    const activeEventIds = new Set<string>();
    const upcomingEventIds = new Set<string>();
    let totalEventOccurrences = 0;
    let nextActiveEvent: { event: CalendarEvent; dateStr: string } | null = null;

    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const cellDate = new Date(year, month, dayNum);
      const dateStr = `${monthPrefix}${String(dayNum).padStart(2, '0')}`;
      const weekIdx = Math.min(
        totalWeeks - 1,
        Math.floor((startingDayOfWeek + dayNum - 1) / 7)
      );
      const isUpcomingOrToday = dateStr >= todayStr;

      // Completed tasks in this week bucket
      const dayCompletedTasks = monthTasks.filter((t) => t.dueDate === dateStr && t.completed).length;
      weekBuckets[weekIdx].completedTasks += dayCompletedTasks;

      // Festivals / Occasions
      if (isMuslimMode) {
        const occ = getIslamicOccasionForDate(cellDate, filters.hijriAdjustmentDays);
        if (occ) {
          const uniqueKey = `${occ.id}:${dateStr}`;
          if (!seenFestivalKeys.has(uniqueKey)) {
            seenFestivalKeys.add(uniqueKey);
            totalMonthFestivalsCount += 1;
            weekBuckets[weekIdx].festivals += 1;
            if (isUpcomingOrToday) {
              upcomingFestivalsList.push({
                id: uniqueKey,
                name:
                  effectiveLang === 'ur'
                    ? occ.nameUr || occ.nameEn
                    : effectiveLang === 'hinglish'
                    ? occ.nameUr
                      ? `${occ.nameEn} (${occ.nameUr})`
                      : occ.nameEn
                    : occ.nameEn,
                dateStr,
                dayNum,
                islamicRef: occ,
              });
            }
          }
        }
      } else {
        const dayFestivals = getGlobalHolidaysForDate(dateStr, {
          countryCode: confirmedCountryCode,
          state: filters.selectedState,
          enabledCategories: filters.enabledCategories,
          showGazettedOnly: filters.showGazettedOnly,
          calendarMode: filters.calendarMode,
        });

        for (const fest of dayFestivals) {
          const uniqueKey = `${fest.id}:${dateStr}`;
          if (!seenFestivalKeys.has(uniqueKey)) {
            seenFestivalKeys.add(uniqueKey);
            totalMonthFestivalsCount += 1;
            weekBuckets[weekIdx].festivals += 1;
            if (isUpcomingOrToday) {
              upcomingFestivalsList.push({
                id: uniqueKey,
                name: isChristianMode
                  ? fest.nameEn
                  : isHinduMode && effectiveLang === 'hi'
                  ? fest.nameHi || fest.nameEn
                  : fest.nameEn,
                dateStr,
                dayNum,
                festivalRef: fest,
              });
            }
          }
        }

        if (isChristianMode) {
          const christianObs = getChristianObservancesForDate(cellDate).filter(
            (obs) => !dayFestivals.some((f) => f.nameEn.toLowerCase() === obs.name.toLowerCase())
          );
          for (const obs of christianObs) {
            const uniqueKey = `chr:${obs.id}:${dateStr}`;
            if (!seenFestivalKeys.has(uniqueKey)) {
              seenFestivalKeys.add(uniqueKey);
              totalMonthFestivalsCount += 1;
              weekBuckets[weekIdx].festivals += 1;
              if (isUpcomingOrToday) {
                upcomingFestivalsList.push({
                  id: uniqueKey,
                  name: obs.name,
                  dateStr,
                  dayNum,
                });
              }
            }
          }
        }
      }

      // Active events
      const dayEvents = getEventsForDateAndMode(events, dateStr, filters.calendarMode, effectiveTz);
      if (dayEvents.length > 0) {
        totalEventOccurrences += dayEvents.length;
        weekBuckets[weekIdx].events += dayEvents.length;
        for (const evt of dayEvents) {
          activeEventIds.add(evt.id);
          if (isUpcomingOrToday) {
            upcomingEventIds.add(evt.id);
            if (!nextActiveEvent) {
              nextActiveEvent = { event: evt, dateStr };
            }
          }
        }
      }
    }

    const lastDayStr = `${monthPrefix}${String(totalDaysInMonth).padStart(2, '0')}`;
    const isPastMonth = lastDayStr < todayStr;

    return {
      completedTasksCount,
      totalTasksCount,
      taskCompletionPct:
        totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0,
      upcomingFestivalsCount: upcomingFestivalsList.length,
      totalMonthFestivalsCount,
      upcomingFestivalsList,
      activeEventsCount: activeEventIds.size,
      upcomingEventsCount: upcomingEventIds.size,
      totalEventOccurrences,
      nextActiveEvent: nextActiveEvent as { event: CalendarEvent; dateStr: string } | null,
      weekBuckets,
      isPastMonth,
    };
  }, [
    tasks,
    events,
    year,
    month,
    monthPrefix,
    startingDayOfWeek,
    totalDaysInMonth,
    todayStr,
    filters.calendarMode,
    filters.hijriAdjustmentDays,
    filters.selectedState,
    filters.enabledCategories,
    filters.showGazettedOnly,
    confirmedCountryCode,
    effectiveTz,
    isMuslimMode,
    isHinduMode,
    isChristianMode,
    effectiveLang,
  ]);

  const activeEventsColorLight = isMuslimMode
    ? '#047857'
    : isHinduMode
    ? '#B45309'
    : '#14284B';
  const activeEventsColorDark = isMuslimMode
    ? '#34D399'
    : isHinduMode
    ? '#FB923C'
    : '#38BDF8';

  const slices: SliceDatum[] = useMemo(
    () => [
      {
        key: 'tasks',
        label: copy.completedTasks,
        value: summary.completedTasksCount,
        colorLight: '#059669',
        colorDark: '#10B981',
      },
      {
        key: 'festivals',
        label: copy.upcomingFestivals,
        value: summary.upcomingFestivalsCount,
        colorLight: '#C69C44',
        colorDark: '#F59E0B',
      },
      {
        key: 'events',
        label: copy.activeEvents,
        value: summary.activeEventsCount,
        colorLight: activeEventsColorLight,
        colorDark: activeEventsColorDark,
      },
    ],
    [
      copy.completedTasks,
      copy.upcomingFestivals,
      copy.activeEvents,
      summary.completedTasksCount,
      summary.upcomingFestivalsCount,
      summary.activeEventsCount,
      activeEventsColorLight,
      activeEventsColorDark,
    ]
  );

  const totalVisualItems =
    summary.completedTasksCount + summary.upcomingFestivalsCount + summary.activeEventsCount;

  const arcPaths = useMemo(() => {
    const nonZero = slices.filter((s) => s.value > 0);
    if (nonZero.length === 0) return [];

    const pieGen = d3Pie<SliceDatum>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(nonZero.length > 1 ? 0.045 : 0);

    const arcGen = d3Arc<PieArcDatum<SliceDatum>>()
      .innerRadius(28)
      .outerRadius(41)
      .cornerRadius(3);

    return pieGen(nonZero).map((arcDatum) => ({
      ...arcDatum.data,
      path: arcGen(arcDatum) || '',
      pct: Math.round((arcDatum.data.value / totalVisualItems) * 100),
    }));
  }, [slices, totalVisualItems]);

  const maxWeekTotal = Math.max(
    1,
    ...summary.weekBuckets.map((w) => w.completedTasks + w.festivals + w.events)
  );

  const locale = getLocaleTag(language, filters.selectedCountryCode);
  const monthTitle = new Date(year, month, 1).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const nextFestival = summary.upcomingFestivalsList[0];
  const defaultCreateDate =
    todayStr.startsWith(monthPrefix) ? todayStr : `${monthPrefix}01`;

  return (
    <section
      aria-label={`${monthTitle} ${copy.overview}`}
      className={`px-4 py-3.5 sm:px-5 border-b ${modeTheme.gridDivider} ${modeTheme.cardSubSurface}/55`}
    >
      {/* Top quiet editorial strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            {monthTitle}
          </h3>
          <span aria-hidden="true" className="text-slate-400">
            ·
          </span>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {copy.overview}
          </span>
          <span aria-hidden="true" className="text-slate-400">
            ·
          </span>
          <span className="font-mono-tabular font-semibold text-slate-700 dark:text-slate-200">
            {totalVisualItems} {copy.items}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenCreateEventOnDate(defaultCreateDate)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${modeTheme.subtleActionBtn}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{copy.addEvent}</span>
        </button>
      </div>

      {/* Visualization + Metrics + Weekly Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr_auto] gap-4 sm:gap-5 items-center">
        {/* 1. D3 Donut Breakdown Ring */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-[92px] h-[92px] shrink-0">
            <svg
              viewBox="-46 -46 92 92"
              className="w-full h-full overflow-visible"
              role="img"
              aria-label={`${monthTitle}: ${summary.completedTasksCount} ${copy.completedTasks}, ${summary.upcomingFestivalsCount} ${copy.upcomingFestivals}, ${summary.activeEventsCount} ${copy.activeEvents}`}
            >
              {totalVisualItems === 0 ? (
                <circle
                  r="34.5"
                  fill="none"
                  className="stroke-slate-300 dark:stroke-slate-700"
                  strokeWidth="12"
                  strokeDasharray="4 4"
                />
              ) : (
                arcPaths.map((slice) => {
                  const isDimmed = hoveredKey !== null && hoveredKey !== slice.key;
                  return (
                    <g
                      key={slice.key}
                      className="transition-opacity duration-150 cursor-pointer"
                      style={{ opacity: isDimmed ? 0.3 : 1 }}
                      onMouseEnter={() => setHoveredKey(slice.key)}
                      onMouseLeave={() => setHoveredKey(null)}
                    >
                      <path
                        d={slice.path}
                        className={
                          slice.key === 'tasks'
                            ? 'fill-emerald-600 dark:fill-emerald-500'
                            : slice.key === 'festivals'
                            ? 'fill-[#C69C44] dark:fill-amber-400'
                            : isMuslimMode
                            ? 'fill-[#047857] dark:fill-emerald-400'
                            : isHinduMode
                            ? 'fill-[#B45309] dark:fill-orange-400'
                            : 'fill-[#14284B] dark:fill-sky-400'
                        }
                      >
                        <title>{`${slice.label}: ${slice.value} (${slice.pct}%)`}</title>
                      </path>
                    </g>
                  );
                })
              )}

              {/* Center Metric */}
              <text
                x="0"
                y="-4"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-900 dark:fill-white font-mono font-bold text-[16px] tabular-nums"
              >
                {hoveredKey
                  ? slices.find((s) => s.key === hoveredKey)?.value ?? totalVisualItems
                  : totalVisualItems}
              </text>
              <text
                x="0"
                y="11"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-500 dark:fill-slate-400 font-semibold text-[8px] uppercase tracking-wider"
              >
                {hoveredKey
                  ? `${
                      totalVisualItems > 0
                        ? Math.round(
                            ((slices.find((s) => s.key === hoveredKey)?.value ?? 0) /
                              totalVisualItems) *
                              100
                          )
                        : 0
                    }%`
                  : copy.items}
              </text>
            </svg>
          </div>

          {totalVisualItems === 0 && (
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[210px] leading-snug xl:hidden">
              {copy.emptyHint}
            </p>
          )}
        </div>

        {/* 2. Three Unboxed Metric Columns separated by Hairline Dividers */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x ${modeTheme.gridDivider}`}
        >
          {/* Metric A: Completed Tasks */}
          <div
            onMouseEnter={() => setHoveredKey('tasks')}
            onMouseLeave={() => setHoveredKey(null)}
            className="pb-2.5 sm:pb-0 sm:pr-4 transition-opacity duration-150"
            style={{ opacity: hoveredKey && hoveredKey !== 'tasks' ? 0.55 : 1 }}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-600 dark:bg-emerald-500 shrink-0" />
              <span className="truncate">{copy.completedTasks}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono-tabular text-slate-900 dark:text-white">
                {summary.completedTasksCount}
              </span>
              <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                {summary.totalTasksCount > 0
                  ? `${copy.ofTotal} ${summary.totalTasksCount} (${summary.taskCompletionPct}% ${copy.done})`
                  : copy.noTasks}
              </span>
            </div>
            {/* Slim completion bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                style={{ width: `${summary.taskCompletionPct}%` }}
              />
            </div>
          </div>

          {/* Metric B: Upcoming Festivals */}
          <div
            onMouseEnter={() => setHoveredKey('festivals')}
            onMouseLeave={() => setHoveredKey(null)}
            className="py-2.5 sm:py-0 sm:px-4 transition-opacity duration-150"
            style={{ opacity: hoveredKey && hoveredKey !== 'festivals' ? 0.55 : 1 }}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#C69C44] dark:bg-amber-400 shrink-0" />
              <span className="truncate">{copy.upcomingFestivals}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono-tabular text-slate-900 dark:text-white">
                {summary.upcomingFestivalsCount}
              </span>
              <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                {summary.isPastMonth && summary.upcomingFestivalsCount === 0
                  ? `${copy.pastMonth} · ${summary.totalMonthFestivalsCount} ${copy.inMonth}`
                  : `${summary.totalMonthFestivalsCount} ${copy.inMonth}`}
              </span>
            </div>
            <div className="mt-1.5 min-h-[20px] flex items-center">
              {nextFestival ? (
                <button
                  type="button"
                  onClick={() => {
                    if (nextFestival.islamicRef) {
                      onSelectIslamic(nextFestival.islamicRef);
                    } else if (nextFestival.festivalRef) {
                      onSelectFestival(nextFestival.festivalRef);
                    } else {
                      onSelectDate(new Date(year, month, nextFestival.dayNum));
                    }
                  }}
                  className={`inline-flex items-center gap-1 text-xs font-medium ${modeTheme.accentText} hover:underline truncate max-w-full cursor-pointer`}
                  title={`${nextFestival.dateStr}: ${nextFestival.name}`}
                >
                  <span className="font-mono-tabular shrink-0">
                    {new Date(year, month, nextFestival.dayNum).toLocaleDateString(locale, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{nextFestival.name}</span>
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </button>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {totalVisualItems === 0 ? copy.emptyHint : '—'}
                </span>
              )}
            </div>
          </div>

          {/* Metric C: Active Events */}
          <div
            onMouseEnter={() => setHoveredKey('events')}
            onMouseLeave={() => setHoveredKey(null)}
            className="pt-2.5 sm:pt-0 sm:pl-4 transition-opacity duration-150"
            style={{ opacity: hoveredKey && hoveredKey !== 'events' ? 0.55 : 1 }}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span
                className={`w-2.5 h-2.5 rounded-[3px] shrink-0 ${
                  isMuslimMode
                    ? 'bg-[#047857] dark:bg-emerald-400'
                    : isHinduMode
                    ? 'bg-[#B45309] dark:bg-orange-400'
                    : 'bg-[#14284B] dark:bg-sky-400'
                }`}
              />
              <span className="truncate">{copy.activeEvents}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono-tabular text-slate-900 dark:text-white">
                {summary.activeEventsCount}
              </span>
              <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                {summary.activeEventsCount > 0
                  ? `${summary.upcomingEventsCount} ${copy.upcoming} · ${summary.totalEventOccurrences} ${copy.daysLabel}`
                  : `0 ${copy.upcoming}`}
              </span>
            </div>
            <div className="mt-1.5 min-h-[20px] flex items-center">
              {summary.nextActiveEvent ? (
                <button
                  type="button"
                  onClick={() => onSelectEvent(summary.nextActiveEvent!.event)}
                  className={`inline-flex items-center gap-1 text-xs font-medium ${modeTheme.accentText} hover:underline truncate max-w-full cursor-pointer`}
                  title={`${summary.nextActiveEvent.dateStr}: ${summary.nextActiveEvent.event.title}`}
                >
                  <span className="font-mono-tabular shrink-0">
                    {summary.nextActiveEvent.dateStr.slice(8, 10)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{summary.nextActiveEvent.event.title}</span>
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </button>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {summary.activeEventsCount === 0 ? '—' : copy.pastMonth}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Weekly Stacked Distribution Micro-Bar Chart (W1-W5/W6) */}
        <div
          className={`pt-3 xl:pt-0 xl:pl-4 border-t xl:border-t-0 xl:border-l ${modeTheme.gridDivider} flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {copy.weeklyRhythm}
            </span>
            {hoveredWeek !== null && summary.weekBuckets[hoveredWeek] && (
              <span className="text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400">
                {summary.weekBuckets[hoveredWeek].label}:{' '}
                {summary.weekBuckets[hoveredWeek].completedTasks +
                  summary.weekBuckets[hoveredWeek].festivals +
                  summary.weekBuckets[hoveredWeek].events}
              </span>
            )}
          </div>

          <div
            className="flex items-end gap-2 h-[54px]"
            role="group"
            aria-label={copy.weeklyRhythm}
          >
            {summary.weekBuckets.map((wk) => {
              const wkTotal = wk.completedTasks + wk.festivals + wk.events;
              const maxBarPx = 34;
              const barHeight = wkTotal === 0 ? 3 : Math.max(6, Math.round((wkTotal / maxWeekTotal) * maxBarPx));
              const taskH = wkTotal > 0 ? Math.round((wk.completedTasks / wkTotal) * barHeight) : 0;
              const festH = wkTotal > 0 ? Math.round((wk.festivals / wkTotal) * barHeight) : 0;
              const evtH = Math.max(0, barHeight - taskH - festH);

              return (
                <button
                  key={wk.label}
                  type="button"
                  onClick={() => onSelectDate(new Date(year, month, wk.firstDayNum))}
                  onMouseEnter={() => setHoveredWeek(wk.weekIndex)}
                  onMouseLeave={() => setHoveredWeek(null)}
                  className="flex flex-col items-center gap-1 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded px-1"
                  title={`${wk.label}: ${wk.completedTasks} ${copy.completedTasks}, ${wk.festivals} ${copy.upcomingFestivals}, ${wk.events} ${copy.activeEvents}`}
                >
                  <div className="w-4 h-[34px] flex flex-col justify-end overflow-hidden rounded-t-sm">
                    {wkTotal === 0 ? (
                      <div className="w-full h-[3px] rounded-full bg-slate-200 dark:bg-slate-800" />
                    ) : (
                      <div className="w-full flex flex-col overflow-hidden rounded-t-sm transition-transform duration-150 group-hover:scale-y-105 origin-bottom">
                        {evtH > 0 && (
                          <div
                            style={{ height: `${evtH}px` }}
                            className={
                              isMuslimMode
                                ? 'bg-[#047857] dark:bg-emerald-400'
                                : isHinduMode
                                ? 'bg-[#B45309] dark:bg-orange-400'
                                : 'bg-[#14284B] dark:bg-sky-400'
                            }
                          />
                        )}
                        {festH > 0 && (
                          <div
                            style={{ height: `${festH}px` }}
                            className="bg-[#C69C44] dark:bg-amber-400"
                          />
                        )}
                        {taskH > 0 && (
                          <div
                            style={{ height: `${taskH}px` }}
                            className="bg-emerald-600 dark:bg-emerald-500"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono-tabular font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                    {wk.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
