import { soundEngine } from '../services/audio';
import { Direction, GameSnapshot, GameState, GridEntity, KeyColor, LogicRule, PuzzleLevel } from '../types/puzzle';

export function createInitialGameState(level: PuzzleLevel): GameState {
  const playerEnt = level.entities.find((e) => e.type === 'player_start');
  const playerPos = playerEnt ? { x: playerEnt.x, z: playerEnt.z } : { x: 0, z: 0 };

  const entityStates: Record<string, { active?: boolean; state?: string; rotation?: number }> = {};
  level.entities.forEach((ent) => {
    entityStates[ent.id] = {
      active: ent.active || false,
      state: ent.state || 'closed',
      rotation: ent.rotation || 0,
    };
  });

  const state: GameState = {
    level,
    playerPos,
    playerDir: 'south',
    inventory: { gems: 0, keys: new Set<KeyColor>() },
    moves: 0,
    startTime: Date.now(),
    elapsedSeconds: 0,
    isWon: false,
    isFailed: false,
    activeLasers: [],
    entityStates,
    bannerMessage: null,
    history: [],
  };

  // Run initial laser propagation & rules
  recalculateLasersAndRules(state);
  return state;
}

function pushSnapshot(state: GameState) {
  if (!state.history) state.history = [];
  const snapshot: GameSnapshot = {
    playerPos: { ...state.playerPos },
    playerDir: state.playerDir,
    inventory: {
      gems: state.inventory.gems,
      keys: Array.from(state.inventory.keys),
    },
    moves: state.moves,
    isWon: state.isWon,
    isFailed: state.isFailed,
    entities: state.level.entities.map((e) => ({ ...e })),
    entityStates: JSON.parse(JSON.stringify(state.entityStates)),
    bannerMessage: state.bannerMessage,
  };
  state.history.push(snapshot);
}

export function undoMove(state: GameState): GameState {
  if (!state.history || state.history.length === 0) return state;

  const snapshot = state.history.pop()!;
  state.playerPos = snapshot.playerPos;
  state.playerDir = snapshot.playerDir;
  state.inventory = {
    gems: snapshot.inventory.gems,
    keys: new Set(snapshot.inventory.keys),
  };
  state.moves = snapshot.moves;
  state.isWon = snapshot.isWon;
  state.isFailed = snapshot.isFailed;
  state.level.entities = snapshot.entities;
  state.entityStates = snapshot.entityStates;
  state.bannerMessage = snapshot.bannerMessage;

  soundEngine.playSwitch();
  recalculateLasersAndRules(state);
  return { ...state };
}

