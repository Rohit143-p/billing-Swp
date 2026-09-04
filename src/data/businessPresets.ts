import { BusinessConfig, UserAccount } from '../types';

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  businessName: 'RevenueFlow Technologies Inc.',
  tagline: 'Cloud Operations & Modern Invoicing Platform',
  brandShort: 'RF',
  industry: 'tech',
  brandColor: '#2563eb',

  email: 'billing@revenueflow.io',
  phone: '+1 (555) 019-2834',
  website: 'https://revenueflow.io',
  address: '100 Montgomery St, Suite 1500',
  cityStateZip: 'San Francisco, CA 94104',

  taxSystem: 'gst',
  taxLabel: 'GSTIN',
  taxNumber: '27AABCU9603R1ZM',
  defaultTaxRate: 18,

  currency: '$',
  currencyCode: 'USD',

  invoicePrefix: 'INV-2026',
  rawBillPrefix: 'RAW-2026',
  paymentTermsDays: 14,
  termsAndConditions: 'Payment due within 14 days of invoice date. Late payments may be subject to a 1.5% monthly finance charge.',
  footerNote: 'Thank you for your business! This is an electronically generated document.',

  bankName: 'HDFC Bank Ltd / Silicon Valley Bank',
  accountName: 'RevenueFlow Technologies Inc.',
  accountNumber: '50200084930219',
  routingOrIfsc: 'HDFC0000123 / 121000358',
  upiOrPaypal: 'revenueflow@hdfcbank',
  paymentNote: 'Please include the invoice number in the payment reference or transfer memo.',

  // Inventory & Stock Threshold Surveillance
  lowStockThreshold: 10,
  enableInventoryBackgroundCheck: true,
  inventoryCheckIntervalSeconds: 30
};

export interface IndustryPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge: string;
  config: Partial<BusinessConfig>;
  sampleItems: Array<{ name: string; quantity: number; rate: number }>;
}

