export type Direction = 'north' | 'east' | 'south' | 'west';

export type FloorType = 'stone' | 'ice' | 'lava' | 'conveyor_north' | 'conveyor_east' | 'conveyor_south' | 'conveyor_west' | 'void';

export type ObjectType = 
  | 'player_start'
  | 'goal'
  | 'gem'
  | 'key'
  | 'door'
  | 'push_cube'
  | 'laser_emitter'
  | 'mirror'
  | 'laser_target'
  | 'pressure_plate'
  | 'color_switch'
  | 'forcefield'
  | 'spike'
  | 'wall';

export type KeyColor = 'red' | 'blue' | 'green' | 'yellow';

export interface GridEntity {
  id: string;
  type: ObjectType;
  x: number;
  z: number;
  rotation?: number; // 0, 90, 180, 270 degrees
  color?: KeyColor;
  active?: boolean;
  state?: 'open' | 'closed' | 'on' | 'off';
  customName?: string;
}

export type TriggerType = 
  | 'on_step'
  | 'on_laser_hit'
  | 'on_gem_collect'
  | 'on_cube_place'
  | 'on_switch_toggle'
  | 'on_game_start';

export type ConditionType = 
  | 'gems_count_gte'
  | 'keys_contains'
  | 'entity_is_active'
  | 'all_targets_active';

export type ActionType = 
  | 'open_door'
  | 'close_door'
  | 'toggle_forcefield'
  | 'activate_laser'
  | 'rotate_mirror'
  | 'show_banner'
  | 'win_level';

export interface RuleCondition {
  type: ConditionType;
  targetId?: string;
  color?: KeyColor;
  value?: number;
}

export interface RuleAction {
  type: ActionType;
  targetId?: string;
  color?: KeyColor;
  message?: string;
}

export interface LogicRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    type: TriggerType;
    targetId?: string;
    color?: KeyColor;
  };
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export type ThemeType = 'cyber' | 'ancient' | 'scifi' | 'lava' | 'crystal';

export interface PuzzleLevel {
  id: string;
  title: string;
  description: string;
  author: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  theme: ThemeType;
  width: number; // grid columns (e.g. 10)
  height: number; // grid rows (e.g. 10)
  floors: FloorType[][]; // grid[z][x]
  entities: GridEntity[];
  rules: LogicRule[];
  createdAt: number;
  updatedAt: number;
}

export interface PlayerInventory {
  gems: number;
  keys: Set<KeyColor>;
}

export interface GameSnapshot {
  playerPos: { x: number; z: number };
  playerDir: Direction;
  inventory: { gems: number; keys: KeyColor[] };
  moves: number;
  isWon: boolean;
  isFailed: boolean;
  entities: GridEntity[];
  entityStates: Record<string, { active?: boolean; state?: string; rotation?: number }>;
  bannerMessage: string | null;
}

export interface GameState {
  level: PuzzleLevel;
  playerPos: { x: number; z: number };
  playerDir: Direction;
  inventory: PlayerInventory;
  moves: number;
  startTime: number;
  elapsedSeconds: number;
  isWon: boolean;
  isFailed: boolean;
  activeLasers: Array<{
    startX: number;
    startZ: number;
    endX: number;
    endZ: number;
    segments: Array<{ x1: number; z1: number; x2: number; z2: number }>;
    color: string;
  }>;
  entityStates: Record<string, { active?: boolean; state?: string; rotation?: number }>;
  bannerMessage: string | null;
  history: GameSnapshot[];
}
