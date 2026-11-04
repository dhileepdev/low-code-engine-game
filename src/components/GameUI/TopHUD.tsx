import React from 'react';
import { ArrowLeft, Code2, Edit3, Gem, Key, Play, RotateCcw, Undo2, Volume2, VolumeX } from 'lucide-react';
import { GameState, KeyColor } from '../../types/puzzle';
import { PWAInstallButton } from './PWAInstallButton';

interface TopHUDProps {
  gameState: GameState;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onRestartLevel: () => void;
  onUndo: () => void;
  onOpenRulesModal: () => void;
  onBackToTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  gameState,
  isEditMode,
  onToggleEditMode,
  onRestartLevel,
  onUndo,
  onOpenRulesModal,
  onBackToTitle,
  isMuted,
  onToggleMute,
}) => {
  const keysArray = Array.from(gameState.inventory.keys);
  const canUndo = (gameState.history?.length || 0) > 0;

  const keyColorClass = (color: KeyColor) => {
    switch (color) {
      case 'red': return 'text-red-400 bg-red-950/60 border-red-800';
      case 'blue': return 'text-blue-400 bg-blue-950/60 border-blue-800';
      case 'green': return 'text-green-400 bg-green-950/60 border-green-800';
      case 'yellow': return 'text-yellow-400 bg-yellow-950/60 border-yellow-800';
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-3 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Left: Back button & Title badge */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onBackToTitle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold shadow transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          Levels
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow">
          <span className="text-xs font-bold text-white tracking-wide">{gameState.level.title}</span>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
            {gameState.level.difficulty}
          </span>
        </div>
      </div>

      {/* Center: Inventory & Stat Readouts */}
      {!isEditMode && (
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Gems Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-sky-300 shadow">
            <Gem className="w-4 h-4 text-sky-400 fill-sky-400/20" />
            <span className="tabular-nums font-mono text-sm">{gameState.inventory.gems}</span>
          </div>

          {/* Key Inventory */}
          {keysArray.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-800 shadow">
              {keysArray.map((color) => (
                <span key={color} className={`p-1 rounded-lg border ${keyColorClass(color)}`}>
                  <Key className="w-3.5 h-3.5" />
                </span>
              ))}
            </div>
          )}

          {/* Steps Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 shadow">
            <span className="text-slate-400 uppercase text-[10px]">Moves:</span>
            <span className="tabular-nums font-mono text-sm text-amber-400">{gameState.moves}</span>
          </div>
        </div>
      )}

      {/* Right: Controls & Mode Switcher */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <PWAInstallButton />

        {/* Low-code rules button */}
        <button
          onClick={onOpenRulesModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 text-xs font-semibold shadow transition active:scale-95"
        >
          <Code2 className="w-4 h-4 text-purple-400" />
          <span>Rules ({gameState.level.rules.length})</span>
        </button>

        {/* Undo Move Button */}
        {!isEditMode && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow transition active:scale-95 ${
              canUndo
                ? 'bg-slate-900/80 hover:bg-slate-800 text-amber-300 border-amber-500/40'
                : 'bg-slate-950/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-50'
            }`}
            title="Undo Last Move (Ctrl+Z / U)"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </button>
        )}

        {/* Edit / Play Mode Toggle */}
        <button
          onClick={onToggleEditMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow transition active:scale-95 ${
            isEditMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
              : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500'
          }`}
        >
          {isEditMode ? <Play className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{isEditMode ? 'Test Play' : 'Edit Level'}</span>
        </button>

        {/* Restart level */}
        <button
          onClick={onRestartLevel}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95"
          title="Restart Level (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Mute button */}
        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95"
          title="Toggle Audio"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
