import React from 'react';
import { Box, Code2, DoorClosed, Eraser, Flame, Gem, Key, Layers, Maximize2, Move, Radio, ShieldAlert, Sparkles, Square, User, Zap } from 'lucide-react';
import { FloorType, KeyColor, ObjectType } from '../../types/puzzle';

interface GridToolbarProps {
  activeTool: 'place' | 'erase' | 'select';
  setActiveTool: (tool: 'place' | 'erase' | 'select') => void;
  selectedObjectType: ObjectType;
  setSelectedObjectType: (type: ObjectType) => void;
  selectedFloorType: FloorType;
  setSelectedFloorType: (type: FloorType) => void;
  selectedKeyColor: KeyColor;
  setSelectedKeyColor: (color: KeyColor) => void;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  onChangeDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => void;
  onOpenCodeView: () => void;
  onClearGrid: () => void;
}

export const GridToolbar: React.FC<GridToolbarProps> = ({
  activeTool,
  setActiveTool,
  selectedObjectType,
  setSelectedObjectType,
  selectedFloorType,
  setSelectedFloorType,
  selectedKeyColor,
  setSelectedKeyColor,
  difficulty,
  onChangeDifficulty,
  onOpenCodeView,
  onClearGrid,
}) => {
  const objectCategories: Array<{
    label: string;
    items: Array<{ type: ObjectType; label: string; icon: React.ReactNode }>;
  }> = [
    {
      label: 'Core Props',
      items: [
        { type: 'player_start', label: 'Player', icon: <User className="w-4 h-4 text-indigo-400" /> },
        { type: 'goal', label: 'Goal Portal', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
        { type: 'gem', label: 'Crystal Gem', icon: <Gem className="w-4 h-4 text-sky-400" /> },
        { type: 'push_cube', label: 'Push Cube', icon: <Box className="w-4 h-4 text-blue-400" /> },
        { type: 'wall', label: 'Wall Block', icon: <Square className="w-4 h-4 text-slate-400" /> },
      ],
    },
    {
      label: 'Laser Mechanics',
      items: [
        { type: 'laser_emitter', label: 'Laser Emitter', icon: <Radio className="w-4 h-4 text-red-400" /> },
        { type: 'mirror', label: 'Reflector Mirror', icon: <Layers className="w-4 h-4 text-amber-400" /> },
        { type: 'laser_target', label: 'Optical Sensor', icon: <Maximize2 className="w-4 h-4 text-emerald-400" /> },
      ],
    },
    {
      label: 'Triggers & Locks',
      items: [
        { type: 'pressure_plate', label: 'Pressure Plate', icon: <ShieldAlert className="w-4 h-4 text-yellow-400" /> },
        { type: 'key', label: 'Key Rune', icon: <Key className="w-4 h-4 text-amber-400" /> },
        { type: 'door', label: 'Lock Door', icon: <DoorClosed className="w-4 h-4 text-red-400" /> },
      ],
    },
  ];

  return (
    <div className="absolute top-16 left-4 z-40 max-w-[320px] w-full p-3 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="text-xs font-bold uppercase text-white tracking-wide">3D Level Forge</span>
        <button
          onClick={onOpenCodeView}
          className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
        >
          <Code2 className="w-3.5 h-3.5" />
          JSON Spec
        </button>
      </div>

      {/* Difficulty Category Dropdown */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
        <span className="text-[10px] font-bold uppercase text-slate-400">Difficulty Rating:</span>
        <select
          value={difficulty}
          onChange={(e) => onChangeDifficulty(e.target.value as 'easy' | 'medium' | 'hard' | 'expert')}
          className="bg-slate-900 text-xs font-semibold text-indigo-300 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      {/* Tool Selection (Place / Erase) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-slate-800">
        <button
          onClick={() => setActiveTool('place')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeTool === 'place'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Move className="w-3.5 h-3.5" />
          Place Object
        </button>

        <button
          onClick={() => setActiveTool('erase')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeTool === 'erase'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eraser className="w-3.5 h-3.5" />
          Erase Tile
        </button>
      </div>

      {/* Floor Tiles */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-400">Floor Surface</span>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setSelectedFloorType('stone')}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFloorType === 'stone'
                ? 'bg-slate-800 border-indigo-500 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            Stone
          </button>
          <button
            onClick={() => setSelectedFloorType('ice')}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFloorType === 'ice'
                ? 'bg-sky-950/80 border-sky-400 text-sky-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            Ice (Slide)
          </button>
          <button
            onClick={() => setSelectedFloorType('lava')}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedFloorType === 'lava'
                ? 'bg-orange-950/80 border-orange-500 text-orange-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <Flame className="w-3 h-3 inline mr-1 text-orange-500" />
            Lava
          </button>
        </div>
      </div>

      {/* Object Palette */}
      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
        {objectCategories.map((cat) => (
          <div key={cat.label} className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">{cat.label}</span>
            <div className="grid grid-cols-2 gap-1">
              {cat.items.map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    setActiveTool('place');
                    setSelectedObjectType(item.type);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium text-left transition ${
                    selectedObjectType === item.type && activeTool === 'place'
                      ? 'bg-indigo-950/80 border-indigo-500 text-white shadow'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Color options for key / door */}
      {['key', 'door'].includes(selectedObjectType) && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400">Color Variant:</span>
          <div className="flex items-center gap-1">
            {(['red', 'blue', 'green', 'yellow'] as KeyColor[]).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedKeyColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition ${
                  selectedKeyColor === c ? 'border-white scale-110' : 'border-transparent opacity-60'
                }`}
                style={{
                  backgroundColor:
                    c === 'red' ? '#ef4444' : c === 'blue' ? '#3b82f6' : c === 'green' ? '#22c55e' : '#eab308',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
