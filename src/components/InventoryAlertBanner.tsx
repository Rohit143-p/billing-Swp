import React, { useState } from 'react';
import {
  AlertTriangle,
  Package,
  RefreshCw,
  Sliders,
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  ShieldAlert
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryAlertBannerProps {
  lowStockItems: InventoryItem[];
  userThreshold: number;
  lastCheckedTime: string;
  isScanning: boolean;
  onRunCheckNow: () => void;
  onUpdateThreshold: (newThreshold: number) => void;
  onOpenRestock: (sku: string) => void;
  onNavigateToInventory: () => void;
}

export const InventoryAlertBanner: React.FC<InventoryAlertBannerProps> = ({
  lowStockItems,
  userThreshold,
  lastCheckedTime,
  isScanning,
  onRunCheckNow,
  onUpdateThreshold,
  onOpenRestock,
  onNavigateToInventory
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [tempThreshold, setTempThreshold] = useState<number>(userThreshold);

  if (lowStockItems.length === 0) {
    return null;
  }

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.max(1, tempThreshold);
    onUpdateThreshold(val);
    setIsThresholdModalOpen(false);
  };

  return (
    <>
      {/* If minimized, show floating persistent pill */}
      {isMinimized ? (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 bg-rose-600 hover:bg-rose-700 text-white py-2 px-3.5 rounded-full shadow-lg border border-rose-500/50 text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 group"
            title="Click to expand low stock surveillance alert"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span>
              {lowStockItems.length} Low Stock Alert{lowStockItems.length > 1 ? 's' : ''} (&lt;{userThreshold})
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-rose-200 group-hover:text-white" />
          </button>
        </div>
      ) : (
        /* Persistent Alert Banner */
        <div className="mb-6 bg-gradient-to-r from-rose-50 via-rose-50/70 to-amber-50/60 dark:from-rose-950/40 dark:via-rose-950/20 dark:to-amber-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3.5 sm:p-4 shadow-sm transition-all relative overflow-hidden">
          {/* Top accent pulse line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-0.5">
            {/* Left Info */}
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase">
                    Persistent Inventory Alert
                  </span>
                  <span className="text-[11px] text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-1">
                    Threshold: <span className="underline decoration-rose-400 font-bold">{userThreshold} units</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                    • Auto-scan active {lastCheckedTime && `(${lastCheckedTime})`}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold mt-1">
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''}</span> have fallen below your user-defined threshold.
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={onRunCheckNow}
                disabled={isScanning}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                title="Force background inventory scan now"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTempThreshold(userThreshold);
                  setIsThresholdModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Change user-defined alert threshold"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Set Threshold</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToInventory}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>View Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title="Minimize alert to background pill"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Low Stock Items List Pills */}
          <div className="mt-3 pt-2.5 border-t border-rose-200/70 dark:border-rose-900/40 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Affected stock:</span>
            {lowStockItems.map((item) => (
              <div
                key={item.sku}
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 py-1 px-2.5 rounded-lg text-xs shadow-2xs hover:border-rose-300 dark:hover:border-rose-700 transition-all"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">({item.sku})</span>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                  {item.currentQty} on hand
                </span>
                <button
                  type="button"
                  onClick={() => onOpenRestock(item.sku)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer ml-1"
                >
                  + Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threshold Config Modal */}
      {isThresholdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Set Low Stock Alert Threshold
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define the minimum stock quantity before persistent alerts trigger.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsThresholdModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveThreshold} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alert Threshold (Units)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={tempThreshold}
                    onChange={(e) => setTempThreshold(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-semibold text-slate-400">
                    units
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  When any inventory item's currentQty drops below this value, persistent alerts and notifications will trigger.
                </p>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Quick Presets
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 25].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTempThreshold(preset)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        tempThreshold === preset
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset} Units
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsThresholdModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save & Apply Threshold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
