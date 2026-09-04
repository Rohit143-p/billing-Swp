import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Receipt,
  BellRing,
  AlertTriangle,
  Server,
  Database,
  Headphones,
  Banknote,
  ArrowUpRight,
  Calendar,
  CalendarCheck
} from 'lucide-react';
import { Bill, ProductPerformance } from '../types';
import { exportBillsPaymentDueDates } from '../utils/calendarExport';

interface DashboardViewProps {
  onNavigateToBilling: (type: 'raw' | 'gst') => void;
  onOpenReminders: () => void;
  onOpenAllProducts: () => void;
  onOpenAutomateModal: () => void;
  currency: string;
  bills: Bill[];
  products: ProductPerformance[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToBilling,
  onOpenReminders,
  onOpenAllProducts,
  onOpenAutomateModal,
  currency,
  bills,
  products
}) => {
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);

  // Dynamic calculations from bills
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter((b) => b.date === todayStr);
  const todayRevenue = todayBills.reduce(
    (acc, b) => acc + (b.status === 'paid' ? b.total : 0),
    0
  );

  // Overdue & pending bills
  const overdueBills = bills.filter((b) => b.status === 'overdue' || b.status === 'pending');
  const overdueCount = overdueBills.length;
  const overdueTotal = overdueBills.reduce((acc, b) => acc + b.total, 0);

  // Total collected revenue / MTD
  const totalPaidRevenue = bills
    .filter((b) => b.status === 'paid')
    .reduce((acc, b) => acc + b.total, 0);

  // 7-day revenue trend from real user bills
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];
    const dayRev = bills
      .filter((b) => b.date === dateStr && b.status === 'paid')
      .reduce((sum, b) => sum + b.total, 0);
    return { day: dayLabel, dateStr, revenue: dayRev };
  });

  const [activeHoverDay, setActiveHoverDay] = useState<number | null>(6);
  const maxWeekRevenue = Math.max(...weekData.map((w) => w.revenue), 0);

  // SVG Chart points calculation
  const chartPoints = weekData.map((d, idx) => {
    const x = 30 + idx * 106.6;
    const y = maxWeekRevenue > 0 ? 140 - (d.revenue / maxWeekRevenue) * 110 : 140;
    return { ...d, x, y, idx };
  });

  const pathD = chartPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${chartPoints[chartPoints.length - 1].x},150 L ${chartPoints[0].x},150 Z`;

  const handleExportCalendarDueDates = () => {
    const targetBills = overdueBills.length > 0 ? overdueBills : bills;
    if (targetBills.length === 0) {
      alert('No invoice records found to export.');
      return;
    }

    const { count, filename } = exportBillsPaymentDueDates(
      targetBills,
      'RevenueFlow_Due_Dates'
    );
    setExportSuccessNotice(`Exported ${count} payment due date(s) to ${filename}`);
    setTimeout(() => setExportSuccessNotice(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-blue-600 block mb-1">
            Enterprise Overview
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time business performance, billing velocity, and receivables.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Today's Revenue */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            {currency}{todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            {todayBills.length} transaction(s) recorded today
          </div>
        </div>

        {/* Card 2: Total Outstanding */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Outstanding
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
              {currency}{overdueTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border ${
              overdueCount > 0 
                ? 'bg-rose-50 text-rose-700 border-rose-200/60' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {overdueCount} Invoice{overdueCount === 1 ? '' : 's'} Due
            </div>
            {bills.length > 0 && (
              <button
                type="button"
                onClick={handleExportCalendarDueDates}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                title="Export invoice payment due dates as .ics file for calendar sync"
              >
                <Calendar className="w-3 h-3" />
                Sync .ics
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Gross Collected Revenue */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Collected Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            {currency}{totalPaidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-semibold rounded-md border border-blue-200/60">
            <TrendingUp className="w-3.5 h-3.5" />
            {bills.filter((b) => b.status === 'paid').length} Paid / Settled
          </div>
        </div>
      </div>

      {/* Export Notice */}
      {exportSuccessNotice && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 flex items-center justify-between gap-3 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CalendarCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-medium">{exportSuccessNotice} — ready to import into Google Calendar, Apple Calendar, or Outlook.</span>
          </div>
          <button
            onClick={() => setExportSuccessNotice(null)}
            className="text-indigo-500 hover:text-indigo-800 text-xs font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick Actions
          </span>
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2.5 sm:gap-3">
          {/* New Bill (Raw) */}
          <button
            onClick={() => onNavigateToBilling('raw')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Estimate (Raw)</span>
          </button>

          {/* New Tax Invoice (GST) */}
          <button
            onClick={() => onNavigateToBilling('gst')}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 sm:px-5 py-2.5 text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Receipt className="w-4 h-4" />
            <span>New Tax Invoice (GST)</span>
          </button>

          {/* Send Reminders */}
          <button
            onClick={onOpenReminders}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 sm:px-5 py-2.5 text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <BellRing className="w-4 h-4 text-slate-500" />
            <span>Send Reminders {overdueCount > 0 && `(${overdueCount})`}</span>
          </button>

          {/* Export Calendar (.ics) */}
          <button
            onClick={handleExportCalendarDueDates}
            className="bg-white hover:bg-indigo-50/60 border border-indigo-200 text-indigo-700 px-4 sm:px-5 py-2.5 text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            title="Export payment due dates as an .ics calendar file for Apple Calendar, Google Calendar, or Outlook"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Export Due Dates (.ics)</span>
          </button>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Trajectory Analysis
            </span>
            <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Weekly Revenue Flow
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            7-Day Cycle
          </span>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="relative pt-6 pb-2">
          {/* Active tooltip on point */}
          {activeHoverDay !== null && (
            <div
              className="absolute -top-1 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg pointer-events-none transition-all z-20"
              style={{
                left: `${(activeHoverDay / (weekData.length - 1)) * 90 + 5}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {currency}{weekData[activeHoverDay].revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}

          <div className="h-44 w-full relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 700 160"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGradientLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid Lines */}
              <line x1="0" y1="20" x2="700" y2="20" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />
              <line x1="0" y1="70" x2="700" y2="70" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />
              <line x1="0" y1="120" x2="700" y2="120" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />
              <line x1="0" y1="150" x2="700" y2="150" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />

              {/* Gradient Area */}
              <path d={areaD} fill="url(#areaGradientLight)" />

              {/* Connecting Line */}
              <path
                d={pathD}
                fill="none"
                className="stroke-blue-600 dark:stroke-blue-400"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {chartPoints.map((pt) => {
                const isHovered = activeHoverDay === pt.idx;
                return (
                  <g
                    key={pt.day + pt.idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveHoverDay(pt.idx)}
                    onClick={() => setActiveHoverDay(pt.idx)}
                  >
                    {/* Invisible bigger hit target */}
                    <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />
                    {/* Outer halo when selected/hovered */}
                    {isHovered && (
                      <circle cx={pt.x} cy={pt.y} r="9" fill="#2563EB" fillOpacity="0.2" />
                    )}
                    {/* Dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5 : 3.5}
                      className={isHovered ? 'fill-blue-600 dark:fill-blue-400' : 'fill-white dark:fill-slate-900'}
                      stroke="#2563EB"
                      strokeWidth={2}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Days Labels */}
          <div className="flex justify-between items-center px-4 mt-3 text-xs font-medium text-slate-500">
            {weekData.map((d, i) => (
              <button
                key={d.day + i}
                onClick={() => setActiveHoverDay(i)}
                className={`transition-colors cursor-pointer ${
                  activeHoverDay === i ? 'text-blue-600 font-bold underline underline-offset-4' : 'hover:text-slate-900'
                }`}
              >
                {d.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Catalog Performance
            </span>
            <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Top Products & Services
            </h3>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-8 text-center px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-slate-800">No Product Sales Recorded Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Line items and services you add to your invoices will automatically be aggregated here with their revenue volume.
            </p>
            <button
              onClick={() => onNavigateToBilling('raw')}
              className="mt-3.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                onClick={onOpenAllProducts}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-3 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    {prod.iconName === 'api' && <Server className="w-4 h-4" />}
                    {prod.iconName === 'storage' && <Database className="w-4 h-4" />}
                    {prod.iconName === 'support' && <Headphones className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 leading-tight">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {prod.metricLabel}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-slate-900">
                    {currency}{prod.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <button
            onClick={onOpenAllProducts}
            className="w-full mt-4 py-2.5 text-center text-blue-600 font-semibold text-xs rounded-lg hover:bg-blue-50 border border-blue-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            View All Products <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Automate Billing Promo Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <span className="text-[11px] uppercase tracking-wider font-bold text-blue-200 block mb-1">
            Programmatic Billing
          </span>
          <h4 className="font-editorial text-2xl sm:text-3xl font-bold leading-tight mb-2">
            Automate Recurring Invoicing
          </h4>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed mb-5">
            Configure automated schedule runs, deliver invoices straight via WhatsApp & Email, and streamline accounts receivable.
          </p>

          <button
            onClick={onOpenAutomateModal}
            className="px-5 py-2.5 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            Setup Automation <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
