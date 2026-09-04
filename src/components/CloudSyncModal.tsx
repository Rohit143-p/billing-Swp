import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  Cloud,
  ShieldCheck,
  X,
  FileText,
  Receipt,
  Boxes,
  Users,
  AlertCircle
} from 'lucide-react';
import { getCloudSyncStats, CloudSyncStats } from '../lib/firebase';
import { UserAccount } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  currentUser?: UserAccount;
  firebaseConnected: boolean;
  onForceSyncAll: () => Promise<{ success: boolean; count: number }>;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentUser,
  firebaseConnected,
  onForceSyncAll
}) => {
  const [stats, setStats] = useState<CloudSyncStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getCloudSyncStats(userId);
      setStats(data);
    } catch (err) {
      console.warn('Error fetching sync stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      setSyncFeedback(null);
    }
  }, [isOpen, userId]);

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await onForceSyncAll();
      await fetchStats();
      if (res.success) {
        setSyncFeedback(`Successfully verified & synchronized ${res.count} records with Firestore!`);
      } else {
        setSyncFeedback('Synchronization encountered an error. Check console logs.');
      }
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message || 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Google Cloud Firestore Status
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono-tag">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      firebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span>{firebaseConnected ? 'Connected & Live' : 'Connecting...'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto touch-scroll">
            {/* Database & Cloud Info Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Database Target:</span>
                <span className="font-mono font-semibold text-slate-800 text-[11px] truncate max-w-[210px]">
                  {stats?.databaseId || 'ai-studio-remixrevenueflow...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Storage Scope:</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100/70 text-blue-800 text-[10px]">
                  {currentUser ? (currentUser.isDemo ? 'Demo Workspace' : currentUser.email) : 'Default Workspace'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Security Rules:</span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cloud Deployed</span>
                </span>
              </div>
            </div>

            {/* Live Document Counts in Firestore */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                  Live Records in Cloud Firestore
                </span>
                <button
                  type="button"
                  onClick={fetchStats}
                  disabled={loading}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Counts</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl border border-slate-200 bg-white text-center shadow-2xs">
                  <FileText className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-slate-900 font-mono-tag">
                    {loading ? '...' : stats?.billsCount ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Invoices</div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white text-center shadow-2xs">
                  <Receipt className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-slate-900 font-mono-tag">
                    {loading ? '...' : stats?.expensesCount ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Expenses</div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white text-center shadow-2xs">
                  <Boxes className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-slate-900 font-mono-tag">
                    {loading ? '...' : stats?.inventoryCount ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Stock Items</div>
                </div>
              </div>
            </div>

            {/* Feedback alert */}
            {syncFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  syncFeedback.includes('Successfully')
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}
              >
                {syncFeedback.includes('Successfully') ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{syncFeedback}</span>
              </motion.div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400">
                Checked: {stats?.lastChecked || 'Just now'}
              </span>

              <button
                type="button"
                onClick={handleSyncNow}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Cloud className={`w-3.5 h-3.5 ${syncing ? 'animate-bounce' : ''}`} />
                <span>{syncing ? 'Syncing to Cloud...' : 'Force Sync All to Firebase'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
