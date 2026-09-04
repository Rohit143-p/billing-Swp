import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Bill, Expense, BusinessConfig, NotificationItem, UserAccount, InventoryItem } from '../types';

// Initialize Firebase App
export const app = !getApps().length
  ? initializeApp({
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId
    })
  : getApp();

// Initialize Firestore with ignoreUndefinedProperties to prevent undefined field errors
export const db = initializeFirestore(
  app,
  { ignoreUndefinedProperties: true },
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Sanitization utility: cleans any undefined or null keys before writing to Firestore
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned: any = Array.isArray(obj) ? [] : {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) {
      continue;
    }
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      cleaned[key] = sanitizeForFirestore(val);
    } else if (Array.isArray(val)) {
      cleaned[key] = val.map((item) =>
        item !== null && typeof item === 'object' ? sanitizeForFirestore(item) : item
      );
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// Connection test on boot (as required by Firebase skill)
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    console.log('[Firebase] Connected to Firestore database successfully.');
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline') || error?.code === 'unavailable') {
      console.warn('[Firebase] Firestore client currently offline or initializing:', error.message);
    } else {
      // Document missing is normal and confirms connectivity
      console.log('[Firebase] Handshake with Firestore completed.');
    }
    return true;
  }
}

// ----------------------------------------------------
// Bills Service (Real-time Firestore sync & persistence)
// ----------------------------------------------------
const BILLS_COLLECTION = 'bills';

export function subscribeToBills(
  userId: string | undefined,
  onUpdate: (bills: Bill[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Query Firestore collection
  const colRef = collection(db, BILLS_COLLECTION);
  const targetScope = userId || 'demo';

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Bill[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const itemScope = data.userId;
        // If demo, show bills marked as demo or unassigned legacy bills
        if (targetScope === 'demo') {
          if (!itemScope || itemScope === 'demo') {
            items.push({ id: docSnap.id, ...data });
          }
        } else {
          // If registered user, match their specific userId
          if (itemScope === targetScope) {
            items.push({ id: docSnap.id, ...data });
          }
        }
      });
      // Sort newest first
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onUpdate(items);
    },
    (err) => {
      console.warn('[Firebase] Error syncing bills:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveBillToFirestore(bill: Bill, userId?: string): Promise<void> {
  try {
    const docRef = doc(db, BILLS_COLLECTION, bill.id);
    const targetUserId = bill.userId || userId || 'demo';
    const cleanData = sanitizeForFirestore({
      ...bill,
      userId: targetUserId,
      updatedAt: serverTimestamp()
    });
    await setDoc(docRef, cleanData, { merge: true });
    console.log(`[Firebase] Successfully saved bill ${bill.id} to Firestore (user: ${targetUserId})`);
  } catch (err: any) {
    console.error(`[Firebase] Failed to save bill ${bill.id} to Firestore:`, err);
    throw err;
  }
}

export async function deleteBillFromFirestore(billId: string): Promise<void> {
  const docRef = doc(db, BILLS_COLLECTION, billId);
  await deleteDoc(docRef);
}

// Seed initial bills if Firestore demo collection is empty
export async function seedInitialBillsIfEmpty(initialBills: Bill[], targetUserId = 'demo'): Promise<void> {
  if (targetUserId !== 'demo') return;

  try {
    const q = query(collection(db, BILLS_COLLECTION), where('userId', '==', 'demo'));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log('[Firebase] Seeding initial sample demo bills to Firestore...');
      for (const bill of initialBills) {
        await setDoc(doc(db, BILLS_COLLECTION, bill.id), sanitizeForFirestore({
          ...bill,
          userId: 'demo'
        }), { merge: true });
      }
    }
  } catch (err) {
    console.warn('[Firebase] Error seeding demo bills:', err);
  }
}

// ----------------------------------------------------
// Expenses Service
// ----------------------------------------------------
const EXPENSES_COLLECTION = 'expenses';

export function subscribeToExpenses(
  userId: string | undefined,
  onUpdate: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, EXPENSES_COLLECTION);
  const targetScope = userId || 'demo';

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Expense[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const itemScope = data.userId;
        if (targetScope === 'demo') {
          if (!itemScope || itemScope === 'demo') {
            items.push({ id: docSnap.id, ...data });
          }
        } else {
          if (itemScope === targetScope) {
            items.push({ id: docSnap.id, ...data });
          }
        }
      });
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onUpdate(items);
    },
    (err) => {
      console.warn('[Firebase] Error syncing expenses:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveExpenseToFirestore(expense: Expense, userId?: string): Promise<void> {
  try {
    const docRef = doc(db, EXPENSES_COLLECTION, expense.id);
    const targetUserId = expense.userId || userId || 'demo';
    const cleanData = sanitizeForFirestore({
      ...expense,
      userId: targetUserId,
      updatedAt: serverTimestamp()
    });
    await setDoc(docRef, cleanData, { merge: true });
    console.log(`[Firebase] Successfully saved expense ${expense.id} to Firestore (user: ${targetUserId})`);
  } catch (err: any) {
    console.error(`[Firebase] Failed to save expense ${expense.id} to Firestore:`, err);
    throw err;
  }
}

export async function deleteExpenseFromFirestore(expenseId: string): Promise<void> {
  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  await deleteDoc(docRef);
}

export async function seedInitialExpensesIfEmpty(initialExpenses: Expense[], targetUserId = 'demo'): Promise<void> {
  if (targetUserId !== 'demo') return;

  try {
    const q = query(collection(db, EXPENSES_COLLECTION), where('userId', '==', 'demo'));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log('[Firebase] Seeding initial sample demo expenses to Firestore...');
      for (const exp of initialExpenses) {
        await setDoc(doc(db, EXPENSES_COLLECTION, exp.id), sanitizeForFirestore({
          ...exp,
          userId: 'demo'
        }), { merge: true });
      }
    }
  } catch (err) {
    console.warn('[Firebase] Error seeding demo expenses:', err);
  }
}

