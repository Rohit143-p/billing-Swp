import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Expense, PaymentMode } from '../types';
import { PaymentModeSelector } from './PaymentModeSelector';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  currency: string;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  currency
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cloud Infrastructure');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [note, setNote] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('card');
  const [paymentReference, setPaymentReference] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    onAddExpense({
      title: title.trim(),
      category: category.trim(),
      amount: numAmount,
      date: new Date().toISOString().split('T')[0],
      vendor: vendor.trim() || undefined,
      note: note.trim() || undefined,
      paymentMode,
      paymentReference: paymentReference.trim() || undefined
    });

    setTitle('');
    setAmount('');
    setVendor('');
    setNote('');
    setPaymentMode('card');
    setPaymentReference('');
    onClose();
  };

  const categories = [
    'Cloud Infrastructure',
    'Contractors',
    'Marketing Spend',
    'Office Lease',
    'Hardware & Inventory',
    'Software Licenses',
    'Travel & Operations'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 block">
              Capital Outflow Entry
            </span>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              Record New Expense
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-sm overflow-y-auto touch-scroll">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Expense Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Server Bandwidth"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Amount ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Vendor / Recipient
            </label>
            <input
              type="text"
              placeholder="e.g. Amazon Web Services Inc"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="pt-1 pb-1">
            <PaymentModeSelector
              selectedMode={paymentMode}
              onChange={setPaymentMode}
              referenceValue={paymentReference}
              onReferenceChange={setPaymentReference}
              compact={true}
              referencePlaceholder="e.g. Card last 4 / Txn ID / Check #"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Internal Note
            </label>
            <textarea
              rows={2}
              placeholder="Optional billing remarks..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
