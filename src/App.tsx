import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TabType,
  BillingType,
  Bill,
  Expense,
  InventoryItem,
  NotificationItem,
  BusinessConfig,
  AuthSession,
  ProductPerformance,
  PaymentMode
} from './types';
import {
  INITIAL_BILLS,
  INITIAL_EXPENSES,
  INITIAL_INVENTORY,
  INITIAL_PRODUCTS,
  INITIAL_NOTIFICATIONS,
  loadUserBills,
  saveUserBills,
  loadUserExpenses,
  saveUserExpenses,
  loadUserInventory,
  saveUserInventory,
  loadUserNotifications,
  saveUserNotifications
} from './data/initialData';
import { loadSavedBusinessConfig, saveBusinessConfig } from './data/businessPresets';
import { getActiveSession, clearActiveSession, isDemoAccount, mergeUsersWithLocalCache } from './data/authService';
import { formatPaymentMode } from './utils/paymentModes';
import {
  testFirestoreConnection,
  subscribeToBills,
  saveBillToFirestore,
  seedInitialBillsIfEmpty,
  subscribeToExpenses,
  saveExpenseToFirestore,
  seedInitialExpensesIfEmpty,
  subscribeToInventory,
  saveInventoryItemToFirestore,
  seedInitialInventoryIfEmpty,
  subscribeToBusinessConfig,
  saveBusinessConfigToFirestore,
  seedInitialConfigIfEmpty,
  subscribeToNotifications,
  saveNotificationToFirestore,
  seedInitialNotificationsIfEmpty,
  subscribeToUsers
} from './lib/firebase';
import { AuthView } from './components/AuthView';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { BillingView } from './components/BillingView';
import { AnalyticsView } from './components/AnalyticsView';
import { ExpensesView } from './components/ExpensesView';
import { BusinessConfigView } from './components/BusinessConfigView';
import { InvoiceModal } from './components/InvoiceModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { RemindersModal } from './components/RemindersModal';
import { AllProductsModal } from './components/AllProductsModal';
import { AutomateBillingModal } from './components/AutomateBillingModal';
import { MobileInstallModal } from './components/MobileInstallModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { InventoryAlertBanner } from './components/InventoryAlertBanner';
import { checkInventoryStock, syncInventoryNotifications } from './utils/inventorySurveillance';
import { useTheme } from './hooks/useTheme';

function computeProductsFromBills(bills: Bill[], isDemo: boolean): ProductPerformance[] {
  const itemMap = new Map<string, { quantity: number; revenue: number }>();
  for (const b of bills) {
    for (const it of b.items || []) {
      const name = (it.name || '').trim();
      if (!name) continue;
      const current = itemMap.get(name) || { quantity: 0, revenue: 0 };
      current.quantity += (it.quantity || 1);
      current.revenue += (it.quantity || 1) * (it.rate || 0);
      itemMap.set(name, current);
    }
  }

  if (itemMap.size > 0) {
    const list: ProductPerformance[] = [];
    let idx = 0;
    const icons: ('api' | 'storage' | 'support')[] = ['api', 'storage', 'support'];
    for (const [name, data] of itemMap.entries()) {
      list.push({
        id: `prod-derived-${idx}`,
        name,
        metricLabel: `${data.quantity} units invoiced`,
        revenue: data.revenue,
        iconName: icons[idx % icons.length]
      });
      idx++;
    }
    return list.sort((a, b) => b.revenue - a.revenue);
  }

  // If no invoiced items yet
  if (isDemo) {
    return INITIAL_PRODUCTS;
  }
  return [];
}

