import React, { useState } from 'react';
import {
  Building2,
  Receipt,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Save,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { ThemeMode } from '../types';

interface MenuViewProps {
  currency: string;
  onSetCurrency: (curr: string) => void;
  onResetData: () => void;
  themeMode?: ThemeMode;
  onSetThemeMode?: (mode: ThemeMode) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  currency,
  onSetCurrency,
  onResetData,
  themeMode = 'system',
  onSetThemeMode
}) => {
  const [businessName, setBusinessName] = useState('RevenueFlow Technologies Inc.');
  const [gstin, setGstin] = useState('27AABCU9603R1ZM');
  const [taxRate, setTaxRate] = useState('18');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block mb-1">
          Configuration & Settings
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Business Profile & Preferences
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage entity credentials, default tax rates, and ledger currency.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Settings saved successfully to system registry!
        </div>
      )}

      {/* Theme Appearance Mode */}
      {onSetThemeMode && (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Interface Appearance
          </span>
          <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight">
            Theme & Display Mode
          </h3>
          <p className="text-xs text-slate-500">
            Choose how Remix RevenueFlow looks to you. Seamlessly switch between Light, Dark, or match your system settings.
          </p>
          <div className="grid grid-cols-3 gap-2.5 max-w-md pt-2">
            {[
              { id: 'light' as const, label: 'Light Mode', icon: Sun },
              { id: 'dark' as const, label: 'Dark Mode', icon: Moon },
              { id: 'system' as const, label: 'System Match', icon: Laptop }
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = themeMode === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSetThemeMode(t.id)}
                  className={`py-2.5 px-3 border text-center text-xs font-semibold rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs font-bold'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Currency Switcher */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Display Currency
        </span>
        <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight">
          Active Currency Symbol
        </h3>
        <p className="text-xs text-slate-500">
          Select primary currency symbol applied across the dashboard, analytics, and invoice exports.
        </p>
        <div className="grid grid-cols-3 gap-2.5 max-w-sm pt-2">
          {[
            { symbol: '$', code: 'USD ($)' },
            { symbol: '₹', code: 'INR (₹)' },
            { symbol: '€', code: 'EUR (€)' }
          ].map((c) => (
            <button
              key={c.symbol}
              onClick={() => onSetCurrency(c.symbol)}
              className={`py-2 px-3 border text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currency === c.symbol
                  ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 bg-white'
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Business Details Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Regulatory Profile
          </span>
          <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Legal Entity & Tax Details
          </h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Organization Legal Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              GSTIN / Tax ID
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Default GST Tax Rate (%)
            </label>
            <select
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="18">18% (Standard GST: 9% CGST + 9% SGST)</option>
              <option value="12">12% (6% CGST + 6% SGST)</option>
              <option value="5">5% (2.5% CGST + 2.5% SGST)</option>
              <option value="0">0% (Exempt)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4" />
          Save Business Profile
        </button>
      </form>

      {/* Compliance and Invoicing Info */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Compliance & Governance
          </span>
          <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Invoicing Standards & Audit Trails
          </h3>
        </div>
        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Digital signatures & hash verification applied to all tax invoices.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Receipt className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Supports both Raw non-tax billing estimates and formal GST bills.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Multi-state IGST and intra-state CGST/SGST automatic calculation splits.</span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Reset Environment
        </span>
        <h3 className="font-editorial text-2xl font-bold text-slate-900 tracking-tight">
          Reset Application Data
        </h3>
        <p className="text-xs text-slate-500">
          Restore all invoices, expenses, and inventory back to initial default seed values.
        </p>
        <button
          onClick={onResetData}
          className="border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer mt-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