export const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: 'tech',
    name: 'Tech & Software / SaaS',
    description: 'Cloud hosting, recurring software subscriptions, API usage, and tech contracts.',
    icon: '💻',
    badge: 'Tech & SaaS',
    config: {
      businessName: 'Apex Cloud Solutions',
      tagline: 'Enterprise Cloud Infrastructure & Software',
      brandShort: 'AC',
      industry: 'tech',
      brandColor: '#2563eb',
      email: 'finance@apexcloud.io',
      phone: '+1 (555) 392-1082',
      website: 'https://apexcloud.io',
      address: '450 Mission Street, Suite 900',
      cityStateZip: 'San Francisco, CA 94105',
      taxSystem: 'sales_tax',
      taxLabel: 'EIN / Tax ID',
      taxNumber: '84-1928374',
      defaultTaxRate: 8.5,
      currency: '$',
      currencyCode: 'USD',
      invoicePrefix: 'ACS-2026',
      rawBillPrefix: 'EST-2026',
      paymentTermsDays: 30,
      termsAndConditions: 'Payment due Net 30 from invoice delivery. Wire transfer and ACH preferred.',
      footerNote: 'Thank you for choosing Apex Cloud Solutions for your core mission-critical workloads.',
      bankName: 'JPMorgan Chase Bank',
      accountName: 'Apex Cloud Solutions LLC',
      accountNumber: '482019482012',
      routingOrIfsc: '021000021',
      upiOrPaypal: 'billing@apexcloud.io',
      paymentNote: 'Wire & ACH details above. Wire fee must be borne by sender.'
    },
    sampleItems: [
      { name: 'Enterprise Cloud Retainer (Monthly)', quantity: 1, rate: 2500 },
      { name: 'Dedicated VPC Cluster Architecture', quantity: 2, rate: 1200 },
      { name: '24/7 SLA Priority DevOps Support', quantity: 1, rate: 850 }
    ]
  },
  {
    id: 'agency',
    name: 'Creative Agency & Design',
    description: 'Branding studios, digital agencies, marketing consultants, and UI/UX designers.',
    icon: '🎨',
    badge: 'Creative & Agency',
    config: {
      businessName: 'Vanguard Design Studio',
      tagline: 'Brand Identity, Digital Systems & Product Strategy',
      brandShort: 'VD',
      industry: 'agency',
      brandColor: '#7c3aed',
      email: 'hello@vanguardstudio.design',
      phone: '+1 (555) 749-3021',
      website: 'https://vanguardstudio.design',
      address: '180 Varick St, 6th Floor',
      cityStateZip: 'New York, NY 10014',
      taxSystem: 'sales_tax',
      taxLabel: 'Tax ID',
      taxNumber: '13-9821734',
      defaultTaxRate: 8.875,
      currency: '$',
      currencyCode: 'USD',
      invoicePrefix: 'VDS-INV',
      rawBillPrefix: 'VDS-QTE',
      paymentTermsDays: 15,
      termsAndConditions: '50% milestone due upon deliverable presentation. Intellectual property transfers upon full settlement.',
      footerNote: 'Crafted with precision by Vanguard Studio. We love building bold brands.',
      bankName: 'Silicon Valley Bank / First Republic',
      accountName: 'Vanguard Design Studio Inc.',
      accountNumber: '9201938201',
      routingOrIfsc: '121000358',
      upiOrPaypal: 'pay@vanguardstudio.design',
      paymentNote: 'Payment via Direct ACH transfer or Stripe invoice portal.'
    },
    sampleItems: [
      { name: 'Brand Identity & Design System Kit', quantity: 1, rate: 4800 },
      { name: 'React Interactive Web Experience Sprint', quantity: 1, rate: 6500 },
      { name: 'Design Sprint Workshop (2 Days)', quantity: 2, rate: 1250 }
    ]
  },
  {
    id: 'india_gst',
    name: 'Indian GST Business & Trading',
    description: 'Compliant with Indian Goods & Services Tax (CGST 9% + SGST 9% or IGST 18%).',
    icon: '🇮🇳',
    badge: 'GST Enterprise',
    config: {
      businessName: 'Bharat Infotech Solutions Pvt Ltd',
      tagline: 'Enterprise IT Solutions, Hardware & Consulting',
      brandShort: 'BI',
      industry: 'india_gst',
      brandColor: '#059669',
      email: 'accounts@bharatinfotech.in',
      phone: '+91 98200 12345',
      website: 'https://bharatinfotech.in',
      address: 'Plot 42, Bandra Kurla Complex',
      cityStateZip: 'Mumbai, Maharashtra 400051',
      taxSystem: 'gst',
      taxLabel: 'GSTIN',
      taxNumber: '27AABCU9603R1ZM',
      defaultTaxRate: 18,
      currency: '₹',
      currencyCode: 'INR',
      invoicePrefix: 'INV-2026',
      rawBillPrefix: 'CHAL-2026',
      paymentTermsDays: 15,
      termsAndConditions: 'Payment due within 15 days of invoice date. Subject to Mumbai Jurisdiction.',
      footerNote: 'Thank you for your business. Certified GST compliant tax invoice.',
      bankName: 'HDFC Bank Ltd',
      accountName: 'Bharat Infotech Solutions Pvt Ltd',
      accountNumber: '50200084930219',
      routingOrIfsc: 'HDFC0000123',
      upiOrPaypal: 'bharatinfotech@hdfcbank',
      paymentNote: 'Scan UPI QR code or transfer via NEFT/RTGS using IFSC HDFC0000123.'
    },
    sampleItems: [
      { name: 'Enterprise Cloud Architecture & Audit', quantity: 1, rate: 45000 },
      { name: 'Server Hardware Annual Maintenance (AMC)', quantity: 2, rate: 18500 },
      { name: 'Database Optimization & Security Patching', quantity: 1, rate: 22000 }
    ]
  },
  {
    id: 'retail',
    name: 'Retail & Electronics Store',
    description: 'Point of sale, equipment sales, consumer goods, and hardware accessories.',
    icon: '🛍️',
    badge: 'Retail & POS',
    config: {
      businessName: 'Metro Tech & Gadget Hub',
      tagline: 'Premium Consumer Electronics, Computing & Gear',
      brandShort: 'MT',
      industry: 'retail',
      brandColor: '#ea580c',
      email: 'store@metrogadgets.com',
      phone: '+1 (555) 839-2041',
      website: 'https://metrogadgets.com',
      address: '1240 Broadway Ave, Ground Floor',
      cityStateZip: 'Seattle, WA 98122',
      taxSystem: 'sales_tax',
      taxLabel: 'State Tax Reg',
      taxNumber: 'WA-602918234',
      defaultTaxRate: 10.25,
      currency: '$',
      currencyCode: 'USD',
      invoicePrefix: 'REC-2026',
      rawBillPrefix: 'MEMO-2026',
      paymentTermsDays: 0,
      termsAndConditions: 'Goods once sold can be returned or exchanged within 14 days with original receipt.',
      footerNote: 'Visit us again soon! All hardware backed by standard 1-year manufacturer warranty.',
      bankName: 'Bank of America',
      accountName: 'Metro Tech Hub LLC',
      accountNumber: '891028491029',
      routingOrIfsc: '125000024',
      upiOrPaypal: 'orders@metrogadgets.com',
      paymentNote: 'Instant POS receipt. Credit Card, Apple Pay, Cash, and Google Pay accepted.'
    },
    sampleItems: [
      { name: 'Wireless Ergonomic Mechanical Keyboard', quantity: 2, rate: 149.99 },
      { name: '4K Ultra-Wide USB-C Monitor Display', quantity: 1, rate: 489.00 },
      { name: 'Braided Fast-Charging Cable Kit (Pack of 3)', quantity: 3, rate: 29.50 }
    ]
  },
  {
    id: 'freelance',
    name: 'Freelancer / Independent Consultant',
    description: 'Solo developers, fractional executives, copywriters, and remote contractors.',
    icon: '☕',
    badge: 'Solo Consultant',
    config: {
      businessName: 'Vance Advisory & Development',
      tagline: 'Fractional CTO, Architecture & Product Engineering',
      brandShort: 'VA',
      industry: 'freelance',
      brandColor: '#0284c7',
      email: 'elena@vanceadvisory.co',
      phone: '+1 (555) 412-9843',
      website: 'https://vanceadvisory.co',
      address: '924 Market Street, Suite 300',
      cityStateZip: 'Austin, TX 78701',
      taxSystem: 'none',
      taxLabel: 'W-9 SSN/EIN on file',
      taxNumber: 'EIN: 82-4910294',
      defaultTaxRate: 0,
      currency: '$',
      currencyCode: 'USD',
      invoicePrefix: 'EVA-INV',
      rawBillPrefix: 'EVA-EST',
      paymentTermsDays: 14,
      termsAndConditions: 'Payment due within 14 days. Work billed on hourly sprint / fixed scope basis.',
      footerNote: 'Thank you for our partnership! Excited for the next product milestone.',
      bankName: 'Mercury Bank / Evolve Bank',
      accountName: 'Elena Vance Advisory LLC',
      accountNumber: '7391029384',
      routingOrIfsc: '084108873',
      upiOrPaypal: 'paypal.me/elenavance',
      paymentNote: 'Direct ACH preferred. Wire and PayPal accepted.'
    },
    sampleItems: [
      { name: 'Sprint Engineering & Architecture (40 hrs)', quantity: 1, rate: 4000 },
      { name: 'Tech Due Diligence & Codebase Audit', quantity: 1, rate: 1800 },
      { name: 'Executive Product Consultation Session', quantity: 3, rate: 350 }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Wellness Clinic',
    description: 'Private clinics, wellness centers, dental practices, and physical therapists.',
    icon: '🩺',
    badge: 'Healthcare & Clinic',
    config: {
      businessName: 'Apex Medical & Diagnostics Clinic',
      tagline: 'Comprehensive Primary Care, Wellness & Pathology',
      brandShort: 'AM',
      industry: 'healthcare',
      brandColor: '#0d9488',
      email: 'reception@apexmedclinic.org',
      phone: '+1 (555) 602-1928',
      website: 'https://apexmedclinic.org',
      address: '500 Health Science Blvd, Suite 210',
      cityStateZip: 'Boston, MA 02115',
      taxSystem: 'none',
      taxLabel: 'NPI / License',
      taxNumber: 'NPI-1928374650',
      defaultTaxRate: 0,
      currency: '$',
      currencyCode: 'USD',
      invoicePrefix: 'CLINIC-2026',
      rawBillPrefix: 'RECEIPT-2026',
      paymentTermsDays: 0,
      termsAndConditions: 'Medical consultations and lab charges due at conclusion of appointment. Superbill provided for insurance.',
      footerNote: 'Wishing you healthy living. Please contact our 24/7 care hotline for urgent medical inquiries.',
      bankName: 'Fidelity Bank / Citizens Bank',
      accountName: 'Apex Medical Practice Associates',
      accountNumber: '3819283719',
      routingOrIfsc: '011000138',
      upiOrPaypal: 'billing@apexmedclinic.org',
      paymentNote: 'FSA/HSA cards, insurance copays, and major credit cards accepted.'
    },
    sampleItems: [
      { name: 'Comprehensive Specialist Medical Consultation', quantity: 1, rate: 250 },
      { name: 'Advanced Preventive Biomarker Lab Panel', quantity: 1, rate: 340 },
      { name: 'Physiotherapy Rehabilitation Session (60m)', quantity: 2, rate: 120 }
    ]
  },
  {
    id: 'restaurant',
    name: 'Restaurant, Cafe & Catering',
    description: 'Cafes, catering companies, bakeries, and dining hospitality establishments.',
    icon: '🍽️',
    badge: 'Food & Hospitality',
    config: {
      businessName: 'Artisan Roast & Kitchen',
      tagline: 'Specialty Coffee Roastery, Bakery & Event Catering',
      brandShort: 'AR',
      industry: 'restaurant',
      brandColor: '#b45309',
      email: 'events@artisanroast.com',
      phone: '+1 (555) 918-2736',
      website: 'https://artisanroast.com',
      address: '78 W Elm St',
      cityStateZip: 'Chicago, IL 60610',
      taxSystem: 'sales_tax',
      taxLabel: 'City F&B Tax ID',
      taxNumber: 'IL-98172635',
      defaultTaxRate: 10.75,
      currency: '$',
      currencyCode: 'USD',
      invoicePrefix: 'CATER-2026',
      rawBillPrefix: 'TAB-2026',
      paymentTermsDays: 7,
      termsAndConditions: '50% deposit required to secure event catering date. Final guest count locked 72 hours prior.',
      footerNote: 'Thank you for gathering with Artisan Roast & Kitchen! Bon Appetit!',
      bankName: 'Wintrust Bank Chicago',
      accountName: 'Artisan Roast Hospitality Group',
      accountNumber: '6192837102',
      routingOrIfsc: '071000013',
      upiOrPaypal: 'events@artisanroast.com',
      paymentNote: 'Gratuity and event coordination included in subtotal.'
    },
    sampleItems: [
      { name: 'Corporate Gourmet Lunch Buffet (Per Head)', quantity: 25, rate: 28.50 },
      { name: 'Cold Brew Specialty Coffee Keg (5 Gallon)', quantity: 2, rate: 165.00 },
      { name: 'Artisan Pastry & Macaron Dessert Platter', quantity: 3, rate: 75.00 }
    ]
  }
];

