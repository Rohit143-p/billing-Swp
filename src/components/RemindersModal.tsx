import React, { useState } from 'react';
import { X, Send, Bell, CheckCircle2, Calendar, CalendarCheck } from 'lucide-react';
import { Bill } from '../types';
import { exportBillsPaymentDueDates } from '../utils/calendarExport';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  bills: Bill[];
  onTriggerNotification: (title: string, desc: string) => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  onClose,
  bills,
  onTriggerNotification
}) => {
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>(
    bills.filter(b => b.status !== 'paid').map(b => b.id)
  );
  const [channel, setChannel] = useState<'both' | 'whatsapp' | 'email'>('both');
  const [isSent, setIsSent] = useState(false);
  const [icsExportedNotice, setIcsExportedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const pendingBills = bills.filter(b => b.status !== 'paid');

  const toggleSelect = (id: string) => {
    setSelectedBillIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportIcs = () => {
    const selectedBills = bills.filter(b => selectedBillIds.includes(b.id));
    if (selectedBills.length === 0) return;

    const { count, filename } = exportBillsPaymentDueDates(
      selectedBills,
      'RevenueFlow_Reminders_Due_Dates'
    );
    setIcsExportedNotice(`Exported ${count} payment due date(s) to ${filename}`);
    onTriggerNotification(
      'Calendar .ics Exported',
      `${count} invoice payment due date(s) downloaded for calendar import.`
    );
    setTimeout(() => setIcsExportedNotice(null), 3500);
  };

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => {
      onTriggerNotification(
        'Reminders Dispatched',
        `Automated payment notices sent to ${selectedBillIds.length} recipient(s) via ${channel.toUpperCase()}.`
      );
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
                Notification Terminal
              </span>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                Dispatch Reminders
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="p-6 sm:p-8 text-center space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-editorial text-2xl font-bold text-slate-900">Reminders Dispatched!</h4>
            <p className="text-xs text-slate-500">
              Payment notices were delivered directly to the selected clients.
            </p>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-4 text-sm overflow-y-auto touch-scroll">
            {icsExportedNotice && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-800 flex items-center gap-2 animate-in fade-in">
                <CalendarCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{icsExportedNotice}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Invoices ({selectedBillIds.length})
                </label>
                <button
                  type="button"
                  disabled={selectedBillIds.length === 0}
                  onClick={handleExportIcs}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Export selected payment due dates as .ics file for calendar sync"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Export .ics</span>
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50 p-1">
                {pendingBills.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center">No pending or overdue invoices.</p>
                ) : (
                  pendingBills.map((b) => (
                    <label
                      key={b.id}
                      className="flex items-center justify-between p-2.5 hover:bg-white rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedBillIds.includes(b.id)}
                          onChange={() => toggleSelect(b.id)}
                          className="accent-blue-600 w-4 h-4 rounded"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{b.customerName}</p>
                          <p className="text-[11px] text-slate-500">{b.billNumber} • Due: {b.dueDate || 'Immediate'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {b.currency}{b.total.toLocaleString()}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Delivery Channel */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Delivery Channel
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setChannel('both')}
                  className={`py-2 px-2 border rounded-lg text-center text-xs font-semibold transition-all cursor-pointer ${
                    channel === 'both'
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  WhatsApp & Mail
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`py-2 px-2 border rounded-lg text-center text-xs font-semibold transition-all cursor-pointer ${
                    channel === 'whatsapp'
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  WhatsApp Only
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`py-2 px-2 border rounded-lg text-center text-xs font-semibold transition-all cursor-pointer ${
                    channel === 'email'
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  Email Only
                </button>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-2.5">
              <button
                type="button"
                disabled={selectedBillIds.length === 0}
                onClick={handleExportIcs}
                className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 border border-indigo-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                title="Export payment due dates as .ics file for external calendar tracking"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Export .ics Calendar</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedBillIds.length === 0}
                  onClick={handleSend}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Now ({selectedBillIds.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
