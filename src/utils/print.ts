/**
 * Wales HQ Global Logistics - Print Utilities
 * Tracking labels, receipts, and QR codes
 */

import jsPDF from 'jspdf';

// Wales HQ branding
const WALES_HQ_BRAND = {
  name: 'Wales HQ Global Logistics',
  tagline: 'Global Operations Center, Cardiff, Wales',
  address: 'Cardiff Bay, CF10 5AL, Wales, United Kingdom',
  phone: '+44 29 2000 0000',
  email: 'support@waleshq.com',
  website: 'www.waleshq.com',
};

export const printTrackingLabel = async (shipment: any) => {
  // Generate QR code data URL
  const trackingUrl = `${window.location.origin}/tracking/${shipment.tracking_number}`;

  // Create a simple QR placeholder (actual QR would need a library)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [4, 6], // 4x6 inches label
  });

  // Background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 152.4, 101.6, 'F');

  // Header
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 20, 60); // Wales HQ Red
  pdf.text('Wales HQ', 10, 15);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Global Logistics', 10, 20);

  // Tracking Number
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text(shipment.tracking_number, 10, 30);

  // Barcode placeholder
  pdf.setDrawColor(0, 0, 0);
  for (let i = 0; i < shipment.tracking_number.length; i++) {
    const width = Math.random() * 2 + 0.5;
    pdf.setLineWidth(width * 0.5);
    pdf.line(10 + i * 3, 32, 10 + i * 3, 45);
  }

  // From/To addresses
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FROM:', 10, 55);
  pdf.text('TO:', 80, 55);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const fromLines = [
    shipment.origin.address || '',
    `${shipment.origin.city}, ${shipment.origin.postal_code}`,
    shipment.origin.country,
  ].filter(Boolean);

  const toLines = [
    shipment.destination.address || '',
    `${shipment.destination.city}, ${shipment.destination.postal_code}`,
    shipment.destination.country,
  ].filter(Boolean);

  fromLines.forEach((line, i) => {
    pdf.text(line, 10, 62 + i * 5);
  });

  toLines.forEach((line, i) => {
    pdf.text(line, 80, 62 + i * 5);
  });

  // Service & Weight
  pdf.setFontSize(8);
  pdf.text(`Service: ${shipment.service?.toUpperCase() || 'EXPRESS'}`, 10, 85);
  pdf.text(`Weight: ${shipment.weight || 'N/A'} kg`, 10, 90);

  // Footer
  pdf.setFontSize(6);
  pdf.setTextColor(150, 150, 150);
  pdf.text(WALES_HQ_BRAND.address, 10, 98);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 100, 98);

  // Open print dialog
  pdf.autoPrint();
  window.open(pdf.output('bloburl'), '_blank');
};

export const printTrackingReceipt = async (shipment: any, events: any[]) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Header
  pdf.setFillColor(220, 20, 60);
  pdf.rect(0, 0, pageWidth, 40, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Wales HQ', 20, 25);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Global Logistics - Tracking Receipt', 20, 33);

  y = 55;

  // Tracking Info
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tracking Number', 20, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(14);
  pdf.text(shipment.tracking_number, 20, y + 8);

  // Status Badge
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  const statusText = shipment.status.replace('_', ' ').toUpperCase();
  const statusWidth = pdf.getTextWidth(statusText) + 10;
  pdf.setFillColor(0, 122, 255);
  pdf.roundedRect(pageWidth - 20 - statusWidth, y - 3, statusWidth, 10, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.text(statusText, pageWidth - 25 - pdf.getTextWidth(statusText), y + 4);

  y += 25;

  // Route
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  pdf.text('FROM', 20, y);
  pdf.text('TO', pageWidth / 2 + 10, y);

  y += 8;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.text(`${shipment.origin.city}, ${shipment.origin.country}`, 20, y);
  pdf.text(`${shipment.destination.city}, ${shipment.destination.country}`, pageWidth / 2 + 10, y);

  y += 15;

  // Package Details
  pdf.setDrawColor(230, 230, 230);
  pdf.line(20, y, pageWidth - 20, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Package Details', 20, y);

  y += 8;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Weight: ${shipment.weight} kg`, 20, y);
  pdf.text(`Service: ${shipment.service}`, 80, y);
  pdf.text(`Est. Delivery: ${new Date(shipment.estimated_delivery).toLocaleDateString()}`, 130, y);

  y += 15;

  // Timeline
  pdf.setTextColor(100, 100, 100);
  pdf.text('Tracking History', 20, y);

  y += 8;
  events.forEach((event, i) => {
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

    pdf.setTextColor(event.completed ? '#34C759' : '#8E8E93');
    pdf.circle(25, y, 3, 'F');

    if (i < events.length - 1) {
      pdf.setDrawColor(220, 220, 220);
      pdf.line(25, y + 3, 25, y + 15);
    }

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(event.status, 35, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    pdf.text(`${event.location} - ${new Date(event.timestamp).toLocaleString()}`, 35, y + 5);

    y += 18;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Generated on ${new Date().toLocaleString()} | Wales HQ Global Logistics | Track at ${WALES_HQ_BRAND.website}`,
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  pdf.autoPrint();
  window.open(pdf.output('bloburl'), '_blank');
};

export const generateQRCode = async (text: string): Promise<string> => {
  // Generate a simple QR code placeholder
  // In production, use a library like 'qrcode'
  return `data:text/plain;base64,${btoa(text)}`;
};

export default {
  printTrackingLabel,
  printTrackingReceipt,
  generateQRCode,
};
