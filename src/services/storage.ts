import { PuzzleLevel, LogicRule } from '../types/puzzle';

const STORAGE_KEY = 'puzzlecraft_user_levels_v1';

export const PRESET_LEVELS: PuzzleLevel[] = [
  {
    id: 'preset_laser_reflector',
    title: 'Trial of the Reflector',
    description: 'Rotate the laser mirrors to bounce the high-energy beam onto the optical sensor to unlock the goal gate.',
    author: 'PuzzleCraft Studio',
    difficulty: 'easy',
    theme: 'cyber',
    width: 8,
    height: 8,
    floors: [
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
    ],
    entities: [
      { id: 'player_1', type: 'player_start', x: 1, z: 6 },
      { id: 'laser_1', type: 'laser_emitter', x: 1, z: 1, rotation: 90, customName: 'Laser Alpha' }, // fires east
      { id: 'mirror_1', type: 'mirror', x: 5, z: 1, rotation: 0, customName: 'Mirror 1' },
      { id: 'mirror_2', type: 'mirror', x: 5, z: 4, rotation: 90, customName: 'Mirror 2' },
      { id: 'sensor_1', type: 'laser_target', x: 2, z: 4, rotation: 90, customName: 'Optical Sensor' },
      { id: 'door_1', type: 'door', x: 6, z: 5, color: 'red', state: 'closed', customName: 'Security Gate' },
      { id: 'goal_1', type: 'goal', x: 6, z: 6 },
      { id: 'gem_1', type: 'gem', x: 3, z: 2 },
      { id: 'wall_1', type: 'wall', x: 3, z: 3 },
      { id: 'wall_2', type: 'wall', x: 4, z: 3 },
    ],
    rules: [
      {
        id: 'rule_unlock_laser',
        name: 'Sensor Unlocks Door',
        enabled: true,
        trigger: {
          type: 'on_laser_hit',
          targetId: 'sensor_1',
        },
        conditions: [],
        actions: [
          {
            type: 'open_door',
            targetId: 'door_1',
            message: 'Optical Sensor Activated! Security Gate Opened!',
          },
        ],
      },
    ],
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 100000,
  },
  {
    id: 'preset_frost_push',
    title: 'Frost & Pressure Cubes',
    description: 'Slide across slick ice and push heavy cubes onto pressure plates to deactivate the energetic forcefield.',
    author: 'PuzzleCraft Studio',
    difficulty: 'medium',
    theme: 'crystal',
    width: 9,
    height: 9,
    floors: [
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'ice',   'ice',   'ice',   'ice',   'ice',   'stone', 'stone', 'stone'],
      ['stone', 'ice',   'ice',   'ice',   'ice',   'ice',   'stone', 'stone', 'stone'],
      ['stone', 'ice',   'ice',   'ice',   'ice',   'ice',   'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
    ],
    entities: [
      { id: 'player_1', type: 'player_start', x: 1, z: 6 },
      { id: 'cube_1', type: 'push_cube', x: 2, z: 4, customName: 'Quantum Cube A' },
      { id: 'cube_2', type: 'push_cube', x: 4, z: 4, customName: 'Quantum Cube B' },
      { id: 'plate_1', type: 'pressure_plate', x: 2, z: 2, customName: 'Plate Alpha' },
      { id: 'plate_2', type: 'pressure_plate', x: 4, z: 2, customName: 'Plate Beta' },
      { id: 'forcefield_1', type: 'forcefield', x: 7, z: 4, state: 'on', customName: 'Barrier' },
      { id: 'gem_1', type: 'gem', x: 3, z: 1 },
      { id: 'gem_2', type: 'gem', x: 7, z: 2 },
      { id: 'goal_1', type: 'goal', x: 7, z: 6 },
    ],
    rules: [
      {
        id: 'rule_both_plates',
        name: 'Plates Lower Barrier',
        enabled: true,
        trigger: {
          type: 'on_step',
          targetId: 'plate_1',
        },
        conditions: [
          { type: 'all_targets_active' }
        ],
        actions: [
          {
            type: 'toggle_forcefield',
            targetId: 'forcefield_1',
            message: 'Both Plates Compressed! Forcefield Lowered!',
          },
        ],
      },
    ],
    createdAt: Date.now() - 90000,
    updatedAt: Date.now() - 90000,
  },
  {
    id: 'preset_citadel_keys',
    title: 'The Low-Code Citadel',
    description: 'Navigate ancient color switches, collect key runes, and trigger custom visual rules to reach the portal.',
    author: 'PuzzleCraft Studio',
    difficulty: 'hard',
    theme: 'ancient',
    width: 10,
    height: 10,
    floors: Array(10).fill(null).map(() => Array(10).fill('stone')),
    entities: [
      { id: 'player_1', type: 'player_start', x: 1, z: 8 },
      { id: 'key_red', type: 'key', x: 1, z: 1, color: 'red', customName: 'Crimson Rune' },
      { id: 'key_blue', type: 'key', x: 8, z: 1, color: 'blue', customName: 'Azure Rune' },
      { id: 'door_red', type: 'door', x: 4, z: 5, color: 'red', state: 'closed', customName: 'Crimson Gate' },
      { id: 'door_blue', type: 'door', x: 5, z: 5, color: 'blue', state: 'closed', customName: 'Azure Gate' },
      { id: 'switch_1', type: 'color_switch', x: 8, z: 8, state: 'off', customName: 'Color Switch' },
      { id: 'gem_1', type: 'gem', x: 4, z: 3 },
      { id: 'gem_2', type: 'gem', x: 5, z: 3 },
      { id: 'gem_3', type: 'gem', x: 8, z: 4 },
      { id: 'goal_1', type: 'goal', x: 4, z: 1 },
      { id: 'wall_1', type: 'wall', x: 3, z: 5 },
      { id: 'wall_2', type: 'wall', x: 6, z: 5 },
    ],
    rules: [
      {
        id: 'rule_switch',
        name: 'Switch Toggles Red Gate',
        enabled: true,
        trigger: {
          type: 'on_switch_toggle',
          targetId: 'switch_1',
        },
        conditions: [],
        actions: [
          {
            type: 'open_door',
            targetId: 'door_red',
            message: 'Ancient Mechanism Engaged! Crimson Gate Unlocked!',
          },
        ],
      },
    ],
    createdAt: Date.now() - 80000,
    updatedAt: Date.now() - 80000,
  },
  {
    id: 'preset_conveyor_circuit',
    title: 'Conveyor & Spike Circuit',
    description: 'Use high-speed conveyor belts and carefully timed laser switches while dodging hazard spike traps.',
    author: 'PuzzleCraft Studio',
    difficulty: 'hard',
    theme: 'scifi',
    width: 9,
    height: 9,
    floors: [
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'conveyor_east', 'conveyor_east', 'conveyor_east', 'conveyor_south', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'conveyor_south', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'conveyor_west', 'conveyor_west', 'conveyor_west', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
    ],
    entities: [
      { id: 'player_1', type: 'player_start', x: 1, z: 1 },
      { id: 'spike_1', type: 'spike', x: 2, z: 1, state: 'off' },
      { id: 'spike_2', type: 'spike', x: 5, z: 3, state: 'off' },
      { id: 'gem_1', type: 'gem', x: 4, z: 1 },
      { id: 'gem_2', type: 'gem', x: 4, z: 3 },
      { id: 'goal_1', type: 'goal', x: 1, z: 7 },
      { id: 'laser_1', type: 'laser_emitter', x: 7, z: 7, rotation: 270 }, // fires west
      { id: 'mirror_1', type: 'mirror', x: 3, z: 7, rotation: 0 },
      { id: 'sensor_1', type: 'laser_target', x: 3, z: 8, rotation: 0 },
      { id: 'door_1', type: 'door', x: 2, z: 7, color: 'yellow', state: 'closed' },
    ],
    rules: [
      {
        id: 'rule_conveyor_laser',
        name: 'Laser Beam Goal Gate',
        enabled: true,
        trigger: {
          type: 'on_laser_hit',
          targetId: 'sensor_1',
        },
        conditions: [],
        actions: [
          {
            type: 'open_door',
            targetId: 'door_1',
            message: 'Laser Stream Connected! Gate Unlocked!',
          },
        ],
      },
    ],
    createdAt: Date.now() - 70000,
    updatedAt: Date.now() - 70000,
  },
  {
    id: 'preset_blank_sandbox',
    title: 'Blank Low-Code Sandbox',
    description: 'A clean slate grid ready for your custom 3D low-code puzzle design. Add tiles, mechanisms, and rules!',
    author: 'You',
    difficulty: 'easy',
    theme: 'lava',
    width: 8,
    height: 8,
    floors: Array(8).fill(null).map(() => Array(8).fill('stone')),
    entities: [
      { id: 'player_1', type: 'player_start', x: 1, z: 6 },
      { id: 'goal_1', type: 'goal', x: 6, z: 1 },
      { id: 'gem_1', type: 'gem', x: 3, z: 3 },
      { id: 'plate_1', type: 'pressure_plate', x: 4, z: 4, customName: 'Plate 1' },
      { id: 'door_1', type: 'door', x: 5, z: 2, color: 'blue', state: 'closed', customName: 'Blue Gate' },
    ],
    rules: [
      {
        id: 'rule_sample',
        name: 'Plate Opens Gate',
        enabled: true,
        trigger: {
          type: 'on_step',
          targetId: 'plate_1',
        },
        conditions: [],
        actions: [
          {
            type: 'open_door',
            targetId: 'door_1',
            message: 'Custom Low-Code Rule Triggered! Gate Opened!',
          },
        ],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export function getUserLevels(): PuzzleLevel[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user levels from localStorage:', e);
    return [];
  }
}

export function saveUserLevel(level: PuzzleLevel): PuzzleLevel[] {
  const levels = getUserLevels();
  const index = levels.findIndex((l) => l.id === level.id);
  const updatedLevel = { ...level, updatedAt: Date.now() };

  if (index >= 0) {
    levels[index] = updatedLevel;
  } else {
    levels.push(updatedLevel);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  } catch (e) {
    console.error('Failed to save level to localStorage:', e);
  }
  return levels;
}

export function deleteUserLevel(id: string): PuzzleLevel[] {
  const levels = getUserLevels().filter((l) => l.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  } catch (e) {
    console.error('Failed to delete level from localStorage:', e);
  }
  return levels;
}

export function exportLevelToJson(level: PuzzleLevel): string {
  return JSON.stringify(level, null, 2);
}

export function importLevelFromJson(jsonString: string): PuzzleLevel | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && parsed.id && parsed.title && parsed.floors && parsed.entities) {
      // Ensure unique ID if imported
      parsed.id = `imported_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      parsed.updatedAt = Date.now();
      saveUserLevel(parsed);
      return parsed;
    }
  } catch (e) {
    console.error('Invalid level JSON:', e);
  }
  return null;
}
