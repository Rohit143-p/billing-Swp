import React, { useState } from 'react';
import {
  Building2,
  Receipt,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Save,
  Download,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Percent,
  Sparkles,
  Layers,
  Palette,
  FileText,
  AlertCircle,
  Smartphone,
  Sun,
  Moon,
  Laptop,
  Package,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BusinessConfig, UserAccount, ThemeMode } from '../types';
import { INDUSTRY_PRESETS, IndustryPreset, DEFAULT_BUSINESS_CONFIG } from '../data/businessPresets';

interface BusinessConfigViewProps {
  config: BusinessConfig;
  onSaveConfig: (newConfig: BusinessConfig) => void;
  onResetData: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenMobileInstall?: () => void;
  themeMode?: ThemeMode;
  onSetThemeMode?: (mode: ThemeMode) => void;
}

export const BusinessConfigView: React.FC<BusinessConfigViewProps> = ({
  config,
  onSaveConfig,
  onResetData,
  currentUser,
  onLogout,
  onOpenMobileInstall,
  themeMode = 'system',
  onSetThemeMode
}) => {
  const [formData, setFormData] = useState<BusinessConfig>({ ...config });
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'tax' | 'invoicing' | 'banking' | 'inventory' | 'presets' | 'data'>('profile');
  const [previewTab, setPreviewTab] = useState<'invoice' | 'raw'>('invoice');

  // Brand color presets
  const COLOR_SWATCHES = [
    { name: 'Royal Blue', hex: '#2563eb' },
    { name: 'Emerald Forest', hex: '#059669' },
    { name: 'Violet Studio', hex: '#7c3aed' },
    { name: 'Deep Indigo', hex: '#4338ca' },
    { name: 'Amber Glow', hex: '#d97706' },
    { name: 'Crimson Rose', hex: '#e11d48' },
    { name: 'Slate Executive', hex: '#334155' },
    { name: 'Teal Medical', hex: '#0d9488' }
  ];

  const handleFieldChange = <K extends keyof BusinessConfig>(field: K, value: BusinessConfig[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyPreset = (preset: IndustryPreset) => {
    const updated: BusinessConfig = {
      ...formData,
      ...preset.config,
      industry: preset.id
    };
    setFormData(updated);
    onSaveConfig(updated);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch {
      // ignore
    }

    setSavedNotice(`Applied "${preset.name}" preset profile!`);
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.4 }
      });
    } catch {
      // ignore
    }

    setSavedNotice('Business configuration saved successfully to local storage!');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName = formData.businessName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${safeName}_config_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSavedNotice('Configuration exported as JSON backup file!');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.businessName) {
          const merged = { ...DEFAULT_BUSINESS_CONFIG, ...parsed };
          setFormData(merged);
          onSaveConfig(merged);
          setSavedNotice('Configuration successfully imported!');
          setTimeout(() => setSavedNotice(null), 3500);
        } else {
          alert('Invalid configuration file. Business name is required.');
        }
      } catch (err) {
        alert('Error parsing JSON configuration file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Multi-Business Settings
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Universal Dynamic Engine
            </span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-1">
            Business Configuration
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Tailor the branding, currency, tax codes, line items, and payment instructions so any commercial entity can use this platform instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportJson}
            title="Download JSON Backup"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium rounded-xl flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* 1-Click Industry Starter Presets Bar */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              1-Click Industry Starter Profiles
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Click any profile to instantly configure for that business
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {INDUSTRY_PRESETS.map((preset) => {
            const isSelected = formData.industry === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-850 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-lg mb-1.5">{preset.icon}</div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {preset.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Visual Preview Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Invoice Branding Preview
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono-tag">
            Auto-synchronizes with PDF & invoices
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
          {/* Top Brand Stripe */}
          <div
            className="h-1.5 rounded-full w-full"
            style={{ backgroundColor: formData.brandColor }}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center font-mono shadow-xs shrink-0"
                style={{ backgroundColor: formData.brandColor }}
              >
                {formData.brandShort || 'RF'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                  {formData.businessName || 'Your Business Name'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formData.tagline || 'Business Tagline / Subtitle'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {formData.taxNumber ? `${formData.taxLabel}: ${formData.taxNumber}` : 'Tax Exempt'} • {formData.email} • {formData.phone}
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                {formData.invoicePrefix}-084
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">
                Currency: <span className="font-bold text-slate-900 dark:text-white">{formData.currency} ({formData.currencyCode})</span>
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                Default Tax: <span className="font-semibold text-slate-600 dark:text-slate-300">{formData.defaultTaxRate}%</span> ({formData.taxSystem.toUpperCase()})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Bank Details: </span>
              <span>{formData.bankName} • Acc: {formData.accountNumber} • {formData.routingOrIfsc}</span>
            </div>
            <div className="sm:text-right">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Payment Due: </span>
              <span>{formData.paymentTermsDays === 0 ? 'Due upon receipt' : `Net ${formData.paymentTermsDays} days`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-1 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-none touch-scroll pb-0.5">
        {[
          { id: 'profile' as const, label: 'Identity & Brand', icon: <Building2 className="w-3.5 h-3.5" /> },
          { id: 'tax' as const, label: 'Tax & Currency', icon: <Percent className="w-3.5 h-3.5" /> },
          { id: 'invoicing' as const, label: 'Invoicing & Terms', icon: <Receipt className="w-3.5 h-3.5" /> },
          { id: 'banking' as const, label: 'Bank & Payments', icon: <CreditCard className="w-3.5 h-3.5" /> },
          { id: 'inventory' as const, label: 'Inventory & Alerts', icon: <Package className="w-3.5 h-3.5" /> },
          { id: 'data' as const, label: 'Data & Reset', icon: <RotateCcw className="w-3.5 h-3.5" /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 rounded-t-lg'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Profile & Identity */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Business Profile & Visual Identity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Define legal business naming, header brand mark, theme color, and contact location.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Business / Organization Legal Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleFieldChange('businessName', e.target.value)}
                  placeholder="e.g. Acme Corporation LLC"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Logo Initials (2-4 Chars)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.brandShort}
                    onChange={(e) => handleFieldChange('brandShort', e.target.value.toUpperCase())}
                    placeholder="e.g. AC"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono uppercase text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                  <div
                    className="w-9 h-9 rounded-lg text-white font-bold text-xs flex items-center justify-center font-mono shrink-0 shadow-xs"
                    style={{ backgroundColor: formData.brandColor }}
                  >
                    {formData.brandShort || 'RF'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Business Tagline / Specialty Description
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleFieldChange('tagline', e.target.value)}
                placeholder="e.g. Creative Design & Full-Stack Engineering Studio"
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Brand Color Theme Swatches */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Brand Accent Color (Applies to Invoices & PDFs)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => handleFieldChange('brandColor', swatch.hex)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      formData.brandColor.toLowerCase() === swatch.hex.toLowerCase()
                        ? 'border-slate-800 dark:border-blue-400 bg-slate-100 dark:bg-slate-800 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="text-slate-700 dark:text-slate-200">{swatch.name}</span>
                  </button>
                ))}

                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                  <input
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => handleFieldChange('brandColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{formData.brandColor}</span>
                </div>
              </div>

              {/* UI Theme Appearance (Light / Dark / System) */}
              {onSetThemeMode && (
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Application Interface Appearance
                  </label>
                  <div className="grid grid-cols-3 gap-2.5 max-w-md">
                    {[
                      { id: 'light' as const, label: 'Light Mode', icon: Sun },
                      { id: 'dark' as const, label: 'Dark Mode', icon: Moon },
                      { id: 'system' as const, label: 'System Default', icon: Laptop }
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = themeMode === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onSetThemeMode(t.id)}
                          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Official Invoicing Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="billing@company.com"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Business Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Official Website
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="e.g. 100 Montgomery St, Suite 1500"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  City, State, Postal / ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.cityStateZip}
                  onChange={(e) => handleFieldChange('cityStateZip', e.target.value)}
                  placeholder="e.g. San Francisco, CA 94104"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Tax, Regulatory & Currency */}
        {activeTab === 'tax' && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Tax System & Currency Rules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Support GST (intra-state CGST+SGST or IGST), Sales Tax, VAT, or non-tax independent contractor regimes.
              </p>
            </div>

            {/* Currency Selector */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Display Currency Symbol & Code
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  { symbol: '$', code: 'USD', label: 'USD ($)' },
                  { symbol: '₹', code: 'INR', label: 'INR (₹)' },
                  { symbol: '€', code: 'EUR', label: 'EUR (€)' },
                  { symbol: '£', code: 'GBP', label: 'GBP (£)' },
                  { symbol: 'C$', code: 'CAD', label: 'CAD (C$)' },
                  { symbol: 'A$', code: 'AUD', label: 'AUD (A$)' },
                  { symbol: 'د.إ', code: 'AED', label: 'AED (د.إ)' }
                ].map((curr) => {
                  const isCurSelected = formData.currency === curr.symbol;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => {
                        handleFieldChange('currency', curr.symbol);
                        handleFieldChange('currencyCode', curr.code);
                      }}
                      className={`py-2 px-2.5 border rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                        isCurSelected
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {curr.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tax Regime Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tax Scheme / Regulatory Regime
                </label>
                <select
                  value={formData.taxSystem}
                  onChange={(e) => handleFieldChange('taxSystem', e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="gst">GST (Goods & Services Tax - CGST+SGST)</option>
                  <option value="sales_tax">Sales Tax (State / Municipal)</option>
                  <option value="vat">VAT (Value Added Tax)</option>
                  <option value="none">Tax Exempt / Independent Contractor</option>
                  <option value="custom">Custom Flat Tax</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tax Identification Label
                </label>
                <input
                  type="text"
                  value={formData.taxLabel}
                  onChange={(e) => handleFieldChange('taxLabel', e.target.value)}
                  placeholder="e.g. GSTIN, EIN, VAT Reg"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tax Identification Number
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => handleFieldChange('taxNumber', e.target.value)}
                  placeholder="e.g. 27AABCU9603R1ZM"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm uppercase text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Default Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.defaultTaxRate}
                    onChange={(e) => handleFieldChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors pr-8"
                  />
                  <span className="absolute right-3 top-2 text-sm text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Common rates: 18% (Standard GST), 8.25% (US Sales Tax), 20% (UK VAT), 0% (Freelance)
                </p>
              </div>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-white">Dynamic Split Guarantee: </span>
                  When GST is selected, the platform automatically calculates intra-state 50/50 splits (CGST + SGST) on all generated invoices and vector PDF exports.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Invoicing Rules & Terms */}
        {activeTab === 'invoicing' && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Invoicing Rules & Terms
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set custom invoice prefixes, payment terms due dates, and default footer notices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tax / Formal Invoice Prefix
                </label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => handleFieldChange('invoicePrefix', e.target.value.toUpperCase())}
                  placeholder="e.g. INV-2026 or ACME-"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm uppercase text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Outputs: {formData.invoicePrefix}-001
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Raw / Estimate / Memo Prefix
                </label>
                <input
                  type="text"
                  value={formData.rawBillPrefix}
                  onChange={(e) => handleFieldChange('rawBillPrefix', e.target.value.toUpperCase())}
                  placeholder="e.g. RAW-2026 or EST-"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm uppercase text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Outputs: {formData.rawBillPrefix}-042
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Default Payment Terms (Days)
                </label>
                <select
                  value={formData.paymentTermsDays}
                  onChange={(e) => handleFieldChange('paymentTermsDays', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value={0}>Due Immediately / Receipt</option>
                  <option value={7}>Net 7 Days</option>
                  <option value={14}>Net 14 Days</option>
                  <option value={15}>Net 15 Days</option>
                  <option value={30}>Net 30 Days</option>
                  <option value={45}>Net 45 Days</option>
                  <option value={60}>Net 60 Days</option>
                </select>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Auto-populates calendar due date
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Standard Terms & Conditions Clause
              </label>
              <textarea
                rows={2}
                value={formData.termsAndConditions}
                onChange={(e) => handleFieldChange('termsAndConditions', e.target.value)}
                placeholder="Payment due within specified term. Interest charged on overdue accounts."
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Invoice Footer Note & Thank You Message
              </label>
              <input
                type="text"
                value={formData.footerNote}
                onChange={(e) => handleFieldChange('footerNote', e.target.value)}
                placeholder="Thank you for your business! This is an electronically generated document."
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* TAB 4: Bank & Payment Instructions */}
        {activeTab === 'banking' && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Bank & Payment Collection Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                These details are directly rendered into the invoice payment instruction box and vector PDF exports.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Bank / Financial Institution Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleFieldChange('bankName', e.target.value)}
                  placeholder="e.g. JPMorgan Chase Bank / HDFC Bank"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Beneficiary Account Legal Name
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => handleFieldChange('accountName', e.target.value)}
                  placeholder="e.g. Acme Corporation LLC"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Number / IBAN
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                  placeholder="e.g. 50200084930219"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Routing / IFSC / Sort Code / SWIFT
                </label>
                <input
                  type="text"
                  value={formData.routingOrIfsc}
                  onChange={(e) => handleFieldChange('routingOrIfsc', e.target.value)}
                  placeholder="e.g. HDFC0000123 / 021000021"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm uppercase text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  UPI ID / PayPal / Payment Link
                </label>
                <input
                  type="text"
                  value={formData.upiOrPaypal}
                  onChange={(e) => handleFieldChange('upiOrPaypal', e.target.value)}
                  placeholder="e.g. billing@company.in / paypal.me/acme"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Instructions & Reference Note
                </label>
                <input
                  type="text"
                  value={formData.paymentNote}
                  onChange={(e) => handleFieldChange('paymentNote', e.target.value)}
                  placeholder="Please include invoice number in remarks."
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Inventory & Threshold Surveillance */}
        {activeTab === 'inventory' && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Inventory Surveillance & Low Stock Thresholds
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure the background monitoring thresholds that trigger persistent UI notifications.
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Automated Background Surveillance</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  The system continuously monitors all warehouse and asset inventories in the background. If any item's <code className="text-rose-700 dark:text-rose-300 font-bold bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-rose-200 dark:border-rose-900">currentQty</code> falls below your defined threshold, a high-priority, persistent notification banner is surfaced on screen.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Global Low Stock Threshold (Units)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={formData.lowStockThreshold || 10}
                    onChange={(e) => handleFieldChange('lowStockThreshold', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    units
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Items with current stock strictly less than this threshold will trigger persistent alerts.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Background Check Interval (Seconds)
                </label>
                <select
                  value={formData.inventoryCheckIntervalSeconds || 30}
                  onChange={(e) => handleFieldChange('inventoryCheckIntervalSeconds', parseInt(e.target.value) || 30)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value={15}>Every 15 seconds (Real-time)</option>
                  <option value={30}>Every 30 seconds (Standard)</option>
                  <option value={60}>Every 60 seconds (Relaxed)</option>
                  <option value={300}>Every 5 minutes (Extended)</option>
                </select>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  How often the background routine verifies catalog quantities.
                </p>
              </div>
            </div>

            {/* Threshold Quick Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Apply Threshold Quick Preset
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((units) => (
                  <button
                    key={units}
                    type="button"
                    onClick={() => handleFieldChange('lowStockThreshold', units)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      (formData.lowStockThreshold || 10) === units
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {units} Units
                  </button>
                ))}
              </div>
            </div>

            {/* Background Check Enablement Toggle */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Enable Background Stock Surveillance
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Run automated background evaluations and retain persistent notifications until restocked.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableInventoryBackgroundCheck !== false}
                  onChange={(e) => handleFieldChange('enableInventoryBackgroundCheck', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 6: Data & Environment Reset */}
        {activeTab === 'data' && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Environment & Data Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reset system defaults, clear test transactions, or export your configuration.
              </p>
            </div>

            {/* Active User Session Info */}
            {currentUser && (
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: currentUser.avatarColor || '#2563eb' }}
                  >
                    {currentUser.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-tag font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email} • {currentUser.businessName}</p>
                  </div>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="self-start sm:self-center px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-850 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    Sign Out / Switch Account
                  </button>
                )}
              </div>
            )}

            {/* Mobile App & APK Generator Card */}
            {onOpenMobileInstall && (
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/70 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-blue-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mobile Application & Android APK</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Install on iPhone/Android or download ready-to-use Android APK via PWABuilder.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenMobileInstall}
                  className="self-start sm:self-center px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Mobile & APK Options
                </button>
              </div>
            )}

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Reset Configuration to Factory Defaults
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restore business name, logo, currency, and tax codes back to original sample presets.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all business configuration to default RevenueFlow settings?')) {
                    setFormData(DEFAULT_BUSINESS_CONFIG);
                    onSaveConfig(DEFAULT_BUSINESS_CONFIG);
                    setSavedNotice('Restored factory default configuration!');
                    setTimeout(() => setSavedNotice(null), 3000);
                  }
                }}
                className="mt-2 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Restore Default Config
              </button>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                Reset All Ledger & Transaction Data
              </span>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                Wipes all custom invoices, expenses, and inventory items back to initial seed data.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all bills, expenses, and inventory?')) {
                    onResetData();
                    setSavedNotice('Application data reset to seed state!');
                    setTimeout(() => setSavedNotice(null), 3000);
                  }
                }}
                className="mt-2 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 bg-white dark:bg-slate-850 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Demo Data
              </button>
            </div>
          </div>
        )}

        {/* Global Save Action Bar */}
        <div className="sticky bottom-16 md:bottom-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md flex items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
            Configured entity: <span className="font-bold text-slate-900 dark:text-white">{formData.businessName}</span> ({formData.currency})
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setFormData({ ...config })}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Discard Changes
            </button>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
