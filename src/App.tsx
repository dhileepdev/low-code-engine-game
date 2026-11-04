/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Direction, FloorType, GameState, GridEntity, KeyColor, LogicRule, ObjectType, PuzzleLevel, ThemeType } from './types/puzzle';
import { deleteUserLevel, getUserLevels, PRESET_LEVELS, saveUserLevel } from './services/storage';
import { soundEngine } from './services/audio';
import { createInitialGameState, movePlayer, rotateMirror, undoMove } from './game/engine';
import { PuzzleScene } from './game/PuzzleScene';

import { TitleScreen } from './components/TitleScreen';
import { TopHUD } from './components/GameUI/TopHUD';
import { BottomDock } from './components/GameUI/BottomDock';
import { VictoryModal } from './components/GameUI/VictoryModal';
import { OfflineIndicator } from './components/GameUI/OfflineIndicator';
import { RuleBuilderModal } from './components/LowCodeEditor/RuleBuilderModal';
import { GridToolbar } from './components/LowCodeEditor/GridToolbar';
import { CodeViewModal } from './components/LowCodeEditor/CodeViewModal';

export default function App() {
  const [mode, setMode] = useState<'TITLE' | 'PLAYING' | 'EDITING'>('TITLE');
  const [userLevels, setUserLevels] = useState<PuzzleLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<PuzzleLevel>(PRESET_LEVELS[0]);
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(PRESET_LEVELS[0]));

  // Editor State
  const [activeTool, setActiveTool] = useState<'place' | 'erase' | 'select'>('place');
  const [selectedObjectType, setSelectedObjectType] = useState<ObjectType>('push_cube');
  const [selectedFloorType, setSelectedFloorType] = useState<FloorType>('stone');
  const [selectedKeyColor, setSelectedKeyColor] = useState<KeyColor>('red');

  // Modals
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Three.js Canvas Container Ref & Manager
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const puzzleSceneRef = useRef<PuzzleScene | null>(null);

  // Refresh User Levels from LocalStorage
  const refreshUserLevels = () => {
    setUserLevels(getUserLevels());
  };

  useEffect(() => {
    refreshUserLevels();
  }, []);

  // Initialize Three.js Scene once mounted
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const scene = new PuzzleScene(canvasMountRef.current);
    puzzleSceneRef.current = scene;
    scene.loadLevel(currentLevel);

    return () => {
      scene.destroy();
      puzzleSceneRef.current = null;
    };
  }, []);

  // Sync Level with 3D Scene when level or mode changes
  useEffect(() => {
    if (puzzleSceneRef.current) {
      puzzleSceneRef.current.loadLevel(currentLevel);
      puzzleSceneRef.current.renderLaserBeams(gameState.activeLasers);
    }
  }, [currentLevel.id, currentLevel.theme]);

  // Sync state changes with 3D Scene
  useEffect(() => {
    if (puzzleSceneRef.current && mode !== 'TITLE') {
      const p = gameState.playerPos;
      const rot = gameState.playerDir === 'east' ? 90 : gameState.playerDir === 'south' ? 180 : gameState.playerDir === 'west' ? 270 : 0;
      puzzleSceneRef.current.updatePlayerPosition(p.x, p.z, rot);

      // Update active entities & lasers
      gameState.level.entities.forEach((ent) => {
        const state = gameState.entityStates[ent.id];
        puzzleSceneRef.current?.updateEntityState(ent.id, ent.x, ent.z, state?.active, state?.state, ent.rotation);
      });

      puzzleSceneRef.current.renderLaserBeams(gameState.activeLasers);
    }
  }, [gameState.playerPos, gameState.moves, gameState.entityStates, gameState.activeLasers, mode]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'PLAYING' || showRulesModal || showCodeModal) return;

      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        setGameState((prev) => movePlayer(prev, 'north'));
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        setGameState((prev) => movePlayer(prev, 'south'));
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        setGameState((prev) => movePlayer(prev, 'west'));
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        setGameState((prev) => movePlayer(prev, 'east'));
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleRotateMirrorAtPlayer();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleRestartLevel();
      } else if (e.code === 'KeyU' || (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        handleUndo();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        setMode('TITLE');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, showRulesModal, showCodeModal, gameState.playerPos]);

  const handleUndo = () => {
    setGameState((prev) => undoMove(prev));
  };

  // Handlers
  const handleSelectLevel = (level: PuzzleLevel, editImmediately: boolean = false) => {
    setCurrentLevel(level);
    const newGameState = createInitialGameState(level);
    setGameState(newGameState);
    setMode(editImmediately ? 'EDITING' : 'PLAYING');
    if (puzzleSceneRef.current) {
      puzzleSceneRef.current.loadLevel(level);
    }
  };

  const handleCreateNewLevel = () => {
    const newLevel: PuzzleLevel = {
      id: `custom_${Date.now()}`,
      title: 'My Custom 3D Puzzle',
      description: 'Built with PuzzleCraft 3D Low-Code Engine',
      author: 'You',
      difficulty: 'medium',
      theme: 'cyber',
      width: 9,
      height: 9,
      floors: Array(9).fill(null).map(() => Array(9).fill('stone')),
      entities: [
        { id: 'player_1', type: 'player_start', x: 1, z: 7 },
        { id: 'goal_1', type: 'goal', x: 7, z: 1 },
      ],
      rules: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveUserLevel(newLevel);
    refreshUserLevels();
    handleSelectLevel(newLevel, true);
  };

  const handleRestartLevel = () => {
    const freshState = createInitialGameState(currentLevel);
    setGameState(freshState);
    if (puzzleSceneRef.current) {
      puzzleSceneRef.current.loadLevel(currentLevel);
    }
  };

  const handleMovePlayer = (dir: Direction) => {
    setGameState((prev) => movePlayer(prev, dir));
  };

  const handleRotateMirrorAtPlayer = () => {
    const mirrorAtPlayer = currentLevel.entities.find(
      (e) => e.x === gameState.playerPos.x && e.z === gameState.playerPos.z && e.type === 'mirror'
    );
    if (mirrorAtPlayer) {
      setGameState((prev) => rotateMirror(prev, mirrorAtPlayer.id));
    }
  };

  const handleChangeTheme = (theme: ThemeType) => {
    const updatedLevel = { ...currentLevel, theme };
    setCurrentLevel(updatedLevel);
    if (mode === 'EDITING') {
      saveUserLevel(updatedLevel);
      refreshUserLevels();
    }
    if (puzzleSceneRef.current) {
      puzzleSceneRef.current.loadLevel(updatedLevel);
    }
  };

  const handleSaveRules = (rules: LogicRule[]) => {
    const updatedLevel = { ...currentLevel, rules };
    setCurrentLevel(updatedLevel);
    saveUserLevel(updatedLevel);
    refreshUserLevels();
    setGameState(createInitialGameState(updatedLevel));
  };

  // Grid Canvas Raycast Click for Editor Mode
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'EDITING' || !puzzleSceneRef.current) return;

    const hit = puzzleSceneRef.current.raycastGridTile(e.clientX, e.clientY);
    if (!hit) return;

    const { gridX, gridZ } = hit;
    const updatedEntities = [...currentLevel.entities];

    if (activeTool === 'erase') {
      // Remove entity at position
      const newEntities = updatedEntities.filter((ent) => !(ent.x === gridX && ent.z === gridZ));
      const updatedLevel = { ...currentLevel, entities: newEntities };
      setCurrentLevel(updatedLevel);
      saveUserLevel(updatedLevel);
      puzzleSceneRef.current.loadLevel(updatedLevel);
    } else if (activeTool === 'place') {
      // Place selected floor or entity
      const newFloor = [...currentLevel.floors];
      newFloor[gridZ][gridX] = selectedFloorType;

      let newEntities = updatedEntities.filter((ent) => !(ent.x === gridX && ent.z === gridZ));

      if (selectedObjectType === 'player_start') {
        newEntities = newEntities.filter((ent) => ent.type !== 'player_start');
      }

      const newEnt: GridEntity = {
        id: `ent_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: selectedObjectType,
        x: gridX,
        z: gridZ,
        color: ['key', 'door'].includes(selectedObjectType) ? selectedKeyColor : undefined,
        rotation: selectedObjectType === 'laser_emitter' ? 90 : 0,
      };

      newEntities.push(newEnt);
      const updatedLevel = { ...currentLevel, floors: newFloor, entities: newEntities };
      setCurrentLevel(updatedLevel);
      saveUserLevel(updatedLevel);
      puzzleSceneRef.current.loadLevel(updatedLevel);
    }
  };

  const handleChangeDifficulty = (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => {
    const updatedLevel = { ...currentLevel, difficulty };
    setCurrentLevel(updatedLevel);
    saveUserLevel(updatedLevel);
    refreshUserLevels();
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Three.js 3D Viewport Container */}
      <div
        ref={canvasMountRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Mode State Router */}
      {mode === 'TITLE' && (
        <TitleScreen
          userLevels={userLevels}
          onSelectLevel={(lvl) => handleSelectLevel(lvl, false)}
          onCreateNewLevel={handleCreateNewLevel}
          onRefreshUserLevels={refreshUserLevels}
        />
      )}

      {mode !== 'TITLE' && (
        <>
          {/* Top Game HUD */}
          <TopHUD
            gameState={gameState}
            isEditMode={mode === 'EDITING'}
            onToggleEditMode={() => setMode(mode === 'EDITING' ? 'PLAYING' : 'EDITING')}
            onRestartLevel={handleRestartLevel}
            onUndo={handleUndo}
            onOpenRulesModal={() => setShowRulesModal(true)}
            onBackToTitle={() => setMode('TITLE')}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(soundEngine.toggleMute())}
          />

          {/* Grid Editor Toolbar */}
          {mode === 'EDITING' && (
            <GridToolbar
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              selectedObjectType={selectedObjectType}
              setSelectedObjectType={setSelectedObjectType}
              selectedFloorType={selectedFloorType}
              setSelectedFloorType={setSelectedFloorType}
              selectedKeyColor={selectedKeyColor}
              setSelectedKeyColor={setSelectedKeyColor}
              difficulty={currentLevel.difficulty}
              onChangeDifficulty={handleChangeDifficulty}
              onOpenCodeView={() => setShowCodeModal(true)}
              onClearGrid={() => {
                const cleared = { ...currentLevel, entities: [] };
                setCurrentLevel(cleared);
                puzzleSceneRef.current?.loadLevel(cleared);
              }}
            />
          )}

          {/* Collapsible Bottom Dock (Zero Playfield Occlusion) */}
          <BottomDock
            currentTheme={currentLevel.theme}
            onChangeTheme={handleChangeTheme}
            onMovePlayer={handleMovePlayer}
            onRotateSelectedMirror={handleRotateMirrorAtPlayer}
            isEditMode={mode === 'EDITING'}
          />

          {/* Low-Code Banner Message Toast */}
          {gameState.bannerMessage && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-purple-950/90 border border-purple-500 text-purple-100 text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4">
              {gameState.bannerMessage}
            </div>
          )}

          {/* Victory Celebration Modal */}
          {gameState.isWon && mode === 'PLAYING' && (
            <VictoryModal
              gameState={gameState}
              onNextLevel={() => {
                const idx = PRESET_LEVELS.findIndex((l) => l.id === currentLevel.id);
                const next = PRESET_LEVELS[(idx + 1) % PRESET_LEVELS.length];
                handleSelectLevel(next);
              }}
              onReplay={handleRestartLevel}
              onEdit={() => setMode('EDITING')}
            />
          )}

          {/* Low-Code Visual Rule Builder Modal */}
          {showRulesModal && (
            <RuleBuilderModal
              level={currentLevel}
              onSaveRules={handleSaveRules}
              onClose={() => setShowRulesModal(false)}
            />
          )}

          {/* Code & JSON Import/Export Spec Modal */}
          {showCodeModal && (
            <CodeViewModal
              level={currentLevel}
              onImportLevel={(imported) => {
                setCurrentLevel(imported);
                handleRestartLevel();
              }}
              onClose={() => setShowCodeModal(false)}
            />
          )}
        </>
      )}

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />
    </main>
  );
}