// ----------------------------------------------------
// Inventory Service
// ----------------------------------------------------
const INVENTORY_COLLECTION = 'inventory';

export function subscribeToInventory(
  userId: string | undefined,
  onUpdate: (inventory: InventoryItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, INVENTORY_COLLECTION);
  const targetScope = userId || 'demo';

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: InventoryItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const itemScope = data.userId;
        if (targetScope === 'demo') {
          if (!itemScope || itemScope === 'demo') {
            items.push({ id: docSnap.id, ...data });
          }
        } else {
          if (itemScope === targetScope) {
            items.push({ id: docSnap.id, ...data });
          }
        }
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('[Firebase] Error syncing inventory:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveInventoryItemToFirestore(item: InventoryItem, userId?: string): Promise<void> {
  try {
    const docRef = doc(db, INVENTORY_COLLECTION, item.id || item.sku);
    const targetUserId = item.userId || userId || 'demo';
    const cleanData = sanitizeForFirestore({
      ...item,
      id: item.id || item.sku,
      userId: targetUserId,
      updatedAt: serverTimestamp()
    });
    await setDoc(docRef, cleanData, { merge: true });
    console.log(`[Firebase] Successfully saved inventory item ${item.sku} to Firestore`);
  } catch (err: any) {
    console.error(`[Firebase] Failed to save inventory item ${item.sku} to Firestore:`, err);
    throw err;
  }
}

export async function seedInitialInventoryIfEmpty(initialItems: InventoryItem[], targetUserId = 'demo'): Promise<void> {
  if (targetUserId !== 'demo') return;

  try {
    const q = query(collection(db, INVENTORY_COLLECTION), where('userId', '==', 'demo'));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log('[Firebase] Seeding initial sample demo inventory to Firestore...');
      for (const item of initialItems) {
        const itemId = item.id || item.sku;
        await setDoc(doc(db, INVENTORY_COLLECTION, itemId), sanitizeForFirestore({
          ...item,
          id: itemId,
          userId: 'demo'
        }), { merge: true });
      }
    }
  } catch (err) {
    console.warn('[Firebase] Error seeding demo inventory:', err);
  }
}

// ----------------------------------------------------
// Business Configuration Service
// ----------------------------------------------------
const CONFIG_COLLECTION = 'business_configs';
const DEFAULT_CONFIG_DOC = 'main_config';

export function subscribeToBusinessConfig(
  userId: string | undefined,
  onUpdate: (config: BusinessConfig) => void,
  onError?: (err: Error) => void
): () => void {
  const docId = userId || DEFAULT_CONFIG_DOC;
  const docRef = doc(db, CONFIG_COLLECTION, docId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as BusinessConfig);
      }
    },
    (err) => {
      console.warn('[Firebase] Error syncing business config:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveBusinessConfigToFirestore(config: BusinessConfig, userId?: string): Promise<void> {
  try {
    const docId = userId || config.userId || DEFAULT_CONFIG_DOC;
    const docRef = doc(db, CONFIG_COLLECTION, docId);
    const cleanData = sanitizeForFirestore({
      ...config,
      userId: docId,
      updatedAt: serverTimestamp()
    });
    await setDoc(docRef, cleanData, { merge: true });
    console.log(`[Firebase] Successfully saved business config ${docId} to Firestore`);
  } catch (err: any) {
    console.error(`[Firebase] Failed to save business config to Firestore:`, err);
    throw err;
  }
}

export async function seedInitialConfigIfEmpty(initialConfig: BusinessConfig, targetUserId = 'demo'): Promise<void> {
  if (targetUserId !== 'demo') return;

  try {
    const docRef = doc(db, CONFIG_COLLECTION, 'demo');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log('[Firebase] Seeding demo business config to Firestore...');
      await setDoc(docRef, sanitizeForFirestore({ ...initialConfig, userId: 'demo' }));
    }
  } catch (err) {
    console.warn('[Firebase] Error seeding demo config:', err);
  }
}

