import React, { useState } from 'react';
import {
  Package,
  Receipt,
  TrendingUp,
  TrendingDown,
  Cloud,
  Briefcase,
  Megaphone,
  Building,
  ChevronDown,
  Plus,
  Minus,
  FileDown,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { Expense, InventoryItem } from '../types';
import { PaymentModeBadge } from './PaymentModeBadge';

interface ExpensesViewProps {
  expenses: Expense[];
  inventory: InventoryItem[];
  currency: string;
  onOpenAddExpense: () => void;
  onRestockItem: (sku: string, addQty: number) => void;
  userThreshold?: number;
  onUpdateThreshold?: (threshold: number) => void;
  onAdjustQty?: (sku: string, delta: number) => void;
  onRunCheckNow?: () => void;
  lastCheckedTime?: string;
  isScanning?: boolean;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  inventory,
  currency,
  onOpenAddExpense,
  onRestockItem,
  userThreshold = 10,
  onUpdateThreshold,
  onAdjustQty,
  onRunCheckNow,
  lastCheckedTime,
  isScanning = false
}) => {
  const [trendRange, setTrendRange] = useState('Last 6 Months');
  const [selectedSkuForRestock, setSelectedSkuForRestock] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState(10);
  const [exportNotice, setExportNotice] = useState(false);
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [tempThreshold, setTempThreshold] = useState<number>(userThreshold);
  const [showAllInventory, setShowAllInventory] = useState(true);

  // Expense trend data (6 months)
  const expenseChartData = [
    { month: 'Jan', value: 380, height: 38 },
    { month: 'Feb', value: 420, height: 42 },
    { month: 'Mar', value: 460, height: 46 },
    { month: 'Apr', value: 410, height: 41 },
    { month: 'May', value: 490, height: 49 },
    { month: 'Jun', value: 482.5, height: 48.25 }
  ];

  // Dynamic calculations
  const totalMonthlyExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const inventoryValuation = inventory.reduce(
    (acc, item) => acc + (item.currentQty || 0) * (item.unitPrice || 0),
    0
  );

  // Export report handler
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Type,Item,Category,Amount_or_Qty,Date_or_SKU']
        .concat(
          expenses.map(
            (e) => `Expense,"${e.title}","${e.category}",${e.amount},${e.date}`
          )
        )
        .concat(
          inventory.map(
            (i) => `Inventory,"${i.name}","${i.category}",${i.currentQty},${i.sku}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RevenueFlow_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('cloud') || category.toLowerCase().includes('aws')) {
      return <Cloud className="w-5 h-5" />;
    }
    if (category.toLowerCase().includes('contractor') || category.toLowerCase().includes('engineer')) {
      return <Briefcase className="w-5 h-5" />;
    }
    if (category.toLowerCase().includes('market') || category.toLowerCase().includes('adwords')) {
      return <Megaphone className="w-5 h-5" />;
    }
    return <Building className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block mb-1">
            Capital Outflow & Inventory
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Expenses & Assets
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time asset valuation, operational costs, and inventory monitoring.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            Export Report
          </button>

          <button
            onClick={onOpenAddExpense}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Report exported successfully to CSV format!
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: CURRENT INVENTORY VALUE */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Inventory Valuation
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {currency}{inventoryValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold rounded-md">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            {inventory.length} item(s) in catalog
          </div>
        </div>

        {/* Card 2: MONTHLY EXPENSES (MTD) */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Expenses (MTD)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {currency}{totalMonthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold rounded-md">
            <Receipt className="w-3.5 h-3.5 text-amber-600" />
            {expenses.length} expense record(s)
          </div>
        </div>
      </div>

      {/* Expense Trends */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Outflow Velocity
            </span>
            <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Expense Trends
            </h3>
          </div>

          <div className="relative">
            <select
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 px-3 py-1.5 pr-8 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Last 12 Months">Last 12 Months</option>
              <option value="Current Quarter">Current Quarter</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Chart with Y-axis ticks */}
        <div className="relative pt-2 pb-1">
          <div className="flex items-stretch gap-2">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between text-xs font-medium text-slate-400 py-2 h-44 text-right pr-2">
              <span>{currency}1M</span>
              <span>{currency}500k</span>
              <span>0</span>
            </div>

            {/* SVG Chart area */}
            <div className="flex-1 h-44 relative border-l border-b border-slate-200 dark:border-slate-800">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
              >
                {/* Horizontal guide lines */}
                <line x1="0" y1="20" x2="500" y2="20" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />
                <line x1="0" y1="80" x2="500" y2="80" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />

                {/* Bars */}
                {expenseChartData.map((d, idx) => {
                  const barWidth = 34;
                  const barX = 25 + idx * 78;
                  const barHeight = (d.height / 100) * 130;
                  const barY = 150 - barHeight;

                  return (
                    <g key={d.month} className="group cursor-pointer">
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        className="fill-blue-200/90 dark:fill-blue-500/40 hover:fill-blue-600 dark:hover:fill-blue-500 transition-colors"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Month labels */}
          <div className="flex justify-between items-center pl-12 pr-4 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {expenseChartData.map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Expenses by Category */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Drain Allocation
            </span>
            <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Top Expenses by Category
            </h3>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            + Add New
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-8 text-center px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
              <Receipt className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-slate-800">No Expenses Recorded Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Log operational costs, cloud services, salaries, or supplies to track capital outflow.
            </p>
            <button
              onClick={onOpenAddExpense}
              className="mt-3.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Record First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.slice(0, 4).map((exp) => (
              <div
                key={exp.id}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2.5 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    {getCategoryIcon(exp.title)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">
                      {exp.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {exp.category} {exp.vendor ? `• ${exp.vendor}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="font-bold text-sm text-slate-900">
                    {currency}{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {exp.paymentMode && (
                      <PaymentModeBadge mode={exp.paymentMode} size="sm" />
                    )}
                    {exp.paymentReference && (
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline" title={exp.paymentReference}>
                        {exp.paymentReference.length > 16 ? `${exp.paymentReference.slice(0, 16)}...` : exp.paymentReference}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Alerts & Threshold Surveillance */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 block">
                  Threshold Surveillance
                </span>
                <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Background Check Active
                </span>
              </div>
              <h3 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Inventory & Stock Surveillance
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* User-defined threshold indicator & trigger */}
            <button
              type="button"
              onClick={() => {
                setTempThreshold(userThreshold);
                setIsEditingThreshold(true);
              }}
              className="bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Click to change user-defined low stock threshold"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Threshold: <strong className="font-bold">{userThreshold} units</strong></span>
            </button>

            {/* Force scan button */}
            {onRunCheckNow && (
              <button
                type="button"
                onClick={onRunCheckNow}
                disabled={isScanning}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60 shadow-2xs"
                title="Run background inventory scan now"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
              </button>
            )}

            {inventory.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSkuForRestock(inventory[0]?.sku || null)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                + Restock
              </button>
            )}
          </div>
        </div>

        {/* Sub-header info bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span>
              Triggering alert if any item's <code className="text-slate-800 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">currentQty &lt; {userThreshold}</code>
            </span>
            {lastCheckedTime && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                • Last background check: {lastCheckedTime}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllInventory(!showAllInventory)}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {showAllInventory ? `Showing all items (${inventory.length})` : 'Show all items'}
            </button>
          </div>
        </div>

        {/* Table or Empty state */}
        {inventory.length === 0 ? (
          <div className="py-6 text-center px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <Package className="w-4 h-4" />
            </div>
            <p className="font-medium text-xs text-slate-700">No Inventory Items Tracked</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Warehouse catalog and inventory units will appear here once items are stocked.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (sm:hidden) */}
            <div className="block sm:hidden space-y-2.5">
              {(showAllInventory ? inventory : inventory.slice(0, 3)).map((item) => {
                const isBelowUserThreshold = item.currentQty < userThreshold;
                const isCritical = item.currentQty <= Math.floor(userThreshold / 2);

                return (
                  <div
                    key={item.sku}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isBelowUserThreshold
                        ? 'border-rose-200 bg-rose-50/30'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isBelowUserThreshold ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                            }`}
                          />
                          <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          SKU: <span className="font-mono text-slate-700">{item.sku}</span> • {item.category}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                          <AlertTriangle className="w-3 h-3" />
                          Critical
                        </span>
                      ) : isBelowUserThreshold ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                          <ShieldAlert className="w-3 h-3" />
                          Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Optimal
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 gap-2">
                      {/* Qty Adjustment */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">Qty:</span>
                        {onAdjustQty && (
                          <button
                            type="button"
                            onClick={() => onAdjustQty(item.sku, -1)}
                            disabled={item.currentQty <= 0}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 flex items-center justify-center text-xs transition-colors cursor-pointer disabled:opacity-30"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        )}
                        <span
                          className={`font-bold text-sm min-w-[28px] text-center px-1.5 py-0.5 rounded ${
                            isCritical
                              ? 'text-rose-700 bg-rose-100/80 font-black'
                              : isBelowUserThreshold
                              ? 'text-amber-700 bg-amber-100/80'
                              : 'text-slate-800 bg-slate-100'
                          }`}
                        >
                          {item.currentQty}
                        </span>
                        {onAdjustQty && (
                          <button
                            type="button"
                            onClick={() => onAdjustQty(item.sku, 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 flex items-center justify-center text-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Restock Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedSkuForRestock(item.sku)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        + Restock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto -mx-1 sm:mx-0 touch-scroll">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200 pb-2">
                    <th className="pb-2 font-semibold">Item / SKU</th>
                    <th className="pb-2 text-center font-semibold">Current Qty</th>
                    <th className="pb-2 text-center font-semibold">Alert Threshold</th>
                    <th className="pb-2 text-center font-semibold">Status</th>
                    <th className="pb-2 text-right font-semibold">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(showAllInventory ? inventory : inventory.slice(0, 3)).map((item) => {
                    const effectiveItemThreshold = item.reorderPt || userThreshold;
                    const isBelowUserThreshold = item.currentQty < userThreshold;
                    const isCritical = item.currentQty <= Math.floor(userThreshold / 2);

                    return (
                      <tr key={item.sku} className={`hover:bg-slate-50/60 transition-colors ${isBelowUserThreshold ? 'bg-rose-50/20' : ''}`}>
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2">
                            {isBelowUserThreshold ? (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            )}
                            <div>
                              <p className="font-semibold text-sm text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                SKU: <span className="font-mono">{item.sku}</span> • {item.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {onAdjustQty && (
                              <button
                                type="button"
                                onClick={() => onAdjustQty(item.sku, -1)}
                                disabled={item.currentQty <= 0}
                                className="w-5 h-5 rounded bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 flex items-center justify-center text-xs transition-colors cursor-pointer disabled:opacity-30"
                                title="Simulate sale/consumption (-1 unit)"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            )}

                            <span
                              className={`font-bold text-sm min-w-[28px] px-1.5 py-0.5 rounded ${
                                isCritical
                                  ? 'text-rose-700 bg-rose-100/80 font-black'
                                  : isBelowUserThreshold
                                  ? 'text-amber-700 bg-amber-100/80'
                                  : 'text-slate-800'
                              }`}
                            >
                              {item.currentQty}
                            </span>

                            {onAdjustQty && (
                              <button
                                type="button"
                                onClick={() => onAdjustQty(item.sku, 1)}
                                className="w-5 h-5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 flex items-center justify-center text-xs transition-colors cursor-pointer"
                                title="Add 1 unit"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 text-center text-xs text-slate-600 font-medium">
                          <span className="font-mono font-bold text-slate-700">{userThreshold}</span>
                          {item.reorderPt && item.reorderPt !== userThreshold && (
                            <span className="text-[10px] text-slate-400 block">
                              (Item pt: {item.reorderPt})
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 text-center">
                          {isCritical ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              Critical (&lt; {Math.floor(userThreshold / 2)})
                            </span>
                          ) : isBelowUserThreshold ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <ShieldAlert className="w-3 h-3" />
                              Below Threshold (&lt; {userThreshold})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Optimal
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSkuForRestock(item.sku)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                          >
                            + Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Modal for setting threshold directly from this view */}
        {isEditingThreshold && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Define Low Stock Threshold</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Trigger persistent alert when currentQty is below:</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingThreshold(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Threshold Quantity
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={tempThreshold}
                    onChange={(e) => setTempThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    units
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Quick Presets
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 15, 20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTempThreshold(preset)}
                      className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        tempThreshold === preset
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingThreshold(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateThreshold) {
                      onUpdateThreshold(tempThreshold);
                    }
                    setIsEditingThreshold(false);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Threshold
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Restock Mini Modal */}
      {selectedSkuForRestock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4 animate-in zoom-in-95">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 block mb-1">
                Restock Protocol
              </span>
              <h4 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white">
                Restock Inventory
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Inbound inventory units for SKU: <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedSkuForRestock}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Quantity to Add
              </label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedSkuForRestock(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRestockItem(selectedSkuForRestock, restockQty);
                  setSelectedSkuForRestock(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
