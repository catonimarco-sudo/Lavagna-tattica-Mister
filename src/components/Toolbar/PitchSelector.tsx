import React from 'react';
import { PitchTheme, PitchViewMode } from '../../types';
import { FORMATIONS_PRESETS } from '../../constants/defaultData';
import { Layout, Palette, Sparkles, Shirt, CircleDot, Network } from 'lucide-react';

interface PitchSelectorProps {
  currentView: PitchViewMode;
  onChangeView: (view: PitchViewMode) => void;
  currentTheme: PitchTheme;
  onChangeTheme: (theme: PitchTheme) => void;
  showNames: boolean;
  onToggleNames: () => void;
  showNumbers: boolean;
  onToggleNumbers: () => void;
  showPhotos: boolean;
  onTogglePhotos: () => void;
  playerRenderMode?: 'circle' | 'jersey';
  onTogglePlayerRenderMode?: () => void;
  showRepartoLines?: boolean;
  onToggleRepartoLines?: () => void;
  onApplyFormation: (formationKey: string) => void;
}

const PITCH_VIEWS: { id: PitchViewMode; label: string; iconLabel: string }[] = [
  { id: 'full_horizontal', label: 'Campo Intero (Orizzontale)', iconLabel: '⬜ Intero' },
  { id: 'full_vertical', label: 'Campo Intero (Verticale)', iconLabel: '▯ Verticale' },
  { id: 'half_attack', label: 'Metà Campo Attacco', iconLabel: '◧ Attacco' },
  { id: 'half_defense', label: 'Metà Campo Difesa', iconLabel: '◨ Difesa' },
  { id: 'attacking_third', label: 'Trequarti Offensiva', iconLabel: '▥ Trequarti' },
  { id: 'right_flank', label: 'Fascia Destra', iconLabel: '▤ Fascia Dx' },
  { id: 'left_flank', label: 'Fascia Sinistra', iconLabel: '▤ Fascia Sx' },
  { id: 'penalty_box', label: 'Area di Rigore', iconLabel: '▢ Area Rigore' },
];

const PITCH_THEMES: { id: PitchTheme; label: string; bg: string }[] = [
  { id: 'realistic_grass', label: 'Erba Naturale', bg: '#23652c' },
  { id: 'tactical_green', label: '2D Tattico', bg: '#1e5428' },
  { id: 'night_board', label: 'Notturno Pro', bg: '#0f172a' },
  { id: 'chalkboard', label: 'Lavagna Tattica', bg: '#1c2826' },
];

export const PitchSelector: React.FC<PitchSelectorProps> = ({
  currentView,
  onChangeView,
  currentTheme,
  onChangeTheme,
  showNames,
  onToggleNames,
  showNumbers,
  onToggleNumbers,
  showPhotos,
  onTogglePhotos,
  playerRenderMode = 'jersey',
  onTogglePlayerRenderMode,
  showRepartoLines = false,
  onToggleRepartoLines,
  onApplyFormation,
}) => {
  return (
    <div className="w-full bg-slate-950/80 border-b border-slate-800/80 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
      {/* 1. Pitch Section Cuts */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
        <span className="font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
          <Layout className="w-3.5 h-3.5 text-emerald-400" />
          Sezione Campo:
        </span>

        {PITCH_VIEWS.map((view) => (
          <button
            key={view.id}
            id={`pitch-view-${view.id}`}
            type="button"
            onClick={() => onChangeView(view.id)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
              currentView === view.id
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {view.iconLabel}
          </button>
        ))}
      </div>

      {/* 2. Moduli Tattici Rapidi, Reparto Lines & Display Toggles */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Moduli Tattici Presets */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Modulo:
          </span>
          <select
            id="select-formation-preset"
            onChange={(e) => {
              if (e.target.value) {
                onApplyFormation(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="" disabled>Applica Modulo...</option>
            {Object.keys(FORMATIONS_PRESETS).map((fKey) => (
              <option key={fKey} value={fKey} className="bg-slate-900 text-white">
                {FORMATIONS_PRESETS[fKey].name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* Tactical Reparto Lines Button */}
        {onToggleRepartoLines && (
          <button
            id="toggle-reparto-lines"
            type="button"
            onClick={onToggleRepartoLines}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${
              showRepartoLines
                ? 'bg-red-950/80 border-red-500 text-red-300 ring-1 ring-red-500/50 shadow-sm'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Mostra / Nascondi Linee Tattiche di Reparto (Difesa, Centrocampo, Attacco)"
          >
            <Network className="w-3.5 h-3.5 text-red-400" />
            <span>Linee Reparto</span>
          </button>
        )}

        {/* Player Token Style Toggle: Jersey (Maglia) vs Circle (Cerchio) */}
        {onTogglePlayerRenderMode && (
          <button
            id="toggle-player-style-mode"
            type="button"
            onClick={onTogglePlayerRenderMode}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${
              playerRenderMode === 'jersey'
                ? 'bg-sky-950/80 border-sky-500 text-sky-300 ring-1 ring-sky-500/40 shadow-sm'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Cambia stile giocatori: Maglia da calcio (mezzo busto) o Cerchio"
          >
            {playerRenderMode === 'jersey' ? (
              <>
                <Shirt className="w-3.5 h-3.5 text-sky-400" />
                <span>Maglie</span>
              </>
            ) : (
              <>
                <CircleDot className="w-3.5 h-3.5 text-amber-400" />
                <span>Cerchi</span>
              </>
            )}
          </button>
        )}

        {/* Toggles (Nomi, Numeri, Foto) */}
        <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-slate-800">
          <button
            id="toggle-player-names"
            type="button"
            onClick={onToggleNames}
            className={`px-1.5 py-0.5 rounded text-[10.5px] font-semibold transition-colors ${
              showNames ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nomi
          </button>

          <button
            id="toggle-player-numbers"
            type="button"
            onClick={onToggleNumbers}
            className={`px-1.5 py-0.5 rounded text-[10.5px] font-semibold transition-colors ${
              showNumbers ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Numeri
          </button>

          <button
            id="toggle-player-photos"
            type="button"
            onClick={onTogglePhotos}
            className={`px-1.5 py-0.5 rounded text-[10.5px] font-semibold transition-colors ${
              showPhotos ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Foto
          </button>
        </div>

        {/* Pitch Theme Select */}
        <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-slate-800">
          <Palette className="w-3 h-3 text-slate-400" />
          {PITCH_THEMES.map((theme) => (
            <button
              key={theme.id}
              id={`theme-btn-${theme.id}`}
              type="button"
              onClick={() => onChangeTheme(theme.id)}
              title={theme.label}
              style={{ backgroundColor: theme.bg }}
              className={`w-3.5 h-3.5 rounded-full border border-slate-600 transition-transform ${
                currentTheme === theme.id ? 'scale-125 ring-2 ring-emerald-400' : 'opacity-70 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
