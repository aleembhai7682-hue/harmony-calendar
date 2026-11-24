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
      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#FCFDFC]/90 dark:bg-[#08130F]/80 border border-[#D5E4DC] dark:border-[#1B382E] shadow-xs"
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
              <stop offset="0%" stopColor="#047857" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Subtle outer hairline halo */}
          <circle
            r="39.5"
            fill="none"
            className="stroke-[#C6DDD1] dark:stroke-[#1B382E]"
            strokeWidth="1"
          />

          {/* Remaining slice */}
          {remainingPct > 0 && remainingPath && (
            <path
              d={remainingPath}
              className="fill-[#DCECE3] dark:fill-[#163026] transition-all duration-500"
            />
          )}

          {/* Elapsed slice */}
          {clamped > 0 && elapsedPath && (
            <path
              d={elapsedPath}
              fill="url(#prayer-pie-elapsed)"
              className="transition-all duration-500"
            />
          )}

          {/* Center label */}
          <text
            x="0"
            y="-3"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-emerald-950 dark:fill-white font-mono font-black text-[13px] tabular-nums"
          >
            {clamped}%
          </text>
          <text
            x="0"
            y="10"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-500 dark:fill-slate-400 font-semibold text-[7.5px] uppercase tracking-wider"
          >
            {language === 'ur' ? 'گزر چکا' : 'Elapsed'}
          </text>
        </svg>
      </div>

      <div className="min-w-[104px] text-[11px] space-y-1">
        <div className="font-bold text-emerald-950 dark:text-slate-100 truncate max-w-[130px]">
          {prevPrayerLabel} → {nextPrayerLabel}
        </div>
        <div className="flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
            <span>{language === 'ur' ? 'گزرا' : 'Elapsed'}</span>
          </span>
          <span className="font-mono font-bold tabular-nums text-emerald-800 dark:text-emerald-300">
            {clamped}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DCECE3] dark:bg-[#163026] border border-[#A8CBB8] dark:border-[#24493C] shrink-0" />
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
