import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 dark:bg-emerald-950/95 text-white border border-emerald-400/40 px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur-md"
    >
      <WifiOff className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
      <span>Offline Mode — Viewing cached calendar data</span>
    </div>
  );
};