export function createDefaultUserConfig(user: {
  id?: string;
  name?: string;
  businessName?: string;
  email?: string;
  phone?: string;
}): BusinessConfig {
  const bName = user.businessName?.trim() || `${user.name?.trim() || 'My'} Business`;
  const initials = bName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'MB';

  return {
    userId: user.id,
    businessName: bName,
    tagline: 'Billing, Invoicing & Operational Ledger',
    brandShort: initials,
    industry: 'general',
    brandColor: '#2563eb',

    email: user.email?.trim() || '',
    phone: user.phone?.trim() || '',
    website: '',
    address: '',
    cityStateZip: '',

    taxSystem: 'gst',
    taxLabel: 'GSTIN',
    taxNumber: '',
    defaultTaxRate: 18,

    currency: '₹',
    currencyCode: 'INR',

    invoicePrefix: 'INV-2026',
    rawBillPrefix: 'RAW-2026',
    paymentTermsDays: 14,
    termsAndConditions: 'Payment due within 14 days of invoice date. Thank you for your business.',
    footerNote: 'Generated via RevenueFlow Cloud Invoicing.',

    bankName: '',
    accountName: bName,
    accountNumber: '',
    routingOrIfsc: '',
    upiOrPaypal: user.phone?.trim() || user.email?.trim() || '',
    paymentNote: 'Please quote invoice number in payment reference.'
  };
}

const STORAGE_KEY = 'revenueflow_business_config_v1';

export function loadSavedBusinessConfig(
  userId?: string,
  fallbackUser?: UserAccount | null
): BusinessConfig {
  const key = userId ? `revenueflow_business_config_${userId}` : STORAGE_KEY;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      const base = fallbackUser
        ? createDefaultUserConfig(fallbackUser)
        : DEFAULT_BUSINESS_CONFIG;
      return { ...base, ...parsed, ...(userId ? { userId } : {}) };
    }
  } catch (err) {
    console.warn('Could not load saved business config from localStorage:', err);
  }

  if (fallbackUser) {
    return createDefaultUserConfig(fallbackUser);
  }

  return DEFAULT_BUSINESS_CONFIG;
}

export function saveBusinessConfig(config: BusinessConfig, userId?: string): void {
  const targetId = userId || config.userId;
  const key = targetId ? `revenueflow_business_config_${targetId}` : STORAGE_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(config));
    if (!targetId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  } catch (err) {
    console.error('Could not save business config to localStorage:', err);
  }
}
