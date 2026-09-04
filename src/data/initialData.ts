import { Bill, Expense, InventoryItem, ProductPerformance, NotificationItem } from '../types';

export const INITIAL_BILLS: Bill[] = [
  {
    id: 'b-084',
    userId: 'demo',
    billNumber: 'INV-2023-084',
    customerName: 'Acme Corp',
    phoneNumber: '+91 98765 43210',
    type: 'gst',
    date: '2026-09-01',
    dueDate: '2026-09-15',
    items: [
      { id: 'i-1', name: 'Premium Consulting Services', quantity: 2, rate: 1800.85 },
      { id: 'i-2', name: 'Cloud Architecture Review', quantity: 1, rate: 648.30 }
    ],
    subtotal: 4250.00,
    taxRate: 18,
    taxAmount: 765.00,
    total: 4250.00,
    currency: '₹',
    delivery: { sms: false, whatsapp: true, email: true },
    status: 'paid',
    paymentMode: 'UPI/QR',
    paymentReference: 'UPI-REF-982341'
  },
  {
    id: 'b-083',
    userId: 'demo',
    billNumber: 'INV-2023-083',
    customerName: 'Stark Ind.',
    phoneNumber: '+91 98111 22334',
    type: 'gst',
    date: '2026-08-20',
    dueDate: '2026-08-30',
    items: [
      { id: 'i-3', name: 'Enterprise SaaS Annual License', quantity: 1, rate: 12000.00 }
    ],
    subtotal: 12000.00,
    taxRate: 18,
    taxAmount: 2160.00,
    total: 12000.00,
    currency: '₹',
    delivery: { sms: true, whatsapp: true, email: false },
    status: 'pending',
    paymentMode: 'net_banking',
    paymentReference: 'NEFT-PENDING'
  },
  {
    id: 'b-042',
    userId: 'demo',
    billNumber: 'RAW-2023-042',
    customerName: 'Walk-in',
    phoneNumber: '+91 99000 11223',
    type: 'raw',
    date: '2026-09-02',
    dueDate: '2026-09-02',
    items: [
      { id: 'i-4', name: 'Hardware Diagnostic Check', quantity: 1, rate: 850.00 }
    ],
    subtotal: 850.00,
    taxRate: 0,
    taxAmount: 0,
    total: 850.00,
    currency: '₹',
    delivery: { sms: false, whatsapp: false, email: true },
    status: 'paid',
    paymentMode: 'cash',
    paymentReference: 'Counter Cash #12'
  }
];

export const INITIAL_PRODUCTS: ProductPerformance[] = [
  {
    id: 'prod-1',
    name: 'API Access (Pro)',
    metricLabel: '124 Subscriptions',
    revenue: 12400,
    iconName: 'api'
  },
  {
    id: 'prod-2',
    name: 'Enterprise Storage',
    metricLabel: '86 Units',
    revenue: 8600,
    iconName: 'storage'
  },
  {
    id: 'prod-3',
    name: 'Premium Support',
    metricLabel: '42 Contracts',
    revenue: 4200,
    iconName: 'support'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    userId: 'demo',
    title: 'Cloud Infrastructure',
    category: 'AWS, GCP',
    amount: 142000,
    date: '2026-08-28',
    vendor: 'Amazon Web Services / Google Cloud',
    paymentMode: 'card',
    paymentReference: 'Corp Amex *4012'
  },
  {
    id: 'exp-2',
    userId: 'demo',
    title: 'Contractors',
    category: 'Engineering',
    amount: 85500,
    date: '2026-08-25',
    vendor: 'Toptal & Upwork',
    paymentMode: 'bank_transfer',
    paymentReference: 'WIRE-89218'
  },
  {
    id: 'exp-3',
    userId: 'demo',
    title: 'Marketing Spend',
    category: 'AdWords, LinkedIn',
    amount: 64200,
    date: '2026-08-22',
    vendor: 'Google Ads & LinkedIn Business',
    paymentMode: 'card',
    paymentReference: 'Corp Visa *8821'
  },
  {
    id: 'exp-4',
    userId: 'demo',
    title: 'Office Lease',
    category: 'HQ San Francisco',
    amount: 45000,
    date: '2026-08-01',
    vendor: 'SOMA Properties LLC',
    paymentMode: 'net_banking',
    paymentReference: 'ACH Auto-debit'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    userId: 'demo',
    name: 'Server Rack Type A',
    sku: 'SRA-1024',
    currentQty: 4,
    reorderPt: 10,
    unitPrice: 1250,
    category: 'Hardware',
    status: 'critical'
  },
  {
    id: 'inv-2',
    userId: 'demo',
    name: 'Switch 48-Port Pro',
    sku: 'SWP-4800',
    currentQty: 12,
    reorderPt: 15,
    unitPrice: 850,
    category: 'Networking',
    status: 'warning'
  },
  {
    id: 'inv-3',
    userId: 'demo',
    name: 'Optic Cable 10G (Box)',
    sku: 'CAB-10G-B',
    currentQty: 2,
    reorderPt: 20,
    unitPrice: 140,
    category: 'Cabling',
    status: 'critical'
  },
  {
    id: 'inv-4',
    userId: 'demo',
    name: 'Cat6 Ethernet Spool (1000ft)',
    sku: 'ETH-1000-C6',
    currentQty: 32,
    reorderPt: 15,
    unitPrice: 95,
    category: 'Cabling',
    status: 'normal'
  },
  {
    id: 'inv-5',
    userId: 'demo',
    name: 'PCI-e NVMe SSD 4TB',
    sku: 'SSD-4TB-PRO',
    currentQty: 18,
    reorderPt: 8,
    unitPrice: 280,
    category: 'Storage',
    status: 'normal'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'demo',
    title: '3 Overdue Invoices',
    description: 'INV-2023-083 ($12,000) and 2 others are past payment terms.',
    time: '10m ago',
    read: false,
    type: 'alert'
  },
  {
    id: 'notif-2',
    userId: 'demo',
    title: 'Low Stock Alert: SRA-1024',
    description: 'Server Rack Type A has reached 4 units (reorder threshold: 10).',
    time: '1h ago',
    read: false,
    type: 'alert'
  },
  {
    id: 'notif-3',
    userId: 'demo',
    title: 'Payment Received: Acme Corp',
    description: '₹4,250.00 settled via Credit Card.',
    time: '2h ago',
    read: true,
    type: 'success'
  }
];

