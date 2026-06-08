import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice, Quote } from "@/lib/types";

// jsPDF can't render French non-breaking space thousands separator — use plain space
function fmt(n: number, decimals = 2): string {
  return n
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function getLastY(doc: jsPDF): number {
  const t = (doc as jsPDF & { getLastAutoTable(): { finalY?: number } | null }).getLastAutoTable();
  return t?.finalY ?? 70;
}

function drawHeader(doc: jsPDF, opts: {
  title: string;
  number: string;
  company: string;
  contact: string;
  dateLabel: string;
  date: string;
  dueLabel?: string;
  due?: string;
}) {
  const PAGE_W = 210;
  const MARGIN = 14;
  const RIGHT = PAGE_W - MARGIN;

  // ── Left: brand ──────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241); // indigo-500
  doc.text("Mon CRM", MARGIN, 18);

  // ── Left: document type + number ─────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text(opts.title, MARGIN, 27);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(opts.number, MARGIN, 35);

  // ── Right: dates ──────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`${opts.dateLabel} :`, RIGHT - 60, 27);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(opts.date, RIGHT, 27, { align: "right" });

  if (opts.dueLabel && opts.due) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`${opts.dueLabel} :`, RIGHT - 60, 34);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(opts.due, RIGHT, 34, { align: "right" });
  }

  // ── Divider ───────────────────────────────────────────────────────────────
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 40, RIGHT, 40);

  // ── Client block ─────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text("CLIENT", MARGIN, 48);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(opts.company || "—", MARGIN, 55);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(opts.contact || "", MARGIN, 61);
}

function drawLines(
  doc: jsPDF,
  lines: { description: string; quantity: number; unit_price: number; discount: number; tax_rate?: number }[],
  startY: number
) {
  const withTax = lines.some((l) => l.tax_rate !== undefined && l.tax_rate > 0);

  const head = withTax
    ? [["Description", "Qté", "P.U. HT", "Remise", "HT", "TVA"]]
    : [["Description", "Qté", "P.U. HT", "Remise", "Total HT"]];

  const body = lines.map((l) => {
    const ht = l.unit_price * l.quantity * (1 - l.discount / 100);
    const row: string[] = [
      l.description,
      String(l.quantity),
      `${fmt(l.unit_price)} EUR`,
      `${l.discount} %`,
      `${fmt(ht)} EUR`,
    ];
    if (withTax) row.push(`${fmt(ht * ((l.tax_rate ?? 0) / 100))} EUR`);
    return row;
  });

  autoTable(doc, {
    head,
    body,
    startY,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    columnStyles: { 0: { cellWidth: 75 } },
    margin: { left: 14, right: 14 },
  });
}

function drawTotals(
  doc: jsPDF,
  lines: { quantity: number; unit_price: number; discount: number; tax_rate?: number }[],
  afterY: number
) {
  const RIGHT = 196;
  const ht = lines.reduce((s, l) => s + l.unit_price * l.quantity * (1 - l.discount / 100), 0);
  const tva = lines.reduce((s, l) => s + l.unit_price * l.quantity * (1 - l.discount / 100) * ((l.tax_rate ?? 0) / 100), 0);
  let y = afterY + 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);

  if (tva > 0) {
    doc.text("Total HT :", 145, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(`${fmt(ht)} EUR`, RIGHT, y, { align: "right" });

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("TVA :", 145, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(`${fmt(tva)} EUR`, RIGHT, y, { align: "right" });

    y += 7;
    doc.setDrawColor(200);
    doc.line(145, y - 2, RIGHT, y - 2);
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text("Total TTC :", 145, y + 3);
    doc.text(`${fmt(ht + tva)} EUR`, RIGHT, y + 3, { align: "right" });
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text("Total HT :", 145, y);
    doc.text(`${fmt(ht)} EUR`, RIGHT, y, { align: "right" });
  }
}

function drawFooter(doc: jsPDF, notes?: string) {
  const PAGE_H = 297;
  const MARGIN = 14;
  const RIGHT = 196;

  if (notes) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(130);
    const lines = doc.splitTextToSize(notes, RIGHT - MARGIN);
    doc.text(lines, MARGIN, PAGE_H - 25);
  }

  doc.setDrawColor(230);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, PAGE_H - 12, RIGHT, PAGE_H - 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(160);
  doc.text("Mon CRM — document généré automatiquement", MARGIN, PAGE_H - 7);
}

export function generateInvoicePDF(inv: Invoice) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawHeader(doc, {
    title: "FACTURE",
    number: inv.invoice_number,
    company: inv.company,
    contact: inv.contact,
    dateLabel: "Emission",
    date: inv.issue_date,
    dueLabel: "Echeance",
    due: inv.due_date,
  });

  if (inv.lines.length > 0) {
    drawLines(doc, inv.lines, 68);
    drawTotals(doc, inv.lines, getLastY(doc));
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(`Montant : ${fmt(inv.amount)} EUR`, 14, 72);
  }

  drawFooter(doc, inv.notes ?? undefined);
  doc.save(`${inv.invoice_number}.pdf`);
}

export function generateQuotePDF(q: Quote) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawHeader(doc, {
    title: "DEVIS",
    number: q.quote_number,
    company: q.company,
    contact: q.contact,
    dateLabel: "Emission",
    date: q.issue_date,
    dueLabel: "Valable jusqu'au",
    due: q.valid_until,
  });

  if (q.lines.length > 0) {
    drawLines(doc, q.lines, 68);
    drawTotals(doc, q.lines, getLastY(doc));
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(`Montant estime : ${fmt(q.amount)} EUR`, 14, 72);
  }

  drawFooter(doc, q.notes ?? undefined);
  doc.save(`${q.quote_number}.pdf`);
}
