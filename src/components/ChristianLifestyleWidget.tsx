import React, { useState, useEffect } from 'react';
import {
  getDailyBibleVerse,
  getChristmasCountdown,
  getLiturgicalSeason,
  getNextChristianObservance,
  getChristianObservancesForDate,
  BibleVerse,
} from '../utils/christianData';
import { getDeviceTimezone, formatLocalTime } from '../utils/istTime';
import { Calendar, ChevronDown, ChevronUp, Church, Sun } from 'lucide-react';

interface ChristianLifestyleWidgetProps {
  currentDate: Date;
}

/**
 * Refined Architectural Cross Emblem
 */
const ArchitecturalCrossMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 36 36"
    className={`w-6 h-6 select-none ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="18"
      cy="15"
      r="10"
      stroke="currentColor"
      strokeOpacity="0.3"
      strokeWidth="1"
    />
    <path
      d="M18 5V31M9.5 14.5H26.5"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <circle cx="18" cy="14.5" r="2" fill="#D4A64A" />
  </svg>
);

export const ChristianLifestyleWidget: React.FC<ChristianLifestyleWidgetProps> = ({
  currentDate,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Synchronize live clock strictly to device local timezone
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const bibleVerse: BibleVerse = getDailyBibleVerse(currentDate);
  const christmasCountdown = getChristmasCountdown(currentDate);
  const liturgicalSeason = getLiturgicalSeason(currentDate);
  const { observance: nextObservance, daysUntil: nextObservanceDays } =
    getNextChristianObservance(currentDate);
  const todayObservances = getChristianObservancesForDate(currentDate);
  const isSunday = currentDate.getDay() === 0;
  const deviceTz = getDeviceTimezone().replace(/_/g, ' ');

  const formattedSelectedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Subtle progress through the liturgical countdown year toward Dec 25
  const christmasProgress = christmasCountdown.isToday
    ? 100
    : Math.max(4, Math.min(99, Math.round(((365 - christmasCountdown.days) / 365) * 100)));

  return (
    <section
      aria-label="Christian Calendar & Daily Devotion"
      className="relative rounded-2xl bg-gradient-to-br from-[#FCFBF8] via-[#F7FAFE] to-[#F2F6FC] dark:from-[#0C172B] dark:via-[#0E1B33] dark:to-[#0A1324] border border-[#E3DDD0] dark:border-slate-700/80 text-[#13223D] dark:text-[#F4F1EA] shadow-[0_10px_30px_-12px_rgba(20,40,75,0.12)] dark:shadow-2xl overflow-hidden transition-colors duration-200"
    >
      {/* Subtle morning sky & warm gold horizon wash */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sky-100/55 via-amber-50/35 to-transparent dark:from-sky-500/8 dark:via-amber-300/5 dark:to-transparent pointer-events-none"
      />

      {/* Header */}
      <div className="relative px-5 sm:px-7 py-5 border-b border-[#E7E1D5] dark:border-slate-800/90 flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#14284B] dark:bg-[#162849] text-[#F8F5EE] border border-[#C69C44]/40 flex items-center justify-center shrink-0 shadow-xs">
            <ArchitecturalCrossMark />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-editorial text-xl sm:text-2xl font-semibold tracking-tight text-[#10203B] dark:text-[#FAF7F0] leading-tight">
                Christian Calendar &amp; Daily Devotion
              </h2>
              {isSunday && (
                <span className="text-xs font-semibold text-[#1E40AF] dark:text-sky-300">
                  · The Lord&apos;s Day
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#14284B] dark:text-sky-200">
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: liturgicalSeason.colorHex }}
                  aria-hidden="true"
                />
                <span>{liturgicalSeason.seasonName}</span>
              </span>
              <span aria-hidden="true" className="text-slate-400">
                ·
              </span>
              <span>{formattedSelectedDate}</span>
              <span aria-hidden="true" className="text-slate-400">
                ·
              </span>
              <span className="font-mono-tabular text-[#8C6418] dark:text-amber-300 font-medium">
                {formatLocalTime(now, false)} ({deviceTz})
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-3.5 py-2 rounded-xl bg-white/85 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-[#14284B] dark:text-slate-200 text-xs font-semibold border border-[#DED8CA] dark:border-slate-700 inline-flex items-center gap-1.5 transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>{isCollapsed ? 'Expand Devotion' : 'Collapse'}</span>
          {isCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Collapsible Body */}
      {!isCollapsed && (
        <div className="relative p-5 sm:p-7 space-y-6">
          {/* Today's Sunday / Observance Highlight */}
          {todayObservances.length > 0 ? (
            <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#EEF5FC] to-[#FAF6EC] dark:from-sky-950/50 dark:to-amber-950/30 border border-[#D4DFED] dark:border-sky-800/60">
              <div className="flex items-start sm:items-center gap-3">
                <Sun className="w-4 h-4 text-[#B48327] dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
                <div className="text-xs sm:text-sm text-[#14284B] dark:text-slate-100">
                  <span className="font-semibold">Today&apos;s Observance — {todayObservances[0].name}:</span>{' '}
                  <span className="text-slate-600 dark:text-slate-300">
                    {todayObservances[0].description}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#8C6418] dark:text-amber-300 whitespace-nowrap">
                {todayObservances[0].season}
              </span>
            </div>
          ) : isSunday ? (
            <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap px-4 py-3.5 rounded-xl bg-[#EEF4FB] dark:bg-sky-950/35 border border-[#D4E1F2] dark:border-sky-800/50">
              <div className="flex items-start sm:items-center gap-3">
                <Church className="w-4 h-4 text-[#1E3A6E] dark:text-sky-300 shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-xs sm:text-sm text-[#14284B] dark:text-slate-200">
                  <strong className="font-semibold">Sunday Worship &amp; Rest:</strong> Set aside unhurried time today for worship, Scripture, family fellowship, and quiet gratitude.
                </p>
              </div>
              <span className="text-xs font-mono-tabular font-semibold text-[#1E3A6E] dark:text-sky-300 whitespace-nowrap">
                Morning Service · 09:30 AM
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-slate-600 dark:text-slate-300 pb-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#8C6418] dark:text-amber-300 shrink-0" />
                <span>
                  <strong className="font-semibold text-[#14284B] dark:text-slate-100">
                    Spiritual Focus:
                  </strong>{' '}
                  {liturgicalSeason.spiritualFocus}
                </span>
              </div>
              <span className="text-slate-500 dark:text-slate-400">
                Liturgical Color: {liturgicalSeason.liturgicalColor}
              </span>
            </div>
          )}

          {/* 3-Column Overview Strip (Clean hairline dividers, single elevation) */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E6E0D4] dark:divide-slate-800 rounded-xl bg-white/80 dark:bg-[#0A1426]/80 border border-[#E6E0D4] dark:border-slate-800">
            {/* Metric 1: Upcoming Christian Feast */}
            <div className="p-4 sm:p-5 flex flex-col justify-between gap-2">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Upcoming Christian Observance
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-editorial text-xl font-semibold text-[#10203B] dark:text-[#FAF7F0] leading-snug">
                  {nextObservance.name}
                </span>
                <span className="font-mono-tabular text-xs font-semibold text-[#8C6418] dark:text-amber-300 whitespace-nowrap">
                  {nextObservanceDays === 0
                    ? 'Today'
                    : nextObservanceDays === 1
                    ? 'Tomorrow'
                    : `In ${nextObservanceDays} days`}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono-tabular">
                {nextObservance.dateStr} · {nextObservance.season}
              </div>
            </div>

            {/* Metric 2: Liturgical Season */}
            <div className="p-4 sm:p-5 flex flex-col justify-between gap-2">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Current Liturgical Season
              </div>
              <div className="font-editorial text-xl font-semibold text-[#10203B] dark:text-[#FAF7F0] leading-snug">
                {liturgicalSeason.seasonName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {liturgicalSeason.description}
              </div>
            </div>

            {/* Metric 3: Christmas Countdown */}
            <div className="p-4 sm:p-5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Countdown to Christmas</span>
                <span className="font-mono-tabular">Dec 25</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[#14284B] dark:text-amber-300 tracking-tight">
                  {christmasCountdown.isToday ? 'Today' : christmasCountdown.days}
                </span>
                {!christmasCountdown.isToday && (
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    days remaining
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#ECE7DC] dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1E3A6E] to-[#C69C44] dark:from-sky-400 dark:to-amber-300 transition-all duration-300"
                  style={{ width: `${christmasProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Scripture & Reflection */}
          <div className="pt-2">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <span className="text-xs font-semibold tracking-wide text-[#8C6418] dark:text-amber-300">
                Scripture of the Day · {bibleVerse.theme}
              </span>
              <span className="text-xs font-mono-tabular font-medium text-slate-500 dark:text-slate-400">
                {bibleVerse.citation}
              </span>
            </div>

            <blockquote className="font-editorial text-xl sm:text-2xl italic font-medium text-[#10203B] dark:text-[#FAF7F0] leading-relaxed border-y border-[#E8E2D6] dark:border-slate-800 py-4 px-1">
              &ldquo;{bibleVerse.textEn}&rdquo;
            </blockquote>

            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="font-semibold text-[#14284B] dark:text-sky-200">
                Reflection:
              </strong>{' '}
              {bibleVerse.reflection}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
