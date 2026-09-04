import React from 'react';
import {
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  ArrowLeftRight,
  FileCheck2,
  Wallet
} from 'lucide-react';
import { PaymentMode } from '../types';

export interface PaymentModeConfig {
  id: PaymentMode;
  label: string;
  shortLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconBg: string;
  iconText: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PAYMENT_MODES: PaymentModeConfig[] = [
  {
    id: 'UPI/QR',
    label: 'UPI / QR Code',
    shortLabel: 'UPI / QR',
    description: 'Dynamic UPI QR, GPay, PhonePe, Paytm, BHIM',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-200 dark:border-indigo-800/80',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    icon: QrCode
  },
  {
    id: 'cash',
    label: 'Cash In Hand',
    shortLabel: 'Cash',
    description: 'Physical cash received or paid',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800/80',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    icon: Banknote
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    shortLabel: 'Card',
    description: 'POS swipe, tap, or online gateway',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-800/80',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconText: 'text-blue-600 dark:text-blue-400',
    icon: CreditCard
  },
  {
    id: 'net_banking',
    label: 'Net Banking / NEFT / RTGS',
    shortLabel: 'Net Banking',
    description: 'Direct internet banking transfer',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200 dark:border-purple-800/80',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconText: 'text-purple-600 dark:text-purple-400',
    icon: Building2
  },
  {
    id: 'bank_transfer',
    label: 'Bank Wire / IMPS',
    shortLabel: 'Transfer',
    description: 'Direct bank account credit',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800/80',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/50',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    icon: ArrowLeftRight
  },
  {
    id: 'cheque',
    label: 'Cheque / Demand Draft',
    shortLabel: 'Cheque',
    description: 'Bank cheque or demand draft',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800/80',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconText: 'text-amber-600 dark:text-amber-400',
    icon: FileCheck2
  },
  {
    id: 'other',
    label: 'Other / Custom',
    shortLabel: 'Other',
    description: 'Custom digital wallet or voucher',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200 dark:border-slate-700',
    iconBg: 'bg-slate-200 dark:bg-slate-700',
    iconText: 'text-slate-700 dark:text-slate-300',
    icon: Wallet
  }
];

export function getPaymentModeConfig(mode?: string | null): PaymentModeConfig {
  if (!mode) return PAYMENT_MODES[0];
  const normalized = mode.trim().toLowerCase();
  if (normalized === 'upi' || normalized === 'upi/qr' || normalized === 'qr') {
    return PAYMENT_MODES[0];
  }
  const found = PAYMENT_MODES.find(
    (m) => m.id.toLowerCase() === normalized || m.shortLabel.toLowerCase() === normalized
  );
  return found || PAYMENT_MODES[0];
}

export function formatPaymentMode(mode?: string | null): string {
  if (!mode) return 'UPI / QR';
  const cfg = getPaymentModeConfig(mode);
  return cfg.shortLabel;
}
