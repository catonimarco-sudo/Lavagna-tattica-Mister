import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ExerciseDrill,
  Player,
  EquipmentItem,
  DrawingElement,
  ToolMode,
  PitchTheme,
  PitchViewMode,
  TeamSettings,
  EquipmentType,
  SyncSessionState,
} from './types';
import {
  DEFAULT_DRILL,
  DEFAULT_ROSTER,
  DEFAULT_TEAM_SETTINGS,
  FORMATIONS_PRESETS,
} from './constants/defaultData';
import { RealtimeSyncService, ConnectionStatus } from './services/syncService';
import { TacticalPitch } from './components/Pitch/TacticalPitch';
import { TacticalToolbar } from './components/Toolbar/TacticalToolbar';
import { PitchSelector } from './components/Toolbar/PitchSelector';
import { RosterManager } from './components/Roster/RosterManager';
import { DrillManager } from './components/DrillBuilder/DrillManager';
import { ExportModal } from './components/Export/ExportModal';
import { CloudSyncModal } from './components/Sync/CloudSyncModal';
import { PlayerEditModal } from './components/Roster/PlayerEditModal';
import {
  Shield,
  Users,
  BookOpen,
  Cloud,
  Download,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Copy,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  Radio,
  Pencil,
  Check,
  X,
  Layers,
} from 'lucide-react';

