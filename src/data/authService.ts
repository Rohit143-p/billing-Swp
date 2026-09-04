import { UserAccount, AuthSession, UserRole } from '../types';
import { saveUserToFirestore } from '../lib/firebase';

const USERS_STORAGE_KEY = 'revenueflow_registered_users_v2';
const SESSION_STORAGE_KEY = 'revenueflow_auth_session_v2';

export const INITIAL_DEMO_USERS: UserAccount[] = [
  {
    id: 'user-demo-1',
    name: 'Alex Mercer',
    email: 'alex@revenueflow.io',
    password: 'Password123!',
    role: 'owner',
    businessName: 'Apex Cloud Solutions',
    phone: '+1 (415) 555-0192',
    avatarColor: '#2563eb',
    createdAt: '2026-01-15',
    isDemo: true
  },
  {
    id: 'user-demo-2',
    name: 'Sarah Chen',
    email: 'sarah@techagency.dev',
    password: 'Password123!',
    role: 'manager',
    businessName: 'Chen Creative Studio',
    phone: '+1 (212) 555-0144',
    avatarColor: '#059669',
    createdAt: '2026-02-01',
    isDemo: true
  },
  {
    id: 'user-demo-3',
    name: 'Rajesh Verma',
    email: 'rajesh@vermafin.in',
    password: 'Password123!',
    role: 'accountant',
    businessName: 'Verma Financial Services',
    phone: '+91 98765 43210',
    avatarColor: '#7c3aed',
    createdAt: '2026-02-10',
    isDemo: true
  }
];

export function isDemoAccount(user?: UserAccount | null): boolean {
  if (!user) return false;
  if (user.isDemo === true) return true;
  if (user.id === 'user-demo-1' || user.id === 'user-demo-2' || user.id === 'user-demo-3') return true;
  const email = (user.email || '').toLowerCase().trim();
  if (
    email === 'alex@revenueflow.io' ||
    email === 'sarah@techagency.dev' ||
    email === 'rajesh@vermafin.in'
  ) {
    return true;
  }
  return false;
}

// Helper to retrieve all registered accounts
export function getRegisteredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USERS));
      return INITIAL_DEMO_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load registered users from localStorage:', err);
  }
  return INITIAL_DEMO_USERS;
}

// Helper to save registered users
export function saveRegisteredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('Failed to save registered users to localStorage:', err);
  }
}

// Check current active session
export function getActiveSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (session && session.user && session.token) {
      return session;
    }
  } catch (err) {
    console.warn('Failed to load active session:', err);
  }
  return null;
}

// Save active session
export function saveActiveSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save active session:', err);
  }
}

// Clear active session (Logout)
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear active session:', err);
  }
}

// Registration function
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  businessName: string;
  role: UserRole;
  phone?: string;
}

const AVATAR_COLORS = [
  '#2563eb', // blue
  '#059669', // emerald
  '#7c3aed', // violet
  '#ea580c', // orange
  '#0891b2', // cyan
  '#db2777'  // pink
];

export function registerUser(payload: RegisterPayload): { success: boolean; error?: string; user?: UserAccount } {
  const users = getRegisteredUsers();
  const normalizedEmail = payload.email.trim().toLowerCase();

  // Validate fields
  if (!payload.name.trim()) {
    return { success: false, error: 'Full name is required.' };
  }
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }
  if (!payload.password || payload.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }
  if (!payload.businessName.trim()) {
    return { success: false, error: 'Business / Company name is required.' };
  }

  // Check email collision
  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please log in instead.' };
  }

  // Pick random avatar color
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const newUser: UserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: payload.name.trim(),
    email: normalizedEmail,
    password: payload.password,
    businessName: payload.businessName.trim(),
    role: payload.role || 'owner',
    phone: payload.phone?.trim() || '',
    avatarColor,
    createdAt: new Date().toISOString().split('T')[0],
    isDemo: false
  };

  const updatedUsers = [...users, newUser];
  saveRegisteredUsers(updatedUsers);

  // Sync with Firebase Firestore users collection asynchronously
  saveUserToFirestore(newUser).catch(err => console.warn('Could not sync user with Firestore:', err));

  return { success: true, user: newUser };
}

// Login function
export function loginUser(email: string, password: string): { success: boolean; error?: string; session?: AuthSession } {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return { success: false, error: 'No account found with this email. Please verify or register a new account.' };
  }

  // Check password
  if (user.password && user.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again or use the demo login.' };
  }

  const session: AuthSession = {
    user,
    token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    loginAt: new Date().toISOString()
  };

  saveActiveSession(session);

  return { success: true, session };
}

// Helper to switch directly to a demo account
export function loginDemoUser(userId: string): { success: boolean; session?: AuthSession } {
  const users = getRegisteredUsers();
  const user = users.find(u => u.id === userId) || INITIAL_DEMO_USERS[0];

  const session: AuthSession = {
    user,
    token: `tok_demo_${Date.now()}`,
    loginAt: new Date().toISOString()
  };

  saveActiveSession(session);
  return { success: true, session };
}

// Merge remote Firestore users into local registered accounts
export function mergeUsersWithLocalCache(remoteUsers: UserAccount[]): void {
  try {
    const localUsers = getRegisteredUsers();
    const userMap = new Map<string, UserAccount>();
    for (const u of localUsers) {
      userMap.set(u.id, u);
    }
    for (const r of remoteUsers) {
      userMap.set(r.id, r);
    }
    const merged = Array.from(userMap.values());
    saveRegisteredUsers(merged);
  } catch (err) {
    console.warn('Failed to merge users with local cache:', err);
  }
}

// Sync users with Firestore cloud
export async function syncUsersWithCloud(): Promise<UserAccount[]> {
  try {
    const { fetchFirestoreUsers } = await import('../lib/firebase');
    const remoteUsers = await fetchFirestoreUsers();
    if (remoteUsers && remoteUsers.length > 0) {
      mergeUsersWithLocalCache(remoteUsers);
      return getRegisteredUsers();
    }
  } catch (err) {
    console.warn('Failed to sync users with cloud:', err);
  }
  return getRegisteredUsers();
}
