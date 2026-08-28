import React, { useState } from 'react';
import { ExerciseDrill, TacticalPhase } from '../../types';
import { Play, Pause, RotateCcw, Plus, Copy, Trash2, BookOpen, Clock, Target, Shield, Check, ListPlus } from 'lucide-react';

interface DrillManagerProps {
  drill: ExerciseDrill;
  onUpdateDrill: (updated: Partial<ExerciseDrill>) => void;
  onSelectPhase: (index: number) => void;
  onAddPhase: () => void;
  onDuplicatePhase: (index: number) => void;
  onDeletePhase: (index: number) => void;
  isPlayingAnimation: boolean;
  onTogglePlayAnimation: () => void;
  onResetAnimation: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Tattica',
  'Tecnica',
  'Possesso Palla',
  'Partitella',
  'Riscaldamento',
  'Palle Inattive',
  'Fisico-Atletico',
] as const;

export const DrillManager: React.FC<DrillManagerProps> = ({
  drill,
  onUpdateDrill,
  onSelectPhase,
  onAddPhase,
  onDuplicatePhase,
  onDeletePhase,
  isPlayingAnimation,
  onTogglePlayAnimation,
  onResetAnimation,
  isOpen,
  onClose,
}) => {
  const [newCoachingPoint, setNewCoachingPoint] = useState('');

  if (!isOpen) return null;

  const handleAddCoachingPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoachingPoint.trim()) return;
    const current = drill.coachingPoints || [];
    onUpdateDrill({ coachingPoints: [...current, newCoachingPoint.trim()] });
    setNewCoachingPoint('');
  };

  const handleRemoveCoachingPoint = (index: number) => {
    const current = drill.coachingPoints || [];
    onUpdateDrill({ coachingPoints: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Scheda Esercitazione & Fasi Tattiche</h2>
              <p className="text-xs text-slate-400">Imposta obiettivi, durata, punti chiave e gestisci l'animazione a step</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow"
          >
            <Check className="w-4 h-4" />
            Fatto
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Title, Category, Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="text-xs font-bold text-slate-300 block mb-1">Titolo dell'Esercizio</label>
              <input
                id="input-drill-title"
                type="text"
                value={drill.title}
                onChange={(e) => onUpdateDrill({ title: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                placeholder="Es. Costruzione dal basso e sviluppo laterale"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-300 block mb-1">Categoria</label>
              <select
                id="select-drill-category"
                value={drill.category}
                onChange={(e) => onUpdateDrill({ category: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-300 block mb-1">Durata (Minuti)</label>
              <input
                id="input-drill-duration"
                type="number"
                min="1"
                max="120"
                value={drill.durationMinutes}
                onChange={(e) => onUpdateDrill({ durationMinutes: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
          </div>

          {/* 2. Objectives and Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Obiettivo Primario
              </label>
              <input
                id="input-drill-obj-1"
                type="text"
                value={drill.objectivePrimary}
                onChange={(e) => onUpdateDrill({ objectivePrimary: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="Es. Riconoscere l'uomo libero tra le linee"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                Obiettivo Secondario
              </label>
              <input
                id="input-drill-obj-2"
                type="text"
                value={drill.objectiveSecondary}
                onChange={(e) => onUpdateDrill({ objectiveSecondary: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="Es. Transizione negativa immediata"
              />
            </div>
          </div>

          {/* 3. Description & Detailed Rules */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Descrizione & Svolgimento dell'Esercizio</label>
            <textarea
              id="textarea-drill-desc"
              rows={3}
              value={drill.description}
              onChange={(e) => onUpdateDrill({ description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
              placeholder="Descrivi come si avvia l'azione, numero di tocchi consentiti, regole per fare punto..."
            />
          </div>

          {/* 4. Coaching Points (Punti Chiave per il Mister) */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <ListPlus className="w-4 h-4" />
              Punti Chiave d'Intervento (Coaching Points)
            </h4>

            <form onSubmit={handleAddCoachingPoint} className="flex gap-2">
              <input
                type="text"
                placeholder="Aggiungi punto chiave (es. Orientamento del corpo in ricezione)..."
                value={newCoachingPoint}
                onChange={(e) => setNewCoachingPoint(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-600"
              >
                + Aggiungi
              </button>
            </form>

            <div className="space-y-1 pt-1">
              {drill.coachingPoints && drill.coachingPoints.map((pt, idx) => (
                <div key={idx} className="flex items-center justify-between px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200">
                  <span>✓ {pt}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoachingPoint(idx)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Tactical Phases / Step Animations */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-sky-400" />
                  Fasi Tattiche dell'Azione (Animazione Sequenziale)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Crea più step (es. Fase 1: Posizionamento, Fase 2: Taglio, Fase 3: Conclusione) per animare la lavagna
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onTogglePlayAnimation}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow ${
                    isPlayingAnimation ? 'bg-amber-600 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  {isPlayingAnimation ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlayingAnimation ? 'Pausa Animazione' : 'Riproduci Fasi'}
                </button>

                <button
                  type="button"
                  onClick={onAddPhase}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  Nuova Fase
                </button>
              </div>
            </div>

            {/* Phases List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
              {drill.phases.map((phase, pIdx) => {
                const isActive = drill.activePhaseIndex === pIdx;
                return (
                  <div
                    key={phase.id || pIdx}
                    onClick={() => onSelectPhase(pIdx)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all relative ${
                      isActive
                        ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/30'
                        : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold ${isActive ? 'text-sky-400' : 'text-slate-300'}`}>
                        {phase.name || `Fase ${pIdx + 1}`}
                      </span>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onDuplicatePhase(pIdx)}
                          title="Duplica questa fase (copia posizioni)"
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {drill.phases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeletePhase(pIdx)}
                            title="Elimina fase"
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[10.5px] text-slate-400 line-clamp-2">
                      {phase.description || 'Clicca per selezionare e posizionare i giocatori per questa fase.'}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{phase.players?.length || 0} Giocatori</span>
                      <span>{phase.drawings?.length || 0} Disegni</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
