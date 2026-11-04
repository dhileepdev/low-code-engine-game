import React, { useState } from 'react';
import { ArrowRight, Code2, Sparkles, Plus, Play, Trash2, Cpu, Smartphone } from 'lucide-react';
import { PuzzleLevel } from '../types/puzzle';
import { deleteUserLevel, PRESET_LEVELS } from '../services/storage';
import { PWAInstallButton } from './GameUI/PWAInstallButton';

interface TitleScreenProps {
  userLevels: PuzzleLevel[];
  onSelectLevel: (level: PuzzleLevel, editImmediately?: boolean) => void;
  onCreateNewLevel: () => void;
  onRefreshUserLevels: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  userLevels,
  onSelectLevel,
  onCreateNewLevel,
  onRefreshUserLevels,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteUserLevel(id);
    onRefreshUserLevels();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-6 sm:p-12 z-20 pointer-events-none">
      {/* Dark gradient backdrop vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

      {/* Top Header Row */}
      <header className="relative z-30 flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 shadow-lg">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Low-Code Game Engine</span>
            <span className="block text-[10px] text-slate-400 font-mono">100% Offline Capable</span>
          </div>
        </div>

        <PWAInstallButton />
      </header>

      {/* Hero Central Title & CTA Block (Bespoke SVG Title Lockup) */}
      <div className="relative z-30 max-w-2xl my-auto pointer-events-auto flex flex-col items-start gap-4">
        {/* Inline SVG Title Lockup */}
        <div className="flex items-center gap-3">
          <svg className="w-10 h-10 text-indigo-400" viewBox="0 0 100 100" fill="none">
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="6" />
            <circle cx="50" cy="50" r="16" fill="#38bdf8" />
            <path d="M50 50 L90 25 M50 50 L10 75" stroke="#ffffff" strokeWidth="4" strokeDasharray="4,4" />
          </svg>
          <span className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-widest">
            3D Puzzle Sandbox
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none uppercase">
          PUZZLE<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-purple-400">CRAFT 3D</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg font-normal leading-relaxed">
          Design, customize visual low-code logic rules, and play interactive 3D puzzles offline with zero internet dependency.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <button
            onClick={() => onSelectLevel(PRESET_LEVELS[0])}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-900/40 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play First Puzzle</span>
          </button>

          <button
            onClick={onCreateNewLevel}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm shadow-lg transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Create Low-Code Level</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Level Browser Cards */}
      <div className="relative z-30 w-full pointer-events-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'presets'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Preset Puzzles ({PRESET_LEVELS.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'custom'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Created Levels ({userLevels.length})
            </button>
          </div>

          <span className="hidden sm:block text-[11px] text-slate-400 font-mono">
            WASD / Arrow Keys: Move · Space: Interact · R: Reset
          </span>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[190px] overflow-y-auto pr-1">
          {(activeTab === 'presets' ? PRESET_LEVELS : userLevels).map((lvl) => (
            <div
              key={lvl.id}
              onClick={() => onSelectLevel(lvl)}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition flex flex-col justify-between gap-2 group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate">
                    {lvl.title}
                  </h3>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800">
                    {lvl.difficulty}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{lvl.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                <span className="text-slate-500 font-mono">{lvl.rules.length} Low-Code Rules</span>
                <div className="flex items-center gap-1">
                  {activeTab === 'custom' && (
                    <button
                      onClick={(e) => handleDelete(lvl.id, e)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="Delete level"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-indigo-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                    Play <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
