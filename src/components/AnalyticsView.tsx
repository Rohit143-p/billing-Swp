import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  Building2,
  Send,
  MoreVertical
} from 'lucide-react';

interface AnalyticsViewProps {
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ currency }) => {
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [activeMonthIdx, setActiveMonthIdx] = useState<number | null>(null);

  // Months data for the Revenue Trends chart
  const monthlyData = [
    { month: 'Jan', value: 720, height: 42 },
    { month: 'Feb', value: 790, height: 48 },
    { month: 'Mar', value: 760, height: 45 },
    { month: 'Apr', value: 920, height: 60 },
    { month: 'May', value: 890, height: 56 },
    { month: 'Jun', value: 1050, height: 75 },
    { month: 'Jul', value: 940, height: 64 },
    { month: 'Aug', value: 1180, height: 88 },
    { month: 'Sep', value: 1240, height: 95 }
  ];

  // Quarterly raw vs GST data
  const quarterlyData = [
    { quarter: 'Q1', raw: 42, gst: 52 },
    { quarter: 'Q2', raw: 56, gst: 68 },
    { quarter: 'Q3', raw: 32, gst: 40 },
    { quarter: 'Q4', raw: 80, gst: 92 }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block mb-1">
          Revenue Intelligence
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Financial Analytics
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Yield analysis, tax distribution, and payment settlement breakdown.
        </p>
      </div>

      {/* Time Period Filter Pills */}
      <div className="inline-flex max-w-full overflow-x-auto scrollbar-none touch-scroll bg-slate-100 p-1 rounded-xl border border-slate-200">
        {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setPeriod(item)}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              period === item
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Total Revenue Card */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Gross Run-Rate (ARR)
            </span>
            <div className="font-editorial text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              {currency}1.24M
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-semibold rounded-md">
                <TrendingUp className="w-3.5 h-3.5" />
                +14.5% MOM
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">vs prior period</span>
            </div>
          </div>

          <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Combined Bar Chart with Overlay Trend Line */}
        <div className="relative pt-8 pb-1">
          {/* Active tooltip on bar hover */}
          {activeMonthIdx !== null && (
            <div
              className="absolute top-0 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg border border-slate-700 pointer-events-none transition-all z-20"
              style={{
                left: `${(activeMonthIdx / (monthlyData.length - 1)) * 88 + 6}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {currency}{monthlyData[activeMonthIdx].value}k
            </div>
          )}

          <div className="h-48 w-full relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 630 170"
              preserveAspectRatio="none"
            >
              {/* Background Plate: light slate in light mode, deep slate in dark mode */}
              <rect x="0" y="0" width="630" height="150" className="fill-slate-50 dark:fill-slate-800/50" rx="8" />

              {/* Bars */}
              {monthlyData.map((d, i) => {
                const barWidth = 36;
                const barX = 25 + i * 65;
                const barHeight = (d.height / 100) * 120;
                const barY = 150 - barHeight;
                const isHovered = activeMonthIdx === i;

                return (
                  <g
                    key={d.month}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveMonthIdx(i)}
                    onMouseLeave={() => setActiveMonthIdx(null)}
                  >
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      className={`transition-colors duration-150 ${
                        isHovered
                          ? 'fill-blue-600 dark:fill-blue-500'
                          : 'fill-blue-200/90 dark:fill-blue-500/40 hover:fill-blue-500'
                      }`}
                    />
                  </g>
                );
              })}

              {/* Blue Accent Trend Line */}
              <path
                d="M 43,130 L 108,118 L 173,124 L 238,85 L 303,95 L 368,58 L 433,78 L 498,42 L 563,32"
                fill="none"
                className="stroke-blue-600 dark:stroke-blue-400"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Month labels under bars */}
          <div className="flex justify-between items-center px-4 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {monthlyData.map((d, i) => (
              <span
                key={d.month}
                className={`transition-colors ${
                  activeMonthIdx === i ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                }`}
              >
                {d.month}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Gross Profit & Net Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gross Profit Card */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Gross Margin Profit
          </span>
          <div className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {currency}845,000
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Target: {currency}1.00M</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">84%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: '84%' }}
              />
            </div>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Net Margin Yield
          </span>
          <div className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {currency}420,000
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Effective Profit Ratio</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">34%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: '34%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Raw vs GST Billing Card */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 block">
            Volume Breakdown
          </span>
          <h3 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Raw vs GST Billing Distribution
          </h3>
        </div>

        {/* Dual Bar Chart */}
        <div className="h-52 w-full pt-4">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 500 160"
            preserveAspectRatio="none"
          >
            <line x1="10" y1="140" x2="490" y2="140" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />

            {quarterlyData.map((q, idx) => {
              const groupX = 35 + idx * 120;
              const rawHeight = (q.raw / 100) * 115;
              const gstHeight = (q.gst / 100) * 115;

              return (
                <g key={q.quarter}>
                  {/* Raw Billing (Slate bar) */}
                  <rect
                    x={groupX}
                    y={140 - rawHeight}
                    width={28}
                    height={rawHeight}
                    rx="3"
                    className="fill-slate-300 dark:fill-slate-700"
                  />
                  {/* With GST (Blue bar) */}
                  <rect
                    x={groupX + 34}
                    y={140 - gstHeight}
                    width={28}
                    height={gstHeight}
                    rx="3"
                    className="fill-blue-600 dark:fill-blue-500"
                  />
                  {/* Quarter label */}
                  <text
                    x={groupX + 31}
                    y={155}
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {q.quarter}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-6 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700" />
            <span>Raw Billing (Non-Tax)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-600 dark:bg-blue-500" />
            <span>With GST (Tax Invoice)</span>
          </div>
        </div>
      </div>

      {/* Revenue by Category Card */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 block">
            Vertical Segmentation
          </span>
          <h3 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Revenue by Service Category
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
              Enterprise SaaS
            </div>
            <div className="font-editorial text-2xl font-bold text-slate-900 dark:text-white">
              65%
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Platform subscriptions</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              API Services
            </div>
            <div className="font-editorial text-2xl font-bold text-slate-900 dark:text-white">
              25%
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Metered endpoints</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Support Tiers
            </div>
            <div className="font-editorial text-2xl font-bold text-slate-900 dark:text-white">
              10%
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">SLA guarantee retainers</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 block">
            Settlement Rails
          </span>
          <h3 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Payment Processing Channels
          </h3>
        </div>

        <div className="space-y-2.5">
          {/* Credit Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Credit / Debit Card
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Stripe & Global Acquirers</p>
              </div>
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {currency}840k
            </span>
          </div>

          {/* ACH Transfer */}
          <div className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  ACH & Direct Bank Transfer
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Corporate Wire Protocol</p>
              </div>
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {currency}320k
            </span>
          </div>

          {/* UPI / Wire */}
          <div className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Instant UPI & Instant Rails
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time payment settlements</p>
              </div>
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {currency}80k
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
