import React, { useRef, useState, useEffect } from 'react';
import { PitchBackground } from './PitchBackground';
import { PlayerMarker } from './PlayerMarker';
import { EquipmentMarker } from './EquipmentMarker';
import { DrawingCanvas } from './DrawingCanvas';
import {
  ExerciseDrill,
  Player,
  EquipmentItem,
  DrawingElement,
  ToolMode,
  TeamSettings,
  EquipmentType,
} from '../../types';

interface TacticalPitchProps {
  drill: ExerciseDrill;
  teamSettings: TeamSettings;
  activeTool: ToolMode;
  currentColor: string;
  currentStrokeWidth: number;
  selectedPlayerId: string | null;
  selectedEquipmentId: string | null;
  onSelectPlayer: (player: Player | null) => void;
  onSelectEquipment: (item: EquipmentItem | null) => void;
  onUpdatePlayerPosition: (id: string, x: number, y: number) => void;
  onRotatePlayer: (id: string, angle: number) => void;
  onDeletePlayer: (id: string) => void;
  onEditPlayer: (player: Player) => void;
  onUpdateEquipmentPosition: (id: string, x: number, y: number) => void;
  onRotateEquipment: (id: string, angle: number) => void;
  onDeleteEquipment: (id: string) => void;
  onAddDrawing: (drawing: DrawingElement) => void;
  onDeleteDrawing: (id: string) => void;
  onDropNewItem?: (type: 'player' | EquipmentType, clientX: number, clientY: number, data?: any) => void;
  isAnimating?: boolean;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  drill,
  teamSettings,
  activeTool,
  currentColor,
  currentStrokeWidth,
  selectedPlayerId,
  selectedEquipmentId,
  onSelectPlayer,
  onSelectEquipment,
  onUpdatePlayerPosition,
  onRotatePlayer,
  onDeletePlayer,
  onEditPlayer,
  onUpdateEquipmentPosition,
  onRotateEquipment,
  onDeleteEquipment,
  onAddDrawing,
  onDeleteDrawing,
  onDropNewItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerBounds, setContainerBounds] = useState<{ width: number; height: number }>({
    width: 900,
    height: 585,
  });

  // Track container dimensions via ResizeObserver for precise percentages
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerBounds({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const activePhase = drill.phases[drill.activePhaseIndex] || drill.phases[0] || {
    id: 'p-1',
    name: 'Fase 1',
    description: '',
    players: [],
    equipment: [],
    drawings: [],
  };

  const players = activePhase.players || [];
  const equipment = activePhase.equipment || [];
  const drawings = activePhase.drawings || [];

  // Handle Drag Over & Drop from bench/roster or toolbar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!onDropNewItem || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(2, Math.min(98, Number(x.toFixed(2))));
    const clampedY = Math.max(2, Math.min(98, Number(y.toFixed(2))));

    const rawData = e.dataTransfer.getData('application/json');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        onDropNewItem(parsed.type, clampedX, clampedY, parsed.data);
      } catch (err) {
        console.error('Error parsing dropped item', err);
      }
    }
  };

  const handlePitchBackgroundClick = (e: React.MouseEvent) => {
    // Only deselect if clicked directly and not drawing
    if (activeTool === 'select') {
      onSelectPlayer(null);
      onSelectEquipment(null);
    }
  };

  // Determine aspect ratio class based on view mode
  const getAspectRatioClass = () => {
    switch (drill.pitchView) {
      case 'full_vertical':
        return 'aspect-[650/1000] max-h-[82vh]';
      case 'half_attack':
      case 'half_defense':
        return 'aspect-[510/650] max-h-[80vh]';
      case 'attacking_third':
        return 'aspect-[350/650] max-h-[80vh]';
      case 'right_flank':
      case 'left_flank':
        return 'aspect-[1000/290] max-h-[60vh]';
      case 'penalty_box':
        return 'aspect-[220/410] max-h-[80vh]';
      case 'full_horizontal':
      default:
        return 'aspect-[1000/650] max-h-[78vh]';
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4 select-none">
      <div
        ref={containerRef}
        id="main-tactical-pitch-container"
        className={`relative w-full ${getAspectRatioClass()} rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900/60 bg-emerald-950 transition-all duration-300`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handlePitchBackgroundClick}
      >
        {/* 1. Base Pitch SVG Render */}
        <PitchBackground
          viewMode={drill.pitchView}
          theme={drill.pitchTheme}
          showZonesGrid={drill.showZonesGrid}
        />

        {/* 2. Tactical Vector Drawing Layer */}
        <DrawingCanvas
          drawings={drawings}
          activeTool={activeTool}
          currentColor={currentColor}
          currentStrokeWidth={currentStrokeWidth}
          onAddDrawing={onAddDrawing}
          onDeleteDrawing={onDeleteDrawing}
          containerBounds={containerBounds}
        />

        {/* 3. Equipment Layer */}
        {equipment.map((item) => (
          <EquipmentMarker
            key={item.id}
            item={item}
            isSelected={selectedEquipmentId === item.id}
            onSelect={(eq) => {
              onSelectEquipment(eq);
              onSelectPlayer(null);
            }}
            onUpdatePosition={onUpdateEquipmentPosition}
            onRotate={onRotateEquipment}
            onDelete={onDeleteEquipment}
            containerBounds={containerBounds}
          />
        ))}

        {/* 4. Players Layer */}
        {players.map((player) => (
          <PlayerMarker
            key={player.id}
            player={player}
            teamSettings={teamSettings}
            isSelected={selectedPlayerId === player.id}
            showName={drill.showPlayerNames}
            showNumber={drill.showPlayerNumbers}
            showPhoto={drill.showPlayerPhotos}
            onSelect={(pl) => {
              onSelectPlayer(pl);
              onSelectEquipment(null);
            }}
            onUpdatePosition={onUpdatePlayerPosition}
            onRotate={onRotatePlayer}
            onDelete={onDeletePlayer}
            onEdit={onEditPlayer}
            containerBounds={containerBounds}
          />
        ))}
      </div>
    </div>
  );
};
