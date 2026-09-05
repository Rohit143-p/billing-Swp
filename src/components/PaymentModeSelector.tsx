import React from 'react';
import { PAYMENT_MODES, getPaymentModeConfig } from '../utils/paymentModes';
import { PaymentMode } from '../types';

interface PaymentModeSelectorProps {
  selectedMode: PaymentMode;
  onChange: (mode: PaymentMode) => void;
  referenceValue?: string;
  onReferenceChange?: (ref: string) => void;
  showReferenceInput?: boolean;
  referencePlaceholder?: string;
  compact?: boolean;
}

export const PaymentModeSelector: React.FC<PaymentModeSelectorProps> = ({
  selectedMode,
  onChange,
  referenceValue = '',
  onReferenceChange,
  showReferenceInput = true,
  referencePlaceholder = 'e.g. UTR / Txn ID / Cheque #',
  compact = false
}) => {
  const activeConfig = getPaymentModeConfig(selectedMode);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Mode of Payment *
        </label>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Selected: <strong className="text-slate-800 dark:text-slate-100">{activeConfig.label}</strong>
        </span>
      </div>

      {/* Grid of payment mode options */}
      <div className={`grid ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'} gap-2`}>
        {PAYMENT_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                isSelected
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' : `${mode.iconBg} ${mode.iconText}`
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-900 dark:text-slate-100'}`}>
                  {mode.shortLabel}
                </p>
                <p className={`text-[10px] truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-400 dark:text-slate-400'}`}>
                  {mode.id === 'UPI/QR' || mode.id === 'upi' ? 'QR / Instant' : mode.id === 'cash' ? 'Paper currency' : mode.id === 'card' ? 'Visa / MC' : mode.id === 'net_banking' ? 'NEFT / RTGS' : mode.id === 'bank_transfer' ? 'Wire / ACH' : mode.id === 'cheque' ? 'Bank cheque' : 'Digital wallet'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional reference / transaction ID */}
      {showReferenceInput && onReferenceChange && (
        <div className="pt-1">
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Payment Reference / Transaction ID (Optional)
          </label>
          <input
            type="text"
            placeholder={referencePlaceholder}
            value={referenceValue}
            onChange={(e) => onReferenceChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 transition-colors"
          />
        </div>
      )}
    </div>
  );
};
