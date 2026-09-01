import jsPDF from 'jspdf';
import type { ReviewEntry } from '../types/ReviewEntry';

const PAGE_MARGIN = 20;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const LINE_HEIGHT = 7;
const SECTION_GAP = 5;
const ENTRY_GAP = 10;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function splitText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

function writeLines(
  doc: jsPDF,
  lines: string[],
  x: number,
  y: number,
  pageHeight: number
): number {
  for (const line of lines) {
    if (y + LINE_HEIGHT > pageHeight - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
    doc.text(line, x, y);
    y += LINE_HEIGHT;
  }
  return y;
}

export const generateReviewsPdf = (entries: ReviewEntry[]): void => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = PAGE_MARGIN;

  // --- Title ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Review & Action Tracker', PAGE_MARGIN, y);
  y += 10;

  // --- Generated date ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${getTodayFormatted()}`, PAGE_MARGIN, y);
  y += 8;
  doc.setTextColor(0, 0, 0);

  // --- Top divider ---
  doc.setDrawColor(200, 200, 200);
  doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);
  y += ENTRY_GAP;

  entries.forEach((entry, index) => {
    if (y + 50 > pageHeight - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }

    // --- Leader Name label ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 60, 180);
    doc.text('Reviewer', PAGE_MARGIN, y);
    y += LINE_HEIGHT - 1;

    // --- Leader Name value with role ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const roleLabel = entry.leaderRole === 'leader' ? 'Leader' : 'Core / Intern';
    const leaderLines = splitText(doc, `${entry.leaderName} (${roleLabel})`, CONTENT_WIDTH);
    y = writeLines(doc, leaderLines, PAGE_MARGIN, y, pageHeight);
    y += SECTION_GAP;

    // --- Date added (subtle) ---
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Added: ${formatDate(entry.createdAt)}`, PAGE_MARGIN, y);
    doc.setTextColor(0, 0, 0);
    y += LINE_HEIGHT;
    y += SECTION_GAP;

    // --- Name label ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const revieweeRoleLabel = entry.revieweeRole === 'core' ? 'Core / Intern' : 'Member';
    doc.text(`Name  ·  ${revieweeRoleLabel}`, PAGE_MARGIN, y);
    y += LINE_HEIGHT;

    // --- Name value ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const nameLines = splitText(doc, entry.revieweeName ?? (entry as any).name ?? '', CONTENT_WIDTH);
    y = writeLines(doc, nameLines, PAGE_MARGIN, y, pageHeight);
    y += SECTION_GAP;

    // --- Review label ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Review', PAGE_MARGIN, y);
    y += LINE_HEIGHT;

    // --- Review value ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const reviewLines = splitText(doc, entry.review, CONTENT_WIDTH);
    y = writeLines(doc, reviewLines, PAGE_MARGIN, y, pageHeight);
    y += SECTION_GAP;

    // --- Planned Action label ---
    if (y + LINE_HEIGHT > pageHeight - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Planned Action', PAGE_MARGIN, y);
    y += LINE_HEIGHT;

    // --- Planned Action value ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const actionLines = splitText(doc, entry.plannedAction, CONTENT_WIDTH);
    y = writeLines(doc, actionLines, PAGE_MARGIN, y, pageHeight);
    y += ENTRY_GAP;

    // --- Divider between entries ---
    if (index < entries.length - 1) {
      if (y + 4 > pageHeight - PAGE_MARGIN) {
        doc.addPage();
        y = PAGE_MARGIN;
      }
      doc.setDrawColor(200, 200, 200);
      doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);
      y += ENTRY_GAP;
    }
  });

  doc.save('review-action-tracker.pdf');
};
