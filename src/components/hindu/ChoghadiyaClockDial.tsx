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

function createOuterArcPath(
  cx: number,
  cy: number,
  radius: number,
  startMin12h: number,
  endMin12h: number
): string {
  const span = Math.max(1, endMin12h - startMin12h);
  const clampedSpan = Math.min(719.5, span);
  const startAngle = (startMin12h / 720) * 360 - 90;
  const endAngle = ((startMin12h + clampedSpan) / 720) * 360 - 90;
  const largeArc = clampedSpan > 360 ? 1 : 0;
  const p1 = polarToCartesian(cx, cy, radius, startAngle);
  const p2 = polarToCartesian(cx, cy, radius, endAngle);
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

function getTierStyles(tier: ChoghadiyaTier): {
  dot: string;
  pillLight: string;
  pillDark: string;
  rimStroke: string;
} {
  switch (tier) {
    case 'best':
      return {
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.75)]',
        pillLight: 'bg-amber-100/90 text-amber-900 border-amber-300',
        pillDark: 'dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-400/40',
        rimStroke: '#f59e0b',
      };
    case 'good':
      return {
        dot: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.75)]',
        pillLight: 'bg-orange-100/90 text-orange-900 border-orange-300',
        pillDark: 'dark:bg-orange-500/20 dark:text-orange-200 dark:border-orange-400/40',
        rimStroke: '#fb923c',
      };
    case 'gain':
      return {
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]',
        pillLight: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
        pillDark: 'dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-400/40',
        rimStroke: '#34d399',
      };
    case 'neutral':
      return {
        dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.65)]',
        pillLight: 'bg-slate-100 text-slate-800 border-slate-300',
        pillDark: 'dark:bg-slate-600/30 dark:text-slate-200 dark:border-slate-500/40',
        rimStroke: '#94a3b8',
      };
    default:
      return {
        dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.65)]',
        pillLight: 'bg-rose-100/90 text-rose-900 border-rose-300',
        pillDark: 'dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-400/40',
        rimStroke: '#fb7185',
      };
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
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);

  useEffect(() => {
    setPeriod(timeline.currentPeriod);
    setSelectedSegmentId(null);
  }, [timeline.currentPeriod, timeline.cityName]);

  const segments: ChoghadiyaDialSegment[] = useMemo(
    () => (period === 'beforeNoon' ? timeline.beforeNoonSegments : timeline.afterNoonSegments),
    [period, timeline.beforeNoonSegments, timeline.afterNoonSegments]
  );

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
    const targetId = hoveredSegmentId || selectedSegmentId;
    if (targetId) {
      const idx = segments.findIndex((s) => s.id === targetId);
      if (idx >= 0) return idx;
    }
    return Math.max(0, liveIndex);
  }, [segments, hoveredSegmentId, selectedSegmentId, liveIndex]);

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
    return `${seg.startTimeStr} - ${seg.endTimeStr}`;
  };

  const handleStep = (delta: number) => {
    if (segments.length === 0) return;
    const nextIdx = (activeIndex + delta + segments.length) % segments.length;
    setSelectedSegmentId(segments[nextIdx].id);
  };

  const dayNum = currentDate.getDate();
  const monthYearLabel = currentDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  const weekdayLabel = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  // Astrolabe SVG geometry (420x420 viewBox for crispness & spacing)
  const cx = 210;
  const cy = 210;
  const bezelOuterR = 192;
  const outerR = 180;
  const numberR = 152;
  const labelR = 102;
  const innerR = 44;

  const getWedgeFill = (tier: ChoghadiyaTier, isActive: boolean): string => {
    const mode = isDark ? 'dark' : 'light';
    const suffix = isActive ? '-active' : '';
    return `url(#chog-rad-${mode}-${tier}${suffix})`;
  };

  const handMin12h =
    period === timeline.currentPeriod && !selectedSegmentId && !hoveredSegmentId
      ? currentMin12h
      : primarySlot
      ? (primarySlot.startMin12h + primarySlot.endMin12h) / 2
      : 0;
  const handAngle = (handMin12h / 720) * 360 - 90;
  const handTip = polarToCartesian(cx, cy, 128, handAngle);
  const handTail = polarToCartesian(cx, cy, 22, handAngle + 180);

  if (!timeline.hasLocation || timeline.timezoneMissing) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 dark:from-[#1b1710] dark:via-slate-900/90 dark:to-[#120e09] border border-amber-300/80 dark:border-amber-600/35 text-center space-y-2 shadow-inner">
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

  const primaryTierStyles = primarySlot ? getTierStyles(primarySlot.tier) : null;
  const secondaryTierStyles = secondarySlot ? getTierStyles(secondarySlot.tier) : null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#DFC9A1] dark:border-[#3B2C1B] bg-gradient-to-b from-[#FFFEFA] via-[#FDF5E2] to-[#F6E6C6] dark:from-[#18130D] dark:via-[#120F0A] dark:to-[#0A0806] p-4 sm:p-6 shadow-md dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)] transition-colors">
      {/* Subtle Celestial Ambient Glows & Sacred Mandala Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full bg-radial from-amber-400/20 via-orange-300/10 to-transparent dark:from-amber-500/15 dark:via-amber-700/5 dark:to-transparent blur-2xl" />
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-amber-300/15 dark:bg-amber-500/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-amber-200/15 dark:bg-slate-600/10 blur-3xl" />
        {/* Faint Sacred Concentric Mandala Lines behind Dial */}
        <svg
          viewBox="0 0 600 600"
          className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] opacity-[0.07] dark:opacity-[0.09] text-amber-800 dark:text-amber-300"
        >
          <circle cx="300" cy="300" r="245" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="300" cy="300" r="272" fill="none" stroke="currentColor" strokeWidth="0.8" />
          {Array.from({ length: 12 }, (_, i) => {
            const ang = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={300 + 210 * Math.cos(ang)}
                y1={300 + 210 * Math.sin(ang)}
                x2={300 + 280 * Math.cos(ang)}
                y2={300 + 280 * Math.sin(ang)}
                stroke="currentColor"
                strokeWidth="0.9"
              />
            );
          })}
        </svg>
      </div>

      <div className="relative z-10">
        {/* Top Shubh Panchang Header Strip */}
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-start gap-3">
            <div className="px-3 py-2 rounded-2xl bg-white/80 dark:bg-white/[0.05] backdrop-blur-md border border-amber-300/80 dark:border-amber-500/30 shadow-xs text-center min-w-[54px]">
              <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums leading-none text-slate-900 dark:text-white">
                {dayNum}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mt-1">
                {monthYearLabel.split(' ')[0]}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight flex items-center gap-1.5">
                <span>{weekdayLabel}</span>
                <span className="text-slate-400 dark:text-slate-500">·</span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {currentDate.getFullYear()}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-amber-800 dark:text-amber-300 mt-0.5">
                {panchang.hinduMonthEn} {panchang.pakshaHi} · {panchang.tithiNameEn.split(' ')[0]}
              </div>
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                Vikram Samvat {panchang.vikramSamvat} · {panchang.hinduMonthHi}
              </div>
            </div>
          </div>

          {/* Solar & Nakshatra Glassmorphic Chip */}
          <div className="px-3.5 py-2 rounded-2xl backdrop-blur-md bg-white/75 dark:bg-white/[0.05] border border-amber-300/80 dark:border-amber-500/30 text-right shadow-xs">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-700 dark:text-amber-300">
              Shubh Panchang Astrolabe
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
              {panchang.nakshatraNameEn} ({panchang.nakshatraNameHi})
            </div>
            <div className="text-[10px] font-mono text-slate-600 dark:text-slate-300 mt-0.5">
              🌅 {formatTimePreference(panchang.sunriseTime, timeFormat, selectedCountryCode)} · 🌇{' '}
              {formatTimePreference(panchang.sunsetTime, timeFormat, selectedCountryCode)}
            </div>
          </div>
        </div>

        {/* Before 12 PM | After 12 PM Glassmorphic Toggle */}
        <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-amber-950/[0.05] dark:bg-white/[0.04] border border-amber-300/60 dark:border-amber-500/20 mb-5">
          <button
            type="button"
            onClick={() => {
              setPeriod('beforeNoon');
              setSelectedSegmentId(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              period === 'beforeNoon'
                ? 'bg-gradient-to-r from-amber-100 to-orange-100/90 dark:from-amber-900/55 dark:to-amber-950/75 text-amber-950 dark:text-white border-amber-400 dark:border-amber-400/70 shadow-sm'
                : 'bg-transparent text-slate-600 dark:text-slate-300 border-transparent hover:bg-white/60 dark:hover:bg-white/[0.06]'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-600 dark:text-amber-300" />
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
                ? 'bg-gradient-to-r from-amber-100 to-orange-100/90 dark:from-amber-900/55 dark:to-amber-950/75 text-amber-950 dark:text-white border-amber-400 dark:border-amber-400/70 shadow-sm'
                : 'bg-transparent text-slate-600 dark:text-slate-300 border-transparent hover:bg-white/60 dark:hover:bg-white/[0.06]'
            }`}
          >
            <Moon className="w-4 h-4 text-slate-700 dark:text-amber-300" />
            <span>After 12 PM</span>
          </button>
        </div>

        {/* Top Left & Right Glassmorphic Muhurat Callout Cards */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 rounded-2xl backdrop-blur-md bg-white/75 dark:bg-white/[0.04] border border-amber-300/70 dark:border-amber-500/25 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                {hoveredSegmentId ? 'Previewing' : selectedSegmentId ? 'Selected Slot' : 'Active Muhurat'}
              </span>
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  primaryTierStyles ? primaryTierStyles.dot : 'bg-slate-400'
                }`}
              />
            </div>
            <div className="text-[11px] sm:text-xs font-mono font-bold text-amber-800 dark:text-amber-300 mt-1 truncate">
              {formatRange(primarySlot)}
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{primarySlot?.name || '--'}</span>
              {primarySlot && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${primaryTierStyles?.pillLight} ${primaryTierStyles?.pillDark}`}
                >
                  {primarySlot.meaning}
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl backdrop-blur-md bg-white/75 dark:bg-white/[0.04] border border-amber-300/70 dark:border-amber-500/25 shadow-xs text-right">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  secondaryTierStyles ? secondaryTierStyles.dot : 'bg-slate-400'
                }`}
              />
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Upcoming Next
              </span>
            </div>
            <div className="text-[11px] sm:text-xs font-mono font-bold text-amber-800 dark:text-amber-300 mt-1 truncate">
              {formatRange(secondarySlot)}
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center justify-end gap-1.5 flex-wrap">
              {secondarySlot && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${secondaryTierStyles?.pillLight} ${secondaryTierStyles?.pillDark}`}
                >
                  {secondarySlot.meaning}
                </span>
              )}
              <span>{secondarySlot?.name || '--'}</span>
            </div>
          </div>
        </div>

        {/* Center Interactive 12-Hour Astrolabe Dial with Horizon Sun & Moon */}
        <div className="relative flex items-center justify-center my-2">
          {/* Left Sunrise Emblem */}
          <div
            className="hidden sm:flex flex-col items-center mr-2 shrink-0"
            title={`Sunrise: ${panchang.sunriseTime}`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-orange-500 shadow-[0_0_24px_rgba(245,158,11,0.45)] flex items-center justify-center text-white border-2 border-amber-100 dark:border-amber-300/70">
              <Sun className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-900 dark:text-amber-300 mt-1.5 px-2 py-0.5 rounded-full bg-white/70 dark:bg-white/[0.06] border border-amber-200 dark:border-amber-500/20">
              {formatTimePreference(panchang.sunriseTime, timeFormat, selectedCountryCode)}
            </span>
          </div>

          {/* 12-Hour Interactive Radial SVG Astrolabe */}
          <div className="w-full max-w-[360px] sm:max-w-[395px] aspect-square relative select-none">
            <svg viewBox="0 0 420 420" className="w-full h-full overflow-visible drop-shadow-sm">
              <defs>
                {/* Soft Aura Filter for Active Wedge & Center Orb */}
                <filter id="chog-active-glow" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.45" />
                </filter>

                {/* Radial Center Moon & Sun Discs */}
                <radialGradient id="chog-sun-orb" cx="38%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="55%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </radialGradient>
                <radialGradient id="chog-moon-orb" cx="35%" cy="32%" r="68%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="55%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#475569" />
                </radialGradient>

                {/* Dark Mode Symmetric Radial Enamel Gradients */}
                <radialGradient id="chog-rad-dark-best" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#3a2f12" stopOpacity="0.72" />
                  <stop offset="68%" stopColor="#8f7222" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#b9962f" stopOpacity="0.95" />
                </radialGradient>
                <radialGradient id="chog-rad-dark-best-active" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#5c4918" stopOpacity="0.9" />
                  <stop offset="68%" stopColor="#c9a232" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
                </radialGradient>

                <radialGradient id="chog-rad-dark-good" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#3d220d" stopOpacity="0.72" />
                  <stop offset="68%" stopColor="#94571c" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#c77828" stopOpacity="0.95" />
                </radialGradient>
                <radialGradient id="chog-rad-dark-good-active" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#5c3310" stopOpacity="0.9" />
                  <stop offset="68%" stopColor="#cc7924" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity="1" />
                </radialGradient>

                <radialGradient id="chog-rad-dark-gain" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#12362a" stopOpacity="0.72" />
                  <stop offset="68%" stopColor="#267355" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#349c74" stopOpacity="0.95" />
                </radialGradient>
                <radialGradient id="chog-rad-dark-gain-active" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#184d3b" stopOpacity="0.92" />
                  <stop offset="68%" stopColor="#329972" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                </radialGradient>

                <radialGradient id="chog-rad-dark-neutral" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#1e1c1a" stopOpacity="0.75" />
                  <stop offset="68%" stopColor="#3b3630" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#524a42" stopOpacity="0.92" />
                </radialGradient>
                <radialGradient id="chog-rad-dark-neutral-active" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#2e2a25" stopOpacity="0.92" />
                  <stop offset="68%" stopColor="#595046" stopOpacity="0.96" />
                  <stop offset="100%" stopColor="#786c5f" stopOpacity="1" />
                </radialGradient>

                <radialGradient id="chog-rad-dark-avoid" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#141b26" stopOpacity="0.78" />
                  <stop offset="68%" stopColor="#263345" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#364761" stopOpacity="0.92" />
                </radialGradient>
                <radialGradient id="chog-rad-dark-avoid-active" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#1d2838" stopOpacity="0.94" />
                  <stop offset="68%" stopColor="#384c66" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#506a8d" stopOpacity="1" />
                </radialGradient>

                {/* Light Mode Symmetric Radial Silk & Saffron Gradients */}
                <radialGradient id="chog-rad-light-best" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#fffbeb" stopOpacity="0.92" />
                  <stop offset="68%" stopColor="#fde68a" stopOpacity="0.94" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.82" />
                </radialGradient>
                <radialGradient id="chog-rad-light-best-active" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#fef3c7" stopOpacity="0.98" />
                  <stop offset="68%" stopColor="#fcd34d" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.95" />
                </radialGradient>

                <radialGradient id="chog-rad-light-good" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#fff7ed" stopOpacity="0.92" />
                  <stop offset="68%" stopColor="#fed7aa" stopOpacity="0.94" />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity="0.72" />
                </radialGradient>
                <radialGradient id="chog-rad-light-good-active" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#ffedd5" stopOpacity="0.98" />
                  <stop offset="68%" stopColor="#fdba74" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.88" />
                </radialGradient>

                <radialGradient id="chog-rad-light-gain" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#ecfdf5" stopOpacity="0.92" />
                  <stop offset="68%" stopColor="#a7f3d0" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.72" />
                </radialGradient>
                <radialGradient id="chog-rad-light-gain-active" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#d1fae5" stopOpacity="0.98" />
                  <stop offset="68%" stopColor="#6ee7b7" stopOpacity="1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.88" />
                </radialGradient>

                <radialGradient id="chog-rad-light-neutral" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#f8fafc" stopOpacity="0.92" />
                  <stop offset="68%" stopColor="#e2e8f0" stopOpacity="0.94" />
                  <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.85" />
                </radialGradient>
                <radialGradient id="chog-rad-light-neutral-active" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#f1f5f9" stopOpacity="0.98" />
                  <stop offset="68%" stopColor="#cbd5e1" stopOpacity="1" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.9" />
                </radialGradient>

                <radialGradient id="chog-rad-light-avoid" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#fff1f2" stopOpacity="0.9" />
                  <stop offset="68%" stopColor="#fecdd3" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#fda4af" stopOpacity="0.68" />
                </radialGradient>
                <radialGradient id="chog-rad-light-avoid-active" cx="50%" cy="50%" r="55%">
                  <stop offset="18%" stopColor="#ffe4e6" stopOpacity="0.98" />
                  <stop offset="68%" stopColor="#fda4af" stopOpacity="0.96" />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity="0.85" />
                </radialGradient>
              </defs>

              {/* Outer Astrolabe Brass Bezel & Precision Tick Marks */}
              <circle
                cx={cx}
                cy={cy}
                r={bezelOuterR}
                fill={isDark ? '#0e0d0a' : '#fffaf0'}
                stroke={isDark ? 'rgba(245,158,11,0.35)' : 'rgba(180,120,30,0.4)'}
                strokeWidth="1.5"
              />
              <circle
                cx={cx}
                cy={cy}
                r={outerR + 2}
                fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(180,120,30,0.22)'}
                strokeWidth="1"
              />
              {Array.from({ length: 48 }, (_, i) => {
                const ang = i * 7.5 - 90;
                const isMajor = i % 4 === 0;
                const pStart = polarToCartesian(cx, cy, bezelOuterR - 2, ang);
                const pEnd = polarToCartesian(
                  cx,
                  cy,
                  isMajor ? bezelOuterR - 9 : bezelOuterR - 5.5,
                  ang
                );
                return (
                  <line
                    key={i}
                    x1={pStart.x}
                    y1={pStart.y}
                    x2={pEnd.x}
                    y2={pEnd.y}
                    stroke={
                      isDark
                        ? isMajor
                          ? 'rgba(251,191,36,0.55)'
                          : 'rgba(255,255,255,0.18)'
                        : isMajor
                        ? 'rgba(180,83,9,0.55)'
                        : 'rgba(180,120,30,0.25)'
                    }
                    strokeWidth={isMajor ? '1.6' : '0.9'}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Choghadiya Radial Pie Wedges */}
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
                let textRot = midAngle;
                if (midAngle > 90 && midAngle < 270) {
                  textRot = midAngle + 180;
                }
                const spanMin = seg.endMin12h - seg.startMin12h;
                const showSubLabel = spanMin >= 62;
                const tierRim = getTierStyles(seg.tier).rimStroke;

                return (
                  <g
                    key={seg.id}
                    onClick={() => setSelectedSegmentId(seg.id)}
                    onMouseEnter={() => setHoveredSegmentId(seg.id)}
                    onMouseLeave={() => setHoveredSegmentId(null)}
                    filter={isActive ? 'url(#chog-active-glow)' : undefined}
                    className="cursor-pointer transition-opacity duration-150"
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
                          ? 'rgba(15,15,12,0.75)'
                          : 'rgba(255,250,240,0.85)'
                      }
                      strokeWidth={isActive ? '2' : '1.4'}
                    />
                    {/* Crisp Colored Outer Rim Accent Arc for Each Wedge */}
                    <path
                      d={createOuterArcPath(cx, cy, outerR - 1.5, seg.startMin12h, seg.endMin12h)}
                      fill="none"
                      stroke={tierRim}
                      strokeOpacity={isActive ? 0.95 : 0.45}
                      strokeWidth={isActive ? '3' : '1.8'}
                      className="pointer-events-none"
                    />
                    {spanMin >= 34 && (
                      <g
                        transform={`rotate(${textRot}, ${textPos.x}, ${textPos.y})`}
                        className="pointer-events-none"
                      >
                        <text
                          x={textPos.x}
                          y={showSubLabel ? textPos.y - 5 : textPos.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={
                            isDark
                              ? '#ffffff'
                              : seg.tier === 'avoid'
                              ? '#881337'
                              : '#0f172a'
                          }
                          fontSize={spanMin >= 55 ? '12.5' : '10.5'}
                          fontWeight="800"
                          letterSpacing="0.02em"
                        >
                          {seg.name}
                        </text>
                        {showSubLabel && (
                          <text
                            x={textPos.x}
                            y={textPos.y + 8}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={
                              isDark
                                ? 'rgba(248,250,252,0.78)'
                                : seg.tier === 'avoid'
                                ? '#9f1239'
                                : '#475569'
                            }
                            fontSize="8.5"
                            fontWeight="700"
                          >
                            {seg.nameHi}
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Inner Subtle Guide Ring */}
              <circle
                cx={cx}
                cy={cy}
                r={numberR}
                fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(180,130,45,0.16)'}
                strokeWidth="0.8"
                strokeDasharray="2 4"
                className="pointer-events-none"
              />

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
                      r="12"
                      fill={isDark ? '#faf4e6' : '#ffffff'}
                      stroke={isDark ? 'rgba(245,158,11,0.55)' : 'rgba(180,120,30,0.5)'}
                      strokeWidth="1.25"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 0.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#0f172a"
                      fontSize="11"
                      fontWeight="800"
                    >
                      {hourNum}
                    </text>
                  </g>
                );
              })}

              {/* Center Medallion & Shaded Celestial Disc */}
              <circle
                cx={cx}
                cy={cy}
                r={innerR}
                fill={isDark ? '#141310' : '#fffdf5'}
                stroke={isDark ? 'rgba(251,191,36,0.55)' : 'rgba(217,119,6,0.65)'}
                strokeWidth="2"
              />
              <circle
                cx={cx}
                cy={cy}
                r={innerR - 7}
                fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(217,119,6,0.28)'}
                strokeWidth="1"
              />
              <circle
                cx={cx}
                cy={cy}
                r={22}
                fill={period === 'beforeNoon' ? 'url(#chog-sun-orb)' : 'url(#chog-moon-orb)'}
                stroke={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(180,83,9,0.35)'}
                strokeWidth="1"
              />
              {/* Subtle Moon Craters or Solar Halo Detail */}
              {period === 'afterNoon' ? (
                <g opacity="0.28" fill="#334155" className="pointer-events-none">
                  <circle cx={cx - 6} cy={cy - 5} r="3.5" />
                  <circle cx={cx + 7} cy={cy + 3} r="4.5" />
                  <circle cx={cx - 3} cy={cy + 8} r="2.2" />
                </g>
              ) : (
                <circle
                  cx={cx}
                  cy={cy}
                  r="14"
                  fill="none"
                  stroke="#fef9c3"
                  strokeOpacity="0.65"
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                  className="pointer-events-none"
                />
              )}

              {/* Sleek Astrolabe Clock Needle */}
              <line
                x1={handTail.x}
                y1={handTail.y}
                x2={handTip.x}
                y2={handTip.y}
                stroke={isDark ? '#fbbf24' : '#b45309'}
                strokeWidth="2.8"
                strokeLinecap="round"
                className="pointer-events-none"
              />
              <circle
                cx={handTip.x}
                cy={handTip.y}
                r="3.2"
                fill={isDark ? '#fde68a' : '#d97706'}
                className="pointer-events-none"
              />
              <circle
                cx={cx}
                cy={cy}
                r="5"
                fill={isDark ? '#fbbf24' : '#d97706'}
                stroke={isDark ? '#18181b' : '#ffffff'}
                strokeWidth="1.5"
                className="pointer-events-none"
              />
            </svg>
          </div>

          {/* Right Sunset / Moon Emblem — Deep Twilight Slate-Indigo */}
          <div
            className="hidden sm:flex flex-col items-center ml-2 shrink-0"
            title={`Sunset: ${panchang.sunsetTime}`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 via-indigo-900 to-slate-950 shadow-[0_0_20px_rgba(30,41,59,0.35)] flex items-center justify-center text-amber-100 border-2 border-amber-200/70 dark:border-amber-400/40">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-amber-300 mt-1.5 px-2 py-0.5 rounded-full bg-white/75 dark:bg-white/[0.06] border border-[#DFC9A1] dark:border-amber-500/20">
              {formatTimePreference(panchang.sunsetTime, timeFormat, selectedCountryCode)}
            </span>
          </div>
        </div>

        {/* Bottom Prev/Next Navigation & Compact Tier Legend */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs mt-2">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            aria-label="Previous Choghadiya slot"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/80 dark:bg-white/[0.06] hover:bg-amber-100 dark:hover:bg-white/[0.12] text-slate-800 dark:text-slate-100 border border-amber-300/80 dark:border-amber-500/25 font-semibold cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Amrit / Shubh</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Laabh</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Avoid</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleStep(1)}
            aria-label="Next Choghadiya slot"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/80 dark:bg-white/[0.06] hover:bg-amber-100 dark:hover:bg-white/[0.12] text-slate-800 dark:text-slate-100 border border-amber-300/80 dark:border-amber-500/25 font-semibold cursor-pointer transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Hora Muhurt & Gowri Panchang Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Hora Muhurt */}
          <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-white/[0.04] border border-amber-200/90 dark:border-amber-500/25 flex items-center justify-between gap-3 shadow-xs">
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
            <div className="w-10 h-10 rounded-full bg-amber-100/90 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-lg shrink-0">
              🪐
            </div>
          </div>

          {/* Gowri Panchang */}
          <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-white/[0.04] border border-amber-200/90 dark:border-amber-500/25 flex items-center justify-between gap-3 shadow-xs">
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
            <div className="w-10 h-10 rounded-full bg-emerald-100/90 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
              🪔
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
