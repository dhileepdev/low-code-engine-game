import React, { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, ChevronUp, Eye, Palette, RotateCw } from 'lucide-react';
import { Direction, ThemeType } from '../../types/puzzle';

interface BottomDockProps {
  currentTheme: ThemeType;
  onChangeTheme: (theme: ThemeType) => void;
  onMovePlayer?: (dir: Direction) => void;
  onRotateSelectedMirror?: () => void;
  isEditMode: boolean;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentTheme,
  onChangeTheme,
  onMovePlayer,
  onRotateSelectedMirror,
  isEditMode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const themes: Array<{ id: ThemeType; label: string; color: string }> = [
    { id: 'cyber', label: 'Cyber Neon', color: '#38bdf8' },
    { id: 'ancient', label: 'Ancient Stone', color: '#a8a29e' },
    { id: 'scifi', label: 'Sci-Fi Core', color: '#818cf8' },
    { id: 'lava', label: 'Lava Cavern', color: '#f97316' },
    { id: 'crystal', label: 'Crystal Haven', color: '#c084fc' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] w-max flex flex-col items-center gap-1 pointer-events-none">
      {/* Collapse/Expand Cinema Mode Toggle Tab */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-slate-900/90 hover:bg-slate-800 border-t border-x border-slate-800 text-[11px] font-semibold text-slate-300 shadow transition"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Show Dock</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cinema View</span>
          </>
        )}
      </button>

      {/* Main Dock Container (Solid/rgba surface as per Three.js guidelines) */}
      {!isCollapsed && (
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-4 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl">
          {/* Movement Touch D-Pad */}
          {onMovePlayer && !isEditMode && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 hidden sm:inline">Move:</span>
              <button
                onClick={() => onMovePlayer('west')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95"
                title="Move Left (A / Left Arrow)"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onMovePlayer('north')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95"
                  title="Move Up (W / Up Arrow)"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMovePlayer('south')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95"
                  title="Move Down (S / Down Arrow)"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => onMovePlayer('east')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95"
                title="Move Right (D / Right Arrow)"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mirror Rotation Action Button */}
          {onRotateSelectedMirror && (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <button
                onClick={onRotateSelectedMirror}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition active:scale-95"
                title="Rotate Mirror (Space)"
              >
                <RotateCw className="w-4 h-4" />
                <span>Rotate Mirror</span>
              </button>
            </div>
          )}

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <Palette className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">Theme:</span>
            <div className="flex items-center gap-1">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChangeTheme(t.id)}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    currentTheme === t.id ? 'border-white scale-110 shadow-lg' : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: t.color }}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          {/* Control hints */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 border-l border-slate-800 pl-3 font-mono">
            <span>WASD / Arrows: Move</span>
            <span>·</span>
            <span>Space: Rotate Mirror</span>
            <span>·</span>
            <span>R: Restart</span>
          </div>
        </div>
      )}
    </div>
  );
};
