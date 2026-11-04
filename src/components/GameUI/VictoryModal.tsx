import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Edit3, RotateCcw, Star, Trophy } from 'lucide-react';
import { GameState } from '../../types/puzzle';

interface VictoryModalProps {
  gameState: GameState;
  onNextLevel: () => void;
  onReplay: () => void;
  onEdit: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  gameState,
  onNextLevel,
  onReplay,
  onEdit,
}) => {
  useEffect(() => {
    // Launch confetti celebratory burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center relative overflow-hidden">
        {/* Glow ambient header background */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-inner">
          <Trophy className="w-8 h-8 animate-bounce" />
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-wide">PUZZLE SOLVED!</h2>
        <p className="mt-1 text-xs text-slate-400">{gameState.level.title}</p>

        {/* 3-Star Rating based on move efficiency */}
        <div className="flex items-center justify-center gap-2 my-5">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Moves</span>
            <div className="text-xl font-mono font-bold text-amber-400">{gameState.moves}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Gems Collected</span>
            <div className="text-xl font-mono font-bold text-sky-400">{gameState.inventory.gems}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-6">
          <button
            onClick={onNextLevel}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg transition active:scale-95"
          >
            <span>Next Puzzle</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay
            </button>
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Logic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
