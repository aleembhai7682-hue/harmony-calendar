import React, { useMemo } from 'react';
import { pie as d3Pie, arc as d3Arc, PieArcDatum } from 'd3-shape';
import { Language } from '../../types/calendar';

interface SliceDatum {
  key: 'elapsed' | 'remaining';
  value: number;
}

interface PrayerWindowPieChartProps {
  progressPct: number;
  prevPrayerLabel: string;
  nextPrayerLabel: string;
  remainingFormatted: string;
  language: Language;
}

export const PrayerWindowPieChart: React.FC<PrayerWindowPieChartProps> = ({
  progressPct,
  prevPrayerLabel,
  nextPrayerLabel,
  remainingFormatted,
  language,
}) => {
  const clamped = Math.min(100, Math.max(0, progressPct));
  const remainingPct = 100 - clamped;

  const { elapsedPath, remainingPath } = useMemo(() => {
    const data: SliceDatum[] = [
      { key: 'elapsed', value: Math.max(0.001, clamped) },
      { key: 'remaining', value: Math.max(0.001, remainingPct) },
    ];

    const pieGen = d3Pie<SliceDatum>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(clamped > 0 && remainingPct > 0 ? 0.04 : 0);

    const arcs = pieGen(data);

    const arcGen = d3Arc<PieArcDatum<SliceDatum>>()
      .innerRadius(25)
      .outerRadius(37)
      .cornerRadius(3.5);

    const elapsedArc = arcs.find((a) => a.data.key === 'elapsed');
    const remainingArc = arcs.find((a) => a.data.key === 'remaining');

    return {
      elapsedPath: elapsedArc ? arcGen(elapsedArc) || '' : '',
      remainingPath: remainingArc ? arcGen(remainingArc) || '' : '',
    };
  }, [clamped, remainingPct]);

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#F4FAF7]/95 dark:bg-[#0D211A]/90 border border-[#B8D8C8] dark:border-teal-500/35 shadow-xs"
      title={`${prevPrayerLabel} → ${nextPrayerLabel}: ${clamped}% elapsed, ${remainingPct}% remaining (${remainingFormatted})`}
    >
      <div className="relative w-[84px] h-[84px] shrink-0">
        <svg
          viewBox="-42 -42 84 84"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label={`Prayer window progress: ${clamped}% elapsed, ${remainingPct}% remaining`}
        >
          <defs>
            <linearGradient id="prayer-pie-elapsed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>

          {/* Subtle outer & inner hairline borders for Dark Mode definition */}
          <circle
            r="39.5"
            fill="none"
            className="stroke-[#B5D6C5] dark:stroke-teal-400/25"
            strokeWidth="1.1"
          />
          <circle
            r="22.8"
            fill="none"
            className="stroke-[#CFE2D8] dark:stroke-teal-400/20"
            strokeWidth="0.9"
          />

          {/* Remaining slice */}
          {remainingPct > 0 && remainingPath && (
            <path
              d={remainingPath}
              strokeWidth="0.9"
              className="fill-[#D7EAE0] dark:fill-[#15352B] stroke-[#9EC7B3] dark:stroke-teal-400/30 transition-all duration-500"
            />
          )}

          {/* Elapsed slice */}
          {clamped > 0 && elapsedPath && (
            <path
              d={elapsedPath}
              fill="url(#prayer-pie-elapsed)"
              strokeWidth="1"
              className="stroke-emerald-800/35 dark:stroke-teal-200/45 transition-all duration-500"
            />
          )}

          {/* Center label */}
          <text
            x="0"
            y="-3"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-emerald-950 dark:fill-teal-50 font-mono font-black text-[13px] tabular-nums"
          >
            {clamped}%
          </text>
          <text
            x="0"
            y="10"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-600 dark:fill-teal-200/75 font-semibold text-[7.5px] uppercase tracking-wider"
          >
            {language === 'ur' ? 'گزر چکا' : 'Elapsed'}
          </text>
        </svg>
      </div>

      <div className="min-w-[104px] text-[11px] space-y-1">
        <div className="font-bold text-emerald-950 dark:text-teal-50 truncate max-w-[130px]">
          {prevPrayerLabel} → {nextPrayerLabel}
        </div>
        <div className="flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 border border-emerald-800/30 dark:border-teal-200/50 shrink-0" />
            <span>{language === 'ur' ? 'گزرا' : 'Elapsed'}</span>
          </span>
          <span className="font-mono font-bold tabular-nums text-emerald-800 dark:text-teal-300">
            {clamped}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D7EAE0] dark:bg-[#15352B] border border-[#9EC7B3] dark:border-teal-400/40 shrink-0" />
            <span>{language === 'ur' ? 'باقی' : 'Left'}</span>
          </span>
          <span className="font-mono font-bold tabular-nums text-slate-700 dark:text-slate-200">
            {remainingPct}%
          </span>
        </div>
      </div>
    </div>
  );
};
