import React, { useState, useRef } from 'react';
import { Player, TeamSettings } from '../../types';
import { Camera, Check, Trash2, X } from 'lucide-react';

interface PlayerEditModalProps {
  player: Player | null;
  teamSettings: TeamSettings;
  onSave: (updated: Player) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const ROLES = ['POR', 'DC', 'TD', 'TS', 'MED', 'CC', 'TRQ', 'ED', 'ES', 'ATT', 'CEN', 'JOLLY'];

export const PlayerEditModal: React.FC<PlayerEditModalProps> = ({
  player,
  teamSettings,
  onSave,
  onDelete,
  onClose,
}) => {
  if (!player) return null;

  const [name, setName] = useState(player.name);
  const [number, setNumber] = useState(player.number);
  const [role, setRole] = useState(player.role);
  const [team, setTeam] = useState(player.team);
  const [photoUrl, setPhotoUrl] = useState(player.photoUrl || '');
  const [foot, setFoot] = useState(player.foot || 'Destro');
  const [notes, setNotes] = useState(player.notes || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...player,
      name: name.trim() || 'Giocatore',
      number: Number(number) || 10,
      role,
      team,
      photoUrl: photoUrl || undefined,
      foot,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-sm font-bold text-white">Modifica Calciatore</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs text-slate-300">
          {/* Avatar & Upload */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-white/60 flex items-center justify-center font-bold text-base text-white shrink-0 overflow-hidden relative shadow">
              {photoUrl ? (
                <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <span>{number}</span>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-white flex items-center gap-1.5 justify-center w-full"
              >
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                {photoUrl ? 'Cambia Foto' : 'Carica Foto Calciatore'}
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-[10px] text-red-400 hover:underline block text-center w-full"
                >
                  Rimuovi foto
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Numero</label>
              <input
                type="number"
                min="1"
                max="99"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Ruolo</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-amber-300 font-bold focus:outline-none focus:border-sky-500"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Piede</label>
              <select
                value={foot}
                onChange={(e) => setFoot(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Destro">Destro</option>
                <option value="Sinistro">Sinistro</option>
                <option value="Ambidestro">Ambidestro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Squadra / Maglia</label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="home">{teamSettings.homeTeamName}</option>
              <option value="goalkeeper_home">{teamSettings.homeTeamName} (Portiere)</option>
              <option value="away">{teamSettings.awayTeamName}</option>
              <option value="goalkeeper_away">{teamSettings.awayTeamName} (Portiere)</option>
              <option value="jolly">Jolly / Sostituto</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Note Tattiche</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Es. Spinge molto sulla fascia..."
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold flex items-center justify-center gap-1 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              Salva Modifiche
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(player.id);
                onClose();
              }}
              className="p-2 bg-slate-800 hover:bg-red-900/60 text-red-400 rounded-lg"
              title="Rimuovi dal campo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
