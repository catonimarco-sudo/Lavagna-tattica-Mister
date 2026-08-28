import React, { useState } from 'react';
import { SyncSessionState } from '../../types';
import { Cloud, Wifi, Copy, Check, RefreshCw, Upload, Download, ExternalLink, X, Globe, ShieldCheck } from 'lucide-react';

interface CloudSyncModalProps {
  roomId: string;
  onSetRoomId: (newRoomId: string) => void;
  onForceSync: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lastUpdatedTime: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  roomId,
  onSetRoomId,
  onForceSync,
  onExportJson,
  onImportJson,
  lastUpdatedTime,
  isOpen,
  onClose,
}) => {
  const [inputRoomId, setInputRoomId] = useState(roomId);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleApplyRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoomId.trim()) {
      onSetRoomId(inputRoomId.trim());
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

  const handleManualSync = async () => {
    setIsSyncing(true);
    await onForceSync();
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Cloud className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Sincronizzazione Cloud Live</h2>
              <p className="text-xs text-slate-400">Sincronizza in tempo reale tra AI Studio, Vercel e qualsiasi dispositivo</p>
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
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* Real-time Status Card */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="font-bold text-white text-xs">Sincronizzazione Live Attiva</p>
                <p className="text-[11px] text-emerald-300/80">
                  Stanza: <strong className="text-white">{roomId}</strong> • Ultimo salvataggio: {new Date(lastUpdatedTime).toLocaleTimeString('it-IT')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-2.5 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizza Ora
            </button>
          </div>

          {/* Room ID configuration */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <label className="text-[11px] font-bold text-slate-300 block">Codice Stanza Tattica Condivisa (Room ID)</label>
            <p className="text-[11px] text-slate-400">
              Inserisci lo stesso Codice Stanza su <strong>AI Studio</strong> e sul tuo deployment su <strong>Vercel</strong>: qualsiasi modifica alla rosa, ai coni, ai campetti o ai disegni verrà aggiornata simultaneamente in entrambe le parti!
            </p>

            <form onSubmit={handleApplyRoom} className="flex items-center gap-2 pt-1">
              <input
                id="input-sync-room-id"
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                placeholder="Es. MISTER-CALCIO-2025"
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
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] text-slate-200 font-semibold flex items-center justify-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Codice Copiato!' : 'Copia Codice Stanza'}
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] text-slate-200 font-semibold flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
                {copiedLink ? 'Link Diretto Copiato!' : 'Copia Link Condivisibile'}
              </button>
            </div>
          </div>

          {/* Backup & Restore JSON */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Backup Locale & Trasferimento Schede</h4>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onExportJson}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                Esporta Backup JSON
              </button>

              <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer text-center">
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
