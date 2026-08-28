import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ExerciseDrill, Player, TeamSettings } from '../types';

export interface ExportOptions {
  fileName?: string;
  format: 'jpeg' | 'png' | 'pdf';
  includeMetadata?: boolean;
  coachName?: string;
  clubName?: string;
  dateStr?: string;
  quality?: number;
}

export async function exportPitchAsImage(
  pitchElement: HTMLElement,
  options: ExportOptions
): Promise<string> {
  const canvas = await html2canvas(pitchElement, {
    scale: 2.5, // Crisp high-definition output
    useCORS: true,
    logging: false,
    backgroundColor: '#1b4d24', // Rich grass base
    allowTaint: true,
  });

  const mimeType = options.format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, options.quality || 0.95);

  // Trigger download
  const link = document.createElement('a');
  link.download = `${options.fileName || 'lavagna_tattica_calcio'}.${options.format === 'png' ? 'png' : 'jpg'}`;
  link.href = dataUrl;
  link.click();

  return dataUrl;
}

export async function exportDrillToPDF(
  pitchElement: HTMLElement,
  drill: ExerciseDrill,
  roster: Player[],
  teamSettings: TeamSettings,
  options: {
    coachName: string;
    clubName: string;
    dateStr: string;
    notes?: string;
  }
): Promise<void> {
  // 1. Capture pitch canvas as image
  const pitchCanvas = await html2canvas(pitchElement, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#15411e',
    allowTaint: true,
  });

  const pitchImgData = pitchCanvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);

  // Primary Colors
  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [22, 101, 52]; // Green 800
  const textColor = [30, 41, 59]; // Slate 800
  const mutedColor = [100, 116, 139]; // Slate 500

  // 1. Top Header Banner
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, pageWidth, 24, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('MISTER TACTICS • SCHEDA ESERCITAZIONE', margin, 11);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(203, 213, 225);
  pdf.text(`${options.clubName || 'Settore Giovanile & Prima Squadra'}  |  Mister: ${options.coachName || 'Allenatore'}  |  Data: ${options.dateStr || new Date().toLocaleDateString('it-IT')}`, margin, 18);

  // 2. Exercise Title Block
  let currentY = 32;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text(drill.title || 'Esercitazione Tattica', margin, currentY);

  // Badge Category
  pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  const catWidth = pdf.getTextWidth(drill.category.toUpperCase()) + 8;
  pdf.roundedRect(pageWidth - margin - catWidth, currentY - 6, catWidth, 8, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8.5);
  pdf.text(drill.category.toUpperCase(), pageWidth - margin - catWidth + 4, currentY - 0.5);

  currentY += 8;

  // 3. Quick Info Matrix Bar (Durata, Giocatori, Dimensioni, Fase)
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'D');

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  
  const colW = contentWidth / 4;
  pdf.text('DURATA', margin + 4, currentY + 4.5);
  pdf.text('GIOCATORI', margin + colW + 4, currentY + 4.5);
  pdf.text('DIMENSIONI CAMPO', margin + (colW * 2) + 4, currentY + 4.5);
  pdf.text('FASE TATTICA', margin + (colW * 3) + 4, currentY + 4.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.setFontSize(9);
  pdf.text(`${drill.durationMinutes || 20} Minuti`, margin + 4, currentY + 9.5);
  pdf.text(drill.playerCount || 'Rosa completa', margin + colW + 4, currentY + 9.5);
  pdf.text(drill.pitchSize || 'Campo Intero', margin + (colW * 2) + 4, currentY + 9.5);
  const activePhase = drill.phases[drill.activePhaseIndex] || drill.phases[0];
  pdf.text(activePhase ? activePhase.name : 'Fase 1', margin + (colW * 3) + 4, currentY + 9.5);

  currentY += 16;

  // 4. Tactical Pitch Image
  const pitchImgHeight = (contentWidth * pitchCanvas.height) / pitchCanvas.width;
  const clampedPitchHeight = Math.min(pitchImgHeight, 105);

  // Border & Pitch Frame
  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.6);
  pdf.addImage(pitchImgData, 'JPEG', margin, currentY, contentWidth, clampedPitchHeight);
  pdf.rect(margin, currentY, contentWidth, clampedPitchHeight, 'D');

  currentY += clampedPitchHeight + 6;

  // 5. Objectives & Coaching Points
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.text('OBIETTIVI DELL\'ESERCITAZIONE', margin, currentY);

  currentY += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  if (drill.objectivePrimary) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('• Primario: ', margin + 2, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(drill.objectivePrimary, margin + 22, currentY, { maxWidth: contentWidth - 24 });
    currentY += 5;
  }

  if (drill.objectiveSecondary) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('• Secondario: ', margin + 2, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(drill.objectiveSecondary, margin + 25, currentY, { maxWidth: contentWidth - 27 });
    currentY += 5;
  }

  if (drill.description) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('• Descrizione: ', margin + 2, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(drill.description, margin + 25, currentY, { maxWidth: contentWidth - 27 });
    currentY += 7;
  }

  // 6. Punti Chiave / Coaching Points
  if (drill.coachingPoints && drill.coachingPoints.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    pdf.text('PUNTI CHIAVE PER IL MISTER (COACHING POINTS)', margin, currentY);
    currentY += 4.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    drill.coachingPoints.slice(0, 4).forEach((pt) => {
      pdf.text(`✓ ${pt}`, margin + 3, currentY, { maxWidth: contentWidth - 6 });
      currentY += 4;
    });
  }

  // 7. Footer
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  pdf.setFontSize(7.5);
  pdf.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  pdf.text('Generato con MisterTactics • Lavagna Tattica per Allenatori di Calcio (Sincronizzazione AI Studio & Vercel)', margin, pageHeight - 5);
  pdf.text('Pagina 1 / 1', pageWidth - margin - 18, pageHeight - 5);

  // Save the PDF
  const cleanTitle = (drill.title || 'scheda_tattica').toLowerCase().replace(/[^a-z0-9]/g, '_');
  pdf.save(`${cleanTitle}_mister_tactics.pdf`);
}
