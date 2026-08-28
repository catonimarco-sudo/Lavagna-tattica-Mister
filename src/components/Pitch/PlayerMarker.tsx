import React, { useState, useRef } from 'react';
import { Player, TeamSettings } from '../../types';
import { RotateCw, Trash2, Edit3, Camera } from 'lucide-react';

interface PlayerMarkerProps {
  player: Player;
  teamSettings: TeamSettings;
  isSelected: boolean;
  showName: boolean;
  showNumber: boolean;
  showPhoto: boolean;
  onSelect: (player: Player) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onRotate?: (id: string, angle: number) => void;
  onDelete?: (id: string) => void;
  onEdit?: (player: Player) => void;
  containerBounds: { width: number; height: number };
}

export const PlayerMarker: React.FC<PlayerMarkerProps> = ({
  player,
  teamSettings,
  isSelected,
  showName,
  showNumber,
  showPhoto,
  onSelect,
  onUpdatePosition,
  onRotate,
  onDelete,
  onEdit,
  containerBounds,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const dragStartPos = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: player.x,
    startY: player.y,
  });

  // Calculate colors based on team
  const getPlayerColors = () => {
    if (player.customColor) {
      return {
        bg: player.customColor,
        text: player.customTextColor || '#ffffff',
        border: 'rgba(255,255,255,0.7)',
        glow: player.customColor,
      };
    }
    switch (player.team) {
      case 'home':
        return {
          bg: teamSettings.homeTeamColor,
          text: teamSettings.homeTeamTextColor,
          border: 'rgba(255,255,255,0.85)',
          glow: teamSettings.homeTeamColor,
        };
      case 'away':
        return {
          bg: teamSettings.awayTeamColor,
          text: teamSettings.awayTeamTextColor,
          border: 'rgba(255,255,255,0.85)',
          glow: teamSettings.awayTeamColor,
        };
      case 'goalkeeper_home':
      case 'goalkeeper_away':
        return {
          bg: teamSettings.gkColor,
          text: '#0f172a',
          border: '#ffffff',
          glow: teamSettings.gkColor,
        };
      case 'jolly':
      default:
        return {
          bg: teamSettings.jollyColor,
          text: '#ffffff',
          border: 'rgba(255,255,255,0.85)',
          glow: teamSettings.jollyColor,
        };
    }
  };

  const colors = getPlayerColors();
  const rotation = player.rotation || 0;

  // Drag start handler
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(player);
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragStartPos.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: player.x,
      startY: player.y,
    };
  };

  // Drag move handler
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerBounds.width || !containerBounds.height) return;

    const deltaX = e.clientX - dragStartPos.current.clientX;
    const deltaY = e.clientY - dragStartPos.current.clientY;

    const deltaPercentX = (deltaX / containerBounds.width) * 100;
    const deltaPercentY = (deltaY / containerBounds.height) * 100;

    let newX = dragStartPos.current.startX + deltaPercentX;
    let newY = dragStartPos.current.startY + deltaPercentY;

    // Clamp inside pitch boundaries
    newX = Math.max(1, Math.min(99, newX));
    newY = Math.max(1, Math.min(99, newY));

    onUpdatePosition(player.id, Number(newX.toFixed(2)), Number(newY.toFixed(2)));
  };

  // Drag end handler
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  // Quick rotation step (45 degrees)
  const handleRotateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRotate) {
      const nextAngle = (rotation + 45) % 360;
      onRotate(player.id, nextAngle);
    }
  };

  return (
    <div
      id={`player-marker-${player.id}`}
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`absolute select-none cursor-grab active:cursor-grabbing z-20 group transition-shadow duration-150 ${
        isDragging ? 'z-40 scale-110' : ''
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 1. Body Orientation Pointer Arrow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform"
        style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
      >
        <div
          className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[9px] -translate-y-[26px] opacity-80"
          style={{ borderBottomColor: colors.bg }}
        />
      </div>

      {/* 2. Main Player Token */}
      <div
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderColor: isSelected ? '#fbbf24' : colors.border,
          boxShadow: isSelected
            ? `0 0 0 3px #fbbf24, 0 8px 16px rgba(0,0,0,0.4)`
            : `0 4px 10px rgba(0,0,0,0.35)`,
        }}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm sm:text-base relative overflow-hidden transition-all duration-150 ${
          isSelected ? 'ring-2 ring-yellow-400' : ''
        }`}
      >
        {/* Photo Avatar if present */}
        {showPhoto && player.photoUrl ? (
          <img
            src={player.photoUrl}
            alt={player.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="leading-none drop-shadow-sm">
            {showNumber ? player.number : player.role}
          </span>
        )}

        {/* Small number badge overlay if photo is active */}
        {showPhoto && player.photoUrl && showNumber && (
          <div
            style={{ backgroundColor: colors.bg, color: colors.text }}
            className="absolute bottom-0 right-0 text-[9px] font-extrabold px-1 rounded-tl-md border-t border-l border-white/50 leading-tight"
          >
            {player.number}
          </div>
        )}
      </div>

      {/* 3. Player Name & Role Label Badge (Below marker) */}
      {showName && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 pointer-events-none flex flex-col items-center">
          <div className="px-1.5 py-0.5 rounded bg-slate-950/85 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-medium whitespace-nowrap border border-white/15 shadow-sm">
            <span className="font-bold text-amber-300 mr-1">{player.role}</span>
            {player.name}
          </div>
        </div>
      )}

      {/* 4. Quick Action Floating Menu on Selection */}
      {isSelected && (
        <div
          className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md px-1.5 py-1 rounded-lg border border-slate-700 shadow-xl z-50 text-white animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {onRotate && (
            <button
              id={`btn-rotate-${player.id}`}
              type="button"
              onClick={handleRotateClick}
              title="Ruota orientamento (+45°)"
              className="p-1 hover:bg-slate-700 rounded text-slate-200 hover:text-white transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {onEdit && (
            <button
              id={`btn-edit-${player.id}`}
              type="button"
              onClick={() => onEdit(player)}
              title="Modifica Giocatore / Carica Foto"
              className="p-1 hover:bg-slate-700 rounded text-sky-400 hover:text-sky-300 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              id={`btn-delete-${player.id}`}
              type="button"
              onClick={() => onDelete(player.id)}
              title="Rimuovi dal campo"
              className="p-1 hover:bg-red-900/50 rounded text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
