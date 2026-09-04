import React, { useState } from 'react';
import {
  FileText,
  Building,
  Plus,
  Trash2,
  Sparkles,
  Share2,
  FileDown,
  CheckCircle2,
  Phone,
  User,
  ArrowRight,
  Calendar,
  CalendarPlus,
  CalendarCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Bill, InvoiceItem, BusinessConfig, PaymentMode } from '../types';
import { exportBillsPaymentDueDates, exportSingleBillDueDate } from '../utils/calendarExport';
import { downloadInvoicePdf } from '../utils/pdfInvoiceGenerator';
import { PaymentModeSelector } from './PaymentModeSelector';
import { PaymentModeBadge } from './PaymentModeBadge';
import { PAYMENT_MODES } from '../utils/paymentModes';

interface BillingViewProps {
  initialType?: 'raw' | 'gst';
  currency: string;
  bills: Bill[];
  onAddBill: (bill: Bill) => void;
  onOpenInvoiceModal: (bill: Bill) => void;
  config?: BusinessConfig;
}

export const BillingView: React.FC<BillingViewProps> = ({
  initialType = 'raw',
  currency,
  bills,
  onAddBill,
  onOpenInvoiceModal,
  config
}) => {
  const [billingType, setBillingType] = useState<'raw' | 'gst'>(initialType);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(config?.phone ? config.phone.slice(0, 4) : '+1 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');

  // Line Items state
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', name: 'Cloud Infrastructure Retainer', quantity: 1, rate: 1500.0 },
    { id: '2', name: 'Database Maintenance & Tuning', quantity: 2, rate: 450.0 }
  ]);

  // Delivery options state
  const [delivery, setDelivery] = useState({
    sms: false,
    whatsapp: true,
    email: true
  });

  // Mode of payment and settlement state
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI/QR');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('all');

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAllBills, setShowAllBills] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);
  const [calendarExportNotice, setCalendarExportNotice] = useState<string | null>(null);

  // Export payment due dates to .ics calendar format
  const handleExportDueDatesIcs = (onlyPending = false) => {
    const targetBills = onlyPending
      ? bills.filter((b) => b.status !== 'paid')
      : bills;

    if (targetBills.length === 0) {
      alert(onlyPending ? 'No pending or unpaid invoices found.' : 'No invoices available to export.');
      return;
    }

    const { count, filename } = exportBillsPaymentDueDates(
      targetBills,
      onlyPending ? 'RevenueFlow_Pending_Due_Dates' : 'RevenueFlow_All_Due_Dates'
    );

    setCalendarExportNotice(`Exported ${count} payment due date(s) to ${filename}`);
    setTimeout(() => setCalendarExportNotice(null), 3500);
  };

  // Export transaction ledger to CSV
  const handleExportTransactions = () => {
    if (bills.length === 0) {
      alert('No transactions available to export.');
      return;
    }

    const headers = [
      'Bill Number',
      'Customer Name',
      'Phone Number',
      'Billing Type',
      'Date',
      'Due Date',
      'Status',
      'Payment Mode',
      'Payment Reference',
      'Currency',
      'Subtotal',
      'Tax Rate (%)',
      'Tax Amount',
      'Total Due',
      'Items Count',
      'Item Summary'
    ];

    const escapeCsv = (str: string | number | undefined | null) => {
      if (str === undefined || str === null) return '""';
      const stringValue = String(str);
      const escaped = stringValue.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = bills.map((b) => {
      const itemSummary = b.items
        .map((i) => `${i.name} (Qty: ${i.quantity}, Rate: ${i.rate})`)
        .join('; ');

      return [
        escapeCsv(b.billNumber),
        escapeCsv(b.customerName),
        escapeCsv(b.phoneNumber),
        escapeCsv(b.type.toUpperCase()),
        escapeCsv(b.date),
        escapeCsv(b.dueDate || ''),
        escapeCsv(b.status.toUpperCase()),
        escapeCsv(b.paymentMode ? b.paymentMode.toUpperCase() : 'N/A'),
        escapeCsv(b.paymentReference || ''),
        escapeCsv(b.currency),
        escapeCsv(b.subtotal.toFixed(2)),
        escapeCsv(b.taxRate),
        escapeCsv(b.taxAmount.toFixed(2)),
        escapeCsv(b.total.toFixed(2)),
        escapeCsv(b.items.length),
        escapeCsv(itemSummary)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `RevenueFlow_Transactions_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  // Line item handlers
  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]:
              field === 'quantity' || field === 'rate'
                ? isNaN(Number(value))
                  ? 0
                  : Number(value)
                : value
          };
        }
        return item;
      })
    );
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      rate: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  const taxRate = billingType === 'gst' ? (config?.defaultTaxRate ?? 18) : 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalDue = subtotal + taxAmount;

  // Generate Bill handler
  const handleGenerateBill = () => {
    if (!customerName.trim()) {
      alert('Please enter a customer name.');
      return;
    }

    const validItems = items.filter((i) => i.name.trim() && i.quantity > 0);
    if (validItems.length === 0) {
      alert('Please include at least one valid line item with quantity > 0.');
      return;
    }

    setIsGenerating(true);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    const prefix = billingType === 'gst' ? (config?.invoicePrefix || 'INV') : 'EST';
    const billNumber = `${prefix}-${new Date().getFullYear()}-${randomNum}`;
    const dueDays = config?.paymentDueDays ?? 14;

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      billNumber,
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      type: billingType,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + dueDays * 86400000).toISOString().split('T')[0],
      items: validItems,
      subtotal,
      taxRate,
      taxAmount,
      total: totalDue,
      currency,
      delivery,
      status: paymentStatus,
      paymentMode,
      paymentReference: paymentReference.trim() || undefined
    };

    setTimeout(() => {
      onAddBill(newBill);
      setIsGenerating(false);

      // Open printable modal
      onOpenInvoiceModal(newBill);

      // Reset form
      setCustomerName('');
      setPhoneNumber('+91 ');
      setPaymentStatus('pending');
      setPaymentMode('UPI/QR');
      setPaymentReference('');
      setItems([
        { id: '1', name: 'Premium Consulting Services', quantity: 1, rate: 1500.0 },
        { id: '2', name: 'Item description', quantity: 0, rate: 0.0 }
      ]);
    }, 600);
  };

  const filteredBills = bills.filter((b) => {
    if (paymentModeFilter === 'all') return true;
    if (paymentModeFilter === 'UPI/QR' || paymentModeFilter === 'upi') {
      return b.paymentMode === 'UPI/QR' || b.paymentMode === 'upi';
    }
    return b.paymentMode === paymentModeFilter;
  });

  const displayedBills = showAllBills ? filteredBills : filteredBills.slice(0, 4);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block mb-1">
            Dispatch Terminal
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Create New Invoice
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure line items, customer credentials, and dispatch preferences.
          </p>
        </div>

        <button
          onClick={handleExportTransactions}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          title="Export transaction history to CSV format"
        >
          <FileDown className="w-4 h-4 text-blue-600" />
          Export Ledger ({bills.length})
        </button>
      </div>

      {/* Export Confirmation Toast */}
      {exportNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center justify-between animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Transaction history exported successfully to CSV format ({bills.length} records)!</span>
          </div>
          <span className="text-[10px] text-emerald-600 uppercase tracking-wider font-bold">CSV READY</span>
        </div>
      )}

      {/* Billing Type Selection */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Select Invoice Protocol
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: Raw / Non-GST Bill */}
          <div
            onClick={() => setBillingType('raw')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
              billingType === 'raw'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 ${
                billingType === 'raw' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900">
                  Standard Estimate (Raw)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Basic commercial memo without statutory tax calculations.
                </p>
              </div>
            </div>

            <div className="mt-1">
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  billingType === 'raw'
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-slate-300'
                }`}
              >
                {billingType === 'raw' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </div>
          </div>

          {/* Option 2: GST / Tax Invoice */}
          <div
            onClick={() => setBillingType('gst')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
              billingType === 'gst'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 ${
                billingType === 'gst' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900">
                  {config?.taxLabel || 'Tax Invoice (GST)'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {config?.taxSystem === 'vat'
                    ? `Formal VAT invoice with statutory standard rate (${config?.defaultTaxRate ?? 20}%).`
                    : config?.taxSystem === 'sales_tax'
                    ? `Formal commercial invoice with applicable sales tax (${config?.defaultTaxRate ?? 8.25}%).`
                    : `Statutory tax invoice with ${config?.taxLabel || 'GST'} breakdown (${config?.defaultTaxRate ?? 18}%).`}
                </p>
              </div>
            </div>

            <div className="mt-1">
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  billingType === 'gst'
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-slate-300'
                }`}
              >
                {billingType === 'gst' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Client Information
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Customer Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Dynamics Ltd"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {billingType === 'gst' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                placeholder="27ABCDE1234F1Z5"
                value={customerGSTIN}
                onChange={(e) => setCustomerGSTIN(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="billing@customer.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Line Items
          </span>
          <button
            onClick={addItem}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-lg flex items-center gap-1.5 px-3 py-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const lineTotal = item.quantity * item.rate;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 hover:border-slate-300 transition-colors"
              >
                {/* Item description */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Item or service description"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 bg-white rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* QTY & RATE */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      QTY
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      RATE ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Line total display */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">Item Total</span>
                  <span className="font-bold text-slate-900">
                    {currency}{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mode of Payment & Settlement Status */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Settlement Protocol
            </span>
            <h4 className="font-editorial text-lg font-bold text-slate-900">
              Mode of Payment & Settlement
            </h4>
          </div>

          {/* Status selection toggle: Pending vs Paid */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setPaymentStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                paymentStatus === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⏳ Pending Payment
            </button>
            <button
              type="button"
              onClick={() => setPaymentStatus('paid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                paymentStatus === 'paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✓ Paid Immediately
            </button>
          </div>
        </div>

        <PaymentModeSelector
          selectedMode={paymentMode}
          onChange={setPaymentMode}
          referenceValue={paymentReference}
          onReferenceChange={setPaymentReference}
          referencePlaceholder={
            paymentMode === 'UPI/QR' || paymentMode === 'upi'
              ? 'e.g. UPI Ref / UTR # / GPay Transaction ID'
              : paymentMode === 'cheque'
              ? 'e.g. Cheque No. & Issuing Bank'
              : paymentMode === 'card'
              ? 'e.g. Card Last 4 Digits / POS Receipt #'
              : paymentMode === 'net_banking' || paymentMode === 'bank_transfer'
              ? 'e.g. NEFT / RTGS / IMPS Reference #'
              : 'e.g. Cash Receipt # or Slip ID'
          }
        />
      </div>

      {/* Delivery Options */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Dispatch Channels
        </span>

        <div className="flex flex-wrap gap-4 sm:gap-6 text-xs text-slate-700">
          {/* SMS */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={delivery.sms}
              onChange={(e) => setDelivery({ ...delivery, sms: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
            />
            <span>SMS Notification</span>
          </label>

          {/* WhatsApp */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={delivery.whatsapp}
              onChange={(e) => setDelivery({ ...delivery, whatsapp: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
            />
            <span className="font-semibold text-slate-900">WhatsApp (PDF Attachment)</span>
          </label>

          {/* Email */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={delivery.email}
              onChange={(e) => setDelivery({ ...delivery, email: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
            />
            <span>Email Dispatch</span>
          </label>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Financial Ledger Summary
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            Live Calculation
          </span>
        </div>

        <div className="flex justify-between text-xs text-slate-600">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900">
            {currency}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between text-xs text-slate-600">
          <span>Tax ({taxRate}%)</span>
          <span className="font-medium text-slate-900">
            {currency}{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between items-baseline pt-4 border-t border-slate-200">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              Total Due
            </span>
            <span className="text-[11px] text-slate-400">Net Payable Amount</span>
          </div>
          <span className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {currency}{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Button: GENERATE BILL */}
      <button
        onClick={handleGenerateBill}
        disabled={isGenerating}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin" /> Generating Invoice...
          </span>
        ) : (
          <>
            Generate & Issue Invoice <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Recent Bills / Transaction History */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Transaction History
            </span>
            <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Recent Transactions
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleExportDueDatesIcs(false)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export all invoice payment due dates as an .ics file for your calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Export Due Dates (.ics)
            </button>
            <button
              onClick={handleExportTransactions}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download transaction history as CSV"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              Export CSV
            </button>
            <button
              onClick={() => setShowAllBills(!showAllBills)}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              {showAllBills ? 'Show Less' : `View All (${bills.length})`}
            </button>
          </div>
        </div>

        {/* Payment Mode Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs -mx-1 px-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">Filter:</span>
          <button
            type="button"
            onClick={() => setPaymentModeFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
              paymentModeFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All ({bills.length})
          </button>
          {PAYMENT_MODES.map((pm) => {
            const count = bills.filter((b) =>
              pm.id === 'UPI/QR'
                ? b.paymentMode === 'UPI/QR' || b.paymentMode === 'upi'
                : b.paymentMode === pm.id
            ).length;
            if (count === 0 && paymentModeFilter !== pm.id) return null;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentModeFilter(pm.id)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  paymentModeFilter === pm.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{pm.shortLabel}</span>
                <span className={`text-[10px] px-1 rounded ${paymentModeFilter === pm.id ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notice Banners */}
        {calendarExportNotice && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-800 flex items-center gap-2 animate-in fade-in">
            <CalendarCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{calendarExportNotice} — open in Apple Calendar, Google Calendar, or Outlook to sync.</span>
          </div>
        )}

        {exportNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Transaction CSV exported successfully!</span>
          </div>
        )}

        {bills.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
            No transaction records found in ledger.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedBills.map((bill) => (
              <div
                key={bill.id}
                onClick={() => onOpenInvoiceModal(bill)}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2.5 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-xs text-blue-600 group-hover:underline">
                      {bill.billNumber}
                    </p>
                    {bill.dueDate && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        Due {bill.dueDate}
                      </span>
                    )}
                    {bill.paymentMode && (
                      <PaymentModeBadge mode={bill.paymentMode} size="sm" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900 mt-0.5 truncate">
                    {bill.customerName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {bill.date} • {bill.type === 'gst' ? 'GST Tax Invoice' : 'Standard Estimate'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const filename = downloadInvoicePdf(bill);
                      setExportNotice(true);
                      setTimeout(() => setExportNotice(false), 3000);
                    }}
                    title="Download PDF invoice"
                    className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportSingleBillDueDate(bill);
                      setCalendarExportNotice(`Exported due date for ${bill.billNumber} (${bill.dueDate || bill.date}) to .ics file.`);
                      setTimeout(() => setCalendarExportNotice(null), 3500);
                    }}
                    title={`Export due date (${bill.dueDate || bill.date}) as .ics file`}
                    className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-200 transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </button>

                  <div className="text-right flex flex-col items-end shrink-0">
                    <p className="font-bold text-sm text-slate-900">
                      {bill.currency}{bill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span
                      className={`inline-block text-[10px] tracking-wide font-semibold px-2 py-0.5 mt-1 rounded-md uppercase ${
                        bill.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {bill.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
