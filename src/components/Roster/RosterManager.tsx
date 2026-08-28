import React, { useState, useRef } from 'react';
import { Player, TeamSettings } from '../../types';
import { Users, Plus, Upload, Trash2, Edit2, Check, X, Camera, Shirt } from 'lucide-react';

interface RosterManagerProps {
  roster: Player[];
  activePlayersOnPitch: Player[];
  teamSettings: TeamSettings;
  onAddPlayer: (player: Player) => void;
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer: (id: string) => void;
  onPlaceOnPitch: (player: Player) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ROLES_LIST = [
  'POR', 'DC', 'TD', 'TS', 'MED', 'CC', 'TRQ', 'ED', 'ES', 'ATT', 'CEN', 'JOLLY'
];

export const RosterManager: React.FC<RosterManagerProps> = ({
  roster,
  activePlayersOnPitch,
  teamSettings,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onPlaceOnPitch,
  isOpen,
  onClose,
}) => {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [filterTeam, setFilterTeam] = useState<'all' | 'home' | 'away' | 'jolly'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState<number>(10);
  const [formRole, setFormRole] = useState('CC');
  const [formTeam, setFormTeam] = useState<'home' | 'away' | 'goalkeeper_home' | 'goalkeeper_away' | 'jolly'>('home');
  const [formFoot, setFormFoot] = useState<'Destro' | 'Sinistro' | 'Ambidestro'>('Destro');
  const [formNotes, setFormNotes] = useState('');
  const [formPhoto, setFormPhoto] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (player: Player) => {
    setEditingPlayer(player);
    setIsCreatingNew(false);
    setFormName(player.name);
    setFormNumber(player.number);
    setFormRole(player.role);
    setFormTeam(player.team);
    setFormFoot(player.foot || 'Destro');
    setFormNotes(player.notes || '');
    setFormPhoto(player.photoUrl || '');
  };

  const startCreate = () => {
    setIsCreatingNew(true);
    setEditingPlayer(null);
    setFormName('');
    setFormNumber(roster.length + 1);
    setFormRole('CC');
    setFormTeam('home');
    setFormFoot('Destro');
    setFormNotes('');
    setFormPhoto('');
  };

  const saveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (isCreatingNew) {
      const newPlayer: Player = {
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: formName.trim(),
        number: Number(formNumber),
        role: formRole,
        team: formTeam,
        foot: formFoot,
        notes: formNotes.trim(),
        photoUrl: formPhoto || undefined,
        x: 50,
        y: 50,
      };
      onAddPlayer(newPlayer);
    } else if (editingPlayer) {
      const updated: Player = {
        ...editingPlayer,
        name: formName.trim(),
        number: Number(formNumber),
        role: formRole,
        team: formTeam,
        foot: formFoot,
        notes: formNotes.trim(),
        photoUrl: formPhoto || undefined,
      };
      onUpdatePlayer(updated);
    }

    setEditingPlayer(null);
    setIsCreatingNew(false);
  };

