import React from 'react';
import { ToolMode, EquipmentType } from '../../types';
import {
  MousePointer,
  MoveRight,
  GitCommit,
  Waves,
  CornerUpRight,
  ShieldAlert,
  Pencil,
  Square,
  Circle,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Plus,
  Sliders,
  Grid,
} from 'lucide-react';

interface TacticalToolbarProps {
  activeTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  currentColor: string;
  onChangeColor: (color: string) => void;
  currentStrokeWidth: number;
  onChangeStrokeWidth: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearDrawings: () => void;
  onAddEquipment: (type: EquipmentType) => void;
  onAddPlayer: (team: 'home' | 'away' | 'goalkeeper_home' | 'jolly') => void;
  showZonesGrid: boolean;
  onToggleZonesGrid: () => void;
}

const COLOR_PALETTE = [
  { label: 'Bianco', value: '#ffffff' },
  { label: 'Giallo Tattico', value: '#facc15' },
  { label: 'Blu Elettrico', value: '#38bdf8' },
  { label: 'Rosso Fuoco', value: '#ef4444' },
  { label: 'Verde Erba', value: '#22c55e' },
  { label: 'Arancio', value: '#f97316' },
  { label: 'Nero', value: '#0f172a' },
];

export const TacticalToolbar: React.FC<TacticalToolbarProps> = ({
  activeTool,
  onSelectTool,
  currentColor,
  onChangeColor,
  currentStrokeWidth,
  onChangeStrokeWidth,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearDrawings,
  onAddEquipment,
  onAddPlayer,
  showZonesGrid,
  onToggleZonesGrid,
}) => {
  // Equipment Drag Starter
  const handleEquipmentDragStart = (e: React.DragEvent, type: EquipmentType) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type }));
  };

  const handlePlayerDragStart = (e: React.DragEvent, team: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'player', data: { team } }));
  };

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-white px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-lg">
      {/* 1. Main Action & Drawing Tools */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {/* Select Mode */}
        <button
          id="tool-btn-select"
          type="button"
          onClick={() => onSelectTool('select')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTool === 'select'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Seleziona & Sposta Giocatori/Oggetti (Cursore)"
        >
          <MousePointer className="w-4 h-4" />
          <span className="hidden md:inline">Sposta</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-700 mx-1" />

        {/* Corsa / Movimento (Solid Arrow) */}
        <button
          id="tool-btn-arrow-run"
          type="button"
          onClick={() => onSelectTool('arrow_run')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTool === 'arrow_run'
              ? 'bg-sky-600 text-white ring-1 ring-sky-400'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Freccia Corsa / Movimento Giocatore"
        >
          <MoveRight className="w-4 h-4" />
          <span className="hidden lg:inline">Corsa</span>
        </button>

        {/* Passaggio (Dashed Arrow) */}
        <button
          id="tool-btn-arrow-pass"
          type="button"
          onClick={() => onSelectTool('arrow_pass')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTool === 'arrow_pass'
              ? 'bg-sky-600 text-white ring-1 ring-sky-400'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Freccia Passaggio (Tratteggiata)"
        >
          <GitCommit className="w-4 h-4" />
          <span className="hidden lg:inline">Passaggio</span>
        </button>

        {/* Conduzione / Dribbling (Wavy Line) */}
        <button
          id="tool-btn-arrow-dribble"
          type="button"
          onClick={() => onSelectTool('arrow_dribble')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTool === 'arrow_dribble'
              ? 'bg-sky-600 text-white ring-1 ring-sky-400'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Conduzione Palla / Dribbling (Ondulata)"
        >
          <Waves className="w-4 h-4" />
          <span className="hidden lg:inline">Dribbling</span>
        </button>

        {/* Sovrapposizione / Taglio (Curved Arrow) */}
        <button
          id="tool-btn-arrow-curve"
          type="button"
          onClick={() => onSelectTool('arrow_curve')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTool === 'arrow_curve'
              ? 'bg-sky-600 text-white ring-1 ring-sky-400'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Taglio / Sovrapposizione Curva"
        >
          <CornerUpRight className="w-4 h-4" />
          <span className="hidden lg:inline">Curva</span>
        </button>

        {/* Pressing / Blocco (T-Arrow) */}
        <button
          id="tool-btn-arrow-press"
          type="button"
          onClick={() => onSelectTool('arrow_press')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTool === 'arrow_press'
              ? 'bg-sky-600 text-white ring-1 ring-sky-400'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Pressing / Schermatura / Blocco"
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="hidden lg:inline">Pressing</span>
        </button>

        {/* Disegno Libero */}
        <button
          id="tool-btn-freehand"
          type="button"
          onClick={() => onSelectTool('freehand')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTool === 'freehand'
              ? 'bg-sky-600 text-white ring-1 ring-sky-400'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Mano Libera / Schizzo"
        >
          <Pencil className="w-4 h-4" />
          <span className="hidden lg:inline">Schizzo</span>
        </button>

        {/* Zona Evidenziata Rettangolo */}
        <button
          id="tool-btn-zone-box"
          type="button"
          onClick={() => onSelectTool('zone_box')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTool === 'zone_box'
              ? 'bg-sky-600 text-white ring-1 ring-sky-400'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Evidenzia Zona / Settore Rettangolare"
        >
          <Square className="w-4 h-4" />
          <span className="hidden lg:inline">Zona</span>
        </button>

        {/* Cerchio */}
        <button
          id="tool-btn-zone-circle"
          type="button"
          onClick={() => onSelectTool('zone_circle')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTool === 'zone_circle'
              ? 'bg-sky-600 text-white ring-1 ring-sky-400'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Evidenzia Cerchio / Raggio d'azione"
        >
          <Circle className="w-4 h-4" />
        </button>

        {/* Testo Nota */}
        <button
          id="tool-btn-text-note"
          type="button"
          onClick={() => onSelectTool('text_note')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTool === 'text_note'
              ? 'bg-sky-600 text-white ring-1 ring-sky-400'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Inserisci Testo / Nota Tattica sul campo"
        >
          <Type className="w-4 h-4" />
        </button>

        {/* Gomma */}
        <button
          id="tool-btn-eraser"
          type="button"
          onClick={() => onSelectTool('eraser')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTool === 'eraser'
              ? 'bg-red-600 text-white ring-1 ring-red-400'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Gomma (Clicca su un disegno per eliminarlo)"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-slate-700 mx-1" />

        {/* Undo / Redo / Clear */}
        <button
          id="btn-undo"
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300"
          title="Annulla ultimo disegno (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          id="btn-redo"
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300"
          title="Ripeti (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <button
          id="btn-clear-drawings"
          type="button"
          onClick={onClearDrawings}
          className="p-1.5 bg-slate-800 hover:bg-red-900/60 rounded-lg text-red-400 hover:text-red-300"
          title="Cancella tutti i disegni del campo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Colors, Stroke Width & Tactical Zones Toggle */}
      <div className="flex items-center gap-2">
        {/* Griglia Zone / Half-Spaces Toggle */}
        <button
          id="btn-toggle-zones"
          type="button"
          onClick={onToggleZonesGrid}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
            showZonesGrid
              ? 'bg-emerald-800/70 border-emerald-500 text-emerald-200'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Mostra / Nascondi Canali e Half-Spaces"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">5 Canali & Half-Spaces</span>
        </button>

        {/* Color Palette Buttons */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onChangeColor(c.value)}
              title={c.label}
              style={{ backgroundColor: c.value }}
              className={`w-4.5 h-4.5 rounded-full border border-black/40 transition-transform ${
                currentColor === c.value ? 'scale-125 ring-2 ring-sky-400' : 'hover:scale-110 opacity-80'
              }`}
            />
          ))}
        </div>

        {/* Stroke thickness */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-300">
          <span>Spessore:</span>
          {[2, 3.5, 5].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onChangeStrokeWidth(w)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                currentStrokeWidth === w ? 'bg-sky-600 text-white' : 'hover:bg-slate-700'
              }`}
            >
              {w === 2 ? 'Fine' : w === 3.5 ? 'Med' : 'Spesso'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Training Equipment & Cones Tray */}
      <div className="w-full pt-1.5 border-t border-slate-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span className="font-semibold text-slate-200 mr-1 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            Attrezzatura & Coni:
          </span>

          {/* Conetto Alto */}
          <button
            id="btn-add-cone"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'cone')}
            onClick={() => onAddEquipment('cone')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-orange-300 cursor-grab active:cursor-grabbing hover:border-orange-500 transition-colors"
            title="Trascina sul campo o clicca per inserire"
          >
            <span className="text-sm leading-none">▲</span> Conetto
          </button>

          {/* Cinesino Giallo */}
          <button
            id="btn-add-flat-yellow"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'flat_cone_yellow')}
            onClick={() => onAddEquipment('flat_cone_yellow')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-yellow-300 cursor-grab active:cursor-grabbing hover:border-yellow-500 transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Cinesino Giallo
          </button>

          {/* Cinesino Rosso */}
          <button
            id="btn-add-flat-red"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'flat_cone_red')}
            onClick={() => onAddEquipment('flat_cone_red')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-red-300 cursor-grab active:cursor-grabbing hover:border-red-500 transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Cinesino Rosso
          </button>

          {/* Cinesino Blu */}
          <button
            id="btn-add-flat-blue"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'flat_cone_blue')}
            onClick={() => onAddEquipment('flat_cone_blue')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-blue-300 cursor-grab active:cursor-grabbing hover:border-blue-500 transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Cinesino Blu
          </button>

          {/* Pallone */}
          <button
            id="btn-add-ball"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'ball')}
            onClick={() => onAddEquipment('ball')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-white font-medium cursor-grab active:cursor-grabbing hover:border-white transition-colors"
          >
            <span className="text-sm">⚽</span> Pallone
          </button>

          {/* Porticina */}
          <button
            id="btn-add-minigoal"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'mini_goal')}
            onClick={() => onAddEquipment('mini_goal')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-slate-200 cursor-grab active:cursor-grabbing hover:border-slate-400 transition-colors"
          >
            <span className="text-sm">🥅</span> Porticina
          </button>

          {/* Scaletta */}
          <button
            id="btn-add-ladder"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'agility_ladder')}
            onClick={() => onAddEquipment('agility_ladder')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-yellow-300 cursor-grab active:cursor-grabbing"
          >
            <span className="text-xs">🪜</span> Scaletta
          </button>

          {/* Paletto Slalom */}
          <button
            id="btn-add-pole"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'pole')}
            onClick={() => onAddEquipment('pole')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-amber-300 cursor-grab active:cursor-grabbing"
          >
            <span className="text-xs">📍</span> Paletto
          </button>

          {/* Sagoma Barriera */}
          <button
            id="btn-add-mannequin"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'mannequin')}
            onClick={() => onAddEquipment('mannequin')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-sky-300 cursor-grab active:cursor-grabbing"
          >
            <span className="text-xs">👤</span> Sagoma
          </button>

          {/* Ostacolo */}
          <button
            id="btn-add-hurdle"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'hurdle')}
            onClick={() => onAddEquipment('hurdle')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-yellow-300 cursor-grab active:cursor-grabbing"
          >
            <span className="text-xs">⊓</span> Ostacolo
          </button>

          {/* Cerchio */}
          <button
            id="btn-add-hoop"
            type="button"
            draggable
            onDragStart={(e) => handleEquipmentDragStart(e, 'hoop')}
            onClick={() => onAddEquipment('hoop')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[11px] text-green-400 cursor-grab active:cursor-grabbing"
          >
            <span className="text-xs">⭕</span> Cerchio
          </button>
        </div>

        {/* Quick Add Player Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="btn-spawn-home-player"
            type="button"
            draggable
            onDragStart={(e) => handlePlayerDragStart(e, 'home')}
            onClick={() => onAddPlayer('home')}
            className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-[11px] font-bold shadow flex items-center gap-1"
            title="Aggiungi Giocatore Blu"
          >
            + Blu
          </button>

          <button
            id="btn-spawn-away-player"
            type="button"
            draggable
            onDragStart={(e) => handlePlayerDragStart(e, 'away')}
            onClick={() => onAddPlayer('away')}
            className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-[11px] font-bold shadow flex items-center gap-1"
            title="Aggiungi Giocatore Rosso"
          >
            + Rosso
          </button>

          <button
            id="btn-spawn-jolly-player"
            type="button"
            draggable
            onDragStart={(e) => handlePlayerDragStart(e, 'jolly')}
            onClick={() => onAddPlayer('jolly')}
            className="px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-[11px] font-bold shadow flex items-center gap-1"
            title="Aggiungi Giocatore Jolly (Verde)"
          >
            + Jolly
          </button>
        </div>
      </div>
    </div>
  );
};
