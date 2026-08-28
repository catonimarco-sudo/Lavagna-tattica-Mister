import React, { useState } from 'react';
import { ExerciseDrill, Player, TeamSettings } from '../../types';
import { exportPitchAsImage, exportDrillToPDF } from '../../services/exportService';
import { Download, FileText, Image as ImageIcon, Check, X, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  drill: ExerciseDrill;
  roster: Player[];
  teamSettings: TeamSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  drill,
  roster,
  teamSettings,
  isOpen,
  onClose,
}) => {
  const [exportType, setExportType] = useState<'jpeg' | 'png' | 'pdf'>('pdf');
  const [coachName, setCoachName] = useState('Mister Calcio');
  const [clubName, setClubName] = useState('ASD Calcio - Settore Giovanile');
  const [dateStr, setDateStr] = useState(new Date().toLocaleDateString('it-IT'));
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExecuteExport = async () => {
    const pitchElement = document.getElementById('main-tactical-pitch-container');
    if (!pitchElement) {
      alert('Impossibile trovare il campetto tattico');
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    try {
      if (exportType === 'pdf') {
        await exportDrillToPDF(pitchElement, drill, roster, teamSettings, {
          coachName,
          clubName,
          dateStr,
        });
      } else {
        await exportPitchAsImage(pitchElement, {
          format: exportType,
          fileName: `${drill.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_lavagna`,
          quality: 0.98,
        });
      }

      setExportSuccess(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (err) {}

      setTimeout(() => {
        setIsExporting(false);
      }, 600);
    } catch (err) {
      console.error('Export error:', err);
      alert('Si è verificato un errore durante l\'esportazione.');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Download className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Esporta Campetto & Analisi</h2>
              <p className="text-xs text-slate-400">Scarica in formato PDF stampabile o Immagine JPEG ad alta risoluzione</p>
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

        {/* Form */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* Format Selection Cards */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Seleziona Formato di Esportazione</label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* PDF */}
              <button
                type="button"
                onClick={() => setExportType('pdf')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  exportType === 'pdf'
                    ? 'bg-emerald-950/70 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-xs">PDF Tattico</span>
                <span className="text-[10px] text-slate-400">Scheda A4 completa</span>
              </button>

              {/* JPEG */}
              <button
                type="button"
                onClick={() => setExportType('jpeg')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  exportType === 'jpeg'
                    ? 'bg-sky-950/70 border-sky-500 text-white ring-2 ring-sky-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-5 h-5 text-sky-400" />
                <span className="font-bold text-xs">Immagine JPEG</span>
                <span className="text-[10px] text-slate-400">Campetto HD</span>
              </button>

              {/* PNG */}
              <button
                type="button"
                onClick={() => setExportType('png')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  exportType === 'png'
                    ? 'bg-sky-950/70 border-sky-500 text-white ring-2 ring-sky-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-xs">PNG Trasparente</span>
                <span className="text-[10px] text-slate-400">Alta fedeltà</span>
              </button>
            </div>
          </div>

          {/* PDF Customization options */}
          {exportType === 'pdf' && (
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nome Mister / Allenatore</label>
                  <input
                    id="export-coach-name"
                    type="text"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Società / Categoria</label>
                  <input
                    id="export-club-name"
                    type="text"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Data Esercizio</label>
                <input
                  id="export-date"
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Export button */}
          <button
            id="btn-confirm-export"
            type="button"
            disabled={isExporting}
            onClick={handleExecuteExport}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generazione {exportType.toUpperCase()} in corso...
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                Download completato con successo!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Scarica {exportType === 'pdf' ? 'Scheda PDF Ufficiale' : `Immagine ${exportType.toUpperCase()}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
