import React, { useState } from 'react';
import { ConnectionStatus } from '../../services/syncService';
import {
  Cloud,
  Copy,
  Check,
  RefreshCw,
  Upload,
  Download,
  ExternalLink,
  X,
  Smartphone,
  Monitor,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
} from 'lucide-react';

interface CloudSyncModalProps {
  roomId: string;
  onSetRoomId: (newRoomId: string) => void;
  onForceSync: () => Promise<void>;
  onPullFromCloud?: () => Promise<boolean>;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lastUpdatedTime: number;
  connectionStatus?: ConnectionStatus;
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  roomId,
  onSetRoomId,
  onForceSync,
  onPullFromCloud,
  onExportJson,
  onImportJson,
  lastUpdatedTime,
  connectionStatus = 'connected',
  isOpen,
  onClose,
}) => {
  const [inputRoomId, setInputRoomId] = useState(roomId);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleApplyRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoomId.trim()) {
      onSetRoomId(inputRoomId.trim());
      showSuccess(`Stanza impostata su ${inputRoomId.trim()}`);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePush = async () => {
    setIsPushing(true);
    await onForceSync();
    setIsPushing(false);
    showSuccess('Lavagna e rosa inviate con successo al Cloud! Tutti i tuoi dispositivi si aggiorneranno.');
  };

  const handlePull = async () => {
    if (!onPullFromCloud) return;
    setIsPulling(true);
    const success = await onPullFromCloud();
    setIsPulling(false);
    if (success) {
      showSuccess('Ultima versione della lavagna scaricata con successo dal Cloud!');
    } else {
      showSuccess('La lavagna locale è già sincronizzata con il Cloud.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Cloud className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Sincronizzazione Cloud Automatica</h2>
              <p className="text-xs text-slate-400">AI Studio PC ⇄ Vercel PC ⇄ Vercel iPhone</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-300 overflow-y-auto">
          {/* Notification feedback */}
          {actionSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Real-time Status Card */}
          <div
            className={`border rounded-xl p-3.5 flex items-center justify-between transition-colors ${
              connectionStatus === 'connected'
                ? 'bg-emerald-950/40 border-emerald-500/30'
                : connectionStatus === 'connecting'
                ? 'bg-amber-950/40 border-amber-500/30'
                : 'bg-rose-950/40 border-rose-500/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-400'
                      : connectionStatus === 'connecting'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-500'
                      : connectionStatus === 'connecting'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <div>
                <p className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>
                    {connectionStatus === 'connected' && 'Cloud Database Attivo & Connesso'}
                    {connectionStatus === 'connecting' && 'Connessione al Cloud in corso...'}
                    {connectionStatus === 'disconnected' && 'Disconnesso (Riconnessione automatica)'}
                    {connectionStatus === 'syncing' && 'Sincronizzazione modifiche...'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-300/80">
                  Stanza: <strong className="text-sky-300 font-mono">{roomId}</strong> • Ultimo salvataggio:{' '}
                  {new Date(lastUpdatedTime).toLocaleTimeString('it-IT')}
                </p>
              </div>
            </div>
          </div>

          {/* Direct Push / Pull Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handlePush}
              disabled={isPushing}
              className="p-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-sky-600/20 transition-all border border-sky-400/40 text-center"
            >
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpRight className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
                <span>Invia Lavagna al Cloud</span>
              </div>
              <span className="text-[10px] font-normal text-sky-100 opacity-80">
                Aggiorna tutti i tuoi dispositivi con questa schermata
              </span>
            </button>

            <button
              type="button"
              onClick={handlePull}
              disabled={isPulling}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border border-slate-600 transition-all text-center"
            >
              <div className="flex items-center gap-1.5 text-xs text-sky-400">
                <ArrowDownLeft className={`w-4 h-4 ${isPulling ? 'animate-bounce' : ''}`} />
                <span>Scarica dal Cloud</span>
              </div>
              <span className="text-[10px] font-normal text-slate-400">
                Recupera l'ultima lavagna salvata da iPhone o PC
              </span>
            </button>
          </div>

          {/* Multi-Device Room ID configuration */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <span>Codice Stanza Tattica Condivisa (Room ID)</span>
              </label>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Monitor className="w-3 h-3 text-sky-400" />
                <span>PC</span>
                <span>⇄</span>
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>iPhone</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tutti i tuoi dispositivi (PC su AI Studio, PC su Vercel, iPhone su Vercel) che usano questo codice stanza condividono automaticamente le stesse rose, giocatori, formazioni e schemi tattici.
            </p>

            <form onSubmit={handleApplyRoom} className="flex items-center gap-2 pt-1">
              <input
                id="input-sync-room-id"
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                placeholder="Es. MISTER-CALCIO-ROOM-1"
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-sky-400 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold"
              >
                Imposta
              </button>
            </form>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Codice Copiato!' : 'Copia Codice Stanza'}
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
                {copiedLink ? 'Link Diretto Copiato!' : 'Copia Link iPhone/PC'}
              </button>
            </div>
          </div>

          {/* Backup & Restore JSON */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Backup Manuale File JSON</h4>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onExportJson}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                Esporta Backup JSON
              </button>

              <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer text-center transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                Importa File JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
