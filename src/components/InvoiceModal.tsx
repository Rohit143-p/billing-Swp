import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Printer,
  Share2,
  Building,
  Phone,
  Calendar,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  FileDown,
  FileText,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare
} from 'lucide-react';
import { Bill, BusinessConfig, PaymentMode } from '../types';
import { loadSavedBusinessConfig } from '../data/businessPresets';
import { exportSingleBillDueDate } from '../utils/calendarExport';
import {
  downloadInvoicePdf,
  shareInvoicePdf,
  openInvoicePdfPreview
} from '../utils/pdfInvoiceGenerator';
import { PaymentModeBadge } from './PaymentModeBadge';
import { PaymentModeSelector } from './PaymentModeSelector';
import { DynamicQrCode } from './DynamicQrCode';

interface InvoiceModalProps {
  bill: Bill | null;
  onClose: () => void;
  onToggleStatus?: (billId: string) => void;
  onUpdatePaymentMode?: (billId: string, mode: PaymentMode, reference?: string) => void;
  config?: BusinessConfig;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  bill,
  onClose,
  onToggleStatus,
  onUpdatePaymentMode,
  config
}) => {
  const [isIcsDownloaded, setIsIcsDownloaded] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null);
  const [isEditingPaymentMode, setIsEditingPaymentMode] = useState(false);
  const [editMode, setEditMode] = useState<PaymentMode>(bill?.paymentMode || 'UPI/QR');
  const [editRef, setEditRef] = useState(bill?.paymentReference || '');

  const activeConfig = config || loadSavedBusinessConfig();

  // Sync edit mode when bill changes
  React.useEffect(() => {
    if (bill) {
      setEditMode(bill.paymentMode || 'UPI/QR');
      setEditRef(bill.paymentReference || '');
      setIsEditingPaymentMode(false);
    }
  }, [bill]);

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setIsPdfGenerating(true);
    try {
      const filename = downloadInvoicePdf(bill, activeConfig);
      setPdfStatusMessage(`Downloaded ${filename}`);
      setTimeout(() => setPdfStatusMessage(null), 3500);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Could not generate PDF. Please try again or use the print option.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleSharePdf = async () => {
    setIsPdfGenerating(true);
    try {
      const result = await shareInvoicePdf(bill, activeConfig);
      if (result.shared && result.method === 'native') {
        setPdfStatusMessage('PDF shared successfully!');
      } else if (result.shared && result.method === 'download') {
        setPdfStatusMessage('PDF downloaded — ready to attach & send!');
      }
      setTimeout(() => setPdfStatusMessage(null), 3500);
    } catch (error) {
      console.error('Failed to share PDF:', error);
      handleDownloadPdf();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handlePreviewPdf = () => {
    try {
      openInvoicePdfPreview(bill, activeConfig);
    } catch (error) {
      console.error('Failed to preview PDF:', error);
      handleDownloadPdf();
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${bill.customerName},\n\nHere is your invoice ${bill.billNumber} from ${activeConfig.businessName} for ${bill.currency}${bill.total.toLocaleString()}.\nStatus: ${bill.status.toUpperCase()}\n\nThank you for your business!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareSMS = () => {
    const text = encodeURIComponent(
      `Invoice ${bill.billNumber} from ${activeConfig.businessName} for ${bill.currency}${bill.total.toLocaleString()} is ${bill.status.toUpperCase()}. Due: ${bill.dueDate || 'Immediate'}. Thank you!`
    );
    const cleanPhone = bill.phoneNumber ? bill.phoneNumber.replace(/[^0-9+]/g, '') : '';
    window.location.href = `sms:${cleanPhone}?body=${text}`;
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Invoice ${bill.billNumber} from ${activeConfig.businessName}`);
    const body = encodeURIComponent(
      `Dear ${bill.customerName},\n\nPlease find your invoice details below:\n\n• Invoice Number: ${bill.billNumber}\n• Date: ${bill.date}\n• Due Date: ${bill.dueDate || 'Immediate'}\n• Amount Due: ${bill.currency}${bill.total.toLocaleString()}\n• Status: ${bill.status.toUpperCase()}\n\nPayment Mode: ${bill.paymentMode || 'UPI/QR'}\n${activeConfig.upiOrPaypal ? `Payment UPI/ID: ${activeConfig.upiOrPaypal}\n` : ''}\nThank you for your business!\n\nBest regards,\n${activeConfig.businessName}\n${activeConfig.email || ''}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleExportIcs = () => {
    exportSingleBillDueDate(bill);
    setIsIcsDownloaded(true);
    setTimeout(() => setIsIcsDownloaded(false), 2500);
  };

  const handleToggleStatus = () => {
    if (!onToggleStatus || !bill) return;
    if (bill.status === 'pending') {
      try {
        confetti({
          particleCount: 30,
          spread: 55,
          origin: { y: 0.35, x: 0.3 }
        });
      } catch {
        // Safe fallback if confetti context is unavailable
      }
    }
    onToggleStatus(bill.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col touch-scroll">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
            <span className={`px-2 py-0.5 text-[11px] sm:text-xs font-semibold rounded-md border ${
              bill.type === 'gst'
                ? 'border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {bill.type === 'gst' ? 'Tax Invoice' : 'Estimate Memo'}
            </span>

            {/* Framer Motion Animated Status Badge */}
            <div className="relative inline-flex items-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.button
                  key={bill.status}
                  type="button"
                  onClick={onToggleStatus ? handleToggleStatus : undefined}
                  initial={{ scale: 0.84, opacity: 0, y: -2 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.84, opacity: 0, y: 2 }}
                  whileHover={onToggleStatus ? { scale: 1.05 } : undefined}
                  whileTap={onToggleStatus ? { scale: 0.94 } : undefined}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 24
                  }}
                  className={`group relative inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-md uppercase tracking-wider border shadow-2xs select-none transition-colors ${
                    onToggleStatus ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    bill.status === 'paid'
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                      : 'border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                  }`}
                  title={
                    onToggleStatus
                      ? `Status: ${bill.status.toUpperCase()} (Click to toggle)`
                      : `Status: ${bill.status.toUpperCase()}`
                  }
                >
                  {bill.status === 'paid' ? (
                    <>
                      {/* Animated check with spring pop & subtle rotation */}
                      <motion.span
                        key="paid-icon"
                        initial={{ scale: 0, rotate: -60 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 18,
                          delay: 0.05
                        }}
                        className="inline-flex text-emerald-600 dark:text-emerald-400 shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </motion.span>
                      <span>Paid</span>
                      {/* Radiating highlight ring on transition to paid */}
                      <motion.span
                        initial={{ opacity: 0.8, scale: 0.9 }}
                        animate={{ opacity: 0, scale: 1.25 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-md border-2 border-emerald-400 pointer-events-none"
                      />
                    </>
                  ) : (
                    <>
                      {/* Animated rocking clock icon */}
                      <motion.span
                        key="pending-icon"
                        initial={{ scale: 0.7, rotate: -25 }}
                        animate={{ scale: 1, rotate: [0, -18, 12, 0] }}
                        transition={{ duration: 0.45, ease: 'easeInOut' }}
                        className="inline-flex text-amber-600 dark:text-amber-400 shrink-0"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </motion.span>
                      <span>Pending</span>
                      {/* Active pulsating amber radar dot */}
                      <span className="relative flex h-1.5 w-1.5 ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                      </span>
                    </>
                  )}
                </motion.button>
              </AnimatePresence>
            </div>

            {bill.paymentMode && (
              <PaymentModeBadge mode={bill.paymentMode} size="sm" />
            )}
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            {/* Quick PDF Download in Header */}
            <button
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              title="Download professional PDF invoice"
              className="px-2 sm:px-2.5 py-1.5 text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800/80 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 active:scale-95 shadow-2xs"
            >
              {isPdfGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              ) : (
                <FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {/* Calendar Export */}
            <button
              onClick={handleExportIcs}
              title="Export Payment Due Date as .ics for Apple / Google / Outlook Calendar"
              className="px-2 sm:px-2.5 py-1.5 text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold active:scale-95 shadow-2xs"
            >
              {isIcsDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline text-emerald-700 dark:text-emerald-300">Exported</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">.ics</span>
                </>
              )}
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              title="Print Invoice"
              className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer active:scale-95 shadow-2xs"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              title="Share summary on WhatsApp (Free)"
              className="p-1.5 sm:p-2 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-800/80 transition-colors cursor-pointer active:scale-95 shadow-2xs"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Direct SMS */}
            <button
              onClick={handleShareSMS}
              title="Send via Phone SMS Messenger (Free)"
              className="p-1.5 sm:p-2 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800/80 transition-colors cursor-pointer active:scale-95 shadow-2xs"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Direct Email */}
            <button
              onClick={handleShareEmail}
              title="Send via Default Email App / Gmail (Free)"
              className="p-1.5 sm:p-2 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer active:scale-95 shadow-2xs"
            >
              <Mail className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer active:scale-95 shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {pdfStatusMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-200 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="font-medium">{pdfStatusMessage}</span>
            </div>
            <button
              onClick={() => setPdfStatusMessage(null)}
              className="text-blue-500 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Invoice Printable Sheet */}
        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 print:p-0">
          {/* Company & Bill Metadata */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 sm:pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-7 h-7 text-white flex items-center justify-center font-bold text-xs rounded-md shadow-xs shrink-0"
                  style={{ backgroundColor: activeConfig.brandColor || '#2563eb' }}
                >
                  {activeConfig.brandShort || 'RF'}
                </div>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {activeConfig.businessName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{activeConfig.tagline}</p>
              {activeConfig.taxNumber && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeConfig.taxLabel || 'Tax ID'}: {activeConfig.taxNumber}</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">{activeConfig.email} {activeConfig.phone ? `• ${activeConfig.phone}` : ''}</p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 block">Invoice ID</span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{bill.billNumber}</h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-1">
                <p><span className="text-slate-400 dark:text-slate-500">Date:</span> {bill.date}</p>
                {bill.dueDate && (
                  <div className="flex items-center sm:justify-end gap-1.5 flex-wrap">
                    <p><span className="text-slate-400 dark:text-slate-500">Due:</span> <span className="font-medium text-slate-700 dark:text-slate-200">{bill.dueDate}</span></p>
                    <button
                      onClick={handleExportIcs}
                      title="Add payment due date to your calendar (.ics)"
                      className="inline-flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-300 hover:text-blue-900 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                    >
                      <CalendarPlus className="w-3 h-3" />
                      <span>.ics Cal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="bg-slate-50 dark:bg-slate-850 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Billed To</p>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{bill.customerName}</h4>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-slate-600 dark:text-slate-300 mt-1.5">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" /> {bill.phoneNumber}
              </span>
              {activeConfig.cityStateZip && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" /> {activeConfig.cityStateZip}
                </span>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto -mx-1 sm:mx-0 touch-scroll">
            <table className="w-full text-left text-xs min-w-[300px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <th className="py-2.5 pr-4">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 pl-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bill.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">{item.name}</td>
                    <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                      {bill.currency}{item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pl-4 text-right font-bold text-slate-900 dark:text-white">
                      {bill.currency}{(item.quantity * item.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="dark:text-slate-200">{bill.currency}{bill.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            {bill.type === 'gst' && (
              <>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>CGST (9%)</span>
                  <span>{bill.currency}{(bill.taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>SGST (9%)</span>
                  <span>{bill.currency}{(bill.taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            {bill.type === 'raw' && (
              <div className="flex justify-between text-slate-400 dark:text-slate-500 italic">
                <span>Non-GST (0%)</span>
                <span>{bill.currency}0.00</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
              <span className="font-editorial text-2xl font-bold">Total Due</span>
              <span className="font-editorial text-3xl font-bold text-blue-600 dark:text-blue-400">
                {bill.currency}{bill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Dynamic QR Code Placeholder based on Bill Total and Business Name */}
          <DynamicQrCode
            businessName={activeConfig.businessName || activeConfig.accountName || 'Merchant Business'}
            total={bill.total}
            currency={bill.currency}
            billNumber={bill.billNumber}
            upiId={activeConfig.upiOrPaypal}
            isPaid={bill.status === 'paid'}
            paymentMode={bill.paymentMode}
          />

          {/* Payment Instructions & Bank Details */}
          {(activeConfig.bankName || activeConfig.upiOrPaypal || activeConfig.footerNote) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Payment Instructions</p>
                {activeConfig.bankName && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Bank:</span> {activeConfig.bankName}
                  </p>
                )}
                {activeConfig.accountNumber && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium text-slate-500 dark:text-slate-400">A/C:</span> {activeConfig.accountNumber}
                  </p>
                )}
                {activeConfig.routingOrIfsc && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Code / Routing:</span> {activeConfig.routingOrIfsc}
                  </p>
                )}
                {activeConfig.upiOrPaypal && (
                  <p className="text-slate-700 dark:text-slate-300 font-mono-tag text-[11px]">
                    <span className="font-medium text-slate-500 dark:text-slate-400 font-sans">Payment ID:</span> {activeConfig.upiOrPaypal}
                  </p>
                )}
                {activeConfig.paymentNote && (
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                    {activeConfig.paymentNote}
                  </p>
                )}
              </div>
              <div>
                <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Notes & Terms</p>
                <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed text-[11px]">
                  {activeConfig.footerNote || 'Payment due according to invoice terms. Thank you for your business!'}
                </p>
                {activeConfig.termsAndConditions && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    {activeConfig.termsAndConditions}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mode of Payment & Settlement Record */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Settlement & Payment Method
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <PaymentModeBadge mode={bill.paymentMode || 'UPI/QR'} size="md" />
                  {bill.paymentReference && (
                    <span className="text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md font-mono">
                      Ref: {bill.paymentReference}
                    </span>
                  )}
                </div>
              </div>

              {onUpdatePaymentMode && (
                <button
                  type="button"
                  onClick={() => setIsEditingPaymentMode(!isEditingPaymentMode)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline self-start sm:self-auto cursor-pointer"
                >
                  {isEditingPaymentMode ? 'Close Edit' : 'Edit Mode / Ref'}
                </button>
              )}
            </div>

            {/* Inline Payment Mode Editor */}
            {isEditingPaymentMode && onUpdatePaymentMode && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
                <PaymentModeSelector
                  selectedMode={editMode}
                  onChange={setEditMode}
                  referenceValue={editRef}
                  onReferenceChange={setEditRef}
                  compact={true}
                  referencePlaceholder="e.g. UPI Ref / Cheque No / Card Last 4"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingPaymentMode(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdatePaymentMode(bill.id, editMode, editRef.trim() || undefined);
                      setIsEditingPaymentMode(false);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Save Settlement Mode
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Channels */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">Instant Dispatch:</span>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                bill.delivery.whatsapp
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
              }`}
              title="Click to send invoice via WhatsApp (Free)"
            >
              <Share2 className="w-3 h-3" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={handleShareSMS}
              className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                bill.delivery.sms
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
              }`}
              title="Click to send invoice via default SMS App (Free)"
            >
              <MessageSquare className="w-3 h-3" />
              SMS
            </button>
            <button
              type="button"
              onClick={handleShareEmail}
              className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                bill.delivery.email
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
              }`}
              title="Click to send invoice via Email / Gmail (Free)"
            >
              <Mail className="w-3 h-3" />
              Email
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 rounded-b-2xl">
          {onToggleStatus && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleToggleStatus}
              className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                bill.status === 'paid'
                  ? 'border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-950/40 bg-white dark:bg-slate-800'
                  : 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
              }`}
            >
              {bill.status === 'paid' ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Mark as Pending</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Mark as Paid</span>
                </>
              )}
            </motion.button>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto flex-wrap">
            {/* Native / Direct PDF Share */}
            <button
              onClick={handleSharePdf}
              disabled={isPdfGenerating}
              title="Share PDF invoice directly to WhatsApp, Mail, AirDrop, etc."
              className="px-2.5 sm:px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Share PDF</span>
            </button>

            {/* PDF Preview in Tab */}
            <button
              onClick={handlePreviewPdf}
              title="Open PDF preview in new window"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Export Due Date .ics */}
            <button
              onClick={handleExportIcs}
              className="px-2.5 sm:px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              {isIcsDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">.ics Exported</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Due Date (.ics)</span>
                </>
              )}
            </button>

            {/* Primary Download PDF Action */}
            <button
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
            >
              {isPdfGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

