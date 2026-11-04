import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../services/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500/90 border border-amber-400 text-slate-950 px-3 py-1.5 text-xs font-bold shadow-xl backdrop-blur-md">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Offline Mode — All 3D Puzzles & Low-Code Engine Cached Locally!</span>
    </div>
  );
};
