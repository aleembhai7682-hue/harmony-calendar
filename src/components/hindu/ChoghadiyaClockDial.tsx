import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react';
import {
  ChoghadiyaDialSegment,
  ChoghadiyaTier,
  HinduPanchangInfo,
  VedicMuhuratTimeline,
} from '../../utils/panchang';
import { formatTimePreference, TimeFormatOption } from '../../utils/localization';

interface ChoghadiyaClockDialProps {
  currentDate: Date;
  panchang: HinduPanchangInfo;
  timeline: VedicMuhuratTimeline;
  timeFormat?: TimeFormatOption;
  selectedCountryCode?: string;
}

function useDocumentDarkMode(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function createWedgePath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startMin12h: number,
  endMin12h: number
): string {
  const span = Math.max(1, endMin12h - startMin12h);
  const clampedSpan = Math.min(719.5, span);
  const startAngle = (startMin12h / 720) * 360 - 90;
  const endAngle = ((startMin12h + clampedSpan) / 720) * 360 - 90;
  const largeArc = clampedSpan > 360 ? 1 : 0;

  const p1 = polarToCartesian(cx, cy, outerR, startAngle);
  const p2 = polarToCartesian(cx, cy, outerR, endAngle);
  const p3 = polarToCartesian(cx, cy, innerR, endAngle);
  const p4 = polarToCartesian(cx, cy, innerR, startAngle);

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function getTierDotClass(tier: ChoghadiyaTier): string {
  switch (tier) {
    case 'best':
      return 'bg-amber-400';
    case 'good':
      return 'bg-emerald-500';
    case 'gain':
      return 'bg-lime-500';
    case 'neutral':
      return 'bg-sky-400';
    default:
      return 'bg-rose-500';
  }
}

export const ChoghadiyaClockDial: React.FC<ChoghadiyaClockDialProps> = ({
  currentDate,
  panchang,
  timeline,
  timeFormat = 'auto',
  selectedCountryCode,
}) => {
  const isDark = useDocumentDarkMode();
  const [period, setPeriod] = useState<'beforeNoon' | 'afterNoon'>(timeline.currentPeriod);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  useEffect(() => {
    setPeriod(timeline.currentPeriod);
    setSelectedSegmentId(null);
  }, [timeline.currentPeriod, timeline.cityName]);

  const segments: ChoghadiyaDialSegment[] = useMemo(
    () => (period === 'beforeNoon' ? timeline.beforeNoonSegments : timeline.afterNoonSegments),
    [period, timeline.beforeNoonSegments, timeline.afterNoonSegments]
  );

  // Find live segment matching current clock time within the chosen half-day
  const currentMin12h =
    timeline.currentPeriod === 'beforeNoon'
      ? timeline.currentMinOfDay
      : timeline.currentMinOfDay - 720;

  const liveIndex = useMemo(() => {
    if (segments.length === 0) return -1;
    if (period === timeline.currentPeriod) {
      const idx = segments.findIndex(
        (s) => currentMin12h >= s.startMin12h && currentMin12h < s.endMin12h
      );
      if (idx >= 0) return idx;
    }
    return 0;
  }, [segments, period, timeline.currentPeriod, currentMin12h]);

  const activeIndex = useMemo(() => {
    if (segments.length === 0) return -1;
    if (selectedSegmentId) {
      const idx = segments.findIndex((s) => s.id === selectedSegmentId);
      if (idx >= 0) return idx;
    }
    return Math.max(0, liveIndex);
  }, [segments, selectedSegmentId, liveIndex]);

  const primarySlot = activeIndex >= 0 ? segments[activeIndex] : null;
  const secondarySlot =
    activeIndex >= 0 && segments.length > 1
      ? segments[(activeIndex + 1) % segments.length]
      : null;

  const formatRange = (seg: ChoghadiyaDialSegment | null) => {
    if (!seg) return '--';
    if (timeFormat === '24h') {
      return seg.fullRangeStr;
    }
    // startTimeStr/endTimeStr are already formatted as "hh:mm AM/PM" in location TZ
    return `${seg.startTimeStr} - ${seg.endTimeStr}`;
  };

  const handleStep = (delta: number) => {
    if (segments.length === 0) return;
    const nextIdx = (activeIndex + delta + segments.length) % segments.length;
    setSelectedSegmentId(segments[nextIdx].id);
  };

  // Date badge formatting matching Shubh Panchang layout
  const dayNum = currentDate.getDate();
  const monthYearLabel = currentDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  const weekdayLabel = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  // SVG dial geometry
  const cx = 190;
  const cy = 190;
  const outerR = 166;
  const innerR = 38;
  const numberR = 132;
  const labelR = 94;

  // Wedge gradient IDs per tier (theme-aware)
  const getWedgeFill = (tier: ChoghadiyaTier, isActive: boolean): string => {
    if (isDark) {
      if (isActive) {
        switch (tier) {
          case 'best':
            return 'url(#chog-dark-best-active)';
          case 'good':
            return 'url(#chog-dark-good-active)';
          case 'gain':
            return 'url(#chog-dark-gain-active)';
          case 'neutral':
            return 'url(#chog-dark-neutral-active)';
          default:
            return 'url(#chog-dark-avoid-active)';
        }
      }
      switch (tier) {
        case 'best':
          return 'url(#chog-dark-best)';
        case 'good':
          return 'url(#chog-dark-good)';
        case 'gain':
          return 'url(#chog-dark-gain)';
        case 'neutral':
          return 'url(#chog-dark-neutral)';
        default:
          return 'url(#chog-dark-avoid)';
      }
    }

    // Light mode warm ivory / saffron / jade / slate wedge palette
    if (isActive) {
      switch (tier) {
        case 'best':
          return 'url(#chog-light-best-active)';
        case 'good':
          return 'url(#chog-light-good-active)';
        case 'gain':
          return 'url(#chog-light-gain-active)';
        case 'neutral':
          return 'url(#chog-light-neutral-active)';
        default:
          return 'url(#chog-light-avoid-active)';
      }
    }
    switch (tier) {
      case 'best':
        return 'url(#chog-light-best)';
      case 'good':
        return 'url(#chog-light-good)';
      case 'gain':
        return 'url(#chog-light-gain)';
      case 'neutral':
        return 'url(#chog-light-neutral)';
      default:
        return 'url(#chog-light-avoid)';
    }
  };

  // Clock hand angle: live clock time if viewing current period, otherwise midpoint of selected slot
  const handMin12h =
    period === timeline.currentPeriod && !selectedSegmentId
      ? currentMin12h
      : primarySlot
      ? (primarySlot.startMin12h + primarySlot.endMin12h) / 2
      : 0;
  const handAngle = (handMin12h / 720) * 360 - 90;
  const handTip = polarToCartesian(cx, cy, 112, handAngle);

  if (!timeline.hasLocation || timeline.timezoneMissing) {
    return (
      <div className="p-5 rounded-2xl bg-amber-50/90 dark:bg-slate-800/50 border border-amber-300/80 dark:border-amber-600/35 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
          <MapPin className="w-4 h-4" />
          <span>Choghadiya Clock &amp; Hora Muhurt</span>
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {timeline.timezoneMissing ? 'Timezone required' : 'Location required'}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          {timeline.timezoneMissing
            ? 'Select your geographical IANA timezone above to compute local Choghadiya wedges, Planetary Hora, and Gowri Panchang.'
            : 'Please select your city or enable GPS above so Choghadiya wedges, Hora Muhurt, and Gowri Panchang match your true local Sunrise and Sunset.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#FFFDF7] via-[#FDF6E7] to-[#F9EED7] dark:from-[#1b1710] dark:via-[#14120e] dark:to-[#0f0e0b] border border-amber-300/80 dark:border-amber-600/40 p-4 sm:p-5 shadow-inner transition-colors">
      {/* Top Shubh Panchang Header Strip */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums leading-none text-slate-900 dark:text-white">
            {dayNum}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {monthYearLabel}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {weekdayLabel}
            </div>
            <div className="text-xs font-bold text-amber-700 dark:text-amber-300 mt-1">
              {panchang.hinduMonthEn} {panchang.pakshaHi} {panchang.tithiNameEn.split(' ')[0]}
            </div>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Vikram Samvat {panchang.vikramSamvat}
            </div>
          </div>
        </div>

        {/* Solar & Nakshatra Summary Chip */}
        <div className="px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/70 border border-amber-300/70 dark:border-amber-500/30 text-right">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300">
            Shubh Panchang Dial
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
            {panchang.nakshatraNameEn} • {panchang.hinduMonthHi}
          </div>
          <div className="text-[10px] font-mono text-slate-600 dark:text-slate-300 mt-0.5">
            🌅 {formatTimePreference(panchang.sunriseTime, timeFormat, selectedCountryCode)} · 🌇{' '}
            {formatTimePreference(panchang.sunsetTime, timeFormat, selectedCountryCode)}
          </div>
        </div>
      </div>

      {/* Before 12 PM | After 12 PM Segmented Toggle */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <button
          type="button"
          onClick={() => {
            setPeriod('beforeNoon');
            setSelectedSegmentId(null);
          }}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            period === 'beforeNoon'
              ? 'bg-amber-100/90 dark:bg-amber-950/50 text-amber-950 dark:text-white border-amber-500 dark:border-amber-400 shadow-sm'
              : 'bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-amber-200/80 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-800'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Before 12 PM</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPeriod('afterNoon');
            setSelectedSegmentId(null);
          }}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            period === 'afterNoon'
              ? 'bg-amber-100/90 dark:bg-amber-950/50 text-amber-950 dark:text-white border-amber-500 dark:border-amber-400 shadow-sm'
              : 'bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-amber-200/80 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-800'
          }`}
        >
          <Moon className="w-4 h-4 text-indigo-600 dark:text-amber-300" />
          <span>After 12 PM</span>
        </button>
      </div>

      {/* Flanking Muhurat Callouts + Dial Container */}
      <div className="relative">
        {/* Top Left & Right Readouts */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
              {formatRange(primarySlot)}
            </div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
              <span>{primarySlot?.name || '--'}</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                ({primarySlot?.meaning || '--'})
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  primarySlot ? getTierDotClass(primarySlot.tier) : 'bg-slate-400'
                }`}
              />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {selectedSegmentId ? 'Selected slot' : 'Active slot'}
              </span>
            </div>
          </div>

          <div className="min-w-0 text-right">
            <div className="text-[11px] sm:text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
              {formatRange(secondarySlot)}
            </div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center justify-end gap-1.5">
              <span>{secondarySlot?.name || '--'}</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                ({secondarySlot?.meaning || '--'})
              </span>
            </div>
            <div className="mt-1 flex items-center justify-end gap-1.5">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Next slot
              </span>
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  secondarySlot ? getTierDotClass(secondarySlot.tier) : 'bg-slate-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Center Interactive 12-Hour Radial Dial with Flanking Sun & Moon */}
        <div className="relative flex items-center justify-center my-1">
          {/* Left Sunrise Emblem */}
          <div
            className="hidden sm:flex flex-col items-center mr-1 shrink-0"
            title={`Sunrise: ${panchang.sunriseTime}`}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg shadow-amber-500/30 flex items-center justify-center text-white border-2 border-amber-200 dark:border-amber-400/60">
              <Sun className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 mt-1">
              {formatTimePreference(panchang.sunriseTime, timeFormat, selectedCountryCode)}
            </span>
          </div>

          {/* 12-Hour Interactive SVG Clock */}
          <div className="w-full max-w-[330px] aspect-square relative select-none">
            <svg viewBox="0 0 380 380" className="w-full h-full overflow-visible">
              <defs>
                {/* Dark Mode Wedge Gradients matching Shubh Panchang screenshot */}
                <linearGradient id="chog-dark-best" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#856b20" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#3c3012" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="chog-dark-best-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#b5922b" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#5a4716" stopOpacity="0.72" />
                </linearGradient>

                <linearGradient id="chog-dark-good" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8a5519" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#3d240b" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="chog-dark-good-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#b87122" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#59350f" stopOpacity="0.72" />
                </linearGradient>

                <linearGradient id="chog-dark-gain" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#276b50" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#123428" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="chog-dark-gain-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#348c69" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#184736" stopOpacity="0.72" />
                </linearGradient>

                <linearGradient id="chog-dark-neutral" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#423b32" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#1e1b17" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="chog-dark-neutral-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5c5347" stopOpacity="0.96" />
                  <stop offset="100%" stopColor="#2e2922" stopOpacity="0.75" />
                </linearGradient>

                <linearGradient id="chog-dark-avoid" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2a3545" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#151b26" stopOpacity="0.65" />
                </linearGradient>
                <linearGradient id="chog-dark-avoid-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3c4b62" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#1e2736" stopOpacity="0.78" />
                </linearGradient>

                {/* Light Mode Warm Ivory & Saffron Wedge Gradients */}
                <linearGradient id="chog-light-best" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.35" />
                </linearGradient>
                <linearGradient id="chog-light-best-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fcd34d" stopOpacity="1" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.55" />
                </linearGradient>

                <linearGradient id="chog-light-good" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity="0.32" />
                </linearGradient>
                <linearGradient id="chog-light-good-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fdba74" stopOpacity="1" />
                  <stop offset="100%" stopColor="#c2410c" stopOpacity="0.5" />
                </linearGradient>

                <linearGradient id="chog-light-gain" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="chog-light-gain-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#86efac" stopOpacity="1" />
                  <stop offset="100%" stopColor="#15803d" stopOpacity="0.48" />
                </linearGradient>

                <linearGradient id="chog-light-neutral" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="chog-light-neutral-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#cbd5e1" stopOpacity="1" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.65" />
                </linearGradient>

                <linearGradient id="chog-light-avoid" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fecdd3" stopOpacity="0.82" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.22" />
                </linearGradient>
                <linearGradient id="chog-light-avoid-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fda4af" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#be123c" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Outer Dial Ring */}
              <circle
                cx={cx}
                cy={cy}
                r={outerR + 4}
                fill={isDark ? '#121210' : '#fffaf0'}
                stroke={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(180,130,45,0.3)'}
                strokeWidth="1.5"
              />

              {/* Choghadiya Wedges */}
              {segments.map((seg) => {
                const isActive = primarySlot?.id === seg.id;
                const pathD = createWedgePath(
                  cx,
                  cy,
                  innerR,
                  outerR,
                  seg.startMin12h,
                  seg.endMin12h
                );
                const midMin12h = (seg.startMin12h + seg.endMin12h) / 2;
                const midAngle = (midMin12h / 720) * 360 - 90;
                const textPos = polarToCartesian(cx, cy, labelR, midAngle);
                // Keep text readable upright inside radial spoke
                let textRot = midAngle;
                if (midAngle > 90 && midAngle < 270) {
                  textRot = midAngle + 180;
                }

                return (
                  <g
                    key={seg.id}
                    onClick={() => setSelectedSegmentId(seg.id)}
                    className="cursor-pointer transition-opacity hover:opacity-95"
                  >
                    <path
                      d={pathD}
                      fill={getWedgeFill(seg.tier, isActive)}
                      stroke={
                        isActive
                          ? isDark
                            ? '#fbbf24'
                            : '#b45309'
                          : isDark
                          ? 'rgba(255,255,255,0.09)'
                          : 'rgba(180,130,45,0.22)'
                      }
                      strokeWidth={isActive ? '2' : '1'}
                    />
                    {seg.endMin12h - seg.startMin12h >= 38 && (
                      <text
                        x={textPos.x}
                        y={textPos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${textRot}, ${textPos.x}, ${textPos.y})`}
                        fill={
                          isDark
                            ? '#f8fafc'
                            : seg.tier === 'avoid'
                            ? '#881337'
                            : '#1e293b'
                        }
                        fontSize="11.5"
                        fontWeight="700"
                        letterSpacing="0.02em"
                        className="pointer-events-none"
                      >
                        {seg.name}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* 12 Hour Markers (12, 1..11) */}
              {Array.from({ length: 12 }, (_, idx) => {
                const hourNum = idx === 0 ? 12 : idx;
                const angle = idx * 30 - 90;
                const pos = polarToCartesian(cx, cy, numberR, angle);
                return (
                  <g key={hourNum} className="pointer-events-none">
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="11.5"
                      fill={isDark ? '#f5efe0' : '#ffffff'}
                      stroke={isDark ? 'rgba(217,119,6,0.45)' : 'rgba(180,130,45,0.45)'}
                      strokeWidth="1.2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 0.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#1e293b"
                      fontSize="11"
                      fontWeight="800"
                    >
                      {hourNum}
                    </text>
                  </g>
                );
              })}

              {/* Center Ring & Lunar Disc */}
              <circle
                cx={cx}
                cy={cy}
                r={innerR}
                fill={isDark ? '#181a20' : '#fef9eb'}
                stroke={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(217,119,6,0.55)'}
                strokeWidth="1.5"
              />
              <circle
                cx={cx}
                cy={cy}
                r={innerR - 9}
                fill={isDark ? '#253147' : '#fef3c7'}
                stroke={isDark ? 'rgba(148,163,184,0.4)' : 'rgba(245,158,11,0.5)'}
                strokeWidth="1"
              />
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="20"
                className="pointer-events-none"
              >
                {period === 'beforeNoon' ? '🌞' : '🌕'}
              </text>

              {/* Clock Hand Needle */}
              <line
                x1={cx}
                y1={cy}
                x2={handTip.x}
                y2={handTip.y}
                stroke={isDark ? '#f59e0b' : '#b45309'}
                strokeWidth="2.5"
                strokeLinecap="round"
                className="pointer-events-none"
              />
              <circle
                cx={cx}
                cy={cy}
                r="4"
                fill={isDark ? '#fbbf24' : '#d97706'}
                className="pointer-events-none"
              />
            </svg>
          </div>

          {/* Right Sunset / Moon Emblem */}
          <div
            className="hidden sm:flex flex-col items-center ml-1 shrink-0"
            title={`Sunset: ${panchang.sunsetTime}`}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white border-2 border-indigo-200 dark:border-indigo-400/60">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-800 dark:text-amber-300 mt-1">
              {formatTimePreference(panchang.sunsetTime, timeFormat, selectedCountryCode)}
            </span>
          </div>
        </div>

        {/* Bottom Prev/Next Navigation Arrows */}
        <div className="flex items-center justify-between text-xs mt-1">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            aria-label="Previous Choghadiya slot"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-amber-300/70 dark:border-slate-700 font-semibold cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
            Tap any wedge to inspect timing
          </span>

          <button
            type="button"
            onClick={() => handleStep(1)}
            aria-label="Next Choghadiya slot"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-amber-300/70 dark:border-slate-700 font-semibold cursor-pointer transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Hora Muhurt & Gowri Panchang Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {/* Hora Muhurt */}
        <div className="p-3.5 rounded-xl bg-white/85 dark:bg-slate-900/80 border border-amber-200/90 dark:border-amber-500/25 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Hora muhurt</span>
            </div>
            {timeline.currentHora ? (
              <>
                <div className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 mt-1">
                  {timeline.currentHora.startTimeStr} - {timeline.currentHora.endTimeStr}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {timeline.currentHora.planetEn} ({timeline.currentHora.planetHi})
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {timeline.currentHora.guidance}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">--</div>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-lg shrink-0">
            🪐
          </div>
        </div>

        {/* Gowri Panchang */}
        <div className="p-3.5 rounded-xl bg-white/85 dark:bg-slate-900/80 border border-amber-200/90 dark:border-amber-500/25 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Gowri panchang</span>
            </div>
            {timeline.currentGowri ? (
              <>
                <div className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 mt-1">
                  {timeline.currentGowri.startTimeStr} - {timeline.currentGowri.endTimeStr}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {timeline.currentGowri.nameEn} ({timeline.currentGowri.nameHi})
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {timeline.currentGowri.meaning}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">--</div>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
            🪔
          </div>
        </div>
      </div>
    </div>
  );
};
