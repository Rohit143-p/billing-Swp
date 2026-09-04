import React, { useState } from 'react';
import { X, Sparkles, Check, ShieldCheck } from 'lucide-react';

interface AutomateBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const AutomateBillingModal: React.FC<AutomateBillingModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [schedule, setSchedule] = useState<'monthly' | 'weekly' | 'quarterly'>('monthly');
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onConfirm();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-slate-50 p-5 sm:p-6 border-b border-slate-200 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block mb-1">
            Automated Cycle
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900">
            Automate Billing
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch recurring invoices automatically on cycle date without manual intervention.
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-sm overflow-y-auto touch-scroll">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Billing Cadence
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['monthly', 'weekly', 'quarterly'] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setSchedule(cycle)}
                  className={`py-2 px-3 border capitalize text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    schedule === cycle
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSendWhatsApp}
                onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                className="accent-blue-600 w-4 h-4 rounded"
              />
              <span>Auto-dispatch PDF copy via WhatsApp directly to client</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoFollowUp}
                onChange={(e) => setAutoFollowUp(e.target.checked)}
                className="accent-blue-600 w-4 h-4 rounded"
              />
              <span>Send payment reminder 3 days prior to due date</span>
            </label>
          </div>

          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-900 leading-snug">
              Invoices are encrypted, hash-verified, and GST-compliant automatically.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-white" /> : null}
              {isSaved ? 'Enabled!' : 'Activate Automation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
