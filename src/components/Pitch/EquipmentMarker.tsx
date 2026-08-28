import React, { useState, useRef } from 'react';
import { EquipmentItem, EquipmentType } from '../../types';
import { Trash2, RotateCw } from 'lucide-react';

interface EquipmentMarkerProps {
  item: EquipmentItem;
  isSelected: boolean;
  onSelect: (item: EquipmentItem) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onRotate?: (id: string, angle: number) => void;
  onDelete?: (id: string) => void;
  containerBounds: { width: number; height: number };
}

export const EquipmentMarker: React.FC<EquipmentMarkerProps> = ({
  item,
  isSelected,
  onSelect,
  onUpdatePosition,
  onRotate,
  onDelete,
  containerBounds,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: item.x,
    startY: item.y,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(item);
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragStartPos.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: item.x,
      startY: item.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerBounds.width || !containerBounds.height) return;

    const deltaX = e.clientX - dragStartPos.current.clientX;
    const deltaY = e.clientY - dragStartPos.current.clientY;

    const deltaPercentX = (deltaX / containerBounds.width) * 100;
    const deltaPercentY = (deltaY / containerBounds.height) * 100;

    let newX = dragStartPos.current.startX + deltaPercentX;
    let newY = dragStartPos.current.startY + deltaPercentY;

    newX = Math.max(1, Math.min(99, newX));
    newY = Math.max(1, Math.min(99, newY));

    onUpdatePosition(item.id, Number(newX.toFixed(2)), Number(newY.toFixed(2)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRotate) {
      const nextAngle = ((item.rotation || 0) + 45) % 360;
      onRotate(item.id, nextAngle);
    }
  };

  // Render authentic realistic SVG icons for each equipment item
  const renderEquipmentVisual = () => {
    switch (item.type) {
      case 'cone':
        // Conetto Alto da Calcio
        return (
          <svg viewBox="0 0 40 40" className="w-7 h-7 drop-shadow-md">
            <ellipse cx="20" cy="34" rx="14" ry="4" fill="rgba(0,0,0,0.3)" />
            {/* Cone Base */}
            <rect x="8" y="32" width="24" height="4" rx="1.5" fill="#ea580c" stroke="#c2410c" strokeWidth="0.8" />
            {/* Cone Body */}
            <polygon points="20,4 12,32 28,32" fill="#f97316" stroke="#c2410c" strokeWidth="0.8" />
            {/* White Reflective Stripes */}
            <polygon points="20,12 17,20 23,20" fill="#ffffff" opacity="0.9" />
            <polygon points="20,23 15,28 25,28" fill="#ffffff" opacity="0.9" />
          </svg>
        );

      case 'flat_cone_yellow':
        // Cinesino Piatto Giallo
        return (
          <svg viewBox="0 0 32 32" className="w-6 h-6 drop-shadow-sm">
            <ellipse cx="16" cy="22" rx="12" ry="6" fill="rgba(0,0,0,0.25)" />
            <ellipse cx="16" cy="18" rx="11" ry="5.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <ellipse cx="16" cy="16" rx="5" ry="2.5" fill="#eab308" />
            <circle cx="16" cy="16" r="2" fill="#854d0e" />
          </svg>
        );

      case 'flat_cone_red':
        // Cinesino Piatto Rosso
        return (
          <svg viewBox="0 0 32 32" className="w-6 h-6 drop-shadow-sm">
            <ellipse cx="16" cy="22" rx="12" ry="6" fill="rgba(0,0,0,0.25)" />
            <ellipse cx="16" cy="18" rx="11" ry="5.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
            <ellipse cx="16" cy="16" rx="5" ry="2.5" fill="#dc2626" />
            <circle cx="16" cy="16" r="2" fill="#7f1d1d" />
          </svg>
        );

      case 'flat_cone_blue':
        // Cinesino Piatto Blu
        return (
          <svg viewBox="0 0 32 32" className="w-6 h-6 drop-shadow-sm">
            <ellipse cx="16" cy="22" rx="12" ry="6" fill="rgba(0,0,0,0.25)" />
            <ellipse cx="16" cy="18" rx="11" ry="5.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
            <ellipse cx="16" cy="16" rx="5" ry="2.5" fill="#2563eb" />
            <circle cx="16" cy="16" r="2" fill="#1e3a8a" />
          </svg>
        );

      case 'flat_cone_orange':
        // Cinesino Piatto Arancio
        return (
          <svg viewBox="0 0 32 32" className="w-6 h-6 drop-shadow-sm">
            <ellipse cx="16" cy="22" rx="12" ry="6" fill="rgba(0,0,0,0.25)" />
            <ellipse cx="16" cy="18" rx="11" ry="5.5" fill="#fb923c" stroke="#c2410c" strokeWidth="1" />
            <ellipse cx="16" cy="16" rx="5" ry="2.5" fill="#ea580c" />
            <circle cx="16" cy="16" r="2" fill="#7c2d12" />
          </svg>
        );

      case 'ball':
        // Pallone da Calcio Ufficiale 3D
        return (
          <svg viewBox="0 0 36 36" className="w-7 h-7 drop-shadow-md animate-in fade-in duration-100">
            <ellipse cx="18" cy="30" rx="10" ry="3.5" fill="rgba(0,0,0,0.35)" />
            <circle cx="18" cy="17" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="1.2" />
            {/* Hexagon Pattern */}
            <polygon points="18,11 23,14 21,19 15,19 13,14" fill="#0f172a" />
            <polygon points="18,3 22,6 20,10 16,10 14,6" fill="#0f172a" opacity="0.8" />
            <polygon points="29,12 32,16 30,20 26,19 25,14" fill="#0f172a" opacity="0.8" />
            <polygon points="7,12 11,14 10,19 6,20 4,16" fill="#0f172a" opacity="0.8" />
            <polygon points="20,24 24,25 22,29 18,30 16,29" fill="#0f172a" opacity="0.8" />
            <line x1="18" y1="11" x2="18" y2="3" stroke="#334155" strokeWidth="0.8" />
            <line x1="23" y1="14" x2="29" y2="12" stroke="#334155" strokeWidth="0.8" />
            <line x1="21" y1="19" x2="24" y2="25" stroke="#334155" strokeWidth="0.8" />
            <line x1="15" y1="19" x2="16" y2="29" stroke="#334155" strokeWidth="0.8" />
            <line x1="13" y1="14" x2="7" y2="12" stroke="#334155" strokeWidth="0.8" />
            {/* Top Shine */}
            <ellipse cx="14" cy="10" rx="4" ry="2" fill="#ffffff" opacity="0.6" />
          </svg>
        );

      case 'mini_goal':
        // Porticina da allenamento
        return (
          <svg viewBox="0 0 48 32" className="w-11 h-7 drop-shadow-md">
            <rect x="4" y="4" width="40" height="24" rx="2" fill="rgba(255,255,255,0.15)" stroke="#f8fafc" strokeWidth="2.5" />
            {/* Net Grid */}
            <line x1="4" y1="10" x2="44" y2="10" stroke="#f8fafc" strokeWidth="0.7" strokeDasharray="2,2" />
            <line x1="4" y1="16" x2="44" y2="16" stroke="#f8fafc" strokeWidth="0.7" strokeDasharray="2,2" />
            <line x1="4" y1="22" x2="44" y2="22" stroke="#f8fafc" strokeWidth="0.7" strokeDasharray="2,2" />
            <line x1="14" y1="4" x2="14" y2="28" stroke="#f8fafc" strokeWidth="0.7" strokeDasharray="2,2" />
            <line x1="24" y1="4" x2="24" y2="28" stroke="#f8fafc" strokeWidth="0.7" strokeDasharray="2,2" />
            <line x1="34" y1="4" x2="34" y2="28" stroke="#f8fafc" strokeWidth="0.7" strokeDasharray="2,2" />
          </svg>
        );

      case 'agility_ladder':
        // Scaletta d'agilità
        return (
          <svg viewBox="0 0 20 80" className="w-6 h-18 drop-shadow-sm">
            {/* Side Straps */}
            <rect x="2" y="2" width="2" height="76" fill="#facc15" />
            <rect x="16" y="2" width="2" height="76" fill="#facc15" />
            {/* Rungs */}
            {[6, 18, 30, 42, 54, 66, 74].map((y) => (
              <rect key={y} x="2" y={y} width="16" height="2.5" rx="0.5" fill="#facc15" />
            ))}
          </svg>
        );

      case 'pole':
        // Paletto Slalom
        return (
          <svg viewBox="0 0 24 50" className="w-5 h-11 drop-shadow-sm">
            <ellipse cx="12" cy="44" rx="8" ry="3" fill="#1e293b" />
            <rect x="10.5" y="4" width="3" height="40" rx="1.5" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
            <rect x="10.5" y="14" width="3" height="8" fill="#ef4444" />
            <rect x="10.5" y="30" width="3" height="8" fill="#ef4444" />
          </svg>
        );

      case 'mannequin':
        // Sagoma Barriera
        return (
          <svg viewBox="0 0 36 60" className="w-8 h-13 drop-shadow-md">
            <ellipse cx="18" cy="54" rx="10" ry="3.5" fill="rgba(0,0,0,0.35)" />
            {/* Head */}
            <circle cx="18" cy="8" r="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
            {/* Torso & Grid */}
            <rect x="9" y="14" width="18" height="24" rx="3" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
            <line x1="9" y1="20" x2="27" y2="20" stroke="#bae6fd" strokeWidth="1" />
            <line x1="9" y1="26" x2="27" y2="26" stroke="#bae6fd" strokeWidth="1" />
            <line x1="9" y1="32" x2="27" y2="32" stroke="#bae6fd" strokeWidth="1" />
            {/* Legs */}
            <line x1="13" y1="38" x2="13" y2="52" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="23" y1="38" x2="23" y2="52" stroke="#0f172a" strokeWidth="2.5" />
          </svg>
        );

      case 'hurdle':
        // Ostacolo
        return (
          <svg viewBox="0 0 40 24" className="w-8 h-5 drop-shadow-sm">
            <rect x="4" y="4" width="32" height="3" rx="1" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
            <line x1="6" y1="7" x2="6" y2="20" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="34" y1="7" x2="34" y2="20" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="6" cy="20" rx="3.5" ry="1.5" fill="#0f172a" />
            <ellipse cx="34" cy="20" rx="3.5" ry="1.5" fill="#0f172a" />
          </svg>
        );

      case 'hoop':
        // Cerchio
        return (
          <svg viewBox="0 0 32 32" className="w-7 h-7 drop-shadow-sm">
            <ellipse cx="16" cy="18" rx="13" ry="8" fill="none" stroke="#22c55e" strokeWidth="3" />
          </svg>
        );

      default:
        return <div className="w-4 h-4 rounded-full bg-yellow-400 border border-black" />;
    }
  };

  const rotation = item.rotation || 0;

  return (
    <div
      id={`equipment-${item.id}`}
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
      className={`absolute select-none cursor-grab active:cursor-grabbing z-15 group transition-transform duration-75 ${
        isDragging ? 'z-40 scale-110' : ''
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className={`relative p-0.5 rounded-lg transition-all ${isSelected ? 'ring-2 ring-amber-400 bg-amber-400/20' : ''}`}>
        {renderEquipmentVisual()}
      </div>

      {/* Floating Toolbar when selected */}
      {isSelected && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/95 px-1.5 py-0.5 rounded-md border border-slate-700 shadow-xl z-50 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {onRotate && (
            <button
              id={`btn-rot-eq-${item.id}`}
              type="button"
              onClick={handleRotate}
              title="Ruota"
              className="p-1 hover:bg-slate-700 rounded text-slate-200"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              id={`btn-del-eq-${item.id}`}
              type="button"
              onClick={() => onDelete(item.id)}
              title="Elimina"
              className="p-1 hover:bg-red-900/60 rounded text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