export default function App() {
  // 1. Initialize Core State from saved local storage immediately if present (prevents resetting on mount)
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) return roomParam.toUpperCase().trim();
      const savedRoom = localStorage.getItem('mister_tactics_active_room_v4');
      if (savedRoom) return savedRoom.toUpperCase().trim();
    }
    return 'MISTER-CALCIO-ROOM-1';
  });

  const [drill, setDrill] = useState<ExerciseDrill>(() => {
    if (typeof window !== 'undefined') {
      try {
        const activeRoom = localStorage.getItem('mister_tactics_active_room_v4') || 'MISTER-CALCIO-ROOM-1';
        const raw = localStorage.getItem(`mister_tactics_state_v4_${activeRoom.toUpperCase().trim()}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.drill && parsed.drill.phases && parsed.drill.phases.length > 0) {
            return parsed.drill;
          }
        }
      } catch (e) {
        console.warn('Could not restore saved drill:', e);
      }
    }
    return DEFAULT_DRILL;
  });

  const [roster, setRoster] = useState<Player[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const activeRoom = localStorage.getItem('mister_tactics_active_room_v4') || 'MISTER-CALCIO-ROOM-1';
        const raw = localStorage.getItem(`mister_tactics_state_v4_${activeRoom.toUpperCase().trim()}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.roster && parsed.roster.length > 0) {
            return parsed.roster;
          }
        }
      } catch (e) {
        console.warn('Could not restore saved roster:', e);
      }
    }
    return DEFAULT_ROSTER;
  });

  const [teamSettings, setTeamSettings] = useState<TeamSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const activeRoom = localStorage.getItem('mister_tactics_active_room_v4') || 'MISTER-CALCIO-ROOM-1';
        const raw = localStorage.getItem(`mister_tactics_state_v4_${activeRoom.toUpperCase().trim()}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.teamSettings) {
            return parsed.teamSettings;
          }
        }
      } catch (e) {
        console.warn('Could not restore saved teamSettings:', e);
      }
    }
    return DEFAULT_TEAM_SETTINGS;
  });

  // 2. Tactical Toolbar State
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [currentColor, setCurrentColor] = useState<string>('#ffffff');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(2.5);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // 3. Modals State
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isDrillModalOpen, setIsDrillModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // 4. Undo / Redo History Stack (for drawings)
  const [undoStack, setUndoStack] = useState<DrawingElement[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingElement[][]>([]);

  // 5. Multi-Phase Animation & Editing State
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const animationTimerRef = useRef<number | null>(null);
  const [editingPhaseIdx, setEditingPhaseIdx] = useState<number | null>(null);
  const [editingPhaseName, setEditingPhaseName] = useState<string>('');

  // 6. Realtime Cloud Sync State (AI Studio <-> Vercel Live Sync)
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const syncService = useRef(RealtimeSyncService.getInstance()).current;
  const isReceivingRemoteUpdate = useRef(false);
  const hasUserEditedLocally = useRef(false);

  // Load Room ID from URL if provided & listen for remote changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      const clean = roomParam.toUpperCase().trim();
      setRoomId(clean);
      syncService.setRoomId(clean);
    } else {
      const savedLocal = syncService.getSavedLocalState();
      if (savedLocal) {
        if (savedLocal.drill) setDrill(savedLocal.drill);
        if (savedLocal.roster) setRoster(savedLocal.roster);
        if (savedLocal.teamSettings) setTeamSettings(savedLocal.teamSettings);
        if (savedLocal.roomId) setRoomId(savedLocal.roomId);
        if (savedLocal.lastUpdated) setLastSyncTime(savedLocal.lastUpdated);
      }
    }

    // Attempt immediate cloud pull on mount
    syncService.fetchFromCloud().then((cloudState) => {
      if (cloudState && !hasUserEditedLocally.current) {
        isReceivingRemoteUpdate.current = true;
        if (cloudState.drill) setDrill(cloudState.drill);
        if (cloudState.roster) setRoster(cloudState.roster);
        if (cloudState.teamSettings) setTeamSettings(cloudState.teamSettings);
        if (cloudState.lastUpdated) setLastSyncTime(cloudState.lastUpdated);
        setTimeout(() => {
          isReceivingRemoteUpdate.current = false;
        }, 250);
      }
    });

    // Subscribe to realtime status changes
    const unsubStatus = syncService.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    // Subscribe to realtime changes from other tabs or remote instances (AI Studio <-> Vercel)
    const unsubscribe = syncService.subscribe((remoteState: SyncSessionState) => {
      isReceivingRemoteUpdate.current = true;
      if (remoteState.drill) setDrill(remoteState.drill);
      if (remoteState.roster) setRoster(remoteState.roster);
      if (remoteState.teamSettings) setTeamSettings(remoteState.teamSettings);
      if (remoteState.lastUpdated) setLastSyncTime(remoteState.lastUpdated);
      setTimeout(() => {
        isReceivingRemoteUpdate.current = false;
      }, 200);
    });

    return () => {
      unsubStatus();
      unsubscribe();
    };
  }, []);

  // Broadcast local changes to Cloud Sync (Only when user explicitly makes edits)
  const syncTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (isReceivingRemoteUpdate.current) return;
    if (!hasUserEditedLocally.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      const stateToPublish: SyncSessionState = {
        roomId,
        lastUpdated: Date.now(),
        author: 'Coach',
        drill,
        roster,
        teamSettings,
      };
      syncService.publishUpdate(stateToPublish);
      setLastSyncTime(stateToPublish.lastUpdated);
    }, 200);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [drill, roster, teamSettings, roomId]);

  // Phase Helpers
  const currentPhaseIndex = (typeof drill.activePhaseIndex === 'number' && drill.activePhaseIndex >= 0)
    ? drill.activePhaseIndex
    : 0;
  const currentPhase = drill.phases[currentPhaseIndex] || drill.phases[0] || {
    id: 'p-default',
    name: 'Fase 1',
    description: '',
    players: [],
    equipment: [],
    drawings: [],
  };

  // Helper to update current active phase
  const updateCurrentPhase = useCallback(
    (updater: (prevPhase: typeof currentPhase) => typeof currentPhase) => {
      hasUserEditedLocally.current = true;
      setDrill((prevDrill) => {
        const activeIdx = (typeof prevDrill.activePhaseIndex === 'number' && prevDrill.activePhaseIndex >= 0)
          ? prevDrill.activePhaseIndex
          : 0;
        const updatedPhases = [...prevDrill.phases];
        if (updatedPhases.length === 0) {
          updatedPhases.push({
            id: `phase-${Date.now()}`,
            name: 'Fase 1',
            description: '',
            players: [],
            equipment: [],
            drawings: [],
          });
        }
        const targetIdx = updatedPhases[activeIdx] ? activeIdx : 0;
        updatedPhases[targetIdx] = updater(updatedPhases[targetIdx]);
        return {
          ...prevDrill,
          activePhaseIndex: targetIdx,
          phases: updatedPhases,
        };
      });
    },
    []
  );

  // Handler to restore master 4-2-3-1 tactic across all devices
  const handleRestoreMasterDrill = () => {
    hasUserEditedLocally.current = true;
    setDrill(DEFAULT_DRILL);
    setRoster(DEFAULT_ROSTER);
    setTeamSettings(DEFAULT_TEAM_SETTINGS);
    syncService.publishUpdate({
      roomId,
      lastUpdated: Date.now(),
      author: 'Coach',
      drill: DEFAULT_DRILL,
      roster: DEFAULT_ROSTER,
      teamSettings: DEFAULT_TEAM_SETTINGS,
    });
    setLastSyncTime(Date.now());
  };

  // -------------------------------------------------------------
  // Player Operations on Pitch
  // -------------------------------------------------------------
  const handleUpdatePlayerPosition = (id: string, x: number, y: number) => {
    updateCurrentPhase((phase) => ({
      ...phase,
      players: phase.players.map((p) => (p.id === id ? { ...p, x, y } : p)),
    }));
  };

  const handleRotatePlayer = (id: string, angle: number) => {
    updateCurrentPhase((phase) => ({
      ...phase,
      players: phase.players.map((p) => (p.id === id ? { ...p, rotation: angle } : p)),
    }));
  };

  const handleDeletePlayerFromPitch = (id: string) => {
    updateCurrentPhase((phase) => ({
      ...phase,
      players: phase.players.filter((p) => p.id !== id),
    }));
    if (selectedPlayerId === id) setSelectedPlayerId(null);
  };

  const handleAddPlayerToPitch = (
    team: 'home' | 'away' | 'goalkeeper_home' | 'goalkeeper_away' | 'jolly',
    customX?: number,
    customY?: number,
    specificPlayerId?: string
  ) => {
    const targetX = customX !== undefined ? customX : Math.max(8, Math.min(92, 45 + (Math.random() * 14 - 7)));
    const targetY = customY !== undefined ? customY : Math.max(8, Math.min(92, 45 + (Math.random() * 14 - 7)));

    if (specificPlayerId) {
      const rosterPlayer = roster.find((p) => p.id === specificPlayerId);
      if (rosterPlayer) {
        const alreadyOnPitch = currentPhase.players.some((p) => p.id === specificPlayerId);
        if (alreadyOnPitch) {
          updateCurrentPhase((phase) => ({
            ...phase,
            players: phase.players.map((p) =>
              p.id === specificPlayerId ? { ...p, x: targetX, y: targetY } : p
            ),
          }));
        } else {
          updateCurrentPhase((phase) => ({
            ...phase,
            players: [...phase.players, { ...rosterPlayer, x: targetX, y: targetY }],
          }));
        }
        return;
      }
    }

    // Find next available player from roster or generate new one
    const availableFromRoster = roster.find(
      (r) =>
        (r.team === team ||
          (team === 'home' && r.team === 'goalkeeper_home') ||
          (team === 'goalkeeper_home' && (r.role === 'POR' || r.team === 'goalkeeper_home'))) &&
        !currentPhase.players.some((p) => p.id === r.id)
    );

    if (availableFromRoster) {
      const newPlayerInstance: Player = {
        ...availableFromRoster,
        team: team === 'goalkeeper_home' ? 'goalkeeper_home' : availableFromRoster.team,
        x: targetX,
        y: targetY,
      };
      updateCurrentPhase((phase) => ({
        ...phase,
        players: [...phase.players, newPlayerInstance],
      }));
    } else {
      const nextNum = currentPhase.players.length + 1;
      const newPl: Player = {
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: `Giocatore ${nextNum}`,
        number: nextNum,
        role: team === 'goalkeeper_home' ? 'POR' : 'CC',
        team,
        foot: 'Destro',
        x: targetX,
        y: targetY,
      };
      setRoster((prev) => [...prev, newPl]);
      updateCurrentPhase((phase) => ({
        ...phase,
        players: [...phase.players, newPl],
      }));
    }
  };

  // -------------------------------------------------------------
  // Equipment Operations
  // -------------------------------------------------------------
  const handleAddEquipment = (type: EquipmentType, x?: number, y?: number) => {
    const targetX = x !== undefined ? x : Number((45 + (Math.random() * 16 - 8)).toFixed(2));
    const targetY = y !== undefined ? y : Number((45 + (Math.random() * 16 - 8)).toFixed(2));
    const newItem: EquipmentItem = {
      id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      x: targetX,
      y: targetY,
      rotation: 0,
    };
    updateCurrentPhase((phase) => ({
      ...phase,
      equipment: [...phase.equipment, newItem],
    }));
  };

  const handleUpdateEquipmentPosition = (id: string, x: number, y: number) => {
    updateCurrentPhase((phase) => ({
      ...phase,
      equipment: phase.equipment.map((eq) => (eq.id === id ? { ...eq, x, y } : eq)),
    }));
  };

  const handleRotateEquipment = (id: string, angle: number) => {
    updateCurrentPhase((phase) => ({
      ...phase,
      equipment: phase.equipment.map((eq) => (eq.id === id ? { ...eq, rotation: angle } : eq)),
    }));
  };

  const handleDeleteEquipment = (id: string) => {
    updateCurrentPhase((phase) => ({
      ...phase,
      equipment: phase.equipment.filter((eq) => eq.id !== id),
    }));
    if (selectedEquipmentId === id) setSelectedEquipmentId(null);
  };

  // -------------------------------------------------------------
  // Tactical Drawings & Undo / Redo / Clear Pitch Commands
  // -------------------------------------------------------------
  const handleAddDrawing = (drawing: DrawingElement) => {
    setUndoStack((prev) => [...prev, currentPhase.drawings]);
    setRedoStack([]); // Clear redo
    updateCurrentPhase((phase) => ({
      ...phase,
      drawings: [...phase.drawings, drawing],
    }));
  };

  const handleDeleteDrawing = (id: string) => {
    setUndoStack((prev) => [...prev, currentPhase.drawings]);
    setRedoStack([]);
    updateCurrentPhase((phase) => ({
      ...phase,
      drawings: phase.drawings.filter((d) => d.id !== id),
    }));
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousDrawings = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, currentPhase.drawings]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    updateCurrentPhase((phase) => ({
      ...phase,
      drawings: previousDrawings,
    }));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextDrawings = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, currentPhase.drawings]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));

    updateCurrentPhase((phase) => ({
      ...phase,
      drawings: nextDrawings,
    }));
  };

  const handleClearDrawings = () => {
    if (currentPhase.drawings.length === 0) return;
    setUndoStack((prev) => [...prev, currentPhase.drawings]);
    setRedoStack([]);
    updateCurrentPhase((phase) => ({
      ...phase,
      drawings: [],
    }));
  };

  // Svuota Campo Completo (Fase Corrente): Rimuove tutti i giocatori, coni, palloni e disegni
  const handleClearPitchCurrentPhase = () => {
    setSelectedPlayerId(null);
    setSelectedEquipmentId(null);
    setEditingPlayer(null);
    setUndoStack((prev) => [...prev, currentPhase.drawings]);
    setRedoStack([]);
    updateCurrentPhase((phase) => ({
      ...phase,
      players: [],
      equipment: [],
      drawings: [],
    }));
  };

  // Svuota Tutto l'Esercizio (Tutte le Fasi): Ripristina 1 singola fase vuota da zero
  const handleClearAllPhases = () => {
    setSelectedPlayerId(null);
    setSelectedEquipmentId(null);
    setEditingPlayer(null);
    setUndoStack([]);
    setRedoStack([]);
    setDrill((prev) => ({
      ...prev,
      activePhaseIndex: 0,
      phases: [
        {
          id: `phase-${Date.now()}`,
          name: 'Fase 1',
          description: 'Fase iniziale vuota',
          players: [],
          equipment: [],
          drawings: [],
        },
      ],
    }));
  };

  // Rimuovi Solo Giocatori dal campo nella fase attiva
  const handleClearPlayersOnly = () => {
    setSelectedPlayerId(null);
    setEditingPlayer(null);
    updateCurrentPhase((phase) => ({
      ...phase,
      players: [],
    }));
  };

  // Rimuovi Solo Coni & Attrezzatura dal campo nella fase attiva
  const handleClearEquipmentOnly = () => {
    setSelectedEquipmentId(null);
    updateCurrentPhase((phase) => ({
      ...phase,
      equipment: [],
    }));
  };

  // -------------------------------------------------------------
  // Drag and Drop from Tray / Roster onto Pitch
  // -------------------------------------------------------------
  const handleDropNewItem = (
    type: 'player' | EquipmentType,
    x: number,
    y: number,
    data?: any
  ) => {
    if (type === 'player') {
      const team = data?.team || 'home';
      const playerId = data?.playerId;
      handleAddPlayerToPitch(team, x, y, playerId);
    } else {
      handleAddEquipment(type as EquipmentType, x, y);
    }
  };

  // -------------------------------------------------------------
  // Formations Preset Application
  // -------------------------------------------------------------
  const handleApplyFormation = (formationKey: string) => {
    const formation = FORMATIONS_PRESETS[formationKey];
    if (!formation) return;

    // Use current home players or take from roster
    const activeHomePlayers = currentPhase.players.filter((p) => p.team === 'home' || p.team === 'goalkeeper_home');
    const availableRoster = roster.filter((p) => p.team === 'home' || p.team === 'goalkeeper_home');

    const updatedPlayers: Player[] = formation.positions.map((pos, idx) => {
      const existing = activeHomePlayers[idx] || availableRoster[idx];
      if (existing) {
        return {
          ...existing,
          role: pos.role,
          x: pos.x,
          y: pos.y,
        };
      }
      return {
        id: `p-${Date.now()}-${idx}`,
        name: `Giocatore ${idx + 1}`,
        number: idx + 1,
        role: pos.role,
        team: pos.role === 'POR' ? 'goalkeeper_home' : 'home',
        foot: 'Destro',
        x: pos.x,
        y: pos.y,
      };
    });

    // Keep away and jolly players untouched
    const otherPlayers = currentPhase.players.filter((p) => p.team !== 'home' && p.team !== 'goalkeeper_home');

    updateCurrentPhase((phase) => ({
      ...phase,
      players: [...updatedPlayers, ...otherPlayers],
    }));
  };

  // -------------------------------------------------------------
  // Multi-Phase Animation Player with Smooth Fluid Transitions
  // -------------------------------------------------------------
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  const togglePlayAnimation = () => {
    if (isPlayingAnimation) {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      setIsPlayingAnimation(false);
    } else {
      setIsPlayingAnimation(true);
    }
  };

  const handleStepPhase = (direction: 'prev' | 'next') => {
    setDrill((prev) => {
      const total = prev.phases.length;
      if (total <= 1) return prev;
      const nextIdx =
        direction === 'next'
          ? (prev.activePhaseIndex + 1) % total
          : (prev.activePhaseIndex - 1 + total) % total;
      return { ...prev, activePhaseIndex: nextIdx };
    });
  };

  useEffect(() => {
    if (!isPlayingAnimation) return;

    const intervalMs = Math.round(2200 / animationSpeed);

    animationTimerRef.current = window.setInterval(() => {
      setDrill((prev) => {
        const nextIdx = (prev.activePhaseIndex + 1) % prev.phases.length;
        return { ...prev, activePhaseIndex: nextIdx };
      });
    }, intervalMs);

    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlayingAnimation, drill.phases.length, animationSpeed]);

  const handleAddPhase = () => {
    const newIdx = drill.phases.length + 1;
    const newPhase = {
      id: `phase-${Date.now()}`,
      name: `Fase ${newIdx}`,
      description: `Svolgimento fase ${newIdx}`,
      players: currentPhase.players.map((p) => ({ ...p })),
      equipment: currentPhase.equipment.map((eq) => ({ ...eq })),
      drawings: [],
    };
    setDrill((prev) => ({
      ...prev,
      phases: [...prev.phases, newPhase],
      activePhaseIndex: prev.phases.length,
    }));
  };

  const handleDuplicatePhase = (index: number) => {
    const target = drill.phases[index];
    if (!target) return;
    const duplicated = {
      ...target,
      id: `phase-${Date.now()}`,
      name: `${target.name} (Copia)`,
      players: target.players.map((p) => ({ ...p })),
      equipment: target.equipment.map((eq) => ({ ...eq })),
      drawings: target.drawings.map((d) => ({ ...d })),
    };
    setDrill((prev) => ({
      ...prev,
      phases: [...prev.phases.slice(0, index + 1), duplicated, ...prev.phases.slice(index + 1)],
      activePhaseIndex: index + 1,
    }));
  };

  const handleDeletePhase = (index: number) => {
    if (drill.phases.length <= 1) return;
    setDrill((prev) => {
      const nextPhases = prev.phases.filter((_, i) => i !== index);
      const nextActive = Math.min(prev.activePhaseIndex, nextPhases.length - 1);
      return {
        ...prev,
        phases: nextPhases,
        activePhaseIndex: nextActive,
      };
    });
  };

  const handleStartEditingPhase = (index: number, currentName: string) => {
    setEditingPhaseIdx(index);
    setEditingPhaseName(currentName);
  };

  const handleSaveEditingPhase = (index: number) => {
    const trimmed = editingPhaseName.trim();
    if (trimmed) {
      setDrill((prev) => {
        const nextPhases = [...prev.phases];
        if (nextPhases[index]) {
          nextPhases[index] = {
            ...nextPhases[index],
            name: trimmed,
          };
        }
        return {
          ...prev,
          phases: nextPhases,
        };
      });
    }
    setEditingPhaseIdx(null);
    setEditingPhaseName('');
  };

  const handleCancelEditingPhase = () => {
    setEditingPhaseIdx(null);
    setEditingPhaseName('');
  };

  const handleAutoRenumberPhases = () => {
    setDrill((prev) => ({
      ...prev,
      phases: prev.phases.map((phase, idx) => ({
        ...phase,
        name: `Fase ${idx + 1}`,
      })),
    }));
  };

  // -------------------------------------------------------------
  // JSON Backup / Import
  // -------------------------------------------------------------
  const handleExportJson = () => {
    const fullState: SyncSessionState = {
      roomId,
      lastUpdated: Date.now(),
      author: 'Coach',
      drill,
      roster,
      teamSettings,
    };
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mister_tactics_${roomId.toLowerCase()}_backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as SyncSessionState;
        if (parsed.drill) setDrill(parsed.drill);
        if (parsed.roster) setRoster(parsed.roster);
        if (parsed.teamSettings) setTeamSettings(parsed.teamSettings);
        if (parsed.roomId) {
          setRoomId(parsed.roomId);
          syncService.setRoomId(parsed.roomId);
        }
        alert('Dati importati con successo!');
      } catch (err) {
        alert('File JSON non valido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* 1. Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 shadow-md z-30">
        {/* Brand & Exercise Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40">
            <span className="text-xl">⚽</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
                MisterTactics
              </h1>
              <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline-block">
                {drill.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-md">
              {drill.title}
            </p>
          </div>
        </div>

        {/* Action Center Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Roster & Players Modal Button */}
          <button
            id="nav-btn-roster"
            type="button"
            onClick={() => setIsRosterModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Rosa Squadra</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-[10px] font-bold text-sky-300">
              {currentPhase.players.length}/{roster.length}
            </span>
          </button>

          {/* Drill Details Modal */}
          <button
            id="nav-btn-drill-details"
            type="button"
            onClick={() => setIsDrillModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Scheda Esercizio</span>
          </button>

          {/* Realtime Cloud Sync Button (AI Studio <-> Vercel) */}
          <button
            id="nav-btn-cloud-sync"
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className={`px-2.5 sm:px-3 py-1.5 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              connectionStatus === 'connected'
                ? 'bg-sky-950/80 hover:bg-sky-900 border-sky-500/50 text-sky-200'
                : connectionStatus === 'connecting'
                ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/50 text-amber-200'
                : 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/50 text-rose-200'
            }`}
            title={`Sincronizzazione Live AI Studio & Vercel (${
              connectionStatus === 'connected'
                ? 'Connesso'
                : connectionStatus === 'connecting'
                ? 'Connessione in corso'
                : 'Disconnesso'
            })`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}></span>
            </span>
            <Cloud className="w-4 h-4" />
            <span className="hidden sm:inline">
              {connectionStatus === 'connected' ? 'Live Sync' : connectionStatus === 'connecting' ? 'Sync...' : 'Offline'}
            </span>
          </button>

          {/* Export PDF / JPEG */}
          <button
            id="nav-btn-export"
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Esporta</span>
          </button>
        </div>
      </header>

      {/* 2. Tactical Toolbar (Tools, Colors, Cones & Equipment) */}
      <TacticalToolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        currentColor={currentColor}
        onChangeColor={setCurrentColor}
        currentStrokeWidth={currentStrokeWidth}
        onChangeStrokeWidth={setCurrentStrokeWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onClearDrawings={handleClearDrawings}
        onClearPitch={handleClearPitchCurrentPhase}
        onClearAllPhases={handleClearAllPhases}
        onClearPlayersOnly={handleClearPlayersOnly}
        onClearEquipmentOnly={handleClearEquipmentOnly}
        onAddEquipment={(type) => handleAddEquipment(type)}
        onAddPlayer={handleAddPlayerToPitch}
        showZonesGrid={drill.showZonesGrid}
        onToggleZonesGrid={() => setDrill((prev) => ({ ...prev, showZonesGrid: !prev.showZonesGrid }))}
      />

      {/* 3. Pitch Selector & Section Cuts Bar */}
      <PitchSelector
        currentView={drill.pitchView}
        onChangeView={(view) => setDrill((prev) => ({ ...prev, pitchView: view }))}
        currentTheme={drill.pitchTheme}
        onChangeTheme={(theme) => setDrill((prev) => ({ ...prev, pitchTheme: theme }))}
        showNames={drill.showPlayerNames}
        onToggleNames={() => setDrill((prev) => ({ ...prev, showPlayerNames: !prev.showPlayerNames }))}
        showNumbers={drill.showPlayerNumbers}
        onToggleNumbers={() => setDrill((prev) => ({ ...prev, showPlayerNumbers: !prev.showPlayerNumbers }))}
        showPhotos={drill.showPlayerPhotos}
        onTogglePhotos={() => setDrill((prev) => ({ ...prev, showPlayerPhotos: !prev.showPlayerPhotos }))}
        playerRenderMode={drill.playerRenderMode || 'jersey'}
        onTogglePlayerRenderMode={() =>
          setDrill((prev) => ({
            ...prev,
            playerRenderMode: prev.playerRenderMode === 'jersey' ? 'circle' : 'jersey',
          }))
        }
        showRepartoLines={drill.showRepartoLines || false}
        onToggleRepartoLines={() =>
          setDrill((prev) => ({
            ...prev,
            showRepartoLines: !prev.showRepartoLines,
          }))
        }
        onApplyFormation={handleApplyFormation}
      />

      {/* 4. Central Area: Tactical Pitch & Side Bench */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto relative">
        <TacticalPitch
          drill={drill}
          teamSettings={teamSettings}
          activeTool={activeTool}
          currentColor={currentColor}
          currentStrokeWidth={currentStrokeWidth}
          selectedPlayerId={selectedPlayerId}
          selectedEquipmentId={selectedEquipmentId}
          onSelectPlayer={(p) => setSelectedPlayerId(p ? p.id : null)}
          onSelectEquipment={(eq) => setSelectedEquipmentId(eq ? eq.id : null)}
          onUpdatePlayerPosition={handleUpdatePlayerPosition}
          onRotatePlayer={handleRotatePlayer}
          onDeletePlayer={handleDeletePlayerFromPitch}
          onEditPlayer={(p) => setEditingPlayer(p)}
          onUpdateEquipmentPosition={handleUpdateEquipmentPosition}
          onRotateEquipment={handleRotateEquipment}
          onDeleteEquipment={handleDeleteEquipment}
          onAddDrawing={handleAddDrawing}
          onDeleteDrawing={handleDeleteDrawing}
          onDropNewItem={handleDropNewItem}
          isAnimating={isPlayingAnimation}
        />
      </main>

      {/* 5. Bottom Tactical Phase & Animation Stepper Bar */}
      <footer className="bg-slate-900 border-t border-slate-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xl z-30">
        {/* Phase Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            Fasi Esercizio:
          </span>

          {drill.phases.map((phase, idx) => {
            const isActive = drill.activePhaseIndex === idx;
            const isEditing = editingPhaseIdx === idx;

            if (isEditing) {
              return (
                <div
                  key={phase.id || idx}
                  className="flex items-center gap-1 bg-slate-800 border border-sky-400 rounded-xl px-2 py-1 shadow-lg shrink-0"
                >
                  <span className="text-xs font-bold text-sky-400">{idx + 1}.</span>
                  <input
                    type="text"
                    autoFocus
                    value={editingPhaseName}
                    onChange={(e) => setEditingPhaseName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEditingPhase(idx);
                      if (e.key === 'Escape') handleCancelEditingPhase();
                    }}
                    placeholder={`Fase ${idx + 1}`}
                    className="bg-slate-900 text-white text-xs font-semibold px-2 py-0.5 rounded border border-slate-700 outline-none w-28 focus:border-sky-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEditingPhase(idx)}
                    className="p-1 hover:bg-emerald-600/30 text-emerald-400 rounded transition-colors"
                    title="Salva Nome (Invio)"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditingPhase}
                    className="p-1 hover:bg-rose-600/30 text-rose-400 rounded transition-colors"
                    title="Annulla (Esc)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={phase.id || idx}
                className={`group relative flex items-center rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-400'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                }`}
              >
                <button
                  id={`phase-step-btn-${idx}`}
                  type="button"
                  onClick={() => setDrill((prev) => ({ ...prev, activePhaseIndex: idx }))}
                  onDoubleClick={() => handleStartEditingPhase(idx, phase.name || `Fase ${idx + 1}`)}
                  className="px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer"
                  title="Clicca per selezionare • Fai doppio clic per rinominare"
                >
                  <span className="opacity-70">{idx + 1}.</span>
                  <span>{phase.name || `Fase ${idx + 1}`}</span>
                </button>

                {/* Quick actions on tab */}
                <div className="flex items-center pr-1.5 gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditingPhase(idx, phase.name || `Fase ${idx + 1}`);
                    }}
                    className={`p-1 rounded hover:bg-black/20 text-sky-200 transition-colors ${
                      isActive ? 'opacity-90 hover:opacity-100' : 'opacity-0 group-hover:opacity-75'
                    }`}
                    title="Rinomina fase (es. Fase 1)"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicatePhase(idx);
                    }}
                    className={`p-1 rounded hover:bg-black/20 text-sky-200 transition-colors ${
                      isActive ? 'opacity-90 hover:opacity-100' : 'opacity-0 group-hover:opacity-75'
                    }`}
                    title="Duplica fase"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  {drill.phases.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDrill((prev) => {
                          const nextPhases = prev.phases.filter((_, i) => i !== idx);
                          const nextActive = Math.min(prev.activePhaseIndex, nextPhases.length - 1);
                          return {
                            ...prev,
                            phases: nextPhases,
                            activePhaseIndex: nextActive,
                          };
                        });
                      }}
                      className={`p-1 rounded hover:bg-rose-900/60 text-rose-300 transition-colors ${
                        isActive ? 'opacity-90 hover:opacity-100' : 'opacity-0 group-hover:opacity-75'
                      }`}
                      title="Elimina fase"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button
            id="btn-footer-add-phase"
            type="button"
            onClick={handleAddPhase}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-colors"
            title="Aggiungi Nuova Fase Tattica"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            id="btn-footer-renumber-phases"
            type="button"
            onClick={handleAutoRenumberPhases}
            className="px-2 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-sky-300 border border-slate-700 rounded-xl text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
            title="Rinomina e riordina automaticamente in: Fase 1, Fase 2, Fase 3..."
          >
            <RotateCcw className="w-3 h-3 text-sky-400" />
            <span className="hidden md:inline">Rinumera (1, 2, 3...)</span>
          </button>
        </div>

        {/* Animation Playback & Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Step Backwards */}
          <button
            id="btn-prev-phase"
            type="button"
            onClick={() => handleStepPhase('prev')}
            disabled={drill.phases.length <= 1}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold transition-all"
            title="Fase Precedente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            id="btn-play-animation"
            type="button"
            onClick={togglePlayAnimation}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
              isPlayingAnimation
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
            }`}
            title="Avvia / Interrompi animazione continua tra le fasi"
          >
            {isPlayingAnimation ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlayingAnimation ? 'Pausa' : 'Riproduci'}</span>
          </button>

          {/* Step Forwards */}
          <button
            id="btn-next-phase"
            type="button"
            onClick={() => handleStepPhase('next')}
            disabled={drill.phases.length <= 1}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold transition-all"
            title="Fase Successiva"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="hidden sm:flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[11px] font-semibold text-slate-400">
            {[0.75, 1, 1.5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setAnimationSpeed(speed)}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  animationSpeed === speed
                    ? 'bg-sky-600 text-white shadow-xs font-bold'
                    : 'hover:text-slate-200'
                }`}
                title={`Velocità animazione: ${speed}x`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Quick Room Sync Badge in Footer */}
          <div
            onClick={() => setIsSyncModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 cursor-pointer hover:border-sky-500 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Room: <strong className="text-white font-mono">{roomId}</strong></span>
          </div>
        </div>
      </footer>

      {/* 6. Modals */}
      {/* Roster & Squad Manager */}
      <RosterManager
        roster={roster}
        activePlayersOnPitch={currentPhase.players}
        teamSettings={teamSettings}
        onAddPlayer={(newP) => setRoster((prev) => [...prev, newP])}
        onUpdatePlayer={(upP) => {
          setRoster((prev) => prev.map((p) => (p.id === upP.id ? upP : p)));
          updateCurrentPhase((phase) => ({
            ...phase,
            players: phase.players.map((p) => (p.id === upP.id ? { ...p, ...upP } : p)),
          }));
        }}
        onDeletePlayer={(id) => {
          setRoster((prev) => prev.filter((p) => p.id !== id));
          handleDeletePlayerFromPitch(id);
        }}
        onResetRoster={() => {
          setRoster(DEFAULT_ROSTER);
          setDrill(DEFAULT_DRILL);
          syncService.publishUpdate({
            roomId,
            lastUpdated: Date.now(),
            author: 'Coach',
            drill: DEFAULT_DRILL,
            roster: DEFAULT_ROSTER,
            teamSettings: DEFAULT_TEAM_SETTINGS,
          });
        }}
        onPlaceOnPitch={(player) => {
          const alreadyOn = currentPhase.players.find((p) => p.id === player.id);
          if (!alreadyOn) {
            updateCurrentPhase((phase) => ({
              ...phase,
              players: [...phase.players, { ...player, x: 50, y: 50 }],
            }));
          }
          setIsRosterModalOpen(false);
        }}
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
      />

      {/* Drill & Exercise Manager */}
      <DrillManager
        drill={drill}
        onUpdateDrill={(updated) => setDrill((prev) => ({ ...prev, ...updated }))}
        onSelectPhase={(idx) => setDrill((prev) => ({ ...prev, activePhaseIndex: idx }))}
        onAddPhase={handleAddPhase}
        onDuplicatePhase={handleDuplicatePhase}
        onDeletePhase={handleDeletePhase}
        isPlayingAnimation={isPlayingAnimation}
        onTogglePlayAnimation={togglePlayAnimation}
        onResetAnimation={() => setDrill((prev) => ({ ...prev, activePhaseIndex: 0 }))}
        isOpen={isDrillModalOpen}
        onClose={() => setIsDrillModalOpen(false)}
      />

      {/* Export Modal (PDF / JPEG / PNG) */}
      <ExportModal
        drill={drill}
        roster={roster}
        teamSettings={teamSettings}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Cloud Realtime Sync Modal (AI Studio <-> Vercel) */}
      <CloudSyncModal
        roomId={roomId}
        onSetRoomId={(newRoom) => {
          setRoomId(newRoom);
          syncService.setRoomId(newRoom, {
            roomId: newRoom,
            lastUpdated: Date.now(),
            author: 'Coach',
            drill,
            roster,
            teamSettings,
          });
        }}
        onForceSync={async () => {
          await syncService.publishUpdate({
            roomId,
            lastUpdated: Date.now(),
            author: 'Coach',
            drill,
            roster,
            teamSettings,
          });
          setLastSyncTime(Date.now());
        }}
        onPullFromCloud={async () => {
          const remote = await syncService.fetchFromCloud();
          if (remote) {
            isReceivingRemoteUpdate.current = true;
            if (remote.drill) setDrill(remote.drill);
            if (remote.roster) setRoster(remote.roster);
            if (remote.teamSettings) setTeamSettings(remote.teamSettings);
            if (remote.lastUpdated) setLastSyncTime(remote.lastUpdated);
            setTimeout(() => {
              isReceivingRemoteUpdate.current = false;
            }, 250);
            return true;
          }
          return false;
        }}
        onRestoreMasterDrill={handleRestoreMasterDrill}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        lastUpdatedTime={lastSyncTime}
        connectionStatus={connectionStatus}
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      {/* Quick Player Field Edit Modal */}
      <PlayerEditModal
        player={editingPlayer}
        teamSettings={teamSettings}
        onSave={(updated) => {
          setRoster((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          updateCurrentPhase((phase) => ({
            ...phase,
            players: phase.players.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
          }));
          setEditingPlayer(null);
        }}
        onDelete={(id) => {
          handleDeletePlayerFromPitch(id);
          setEditingPlayer(null);
        }}
        onClose={() => setEditingPlayer(null)}
      />
    </div>
  );
}
