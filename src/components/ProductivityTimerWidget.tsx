import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
} from 'lucide-react';

interface ProductivityTimerWidgetProps {
  onSessionComplete?: (sessionName: string, durationMinutes: number) => void;
}

export const ProductivityTimerWidget: React.FC<ProductivityTimerWidgetProps> = ({
  onSessionComplete,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // minutes
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedRoutine, setSelectedRoutine] = useState<string>('Deep Focus');
  const [completedSessions, setCompletedSessions] = useState<number>(2);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const routinePresets = [
    { label: 'Deep Focus', duration: 25, icon: '🎯' },
    { label: 'Power Sprint', duration: 15, icon: '⚡' },
    { label: 'Health & Workout', duration: 30, icon: '🏃' },
    { label: 'Reading & Journal', duration: 20, icon: '📖' },
    { label: 'Quick Break', duration: 5, icon: '☕' },
  ];

  // Tick timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isRunning) {
      setIsRunning(false);
      setCompletedSessions((c) => c + 1);
      if (onSessionComplete) {
        onSessionComplete(selectedRoutine, selectedDuration);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerSeconds, selectedRoutine, selectedDuration, onSessionComplete]);

  const handleSelectRoutine = (routine: (typeof routinePresets)[0]) => {
    setSelectedRoutine(routine.label);
    setSelectedDuration(routine.duration);
    setTimerSeconds(routine.duration * 60);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimerSeconds(selectedDuration * 60);
  };

  const formatTimer = () => {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress percentage
  const totalSeconds = selectedDuration * 60;
  const progressPercent = Math.round(((totalSeconds - timerSeconds) / totalSeconds) * 100);

  return (
    <div className="rounded-3xl bg-slate-900 border border-indigo-900/40 text-slate-100 shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border-b border-indigo-900/30 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-xs">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">
                Daily Routine & Productivity Focus Timer
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 font-semibold">
                {completedSessions} sessions done today
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Smooth routine management for focused work, fitness, and lifestyle habits.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>{isCollapsed ? 'Show Timer' : 'Minimize'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isCollapsed && (
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Preset Buttons */}
          <div className="w-full md:w-auto flex flex-wrap gap-2">
            {routinePresets.map((r) => (
              <button
                key={r.label}
                onClick={() => handleSelectRoutine(r)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  selectedRoutine === r.label
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
                <span className="text-[10px] opacity-75">({r.duration}m)</span>
              </button>
            ))}
          </div>

          {/* Central Timer & Controls */}
          <div className="flex items-center gap-5">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold text-center md:text-right">
                {selectedRoutine}
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-black text-amber-300 tracking-wider text-center md:text-right">
                {formatTimer()}
              </div>
              {/* Mini Progress Bar */}
              <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Play / Pause / Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                title={isRunning ? 'Pause Timer' : 'Start Focus Session'}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-all border border-slate-700 cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