export function createWelcomeNotification(user: { id: string; name: string; businessName?: string }): NotificationItem {
  return {
    id: `notif-welcome-${user.id}`,
    userId: user.id,
    title: `Welcome to RevenueFlow, ${user.name}!`,
    description: `Your live business workspace for ${user.businessName || 'your company'} is initialized. Create your first invoice or record expenses to begin.`,
    time: 'Just now',
    read: false,
    type: 'success'
  };
}

// User-scoped Local Storage helpers
export function loadUserBills(userId?: string): Bill[] {
  if (!userId || userId === 'demo') {
    const saved = localStorage.getItem('revenueflow_bills_demo');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_BILLS;
  }
  const saved = localStorage.getItem(`revenueflow_bills_${userId}`);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  // Newly registered users start with 0 bills!
  return [];
}

export function saveUserBills(userId: string | undefined, bills: Bill[]): void {
  const key = userId ? `revenueflow_bills_${userId}` : 'revenueflow_bills_demo';
  try {
    localStorage.setItem(key, JSON.stringify(bills));
  } catch (err) {
    console.warn('Failed to save bills to localStorage:', err);
  }
}

export function loadUserExpenses(userId?: string): Expense[] {
  if (!userId || userId === 'demo') {
    const saved = localStorage.getItem('revenueflow_expenses_demo');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_EXPENSES;
  }
  const saved = localStorage.getItem(`revenueflow_expenses_${userId}`);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  // Newly registered users start with 0 expenses!
  return [];
}

export function saveUserExpenses(userId: string | undefined, expenses: Expense[]): void {
  const key = userId ? `revenueflow_expenses_${userId}` : 'revenueflow_expenses_demo';
  try {
    localStorage.setItem(key, JSON.stringify(expenses));
  } catch (err) {
    console.warn('Failed to save expenses to localStorage:', err);
  }
}

export function loadUserInventory(userId?: string): InventoryItem[] {
  if (!userId || userId === 'demo') {
    const saved = localStorage.getItem('revenueflow_inventory_demo');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_INVENTORY;
  }
  const saved = localStorage.getItem(`revenueflow_inventory_${userId}`);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  // Newly registered users start with empty catalog/inventory
  return [];
}

export function saveUserInventory(userId: string | undefined, items: InventoryItem[]): void {
  const key = userId ? `revenueflow_inventory_${userId}` : 'revenueflow_inventory_demo';
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save inventory to localStorage:', err);
  }
}

export function loadUserNotifications(
  userId?: string,
  user?: { id: string; name: string; businessName?: string }
): NotificationItem[] {
  if (!userId || userId === 'demo') {
    const saved = localStorage.getItem('revenueflow_notifications_demo');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_NOTIFICATIONS;
  }
  const saved = localStorage.getItem(`revenueflow_notifications_${userId}`);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  // Real registered users receive their personalized welcome notification
  return user ? [createWelcomeNotification(user)] : [];
}

export function saveUserNotifications(userId: string | undefined, items: NotificationItem[]): void {
  const key = userId ? `revenueflow_notifications_${userId}` : 'revenueflow_notifications_demo';
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save notifications to localStorage:', err);
  }
}
