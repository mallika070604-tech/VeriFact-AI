import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResult } from '../types';

export async function generatePdfReport(result: AnalysisResult, containerElementId: string = 'result-dashboard-container') {
  const element = document.getElementById(containerElementId);
  
  if (!element) {
    createStructuredPdf(result);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#0b0f19' : '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`VeriFact_Analysis_${result.id}.pdf`);
  } catch (err) {
    console.error('Failed to generate canvas PDF, falling back to basic PDF:', err);
    createStructuredPdf(result);
  }
}

function createStructuredPdf(result: AnalysisResult) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.text('VERIFACT AI - FACT CHECK REPORT', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${new Date(result.createdAt).toLocaleString()}`, 14, y);
  doc.text(`Input Type: ${result.inputType.toUpperCase()}`, 110, y);
  y += 6;
  doc.text(`Report ID: ${result.id}`, 14, y);
  y += 8;

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 10;

  // Verdict & Confidence
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`VERDICT: ${result.verdict} (${result.confidence}% Confidence)`, 14, y);
  y += 10;

  // Claim
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Evaluated Claim:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  const claimLines = doc.splitTextToSize(result.claim, 170);
  doc.text(claimLines, 14, y);
  y += claimLines.length * 6 + 6;

  // Explanation
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Explanation:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  const expLines = doc.splitTextToSize(result.explanation || result.summary, 170);
  doc.text(expLines, 14, y);
  y += expLines.length * 6 + 6;

  // Evidence
  if (result.evidence && result.evidence.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Key Evidence & Verification Points:', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    result.evidence.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const itemLines = doc.splitTextToSize(`• ${item}`, 165);
      doc.text(itemLines, 18, y);
      y += itemLines.length * 5 + 2;
    });
    y += 4;
  }

  // Source Credibility
  if (result.sourceCredibility || result.sourceName) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Source Credibility Assessment:', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const sourceInfo = result.sourceCredibility
      ? `${result.sourceCredibility.organization} (Credibility Score: ${result.sourceCredibility.credibilityScore}/100) - ${result.sourceCredibility.ratingReason}`
      : `Publisher: ${result.sourceName || 'Evaluated Source'}`;
    const sourceLines = doc.splitTextToSize(sourceInfo, 170);
    doc.text(sourceLines, 14, y);
  }

  doc.save(`VeriFact_Report_${result.id}.pdf`);
}
