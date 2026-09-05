import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { PaymentMode } from '../types';

interface DynamicQrCodeProps {
  businessName: string;
  total: number;
  currency: string;
  billNumber: string;
  upiId?: string;
  isPaid?: boolean;
  paymentMode?: PaymentMode | string;
  className?: string;
}

export const DynamicQrCode: React.FC<DynamicQrCodeProps> = ({
  businessName,
  total,
  currency,
  billNumber,
  upiId,
  isPaid = false,
  paymentMode = 'UPI/QR',
  className = ''
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  // Normalize user business name and UPI handle
  const cleanBusinessName = businessName?.trim() || 'Merchant Business';
  const cleanUpiId =
    upiId?.trim() ||
    `${cleanBusinessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'billing'}@upi`;

  const formattedAmount = total.toFixed(2);

  // Construct NPCI standard UPI Payment URI
  // Format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR&tn=<NOTE>
  const upiPayload = `upi://pay?pa=${encodeURIComponent(cleanUpiId)}&pn=${encodeURIComponent(
    cleanBusinessName
  )}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`Invoice ${billNumber}`)}`;

  useEffect(() => {
    let isCurrent = true;
    setIsGenerating(true);

    QRCode.toDataURL(upiPayload, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a', // deep slate
        light: '#ffffff'
      }
    })
      .then((url: string) => {
        if (isCurrent) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err: unknown) => {
        console.warn('Failed to generate dynamic QR code:', err);
        if (isCurrent) {
          setIsGenerating(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [upiPayload]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiPayload);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      className={`bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-100/90 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-5 rounded-2xl border border-blue-100/80 dark:border-slate-800 shadow-xs relative overflow-hidden text-slate-900 dark:text-slate-100 ${className}`}
    >
      {/* Decorative ambient background glow */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-blue-200/30 dark:bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Instant Pay QR</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                Dynamic
              </span>
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Scan via any UPI / Banking app</p>
          </div>
        </div>

        {/* Amount badge */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
            Encoded Total
          </span>
          <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
            {currency}
            {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Main Inner Container */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/90 dark:bg-slate-950/90 p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs backdrop-blur-xs">
        {/* QR Code Canvas Frame (Always crisp white background for camera scanning) */}
        <div className="relative shrink-0 flex items-center justify-center bg-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group">
          {isGenerating || !qrDataUrl ? (
            <div className="w-36 h-36 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg animate-pulse text-slate-400 gap-1.5">
              <QrCode className="w-8 h-8 opacity-40 animate-spin" />
              <span className="text-[10px] font-medium">Generating QR...</span>
            </div>
          ) : (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <img
                src={qrDataUrl}
                alt={`Dynamic payment QR code for ${cleanBusinessName} - ${currency}${formattedAmount}`}
                className="w-full h-full object-contain rounded-md"
              />

              {/* Center subtle brand pip */}
              <div className="absolute inset-0 m-auto w-7 h-7 rounded-md bg-white border border-slate-200 shadow-xs flex items-center justify-center pointer-events-none">
                <span className="text-[9px] font-black text-blue-600">UPI</span>
              </div>

              {/* Settled overlay if invoice is paid */}
              {isPaid && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-[1px] rounded-md flex flex-col items-center justify-center text-white p-1 text-center animate-in fade-in duration-200">
                  <CheckCircle2 className="w-7 h-7 text-emerald-300 mb-0.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Paid
                  </span>
                  <span className="text-[9px] text-emerald-100 font-medium">
                    Invoice Settled
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meta details & UPI String */}
        <div className="flex-1 min-w-0 space-y-2.5 text-left w-full sm:w-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
              Payee Name
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate" title={cleanBusinessName}>
              {cleanBusinessName}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
              VPA / Payment ID
            </span>
            <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 truncate" title={cleanUpiId}>
              {cleanUpiId}
            </p>
          </div>

          <div className="pt-0.5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1.5">
              Supports GPay, PhonePe, Paytm, BHIM, Cred, and all UPI mobile banking apps.
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
                title="Copy UPI string"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Copy UPI Link</span>
                  </>
                )}
              </button>

              <a
                href={upiPayload}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 transition-colors sm:hidden"
              >
                <span>Open UPI App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer metadata */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800 pt-2.5">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Secured Direct Merchant Transfer</span>
        </div>
        <span className="text-slate-500 dark:text-slate-400 font-mono">Invoice #{billNumber}</span>
      </div>
    </div>
  );
};