export function movePlayer(state: GameState, dir: Direction): GameState {
  if (state.isWon || state.isFailed) return state;

  const dx = dir === 'east' ? 1 : dir === 'west' ? -1 : 0;
  const dz = dir === 'south' ? 1 : dir === 'north' ? -1 : 0;

  const targetX = state.playerPos.x + dx;
  const targetZ = state.playerPos.z + dz;

  // Check Grid Boundaries
  if (targetX < 0 || targetX >= state.level.width || targetZ < 0 || targetZ >= state.level.height) {
    return state;
  }

  // Check Floor Type
  const floor = state.level.floors[targetZ]?.[targetX] || 'stone';

  // Check Entity Obstacles at target position
  const targetEntity = state.level.entities.find((e) => e.x === targetX && e.z === targetZ);

  if (targetEntity) {
    const entState = state.entityStates[targetEntity.id];

    // Wall
    if (targetEntity.type === 'wall') return state;

    // Closed Door
    if (targetEntity.type === 'door' && entState?.state !== 'open') {
      if (!targetEntity.color || !state.inventory.keys.has(targetEntity.color)) {
        return state; // locked
      }
    }

    // Forcefield
    if (targetEntity.type === 'forcefield' && entState?.state !== 'off') {
      return state;
    }

    // Pushable Cube
    if (targetEntity.type === 'push_cube') {
      const cubeNextX = targetX + dx;
      const cubeNextZ = targetZ + dz;

      // Can cube move to cubeNext?
      if (
        cubeNextX < 0 ||
        cubeNextX >= state.level.width ||
        cubeNextZ < 0 ||
        cubeNextZ >= state.level.height
      ) {
        return state;
      }

      const obstacleOnCubeNext = state.level.entities.find((e) => e.x === cubeNextX && e.z === cubeNextZ);
      const cubeNextFloor = state.level.floors[cubeNextZ]?.[cubeNextX];

      if (obstacleOnCubeNext || cubeNextFloor === 'void' || cubeNextFloor === 'lava') {
        return state; // blocked
      }
    }
  }

  // Push snapshot to history before making move!
  pushSnapshot(state);

  if (floor === 'void' || floor === 'lava') {
    soundEngine.playHazard();
    state.isFailed = true;
    state.bannerMessage = 'Ouch! Fallen into hazard lava!';
    return { ...state };
  }

  if (targetEntity) {
    const entState = state.entityStates[targetEntity.id];

    if (targetEntity.type === 'door' && entState?.state !== 'open') {
      if (targetEntity.color && state.inventory.keys.has(targetEntity.color)) {
        entState.state = 'open';
        soundEngine.playDoorOpen();
        state.bannerMessage = `Unlocked ${targetEntity.customName || targetEntity.color + ' door'} with key!`;
      }
    }

    if (targetEntity.type === 'push_cube') {
      const cubeNextX = targetX + dx;
      const cubeNextZ = targetZ + dz;
      targetEntity.x = cubeNextX;
      targetEntity.z = cubeNextZ;
      soundEngine.playPush();
      triggerEvent(state, 'on_step', targetEntity.id);
    }
  }

  // Update Player Position
  state.playerPos = { x: targetX, z: targetZ };
  state.playerDir = dir;
  state.moves += 1;
  soundEngine.playStep();

  // Pick up Collectibles at new position
  const pickupEntities = state.level.entities.filter((e) => e.x === targetX && e.z === targetZ);
  pickupEntities.forEach((ent) => {
    if (ent.type === 'gem') {
      state.inventory.gems += 1;
      soundEngine.playGemCollect();
      state.level.entities = state.level.entities.filter((e) => e.id !== ent.id);
      triggerEvent(state, 'on_gem_collect', ent.id);
    } else if (ent.type === 'key' && ent.color) {
      state.inventory.keys.add(ent.color);
      soundEngine.playKeyCollect();
      state.level.entities = state.level.entities.filter((e) => e.id !== ent.id);
      state.bannerMessage = `Collected ${ent.color.toUpperCase()} Key Rune!`;
    } else if (ent.type === 'pressure_plate') {
      state.entityStates[ent.id].active = true;
      soundEngine.playSwitch();
      triggerEvent(state, 'on_step', ent.id);
    } else if (ent.type === 'color_switch') {
      const curr = state.entityStates[ent.id].state;
      state.entityStates[ent.id].state = curr === 'on' ? 'off' : 'on';
      soundEngine.playSwitch();
      triggerEvent(state, 'on_switch_toggle', ent.id);
    } else if (ent.type === 'goal') {
      soundEngine.playVictory();
      state.isWon = true;
      state.bannerMessage = '🎉 Level Clear! Puzzle Solved!';
    }
  });

  // Handle Ice sliding physics
  if (floor === 'ice') {
    soundEngine.playSlide();
  }

  // Recalculate Laser Optics and Evaluate Rules
  recalculateLasersAndRules(state);
  return { ...state };
}

export function rotateMirror(state: GameState, mirrorId: string): GameState {
  const mirror = state.level.entities.find((e) => e.id === mirrorId);
  if (mirror && mirror.type === 'mirror') {
    pushSnapshot(state);
    mirror.rotation = ((mirror.rotation || 0) + 90) % 360;
    soundEngine.playSwitch();
    state.bannerMessage = `Rotated ${mirror.customName || 'Mirror'} to ${mirror.rotation}°`;
    recalculateLasersAndRules(state);
  }
  return { ...state };
}