export default function App() {
  const { themeMode, setThemeMode, isDark, toggleTheme } = useTheme();
  const [session, setSession] = useState<AuthSession | null>(() => getActiveSession());
  const isDemo = isDemoAccount(session?.user);
  const targetScopeId = isDemo ? 'demo' : (session?.user?.id || 'demo');

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() =>
    loadSavedBusinessConfig(targetScopeId, session?.user)
  );
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [billingInitialType, setBillingInitialType] = useState<BillingType>('raw');
  const [currency, setCurrency] = useState<string>(() => businessConfig.currency || '$');

  // Application Data States scoped to the active workspace user
  const [bills, setBills] = useState<Bill[]>(() => loadUserBills(targetScopeId));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadUserExpenses(targetScopeId));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadUserInventory(targetScopeId));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadUserNotifications(targetScopeId, session?.user)
  );
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);
  const [cloudToast, setCloudToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showCloudToast = (message: string, type: 'success' | 'error' = 'success') => {
    setCloudToast({ message, type });
    setTimeout(() => {
      setCloudToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Synchronize state whenever active session user changes
  useEffect(() => {
    const currentScope = isDemoAccount(session?.user) ? 'demo' : (session?.user?.id || 'demo');
    const cfg = loadSavedBusinessConfig(currentScope, session?.user);
    setBusinessConfig(cfg);
    setCurrency(cfg.currency || '$');
    setBills(loadUserBills(currentScope));
    setExpenses(loadUserExpenses(currentScope));
    setInventory(loadUserInventory(currentScope));
    setNotifications(loadUserNotifications(currentScope, session?.user));
  }, [session?.user?.id]);

  // Initialize and synchronize with Firebase Firestore live cloud database
  useEffect(() => {
    let unsubscribeBills: (() => void) | undefined;
    let unsubscribeExpenses: (() => void) | undefined;
    let unsubscribeInventory: (() => void) | undefined;
    let unsubscribeConfig: (() => void) | undefined;
    let unsubscribeNotifs: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;

    async function initFirebaseSync() {
      try {
        await testFirestoreConnection();
        setIsFirebaseConnected(true);

        const currentScope = isDemoAccount(session?.user) ? 'demo' : (session?.user?.id || 'demo');

        // CRITICAL: Seed initial demo collections in Firestore ONLY if demo account!
        // Never seed mock demo bills for real registered users.
        if (isDemoAccount(session?.user)) {
          await seedInitialBillsIfEmpty(INITIAL_BILLS, 'demo');
          await seedInitialExpensesIfEmpty(INITIAL_EXPENSES, 'demo');
          await seedInitialInventoryIfEmpty(INITIAL_INVENTORY, 'demo');
          await seedInitialConfigIfEmpty(businessConfig, 'demo');
          await seedInitialNotificationsIfEmpty(INITIAL_NOTIFICATIONS, 'demo');
        }

        // Real-time Firestore listeners scoped strictly to target user/demo
        unsubscribeBills = subscribeToBills(currentScope, (remoteBills) => {
          if (remoteBills && remoteBills.length > 0) {
            setBills(remoteBills);
            saveUserBills(currentScope, remoteBills);
          } else {
            // Safety: If remote is empty, check if local storage has bills to push to cloud
            const local = loadUserBills(currentScope);
            if (local && local.length > 0) {
              console.log(`[Firebase] Syncing ${local.length} local bills to cloud...`);
              for (const b of local) {
                saveBillToFirestore(b, currentScope).catch(console.warn);
              }
            }
          }
        });

        unsubscribeExpenses = subscribeToExpenses(currentScope, (remoteExpenses) => {
          if (remoteExpenses && remoteExpenses.length > 0) {
            setExpenses(remoteExpenses);
            saveUserExpenses(currentScope, remoteExpenses);
          } else {
            const local = loadUserExpenses(currentScope);
            if (local && local.length > 0) {
              console.log(`[Firebase] Syncing ${local.length} local expenses to cloud...`);
              for (const e of local) {
                saveExpenseToFirestore(e, currentScope).catch(console.warn);
              }
            }
          }
        });

        unsubscribeInventory = subscribeToInventory(currentScope, (remoteInv) => {
          if (remoteInv && remoteInv.length > 0) {
            setInventory(remoteInv);
            saveUserInventory(currentScope, remoteInv);
          } else {
            const local = loadUserInventory(currentScope);
            if (local && local.length > 0) {
              for (const i of local) {
                saveInventoryItemToFirestore(i, currentScope).catch(console.warn);
              }
            }
          }
        });

        unsubscribeConfig = subscribeToBusinessConfig(currentScope, (remoteConfig) => {
          if (remoteConfig && remoteConfig.businessName) {
            setBusinessConfig(remoteConfig);
            saveBusinessConfig(remoteConfig, currentScope);
            if (remoteConfig.currency) {
              setCurrency(remoteConfig.currency);
            }
          }
        });

        unsubscribeNotifs = subscribeToNotifications(currentScope, (remoteNotifs) => {
          if (remoteNotifs) {
            setNotifications(remoteNotifs);
            saveUserNotifications(currentScope, remoteNotifs);
          }
        });

        unsubscribeUsers = subscribeToUsers((remoteUsers) => {
          if (remoteUsers && remoteUsers.length > 0) {
            mergeUsersWithLocalCache(remoteUsers);
          }
        });
      } catch (err) {
        console.warn('Firebase Firestore sync note:', err);
      }
    }

    initFirebaseSync();

    return () => {
      if (unsubscribeBills) unsubscribeBills();
      if (unsubscribeExpenses) unsubscribeExpenses();
      if (unsubscribeInventory) unsubscribeInventory();
      if (unsubscribeConfig) unsubscribeConfig();
      if (unsubscribeNotifs) unsubscribeNotifs();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, [session?.user?.id]);

  // Modal States
  const [activeInvoice, setActiveInvoice] = useState<Bill | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isAllProductsOpen, setIsAllProductsOpen] = useState(false);
  const [isAutomateModalOpen, setIsAutomateModalOpen] = useState(false);
  const [isMobileInstallOpen, setIsMobileInstallOpen] = useState(false);

  // Inventory Background Surveillance State
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [inventoryCheckTime, setInventoryCheckTime] = useState<string>('');
  const [isScanningInventory, setIsScanningInventory] = useState<boolean>(false);

  // Navigation helper for quick actions from Dashboard
  const handleNavigateToBilling = (type: BillingType) => {
    setBillingInitialType(type);
    setCurrentTab('billing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bill handlers
  const handleAddBill = async (newBill: Bill) => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    const billWithUser: Bill = { ...newBill, userId: currentScope };
    const updatedBills = [billWithUser, ...bills];
    setBills(updatedBills);
    saveUserBills(currentScope, updatedBills);

    try {
      await saveBillToFirestore(billWithUser, currentScope);
      showCloudToast(`Invoice ${newBill.billNumber} saved & synced to Firebase!`, 'success');
    } catch (err: any) {
      console.warn('Firestore bill save error:', err);
      showCloudToast(`Saved locally. Cloud sync: ${err?.message || 'Check connection'}`, 'error');
    }

    // Add success notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentScope,
      title: `Invoice Generated: ${newBill.billNumber}`,
      description: `${newBill.type === 'gst' ? 'GST Invoice' : 'Raw Bill'} created for ${newBill.customerName} (${newBill.currency}${newBill.total.toLocaleString()}).`,
      time: 'Just now',
      read: false,
      type: 'success'
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveUserNotifications(currentScope, updatedNotifs);
    saveNotificationToFirestore(newNotif, currentScope).catch((err) => console.warn('Firestore notif save error:', err));
  };

  const handleToggleBillStatus = async (billId: string) => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    let updatedBill: Bill | null = null;
    const updatedBills = bills.map((b) => {
      if (b.id === billId) {
        updatedBill = { ...b, status: b.status === 'paid' ? 'pending' : 'paid' };
        return updatedBill;
      }
      return b;
    });
    setBills(updatedBills);
    saveUserBills(currentScope, updatedBills);
    if (updatedBill) {
      try {
        await saveBillToFirestore(updatedBill, currentScope);
        showCloudToast(`Invoice ${(updatedBill as Bill).billNumber} marked as ${(updatedBill as Bill).status.toUpperCase()} in Firebase!`, 'success');
      } catch (err) {
        console.warn('Firestore bill status update error:', err);
      }
    }
    if (activeInvoice && activeInvoice.id === billId) {
      setActiveInvoice((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === 'paid' ? 'pending' : 'paid'
            }
          : null
      );
    }
  };

  const handleUpdateBillPaymentMode = async (billId: string, mode: PaymentMode, reference?: string) => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    let updatedBill: Bill | null = null;
    const updatedBills = bills.map((b) => {
      if (b.id === billId) {
        updatedBill = { ...b, paymentMode: mode, paymentReference: reference };
        return updatedBill;
      }
      return b;
    });
    setBills(updatedBills);
    saveUserBills(currentScope, updatedBills);
    if (updatedBill) {
      try {
        await saveBillToFirestore(updatedBill, currentScope);
        showCloudToast(`Payment mode for ${(updatedBill as Bill).billNumber} updated to ${formatPaymentMode(mode)}!`, 'success');
      } catch (err) {
        console.warn('Firestore bill payment mode update error:', err);
      }
    }
    if (activeInvoice && activeInvoice.id === billId) {
      setActiveInvoice((prev) =>
        prev
          ? {
              ...prev,
              paymentMode: mode,
              paymentReference: reference
            }
          : null
      );
    }
  };

  // Expense handlers
  const handleAddExpense = async (expData: Omit<Expense, 'id'>) => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      userId: currentScope
    };
    const updatedExpenses = [newExp, ...expenses];
    setExpenses(updatedExpenses);
    saveUserExpenses(currentScope, updatedExpenses);

    try {
      await saveExpenseToFirestore(newExp, currentScope);
      showCloudToast(`Expense "${newExp.title}" saved & synced to Firebase!`, 'success');
    } catch (err: any) {
      console.warn('Firestore expense save error:', err);
      showCloudToast(`Expense saved locally. Cloud sync: ${err?.message || 'Check connection'}`, 'error');
    }

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentScope,
      title: `New Expense Added: ${newExp.title}`,
      description: `${currency}${newExp.amount.toLocaleString()} for ${newExp.category}.`,
      time: 'Just now',
      read: false,
      type: 'info'
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveUserNotifications(currentScope, updatedNotifs);
    saveNotificationToFirestore(newNotif, currentScope).catch((err) => console.warn('Firestore notif save error:', err));
  };

  // Restock inventory item
  const handleRestockItem = async (sku: string, addQty: number) => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    let targetItemToSave: InventoryItem | null = null;
    const updatedInventory = inventory.map((item) => {
      if (item.sku === sku) {
        const updated = { ...item, currentQty: item.currentQty + addQty, userId: currentScope };
        targetItemToSave = updated;
        return updated;
      }
      return item;
    });
    setInventory(updatedInventory);
    saveUserInventory(currentScope, updatedInventory);

    if (targetItemToSave) {
      try {
        await saveInventoryItemToFirestore(targetItemToSave, currentScope);
        showCloudToast(`Restocked ${sku} (+${addQty}) and updated Firebase!`, 'success');
      } catch (err) {
        console.warn('Firestore inventory save error:', err);
      }
    }

    const item = inventory.find((i) => i.sku === sku);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentScope,
      title: `Restocked ${item?.name || sku}`,
      description: `Added ${addQty} units. Total on hand: ${(item?.currentQty || 0) + addQty}.`,
      time: 'Just now',
      read: false,
      type: 'success'
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveUserNotifications(currentScope, updatedNotifs);
    saveNotificationToFirestore(newNotif, currentScope).catch((err) => console.warn('Firestore notif save error:', err));
  };

  // Force sync all records across collections to Firestore
  const handleForceSyncAll = async (): Promise<{ success: boolean; count: number }> => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    let count = 0;
    try {
      for (const bill of bills) {
        await saveBillToFirestore(bill, currentScope);
        count++;
      }
      for (const exp of expenses) {
        await saveExpenseToFirestore(exp, currentScope);
        count++;
      }
      for (const item of inventory) {
        await saveInventoryItemToFirestore(item, currentScope);
        count++;
      }
      if (businessConfig) {
        await saveBusinessConfigToFirestore(businessConfig, currentScope);
        count++;
      }
      showCloudToast(`Successfully verified & synced ${count} items with Cloud Firestore!`, 'success');
      return { success: true, count };
    } catch (err: any) {
      console.error('Force sync error:', err);
      showCloudToast(`Cloud sync error: ${err?.message || 'Failed to sync'}`, 'error');
      return { success: false, count };
    }
  };

  // Notification handlers
  const handleMarkNotificationRead = (id: string) => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    const updated = notifications.map((n) => {
      if (n.id === id) {
        const marked = { ...n, read: true };
        saveNotificationToFirestore(marked, currentScope).catch((err) => console.warn('Firestore notif update error:', err));
        return marked;
      }
      return n;
    });
    setNotifications(updated);
    saveUserNotifications(currentScope, updated);
  };

  const handleClearAllNotifications = () => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveUserNotifications(currentScope, updated);
  };

  const handleTriggerCustomNotification = (title: string, desc: string) => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentScope,
      title,
      description: desc,
      time: 'Just now',
      read: false,
      type: 'info'
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveUserNotifications(currentScope, updated);
    saveNotificationToFirestore(newNotif, currentScope).catch((err) => console.warn('Firestore notif save error:', err));
  };

  // Inventory Background Surveillance Evaluation
  const runInventoryEvaluation = (
    currentInventory: InventoryItem[],
    config: BusinessConfig,
    showToast = false
  ) => {
    if (config.enableInventoryBackgroundCheck === false) {
      setLowStockItems([]);
      return;
    }

    const threshold = config.lowStockThreshold || 10;
    const result = checkInventoryStock(currentInventory, threshold);

    setLowStockItems(result.lowStockItems);
    setInventoryCheckTime(result.checkedAt);

    if (result.hasAlert) {
      const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
      const { updatedNotifications, newAlertsAdded } = syncInventoryNotifications(
        result.lowStockItems,
        notifications,
        threshold,
        currentScope
      );

      if (newAlertsAdded.length > 0) {
        setNotifications(updatedNotifications);
        saveUserNotifications(currentScope, updatedNotifications);
        for (const alert of newAlertsAdded) {
          saveNotificationToFirestore(alert, currentScope).catch((err) =>
            console.warn('Firestore inventory alert save error:', err)
          );
        }
      }
    }

    if (showToast) {
      if (result.hasAlert) {
        showCloudToast(`Surveillance alert: ${result.lowStockItems.length} item(s) below ${threshold} units!`, 'error');
      } else {
        showCloudToast(`Surveillance check: All items above threshold (${threshold} units)!`, 'success');
      }
    }
  };

  // Periodic background check on the inventory list
  useEffect(() => {
    if (!session) return;

    // Run check immediately on inventory or threshold change
    runInventoryEvaluation(inventory, businessConfig, false);

    const intervalSeconds = Math.max(10, businessConfig.inventoryCheckIntervalSeconds || 30);
    const intervalId = setInterval(() => {
      runInventoryEvaluation(inventory, businessConfig, false);
    }, intervalSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [
    inventory,
    businessConfig.lowStockThreshold,
    businessConfig.enableInventoryBackgroundCheck,
    businessConfig.inventoryCheckIntervalSeconds,
    session?.user?.id
  ]);

  const handleRunInventoryCheckNow = () => {
    setIsScanningInventory(true);
    setTimeout(() => {
      runInventoryEvaluation(inventory, businessConfig, true);
      setIsScanningInventory(false);
    }, 450);
  };

  const handleUpdateInventoryThreshold = async (newThreshold: number) => {
    const updatedConfig: BusinessConfig = {
      ...businessConfig,
      lowStockThreshold: newThreshold
    };
    setBusinessConfig(updatedConfig);
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    saveBusinessConfig(updatedConfig, currentScope);
    try {
      await saveBusinessConfigToFirestore(updatedConfig, currentScope);
      showCloudToast(`Threshold updated to ${newThreshold} units!`, 'success');
    } catch (err) {
      console.warn('Failed to save config threshold:', err);
    }
    runInventoryEvaluation(inventory, updatedConfig, true);
  };

  const handleAdjustInventoryQty = async (sku: string, delta: number) => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    let targetItemToSave: InventoryItem | null = null;
    const updatedInventory = inventory.map((item) => {
      if (item.sku === sku) {
        const nextQty = Math.max(0, item.currentQty + delta);
        const updated = { ...item, currentQty: nextQty, userId: currentScope };
        targetItemToSave = updated;
        return updated;
      }
      return item;
    });

    setInventory(updatedInventory);
    saveUserInventory(currentScope, updatedInventory);

    if (targetItemToSave) {
      try {
        await saveInventoryItemToFirestore(targetItemToSave, currentScope);
      } catch (err) {
        console.warn('Firestore inventory adjust error:', err);
      }
    }
  };

  const handleCurrencyToggle = () => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    setCurrency((prev) => {
      const next = prev === '$' ? '₹' : prev === '₹' ? '€' : prev === '€' ? '£' : '$';
      const updated = { ...businessConfig, currency: next, userId: currentScope };
      setBusinessConfig(updated);
      saveBusinessConfig(updated, currentScope);
      saveBusinessConfigToFirestore(updated, currentScope).catch((err) => console.warn('Firestore config save error:', err));
      return next;
    });
  };

  const handleSaveBusinessConfig = (newConfig: BusinessConfig) => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    const configWithUser = { ...newConfig, userId: currentScope };
    setBusinessConfig(configWithUser);
    saveBusinessConfig(configWithUser, currentScope);
    saveBusinessConfigToFirestore(configWithUser, currentScope).catch((err) => console.warn('Firestore config save error:', err));
    setCurrency(newConfig.currency);
    handleTriggerCustomNotification(
      'Business Profile Saved (Synced with Firebase)',
      `${newConfig.businessName} configuration saved to Google Cloud Firestore.`
    );
  };

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    setCurrentTab('dashboard');
    const userIsDemo = isDemoAccount(newSession.user);
    const scope = userIsDemo ? 'demo' : newSession.user.id;
    const userConfig = loadSavedBusinessConfig(scope, newSession.user);
    setBusinessConfig(userConfig);
    setCurrency(userConfig.currency || '$');
    setBills(loadUserBills(scope));
    setExpenses(loadUserExpenses(scope));
    setInventory(loadUserInventory(scope));
    setNotifications(loadUserNotifications(scope, newSession.user));

    handleTriggerCustomNotification(
      `Welcome, ${newSession.user.name}!`,
      `Signed in to workspace for ${newSession.user.businessName} as ${newSession.user.role}.`
    );
  };

  const handleLogout = () => {
    clearActiveSession();
    setSession(null);
  };

  const handleResetData = () => {
    const currentScope = isDemo ? 'demo' : (session?.user?.id || 'demo');
    if (isDemo) {
      setBills(INITIAL_BILLS);
      setExpenses(INITIAL_EXPENSES);
      setInventory(INITIAL_INVENTORY);
      setNotifications(INITIAL_NOTIFICATIONS);
      saveUserBills('demo', INITIAL_BILLS);
      saveUserExpenses('demo', INITIAL_EXPENSES);
      saveUserInventory('demo', INITIAL_INVENTORY);
      saveUserNotifications('demo', INITIAL_NOTIFICATIONS);
    } else {
      setBills([]);
      setExpenses([]);
      setInventory([]);
      const notifs = loadUserNotifications(currentScope, session?.user);
      setNotifications(notifs);
      saveUserBills(currentScope, []);
      saveUserExpenses(currentScope, []);
      saveUserInventory(currentScope, []);
      saveUserNotifications(currentScope, notifs);
    }
  };

  // If not authenticated, render the dedicated Registration & Login page
  if (!session) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        config={businessConfig}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const userProducts = computeProductsFromBills(bills, isDemo);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex flex-col antialiased relative selection:bg-blue-600 selection:text-white transition-colors duration-200 overflow-x-hidden w-full">
      {/* Subtle Dot Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 artistic-grid z-0" 
      />
      {/* Ambient soft background glows */}
      <div className="fixed -right-24 -top-24 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed -left-24 bottom-12 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Top App Bar Header */}
      <TopAppBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearAllNotifications={handleClearAllNotifications}
        currency={currency}
        onCurrencyToggle={handleCurrencyToggle}
        config={businessConfig}
        currentUser={session.user}
        onLogout={handleLogout}
        firebaseConnected={isFirebaseConnected}
        onOpenMobileInstall={() => setIsMobileInstallOpen(true)}
        onOpenCloudSyncModal={() => setIsCloudSyncOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Screen Content */}
      <main className="relative z-10 flex-1 w-full min-w-0 max-w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-3 sm:px-6 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] sm:pt-24 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
        {/* Persistent UI Notification for Inventory Low-Stock Background Surveillance */}
        <InventoryAlertBanner
          lowStockItems={lowStockItems}
          userThreshold={businessConfig.lowStockThreshold || 10}
          lastCheckedTime={inventoryCheckTime}
          isScanning={isScanningInventory}
          onRunCheckNow={handleRunInventoryCheckNow}
          onUpdateThreshold={handleUpdateInventoryThreshold}
          onOpenRestock={(sku) => {
            setCurrentTab('expenses');
            handleRestockItem(sku, 10);
          }}
          onNavigateToInventory={() => setCurrentTab('expenses')}
        />

        <AnimatePresence mode="wait">
          {currentTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DashboardView
                onNavigateToBilling={handleNavigateToBilling}
                onOpenReminders={() => setIsRemindersOpen(true)}
                onOpenAllProducts={() => setIsAllProductsOpen(true)}
                onOpenAutomateModal={() => setIsAutomateModalOpen(true)}
                currency={currency}
                bills={bills}
                products={userProducts}
              />
            </motion.div>
          )}

          {currentTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <BillingView
                initialType={billingInitialType}
                bills={bills}
                onAddBill={handleAddBill}
                onOpenInvoiceModal={(bill) => setActiveInvoice(bill)}
                currency={currency}
                config={businessConfig}
              />
            </motion.div>
          )}

          {currentTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <AnalyticsView currency={currency} />
            </motion.div>
          )}

          {currentTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ExpensesView
                expenses={expenses}
                inventory={inventory}
                currency={currency}
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                onRestockItem={handleRestockItem}
                userThreshold={businessConfig.lowStockThreshold || 10}
                onUpdateThreshold={handleUpdateInventoryThreshold}
                onAdjustQty={handleAdjustInventoryQty}
                onRunCheckNow={handleRunInventoryCheckNow}
                lastCheckedTime={inventoryCheckTime}
                isScanning={isScanningInventory}
              />
            </motion.div>
          )}

          {currentTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <BusinessConfigView
                config={businessConfig}
                onSaveConfig={handleSaveBusinessConfig}
                onResetData={handleResetData}
                currentUser={session.user}
                onLogout={handleLogout}
                onOpenMobileInstall={() => setIsMobileInstallOpen(true)}
                themeMode={themeMode}
                onSetThemeMode={setThemeMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNavBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <InvoiceModal
        bill={activeInvoice}
        onClose={() => setActiveInvoice(null)}
        onToggleStatus={handleToggleBillStatus}
        onUpdatePaymentMode={handleUpdateBillPaymentMode}
        config={businessConfig}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        currency={currency}
      />

      <RemindersModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        bills={bills}
        onTriggerNotification={handleTriggerCustomNotification}
      />

      <AllProductsModal
        isOpen={isAllProductsOpen}
        onClose={() => setIsAllProductsOpen(false)}
        products={userProducts}
        currency={currency}
      />

      <AutomateBillingModal
        isOpen={isAutomateModalOpen}
        onClose={() => setIsAutomateModalOpen(false)}
        onConfirm={() =>
          handleTriggerCustomNotification(
            'Billing Automation Enabled',
            'Recurring invoices will now be scheduled automatically on the 1st of every month.'
          )
        }
      />

      <MobileInstallModal
        isOpen={isMobileInstallOpen}
        onClose={() => setIsMobileInstallOpen(false)}
      />

      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        userId={isDemo ? 'demo' : (session?.user?.id || 'demo')}
        currentUser={session.user}
        firebaseConnected={isFirebaseConnected}
        onForceSyncAll={handleForceSyncAll}
      />

      {/* Cloud Sync Floating Toast */}
      <AnimatePresence>
        {cloudToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className={`fixed bottom-20 md:bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 backdrop-blur-md ${
              cloudToast.type === 'success'
                ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/90 border-red-500/40 text-red-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cloudToast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
            <span>{cloudToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
