export type TabType = 'dashboard' | 'billing' | 'analytics' | 'expenses' | 'menu';

export type ThemeMode = 'light' | 'dark' | 'system';

export type BillingType = 'raw' | 'gst';

export type PaymentMode =
  | 'UPI/QR'
  | 'cash'
  | 'upi'
  | 'card'
  | 'net_banking'
  | 'bank_transfer'
  | 'cheque'
  | 'other';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
}

export interface Bill {
  id: string;
  userId?: string;
  billNumber: string;
  customerName: string;
  phoneNumber: string;
  type: BillingType;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  delivery: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  status: 'paid' | 'pending' | 'overdue';
  paymentMode?: PaymentMode;
  paymentReference?: string;
}

export interface Expense {
  id: string;
  userId?: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  vendor?: string;
  note?: string;
  paymentMode?: PaymentMode;
  paymentReference?: string;
}

export interface InventoryItem {
  id: string;
  userId?: string;
  name: string;
  sku: string;
  currentQty: number;
  reorderPt: number;
  unitPrice: number;
  category: string;
  status?: 'critical' | 'warning' | 'normal';
}

export interface ProductPerformance {
  id: string;
  name: string;
  metricLabel: string;
  revenue: number;
  iconName: 'api' | 'storage' | 'support';
}

export interface BusinessConfig {
  userId?: string;
  // Brand & Identity
  businessName: string;
  tagline: string;
  brandShort: string;
  industry: string;
  brandColor: string;

  // Contact & Location
  email: string;
  phone: string;
  website: string;
  address: string;
  cityStateZip: string;

  // Regulatory & Tax
  taxSystem: 'gst' | 'vat' | 'sales_tax' | 'custom' | 'none';
  taxLabel: string;
  taxNumber: string;
  defaultTaxRate: number;

  // Financial & Currency
  currency: string;
  currencyCode: string;

  // Invoicing & Numbering Rules
  invoicePrefix: string;
  rawBillPrefix: string;
  paymentTermsDays: number;
  termsAndConditions: string;
  footerNote: string;

  // Banking & Payment Collection
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingOrIfsc: string;
  upiOrPaypal: string;
  paymentNote: string;

  // Inventory & Stock Threshold Surveillance
  lowStockThreshold?: number;
  enableInventoryBackgroundCheck?: boolean;
  inventoryCheckIntervalSeconds?: number;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
  sku?: string;
  isPersistentAlert?: boolean;
}

export type UserRole = 'owner' | 'manager' | 'accountant' | 'staff';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  businessName: string;
  phone?: string;
  avatarColor?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface AuthSession {
  user: UserAccount;
  token: string;
  loginAt: string;
}