  const filteredRoster = roster.filter((p) => {
    if (filterTeam !== 'all') {
      if (filterTeam === 'home' && p.team !== 'home' && p.team !== 'goalkeeper_home') return false;
      if (filterTeam === 'away' && p.team !== 'away' && p.team !== 'goalkeeper_away') return false;
      if (filterTeam === 'jolly' && p.team !== 'jolly') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q) || String(p.number).includes(q);
    }
    return true;
  });

  const getTeamBadgeColor = (team: string) => {
    switch (team) {
      case 'home':
        return teamSettings.homeTeamColor;
      case 'away':
        return teamSettings.awayTeamColor;
      case 'goalkeeper_home':
      case 'goalkeeper_away':
        return teamSettings.gkColor;
      case 'jolly':
      default:
        return teamSettings.jollyColor;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Gestione Rosa & Giocatori</h2>
              <p className="text-xs text-slate-400">Personalizza nomi, numeri, ruoli e carica le foto dei tuoi calciatori</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-create-new-player"
              type="button"
              onClick={startCreate}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuovo Giocatore
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Player List & Filter */}
          <div className="md:col-span-7 flex flex-col border-r border-slate-800 max-h-[60vh] md:max-h-full overflow-hidden">
            {/* Search & Team Filter Bar */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/50 space-y-2">
              <input
                id="search-roster-input"
                type="text"
                placeholder="Cerca per nome, ruolo, numero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterTeam('all')}
                  className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                    filterTeam === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Tutti ({roster.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTeam('home')}
                  className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                    filterTeam === 'home' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {teamSettings.homeTeamName}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTeam('away')}
                  className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                    filterTeam === 'away' ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {teamSettings.awayTeamName}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTeam('jolly')}
                  className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                    filterTeam === 'jolly' ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Jolly
                </button>
              </div>
            </div>

            {/* Players Table / List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredRoster.map((player) => {
                const isOnPitch = activePlayersOnPitch.some((p) => p.id === player.id);
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Avatar / Number */}
                      <div
                        style={{ backgroundColor: getTeamBadgeColor(player.team) }}
                        className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center font-bold text-xs text-white shrink-0 overflow-hidden relative"
                      >
                        {player.photoUrl ? (
                          <img
                            src={player.photoUrl}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{player.number}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{player.name}</span>
                          <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            {player.role}
                          </span>
                          {isOnPitch && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              IN CAMPO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          N° {player.number} • {player.foot || 'Destro'} {player.notes ? `• ${player.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onPlaceOnPitch(player)}
                        className="px-2 py-1 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded text-[11px] font-semibold transition-colors"
                        title="Posiziona o sposta sul campo"
                      >
                        {isOnPitch ? 'Sposta' : '+ Campo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(player)}
                        className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-slate-700 rounded-lg"
                        title="Modifica scheda & foto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePlayer(player.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg"
                        title="Elimina dalla rosa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Player Form & Photo Editor */}
          <div className="md:col-span-5 p-4 bg-slate-950/40 flex flex-col justify-between overflow-y-auto">
            {(isCreatingNew || editingPlayer) ? (
              <form onSubmit={saveForm} className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-1 border-b border-slate-800">
                  <Shirt className="w-4 h-4 text-sky-400" />
                  {isCreatingNew ? 'Aggiungi Nuovo Calciatore' : `Modifica: ${editingPlayer?.name}`}
                </h3>

                {/* Photo Upload Box */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div
                    style={{ backgroundColor: getTeamBadgeColor(formTeam) }}
                    className="w-14 h-14 rounded-full border-2 border-white/60 flex items-center justify-center font-bold text-lg text-white shrink-0 overflow-hidden relative shadow"
                  >
                    {formPhoto ? (
                      <img src={formPhoto} alt="Anteprima" className="w-full h-full object-cover" />
                    ) : (
                      <span>{formNumber || '?'}</span>
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
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-white font-medium flex items-center gap-1.5 w-full justify-center"
                    >
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      {formPhoto ? 'Cambia Foto' : 'Carica Foto'}
                    </button>
                    {formPhoto && (
                      <button
                        type="button"
                        onClick={() => setFormPhoto('')}
                        className="text-[10px] text-red-400 hover:underline block text-center w-full"
                      >
                        Rimuovi foto
                      </button>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome Completo</label>
                  <input
                    id="form-player-name"
                    type="text"
                    required
                    placeholder="Es. Mario Rossi"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Number, Role, Foot in row */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Numero</label>
                    <input
                      id="form-player-number"
                      type="number"
                      min="1"
                      max="99"
                      required
                      value={formNumber}
                      onChange={(e) => setFormNumber(parseInt(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Ruolo</label>
                    <select
                      id="form-player-role"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-300 font-bold focus:outline-none focus:border-sky-500"
                    >
                      {ROLES_LIST.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Piede</label>
                    <select
                      id="form-player-foot"
                      value={formFoot}
                      onChange={(e) => setFormFoot(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Destro">Destro</option>
                      <option value="Sinistro">Sinistro</option>
                      <option value="Ambidestro">Ambidestro</option>
                    </select>
                  </div>
                </div>

                {/* Team Assignment */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Squadra / Maglia</label>
                  <select
                    id="form-player-team"
                    value={formTeam}
                    onChange={(e) => setFormTeam(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="home">{teamSettings.homeTeamName} (Giocatore)</option>
                    <option value="goalkeeper_home">{teamSettings.homeTeamName} (Portiere)</option>
                    <option value="away">{teamSettings.awayTeamName} (Giocatore)</option>
                    <option value="goalkeeper_away">{teamSettings.awayTeamName} (Portiere)</option>
                    <option value="jolly">Jolly / Sostituto Neutrale</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Caratteristiche / Note Tattiche</label>
                  <input
                    id="form-player-notes"
                    type="text"
                    placeholder="Es. Veloce negli spazi, abile di testa..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Salva Giocatore
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlayer(null);
                      setIsCreatingNew(false);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Shirt className="w-12 h-12 text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-300">Seleziona un giocatore dalla lista</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Modifica i suoi dati o carica la sua foto, oppure crea un nuovo calciatore per la tua rosa.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