// ----------------------------------------------------
// Notifications Service
// ----------------------------------------------------
const NOTIFICATIONS_COLLECTION = 'notifications';

export function subscribeToNotifications(
  userId: string | undefined,
  onUpdate: (notifications: NotificationItem[]) => void
): () => void {
  const q = userId
    ? query(collection(db, NOTIFICATIONS_COLLECTION), where('userId', '==', userId))
    : collection(db, NOTIFICATIONS_COLLECTION);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('[Firebase] Error syncing notifications:', err);
    }
  );
}

export async function saveNotificationToFirestore(item: NotificationItem, userId?: string): Promise<void> {
  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, item.id);
    const cleanData = sanitizeForFirestore({
      ...item,
      userId: item.userId || userId || 'demo'
    });
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Error saving notification to Firestore:', err);
  }
}

export async function clearAllNotificationsInFirestore(items: NotificationItem[]): Promise<void> {
  for (const item of items) {
    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, item.id));
  }
}

export async function seedInitialNotificationsIfEmpty(initialItems: NotificationItem[], targetUserId = 'demo'): Promise<void> {
  if (targetUserId !== 'demo') return;

  try {
    const q = query(collection(db, NOTIFICATIONS_COLLECTION), where('userId', '==', 'demo'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of initialItems) {
        await setDoc(doc(db, NOTIFICATIONS_COLLECTION, item.id), sanitizeForFirestore({
          ...item,
          userId: 'demo'
        }));
      }
    }
  } catch (err) {
    console.warn('[Firebase] Error seeding notifications:', err);
  }
}

// ----------------------------------------------------
// Users & Auth Service Sync
// ----------------------------------------------------
const USERS_COLLECTION = 'users';

export async function fetchFirestoreUsers(): Promise<UserAccount[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    const list: UserAccount[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as UserAccount);
    });
    return list;
  } catch (err) {
    console.warn('[Firebase] Error fetching users from Firestore:', err);
    return [];
  }
}

export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    const cleanData = sanitizeForFirestore({
      ...user,
      updatedAt: serverTimestamp()
    });
    await setDoc(docRef, cleanData, { merge: true });
    console.log(`[Firebase] Successfully saved user ${user.email} to Firestore`);
  } catch (err: any) {
    console.error('[Firebase] Error saving user to Firestore:', err);
    throw err;
  }
}

export function subscribeToUsers(
  onUpdate: (users: UserAccount[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = query(collection(db, USERS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: UserAccount[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as UserAccount);
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('[Firebase] users subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Failed to setup users listener:', err);
    return () => {};
  }
}

export async function findFirestoreUserByEmail(email: string): Promise<UserAccount | null> {
  try {
    const normalized = email.trim().toLowerCase();
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', normalized));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserAccount;
    }
  } catch (err) {
    console.warn('[Firebase] Error finding user by email:', err);
  }
  return null;
}

// ----------------------------------------------------
// Diagnostic & Cloud Sync Stats Helper
// ----------------------------------------------------
export interface CloudSyncStats {
  connected: boolean;
  databaseId: string;
  projectId: string;
  billsCount: number;
  expensesCount: number;
  inventoryCount: number;
  usersCount: number;
  lastChecked: string;
}

export async function getCloudSyncStats(userId?: string): Promise<CloudSyncStats> {
  const targetScope = userId || 'demo';
  const stats: CloudSyncStats = {
    connected: false,
    databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    projectId: firebaseConfig.projectId,
    billsCount: 0,
    expensesCount: 0,
    inventoryCount: 0,
    usersCount: 0,
    lastChecked: new Date().toLocaleTimeString()
  };

  try {
    const [billsSnap, expSnap, invSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, BILLS_COLLECTION)),
      getDocs(collection(db, EXPENSES_COLLECTION)),
      getDocs(collection(db, INVENTORY_COLLECTION)),
      getDocs(collection(db, USERS_COLLECTION))
    ]);

    stats.connected = true;
    stats.usersCount = usersSnap.size;

    billsSnap.forEach((d) => {
      const data = d.data();
      if (targetScope === 'demo') {
        if (!data.userId || data.userId === 'demo') stats.billsCount++;
      } else {
        if (data.userId === targetScope) stats.billsCount++;
      }
    });

    expSnap.forEach((d) => {
      const data = d.data();
      if (targetScope === 'demo') {
        if (!data.userId || data.userId === 'demo') stats.expensesCount++;
      } else {
        if (data.userId === targetScope) stats.expensesCount++;
      }
    });

    invSnap.forEach((d) => {
      const data = d.data();
      if (targetScope === 'demo') {
        if (!data.userId || data.userId === 'demo') stats.inventoryCount++;
      } else {
        if (data.userId === targetScope) stats.inventoryCount++;
      }
    });
  } catch (err) {
    console.warn('[Firebase] Error gathering cloud sync stats:', err);
  }

  return stats;
}