function recalculateLasersAndRules(state: GameState) {
  state.activeLasers = [];

  // Reset all laser sensor targets to inactive
  state.level.entities.forEach((ent) => {
    if (ent.type === 'laser_target') {
      state.entityStates[ent.id].active = false;
    }
  });

  // Trace every laser emitter beam
  const emitters = state.level.entities.filter((e) => e.type === 'laser_emitter');

  emitters.forEach((emitter) => {
    let currX = emitter.x;
    let currZ = emitter.z;
    let dir: Direction =
      emitter.rotation === 90 ? 'east' : emitter.rotation === 180 ? 'south' : emitter.rotation === 270 ? 'west' : 'north';

    const segments: Array<{ x1: number; z1: number; x2: number; z2: number }> = [];
    let beamStartX = currX;
    let beamStartZ = currZ;

    let stepCount = 0;
    const maxSteps = 40; // prevent infinite loops

    while (stepCount < maxSteps) {
      stepCount++;
      const dx = dir === 'east' ? 1 : dir === 'west' ? -1 : 0;
      const dz = dir === 'south' ? 1 : dir === 'north' ? -1 : 0;

      const nextX = currX + dx;
      const nextZ = currZ + dz;

      // Check boundary
      if (nextX < 0 || nextX >= state.level.width || nextZ < 0 || nextZ >= state.level.height) {
        segments.push({ x1: beamStartX, z1: beamStartZ, x2: nextX, z2: nextZ });
        break;
      }

      // Check entity at next cell
      const hitEntity = state.level.entities.find((e) => e.x === nextX && e.z === nextZ);
      const hitState = hitEntity ? state.entityStates[hitEntity.id] : null;

      if (hitEntity) {
        if (hitEntity.type === 'wall' || (hitEntity.type === 'door' && hitState?.state !== 'open') || hitEntity.type === 'push_cube') {
          // Beam blocked
          segments.push({ x1: beamStartX, z1: beamStartZ, x2: nextX, z2: nextZ });
          break;
        }

        if (hitEntity.type === 'laser_target') {
          // Sensor target hit!
          segments.push({ x1: beamStartX, z1: beamStartZ, x2: nextX, z2: nextZ });
          if (!state.entityStates[hitEntity.id].active) {
            state.entityStates[hitEntity.id].active = true;
            soundEngine.playLaserActivate();
            triggerEvent(state, 'on_laser_hit', hitEntity.id);
          }
          break;
        }

        if (hitEntity.type === 'mirror') {
          // Mirror bounce calculation!
          segments.push({ x1: beamStartX, z1: beamStartZ, x2: nextX, z2: nextZ });
          beamStartX = nextX;
          beamStartZ = nextZ;
          currX = nextX;
          currZ = nextZ;

          const rot = (hitEntity.rotation || 0) % 180;
          if (rot === 0) {
            // Diagonal Mirror /
            if (dir === 'north') dir = 'east';
            else if (dir === 'east') dir = 'north';
            else if (dir === 'south') dir = 'west';
            else if (dir === 'west') dir = 'south';
          } else {
            // Diagonal Mirror \
            if (dir === 'north') dir = 'west';
            else if (dir === 'west') dir = 'north';
            else if (dir === 'south') dir = 'east';
            else if (dir === 'east') dir = 'south';
          }
          continue;
        }
      }

      currX = nextX;
      currZ = nextZ;
    }

    if (segments.length > 0) {
      state.activeLasers.push({
        startX: emitter.x,
        startZ: emitter.z,
        endX: currX,
        endZ: currZ,
        segments,
        color: '#ef4444',
      });
    }
  });
}

function triggerEvent(state: GameState, triggerType: string, targetId?: string) {
  state.level.rules.forEach((rule) => {
    if (!rule.enabled) return;

    if (rule.trigger.type === triggerType) {
      if (rule.trigger.targetId && rule.trigger.targetId !== targetId) return;

      // Evaluate rule conditions
      const allPassed = rule.conditions.every((cond) => {
        if (cond.type === 'gems_count_gte' && cond.value !== undefined) {
          return state.inventory.gems >= cond.value;
        }
        if (cond.type === 'all_targets_active') {
          const targets = state.level.entities.filter((e) => e.type === 'laser_target' || e.type === 'pressure_plate');
          return targets.every((t) => state.entityStates[t.id]?.active);
        }
        return true;
      });

      if (allPassed) {
        // Execute rule actions
        rule.actions.forEach((act) => {
          if (act.type === 'open_door' && act.targetId) {
            if (state.entityStates[act.targetId]) {
              state.entityStates[act.targetId].state = 'open';
              soundEngine.playDoorOpen();
            }
          } else if (act.type === 'toggle_forcefield' && act.targetId) {
            if (state.entityStates[act.targetId]) {
              state.entityStates[act.targetId].state = 'off';
              soundEngine.playSwitch();
            }
          } else if (act.type === 'win_level') {
            state.isWon = true;
            soundEngine.playVictory();
          }

          if (act.message) {
            state.bannerMessage = `⚡ [Low-Code Rule]: ${act.message}`;
          }
        });
      }
    }
  });
}
