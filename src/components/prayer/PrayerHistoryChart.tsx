import React, { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Circle, Target, RotateCcw } from 'lucide-react';
import { Language } from '../../types/calendar';
import { formatDateToLocalYMD, parseYMDToLocalDate } from '../../utils/dateUtils';
import {
  PRAYER_IDS,
  PrayerHistoryMap,
  PrayerId,
  getLast7DaysPrayerStats,
  getPrayerDisplayName,
} from '../../utils/prayerHistory';

interface PrayerHistoryChartProps {
  currentDate: Date;
  language: Language;
  history: PrayerHistoryMap;
  dailyGoal: number;
  onTogglePrayer: (dateStr: string, prayerId: PrayerId) => void;
  onSetAllPrayersForDay: (dateStr: string, completed: boolean) => void;
  onChangeGoal: (goal: number) => void;
}

const CHART_LEFT = 42;
const CHART_RIGHT = 556;
const CHART_TOP = 26;
const CHART_BOTTOM = 170;
const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;
const MAX_PRAYERS = 5;

function yForCount(count: number): number {
  const clamped = Math.max(0, Math.min(MAX_PRAYERS, count));
  return CHART_BOTTOM - (clamped / MAX_PRAYERS) * CHART_HEIGHT;
}

export const PrayerHistoryChart: React.FC<PrayerHistoryChartProps> = ({
  currentDate,
  language,
  history,
  dailyGoal,
  onTogglePrayer,
  onSetAllPrayersForDay,
  onChangeGoal,
}) => {
  const anchorYmd = formatDateToLocalYMD(currentDate);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(anchorYmd);
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);

  const days = useMemo(
    () => getLast7DaysPrayerStats(currentDate, history, dailyGoal, language),
    [currentDate, history, dailyGoal, language]
  );

  // Keep selected date inside the active 7-day window when the user navigates dates
  useEffect(() => {
    if (!days.some((d) => d.dateStr === selectedDateStr)) {
      setSelectedDateStr(anchorYmd);
    }
  }, [anchorYmd, days, selectedDateStr]);

  const activeDay = useMemo(() => {
    const targetKey = hoveredDateStr ?? selectedDateStr;
    return days.find((d) => d.dateStr === targetKey) ?? days[days.length - 1];
  }, [days, hoveredDateStr, selectedDateStr]);

  const selectedDay = useMemo(
    () => days.find((d) => d.dateStr === selectedDateStr) ?? days[days.length - 1],
    [days, selectedDateStr]
  );

  const weeklyTotals = useMemo(() => {
    const completed = days.reduce((acc, d) => acc + d.completedCount, 0);
    const goalTotal = days.length * dailyGoal;
    const metDays = days.filter((d) => d.metGoal).length;
    const adherencePct = goalTotal > 0 ? Math.min(100, Math.round((completed / goalTotal) * 100)) : 0;
    return { completed, goalTotal, metDays, adherencePct };
  }, [days, dailyGoal]);

  const selectedDayIsFriday = useMemo(
    () => parseYMDToLocalDate(selectedDay.dateStr).getDay() === 5,
    [selectedDay.dateStr]
  );

  const slotWidth = (CHART_RIGHT - CHART_LEFT) / days.length;
  const barWidth = 34;
  const goalLineY = yForCount(dailyGoal);
  const hasAnyLogged = weeklyTotals.completed > 0;

  return (
    <section
      aria-label={
        language === 'ur'
          ? 'گزشتہ 7 دنوں کی نماز کا چارٹ اور روزانہ کا ہدف'
          : 'Last 7 days prayer completion compared with daily goal'
      }
      className="rounded-2xl bg-[#FCFDFC]/95 dark:bg-[#0D2019]/92 border border-[#C6DDD1] dark:border-teal-500/30 p-4 sm:p-5 space-y-4 shadow-xs"
    >
      {/* Header Row: Title + Daily Goal Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#DCEBE2] dark:border-teal-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-700 dark:text-emerald-300 shrink-0" />
            <h3 className="text-sm sm:text-base font-extrabold text-emerald-950 dark:text-teal-50 tracking-tight">
              {language === 'ur'
                ? 'گزشتہ 7 دنوں کی نماز بمقابلہ ہدف'
                : language === 'hinglish'
                ? '7-Day Namaz vs. Daily Goal'
                : '7-Day Prayer Completion vs. Goal'}
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {language === 'ur'
              ? `${days[0].dateShort} تا ${days[days.length - 1].dateShort} · روزانہ ہدف: ${dailyGoal}/5 نمازیں`
              : `${days[0].dateShort} – ${days[days.length - 1].dateShort} · Daily target: ${dailyGoal}/5 prayers`}
          </p>
        </div>

        {/* Daily Goal Step Selector (1 to 5 prayers/day) */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-teal-200/80 whitespace-nowrap">
            {language === 'ur' ? 'روزانہ ہدف' : 'Daily Goal'}
          </span>
          <div
            role="group"
            aria-label={language === 'ur' ? 'روزانہ نماز کا ہدف منتخب کریں' : 'Select daily prayer goal'}
            className="inline-flex items-center p-0.5 rounded-xl bg-[#EFF6F2] dark:bg-[#081511] border border-[#C2DBCD] dark:border-teal-500/35"
          >
            {[1, 2, 3, 4, 5].map((goalNum) => {
              const isActive = dailyGoal === goalNum;
              return (
                <button
                  key={goalNum}
                  type="button"
                  onClick={() => onChangeGoal(goalNum)}
                  aria-pressed={isActive}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold tabular-nums transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 dark:bg-emerald-400 text-white dark:text-emerald-950 shadow-xs'
                      : 'text-slate-700 dark:text-teal-200/85 hover:bg-[#E1F0E8] dark:hover:bg-[#133027]'
                  }`}
                >
                  {goalNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Single-Elevation Summary Strip */}
      <div className="grid grid-cols-3 divide-x divide-[#D5E4DC] dark:divide-teal-500/20 rounded-xl bg-[#F4FAF7] dark:bg-[#091813] border border-[#CBE0D4] dark:border-teal-500/25 py-2.5 px-2">
        <div className="px-2.5 sm:px-4">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-teal-200/70">
            {language === 'ur' ? '7 دن کی نمازیں' : '7-Day Prayers'}
          </div>
          <div className="mt-0.5 text-base sm:text-lg font-black font-mono tabular-nums text-emerald-900 dark:text-emerald-300">
            {weeklyTotals.completed}
            <span className="text-xs font-semibold text-slate-500 dark:text-teal-200/60">
              /{weeklyTotals.goalTotal}
            </span>
          </div>
        </div>

        <div className="px-2.5 sm:px-4">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-teal-200/70">
            {language === 'ur' ? 'ہدف مکمل دن' : 'Goal Met Days'}
          </div>
          <div className="mt-0.5 text-base sm:text-lg font-black font-mono tabular-nums text-teal-800 dark:text-teal-300">
            {weeklyTotals.metDays}
            <span className="text-xs font-semibold text-slate-500 dark:text-teal-200/60">/7</span>
          </div>
        </div>

        <div className="px-2.5 sm:px-4">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-teal-200/70">
            {language === 'ur' ? 'ہدف کا تناسب' : 'Goal Progress'}
          </div>
          <div className="mt-0.5 text-base sm:text-lg font-black font-mono tabular-nums text-emerald-800 dark:text-cyan-300">
            {weeklyTotals.adherencePct}%
          </div>
        </div>
      </div>

      {/* High-Contrast Emerald / Teal SVG Comparison Chart */}
      <div className="rounded-xl bg-[#F6FBF8] dark:bg-[#081611] border border-[#C6DDD1] dark:border-teal-500/30 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2 text-[11px]">
          <div className="font-semibold text-emerald-950 dark:text-teal-50 flex items-center gap-2">
            <span>{activeDay.fullDateLabel}</span>
            <span className="text-slate-400 dark:text-teal-500/70">·</span>
            <span className="font-mono tabular-nums font-bold text-emerald-800 dark:text-emerald-300">
              {activeDay.completedCount}/{activeDay.goal}{' '}
              {language === 'ur' ? 'ہدف' : 'of goal'} ({activeDay.adherencePct}%)
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700 dark:bg-emerald-400 border border-emerald-950/35 dark:border-emerald-100/75" />
              <span>{language === 'ur' ? 'ہدف مکمل' : 'Goal Met'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-teal-600 dark:bg-cyan-400 border border-teal-950/30 dark:border-cyan-100/70" />
              <span>{language === 'ur' ? 'جزوی' : 'In Progress'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 border-t-2 border-dashed border-teal-800 dark:border-teal-300" />
              <span>{language === 'ur' ? 'ہدف کی حد' : 'Goal Line'}</span>
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 640 214"
          className="w-full h-auto select-none overflow-visible"
          role="img"
          aria-label={`7-day prayer completion chart showing ${weeklyTotals.completed} prayers completed out of ${weeklyTotals.goalTotal} weekly goal`}
        >
          {/* Y-axis Horizontal Grid Hairlines & Ticks (0 to 5) */}
          {[0, 1, 2, 3, 4, 5].map((tick) => {
            const y = yForCount(tick);
            return (
              <g key={tick}>
                <line
                  x1={CHART_LEFT}
                  x2={CHART_RIGHT}
                  y1={y}
                  y2={y}
                  strokeWidth={tick === 0 ? 1.25 : 1}
                  className={
                    tick === 0
                      ? 'stroke-[#A6CCB8] dark:stroke-teal-400/40'
                      : 'stroke-[#D8EAE0] dark:stroke-teal-400/15'
                  }
                />
                <text
                  x={CHART_LEFT - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="fill-slate-500 dark:fill-teal-200/70 font-mono text-[11px] font-semibold tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* 7 Daily Columns */}
          {days.map((day, idx) => {
            const colLeft = CHART_LEFT + idx * slotWidth;
            const barX = colLeft + (slotWidth - barWidth) / 2;
            const centerX = barX + barWidth / 2;
            const isSelected = day.dateStr === selectedDateStr;
            const isHovered = day.dateStr === hoveredDateStr;

            const goalHeight = CHART_BOTTOM - goalLineY;
            const completedY = yForCount(day.completedCount);
            const completedHeight = CHART_BOTTOM - completedY;

            return (
              <g
                key={day.dateStr}
                tabIndex={0}
                role="button"
                aria-label={`${day.fullDateLabel}: ${day.completedCount} of ${day.goal} goal prayers completed`}
                aria-pressed={isSelected}
                onClick={() => setSelectedDateStr(day.dateStr)}
                onMouseEnter={() => setHoveredDateStr(day.dateStr)}
                onMouseLeave={() => setHoveredDateStr(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDateStr(day.dateStr);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                {/* Interactive Column Focus / Selection Backdrop */}
                <rect
                  x={colLeft + 6}
                  y={CHART_TOP - 10}
                  width={slotWidth - 12}
                  height={CHART_HEIGHT + 44}
                  rx={10}
                  strokeWidth={isSelected ? 1.4 : isHovered ? 1 : 0}
                  className={
                    isSelected
                      ? 'fill-emerald-700/[0.06] dark:fill-teal-300/[0.08] stroke-emerald-700/45 dark:stroke-teal-300/55 transition-colors'
                      : isHovered
                      ? 'fill-emerald-700/[0.03] dark:fill-teal-300/[0.04] stroke-emerald-600/25 dark:stroke-teal-400/30 transition-colors'
                      : 'fill-transparent stroke-transparent'
                  }
                />

                {/* Full 5-Prayer Capacity Track with Subtle Dark Mode Border */}
                <rect
                  x={barX}
                  y={CHART_TOP}
                  width={barWidth}
                  height={CHART_HEIGHT}
                  rx={6}
                  strokeWidth="1"
                  className="fill-[#EAF4EE] dark:fill-[#102920] stroke-[#BDDACA] dark:stroke-teal-400/25"
                />

                {/* Goal Target Ghost Box (visualizes remaining gap to goal) */}
                <rect
                  x={barX + 2}
                  y={goalLineY}
                  width={barWidth - 4}
                  height={goalHeight}
                  rx={4}
                  strokeWidth="1"
                  strokeDasharray="3 2.5"
                  className="fill-[#D6EDE1]/60 dark:fill-[#15392D]/70 stroke-[#70B79B] dark:stroke-teal-300/40"
                />

                {/* Actual Completed Prayers Bar */}
                {day.completedCount > 0 && (
                  <rect
                    x={barX}
                    y={completedY}
                    width={barWidth}
                    height={completedHeight}
                    rx={6}
                    strokeWidth="1.25"
                    className={
                      day.metGoal
                        ? 'fill-emerald-700 dark:fill-emerald-400 stroke-emerald-950/35 dark:stroke-emerald-100/80 transition-all duration-300'
                        : 'fill-teal-600 dark:fill-cyan-400 stroke-teal-950/30 dark:stroke-cyan-100/75 transition-all duration-300'
                    }
                  />
                )}

                {/* Count & Goal-Met Indicator Above Bar */}
                <text
                  x={centerX}
                  y={Math.min(completedY, goalLineY) - 7}
                  textAnchor="middle"
                  className={`font-mono text-[10.5px] font-bold tabular-nums ${
                    day.metGoal
                      ? 'fill-emerald-800 dark:fill-emerald-300'
                      : day.completedCount > 0
                      ? 'fill-teal-800 dark:fill-cyan-300'
                      : 'fill-slate-400 dark:fill-slate-500'
                  }`}
                >
                  {day.completedCount}/{day.goal}
                  {day.metGoal ? ' ✓' : ''}
                </text>

                {/* X-Axis Day & Short Date Labels */}
                <text
                  x={centerX}
                  y={CHART_BOTTOM + 16}
                  textAnchor="middle"
                  className={`text-[11px] font-bold ${
                    isSelected || day.isToday
                      ? 'fill-emerald-900 dark:fill-emerald-300'
                      : 'fill-slate-700 dark:fill-slate-200'
                  }`}
                >
                  {day.dayShort}
                </text>
                <text
                  x={centerX}
                  y={CHART_BOTTOM + 30}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-teal-200/70 font-mono text-[9.5px] tabular-nums"
                >
                  {day.isToday ? (language === 'ur' ? 'آج' : 'Today') : day.dateShort}
                </text>
              </g>
            );
          })}

          {/* Crisp Dashed Daily Goal Threshold Line + Callout Tag */}
          <g pointerEvents="none">
            <line
              x1={CHART_LEFT - 4}
              x2={CHART_RIGHT + 6}
              y1={goalLineY}
              y2={goalLineY}
              strokeWidth="1.75"
              strokeDasharray="5 4"
              className="stroke-teal-800 dark:stroke-teal-300"
            />
            <rect
              x={CHART_RIGHT + 10}
              y={goalLineY - 11}
              width={66}
              height={22}
              rx={6}
              strokeWidth="1"
              className="fill-[#E4F4EC] dark:fill-[#123328] stroke-[#7CC1A6] dark:stroke-teal-300/60"
            />
            <text
              x={CHART_RIGHT + 43}
              y={goalLineY}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-teal-900 dark:fill-teal-200 font-mono text-[10px] font-bold tabular-nums"
            >
              {language === 'ur' ? `ہدف ${dailyGoal}/5` : `Goal ${dailyGoal}/5`}
            </text>
          </g>
        </svg>
      </div>

      {/* Selected Day Interactive Prayer Check-In Strip */}
      <div className="rounded-xl bg-[#F4FAF7] dark:bg-[#091813] border border-[#C6DDD1] dark:border-teal-500/30 p-3 sm:p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs font-bold text-emerald-950 dark:text-teal-50 flex items-center gap-2 flex-wrap">
            <span>
              {language === 'ur'
                ? `${selectedDay.dayShort} (${selectedDay.dateShort}) کی نمازیں:`
                : `Log prayers for ${selectedDay.fullDateLabel}`}
            </span>
            <span className="font-mono tabular-nums text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              {selectedDay.completedCount}/5{' '}
              {selectedDay.metGoal
                ? language === 'ur'
                  ? '· ہدف مکمل'
                  : '· Goal met'
                : language === 'ur'
                ? `· ہدف ${selectedDay.goal}`
                : `· Goal ${selectedDay.goal}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSetAllPrayersForDay(selectedDay.dateStr, true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-700/10 hover:bg-emerald-700/20 dark:bg-emerald-400/15 dark:hover:bg-emerald-400/25 text-emerald-900 dark:text-emerald-200 border border-emerald-700/25 dark:border-emerald-400/35 transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>{language === 'ur' ? 'تمام 5 مکمل' : 'Mark All 5'}</span>
            </button>
            {selectedDay.completedCount > 0 && (
              <button
                type="button"
                onClick={() => onSetAllPrayersForDay(selectedDay.dateStr, false)}
                title={language === 'ur' ? 'صاف کریں' : 'Clear day'}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#E4F0EA] dark:hover:bg-[#143027] border border-[#C6DDD1] dark:border-teal-500/25 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'ur' ? 'صاف' : 'Clear'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRAYER_IDS.map((prayerId) => {
            const checked = Boolean(selectedDay.record[prayerId]);
            const label = getPrayerDisplayName(prayerId, language, selectedDayIsFriday);
            return (
              <button
                key={prayerId}
                type="button"
                onClick={() => onTogglePrayer(selectedDay.dateStr, prayerId)}
                aria-pressed={checked}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  checked
                    ? 'bg-emerald-700 dark:bg-emerald-400/20 text-white dark:text-emerald-200 border-emerald-800 dark:border-emerald-400/70 shadow-xs'
                    : 'bg-[#FCFDFC] dark:bg-[#0D211A] text-slate-700 dark:text-slate-200 border-[#C6DDD1] dark:border-teal-500/30 hover:border-emerald-500/60 dark:hover:border-teal-400/55'
                }`}
              >
                <span className="truncate">{label}</span>
                {checked ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-100 dark:text-emerald-300" />
                ) : (
                  <Circle className="w-4 h-4 shrink-0 text-slate-400 dark:text-teal-400/50" />
                )}
              </button>
            );
          })}
        </div>

        {!hasAnyLogged && (
          <p className="text-[11px] text-slate-600 dark:text-teal-200/75 pt-0.5">
            {language === 'ur'
              ? 'اپنا 7 دن کا ریکارڈ اور ہدف چارٹ دیکھنے کے لیے اوپر کسی دن پر کلک کریں یا یہاں نماز منتخب کریں۔'
              : 'Select any day bar above and tap prayers here to log your completion history against your daily goal.'}
          </p>
        )}
      </div>
    </section>
  );
};
