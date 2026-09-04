import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bill, BusinessConfig } from '../types';
import { loadSavedBusinessConfig } from '../data/businessPresets';
import { formatPaymentMode } from './paymentModes';

// Helper to convert hex color (#2563eb) to RGB array
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return [r, g, b];
    }
  }
  return [37, 99, 235]; // fallback blue
}

/**
 * Creates a professional vector PDF invoice using jsPDF and jspdf-autotable.
 */
export function buildInvoicePdfDoc(bill: Bill, config?: BusinessConfig): jsPDF {
  const activeConfig = config || loadSavedBusinessConfig();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Primary brand colors
  const primaryColor = hexToRgb(activeConfig.brandColor || '#2563eb');
  const darkSlate = [15, 23, 42]; // #0f172a
  const mutedSlate = [100, 116, 139]; // #64748b
  const lightBg = [248, 250, 252]; // #f8fafc
  const borderGray = [226, 232, 240]; // #e2e8f0

  // 1. Top Decorative Brand Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Company Brand Logo & Header
  let y = 18;

  // Logo Icon Box
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, y - 5, 11, 11, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(activeConfig.brandShort.length > 2 ? 8 : 10);
  doc.text(activeConfig.brandShort || 'RF', margin + (activeConfig.brandShort.length > 2 ? 1.5 : 2.5), y + 2.5);

  // Brand Name
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(activeConfig.businessName || 'RevenueFlow', margin + 14, y + 1);

  // Subtitle / Legal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.text(activeConfig.tagline || 'Cloud Operations & Financial Solutions', margin + 14, y + 6);
  
  const taxIdLine = activeConfig.taxNumber 
    ? `${activeConfig.taxLabel || 'Tax ID'}: ${activeConfig.taxNumber}  |  ${activeConfig.email}`
    : activeConfig.email;
  doc.text(taxIdLine, margin + 14, y + 10.5);

  // Right Side: Invoice Meta Header
  const invoiceTypeTitle = bill.type === 'gst' ? (activeConfig.taxSystem === 'gst' ? 'TAX INVOICE' : 'OFFICIAL INVOICE') : 'COMMERCIAL MEMO';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(invoiceTypeTitle, pageWidth - margin, y, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(bill.billNumber, pageWidth - margin, y + 6, { align: 'right' });

  // Status Badge
  const isPaid = bill.status === 'paid';
  const badgeText = isPaid ? 'PAID' : 'PENDING PAYMENT';
  const badgeWidth = isPaid ? 18 : 36;
  const badgeX = pageWidth - margin - badgeWidth;
  const badgeY = y + 8.5;

  if (isPaid) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.setTextColor(5, 150, 105); // emerald-600
  } else {
    doc.setFillColor(254, 243, 199); // amber-50
    doc.setDrawColor(253, 230, 138); // amber-200
    doc.setTextColor(217, 119, 6); // amber-600
  }
  doc.roundedRect(badgeX, badgeY, badgeWidth, 5.5, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(badgeText, badgeX + badgeWidth / 2, badgeY + 3.8, { align: 'center' });

  // Divider
  y = 36;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // 3. Information Grid (Billed To vs Invoice Dates)
  y = 42;
  const colWidth = (contentWidth - 6) / 2;

  // Box 1: Customer Details
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, colWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.text('BILLED TO', margin + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(bill.customerName, margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.text(`Phone: ${bill.phoneNumber}`, margin + 4, y + 17.5);
  if (activeConfig.cityStateZip) {
    doc.text(`Issuer: ${activeConfig.cityStateZip}`, margin + 4, y + 22.5);
  } else {
    doc.text('Commercial Invoicing Memo', margin + 4, y + 22.5);
  }
  doc.text(`Status: ${bill.status.toUpperCase()}`, margin + 4, y + 27.5);

  // Box 2: Invoice & Payment Terms Details
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin + colWidth + 6, y, colWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.text('INVOICE & PAYMENT DETAILS', margin + colWidth + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

  doc.text('Invoice Date:', margin + colWidth + 10, y + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.text(bill.date, margin + colWidth + 42, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.text('Payment Due:', margin + colWidth + 10, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPaid ? darkSlate[0] : 220, isPaid ? darkSlate[1] : 38, isPaid ? darkSlate[2] : 38);
  doc.text(bill.dueDate || 'Upon Receipt', margin + colWidth + 42, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Currency:', margin + colWidth + 10, y + 22.5);
  doc.setFont('helvetica', 'bold');
  doc.text(bill.currency === '$' ? 'USD ($)' : bill.currency === '₹' ? 'INR (₹)' : bill.currency === '€' ? 'EUR (€)' : bill.currency, margin + colWidth + 42, y + 22.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Payment Mode:', margin + colWidth + 10, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const displayPaymentMode = bill.paymentMode ? formatPaymentMode(bill.paymentMode) : 'Standard Terms';
  doc.text(displayPaymentMode, margin + colWidth + 42, y + 28);

  // 4. Line Items Table via autoTable
  y = 81;
  const tableData = bill.items.map((item, index) => [
    (index + 1).toString(),
    item.name,
    item.quantity.toString(),
    `${bill.currency}${item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `${bill.currency}${(item.quantity * item.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Description', 'Qty', 'Unit Rate', 'Amount']],
    body: tableData,
    theme: 'plain',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [30, 41, 59], // #1e293b
      textColor: [255, 255, 255],
      font: 'helvetica',
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 3.5
    },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 36, fontStyle: 'bold' }
    }
  });

  // Calculate table end position
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : y + 40;

  // 5. Bottom Financial Breakdown & Payment Info
  let summaryY = finalY + 8;

  // If table went near bottom, add page
  if (summaryY + 55 > pageHeight) {
    doc.addPage();
    summaryY = 20;
  }

  // Left column: Bank & Payment Instructions
  const paymentBoxWidth = contentWidth * 0.52;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, summaryY, paymentBoxWidth, 42, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PAYMENT INSTRUCTIONS', margin + 4, summaryY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.text(`Bank: ${activeConfig.bankName || 'HDFC Bank Ltd'}`, margin + 4, summaryY + 12);
  doc.text(`Account No: ${activeConfig.accountNumber || '50200084930219'}`, margin + 4, summaryY + 17);
  doc.text(`Routing/IFSC: ${activeConfig.routingOrIfsc || 'HDFC0000123'}`, margin + 4, summaryY + 22);
  if (activeConfig.upiOrPaypal) {
    doc.text(`UPI / PayPal / Pay: ${activeConfig.upiOrPaypal}`, margin + 4, summaryY + 27);
  } else {
    doc.text(`Beneficiary: ${activeConfig.accountName || activeConfig.businessName}`, margin + 4, summaryY + 27);
  }
  if (isPaid && bill.paymentMode) {
    doc.text(`Settled Via: ${formatPaymentMode(bill.paymentMode)}${bill.paymentReference ? ` (Ref: ${bill.paymentReference})` : ''}`, margin + 4, summaryY + 32);
  } else {
    doc.text(`Reference: ${bill.billNumber}`, margin + 4, summaryY + 32);
  }
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text(activeConfig.paymentNote || 'Please include invoice number in payment remarks.', margin + 4, summaryY + 37);

  // Right column: Financial Calculations
  const calcBoxX = margin + paymentBoxWidth + 6;
  const calcBoxWidth = contentWidth - paymentBoxWidth - 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);

  let calcY = summaryY + 5;
  doc.text('Subtotal', calcBoxX, calcY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(
    `${bill.currency}${bill.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    pageWidth - margin,
    calcY,
    { align: 'right' }
  );

  calcY += 6;
  if (bill.type === 'gst') {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    if (activeConfig.taxSystem === 'gst') {
      doc.text(`CGST (${(bill.taxRate / 2).toFixed(1)}%)`, calcBoxX, calcY);
      doc.text(
        `${bill.currency}${(bill.taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pageWidth - margin,
        calcY,
        { align: 'right' }
      );

      calcY += 6;
      doc.text(`SGST (${(bill.taxRate / 2).toFixed(1)}%)`, calcBoxX, calcY);
      doc.text(
        `${bill.currency}${(bill.taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pageWidth - margin,
        calcY,
        { align: 'right' }
      );
    } else {
      doc.text(`${activeConfig.taxLabel || 'Tax'} (${bill.taxRate}%)`, calcBoxX, calcY);
      doc.text(
        `${bill.currency}${bill.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pageWidth - margin,
        calcY,
        { align: 'right' }
      );
    }
    calcY += 6;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text('Tax (Standard Non-Tax Memo)', calcBoxX, calcY);
    doc.text(`${bill.currency}0.00`, pageWidth - margin, calcY, { align: 'right' });
    calcY += 6;
  }

  // Total Due Highlight Box
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.roundedRect(calcBoxX - 2, calcY - 1, calcBoxWidth + 2, 13, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TOTAL DUE', calcBoxX + 2, calcY + 7);

  doc.setFontSize(12);
  doc.text(
    `${bill.currency}${bill.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    pageWidth - margin - 2,
    calcY + 7.2,
    { align: 'right' }
  );

  // 6. Footer Terms & Signature Note
  const footerY = pageHeight - 16;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
  doc.text(
    activeConfig.footerNote || 'Thank you for your business! This is an electronically generated document authorized by RevenueFlow.',
    margin,
    footerY
  );
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

/**
 * Helper to trigger robust file downloads on desktop and mobile browsers.
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const url = URL.createObjectURL(blob);

  if (isIOS) {
    // iOS Safari cannot download direct blob via <a download>; opening the blob URL in a new tab allows user to view / save to Files / share
    const win = window.open(url, '_blank');
    if (!win) {
      window.location.href = url;
    }
  } else {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }, 500);
  }
}

/**
 * Downloads a generated invoice PDF to the user's computer or mobile device.
 */
export function downloadInvoicePdf(bill: Bill, config?: BusinessConfig): string {
  const doc = buildInvoicePdfDoc(bill, config);
  const cleanCustomer = (bill.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${bill.billNumber}_${cleanCustomer}.pdf`;

  try {
    const blob = doc.output('blob');
    triggerFileDownload(blob, filename);
    return filename;
  } catch (err) {
    // Fallback to jsPDF standard save
    doc.save(filename);
    return filename;
  }
}

/**
 * Generates an invoice PDF as a Blob object for sharing or viewing.
 */
export function getInvoicePdfBlob(bill: Bill, config?: BusinessConfig): Blob {
  const doc = buildInvoicePdfDoc(bill, config);
  return doc.output('blob');
}

/**
 * Opens the generated invoice PDF in a new tab for previewing or printing.
 */
export function openInvoicePdfPreview(bill: Bill, config?: BusinessConfig): void {
  const blob = getInvoicePdfBlob(bill, config);
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    window.location.href = url;
  }
}

/**
 * Uses the native Web Share API to share the PDF directly if supported by the browser,
 * or provides immediate WhatsApp + download fallback on HTTP / non-secure contexts.
 */
export async function shareInvoicePdf(bill: Bill, config?: BusinessConfig): Promise<{ shared: boolean; method: string }> {
  const cleanCustomer = (bill.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${bill.billNumber}_${cleanCustomer}.pdf`;
  const blob = getInvoicePdfBlob(bill, config);

  // Check if Web Share API is available (only enabled on HTTPS / Secure Contexts)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const file = new File([blob], filename, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${bill.billNumber} - ${config?.businessName || 'RevenueFlow'}`,
          text: `Invoice ${bill.billNumber} for ${bill.customerName} (${bill.currency}${bill.total.toLocaleString()})`,
          files: [file]
        });
        return { shared: true, method: 'native' };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { shared: false, method: 'cancelled' };
      }
      console.warn('Native file share error:', err);
    }

    // Try text/url share if file share is unsupported
    try {
      await navigator.share({
        title: `Invoice ${bill.billNumber} - ${config?.businessName || 'RevenueFlow'}`,
        text: `Invoice ${bill.billNumber} for ${bill.customerName} (${bill.currency}${bill.total.toLocaleString()}). Status: ${bill.status.toUpperCase()}`,
        url: window.location.href
      });
      return { shared: true, method: 'native-text' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { shared: false, method: 'cancelled' };
      }
    }
  }

  // Fallback on HTTP or when Web Share API is unavailable:
  // 1. Trigger WhatsApp sharing with full details
  const whatsappText = encodeURIComponent(
    `*Invoice ${bill.billNumber}*\n` +
    `Business: ${config?.businessName || 'RevenueFlow'}\n` +
    `Customer: ${bill.customerName}\n` +
    `Total: ${bill.currency}${bill.total.toLocaleString()}\n` +
    `Status: ${bill.status.toUpperCase()}\n` +
    `Date: ${bill.date}\n` +
    `Due Date: ${bill.dueDate || 'Immediate'}`
  );
  window.open(`https://api.whatsapp.com/send?text=${whatsappText}`, '_blank');

  // 2. Also trigger the PDF download
  downloadInvoicePdf(bill, config);
  return { shared: true, method: 'whatsapp-and-download' };
}

