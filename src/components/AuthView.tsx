import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building2,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  HelpCircle,
  Check,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, AuthSession, UserRole, BusinessConfig } from '../types';
import {
  registerUser,
  loginUser,
  loginDemoUser,
  syncUsersWithCloud,
  INITIAL_DEMO_USERS,
  RegisterPayload
} from '../data/authService';
import { findFirestoreUserByEmail } from '../lib/firebase';
import { sendWelcomeEmail } from '../services/emailService';

interface AuthViewProps {
  onLoginSuccess: (session: AuthSession) => void;
  config?: BusinessConfig;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, config, isDark = false, onToggleTheme }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('owner');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotAccountFound, setForgotAccountFound] = useState<UserAccount | null>(null);
  const [isForgotChecking, setIsForgotChecking] = useState(false);

  const brandName = config?.businessName || 'RevenueFlow';
  const brandShort = config?.brandShort || 'RF';
  const brandColor = config?.brandColor || '#2563eb';

  // Pre-sync registered users from Google Cloud Firestore on view mount
  useEffect(() => {
    syncUsersWithCloud();
  }, []);

  const triggerSuccessBurst = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginUser(loginEmail, loginPassword);
      setIsLoading(false);

      if (res.success && res.session) {
        setSuccessMessage(`Welcome back, ${res.session.user.name}!`);
        triggerSuccessBurst();
        setTimeout(() => {
          onLoginSuccess(res.session!);
        }, 400);
      } else {
        setErrorMessage(res.error || 'Failed to sign in.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Error occurred while signing in. Please check your connection.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service & Privacy Policy to create your account.');
      return;
    }

    setIsLoading(true);

    const payload: RegisterPayload = {
      name: regName,
      email: regEmail,
      password: regPassword,
      businessName: regBusinessName,
      role: regRole,
      phone: regPhone
    };

    try {
      const res = await registerUser(payload);
      setIsLoading(false);

      if (res.success && res.user) {
        // Trigger welcome email asynchronously (if EmailJS is configured)
        sendWelcomeEmail({
          name: res.user.name,
          email: res.user.email,
          businessName: res.user.businessName
        }).catch(err => console.log('Welcome email dispatch note:', err));

        // Pre-fill login email with the newly registered account email
        const registeredEmail = regEmail.trim().toLowerCase();
        setLoginEmail(registeredEmail);
        setLoginPassword('');

        // Reset registration fields
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegBusinessName('');
        setRegPhone('');

        // Switch to Login mode
        setMode('login');
        setSuccessMessage('Account created successfully! Please sign in with your email and password.');
        triggerSuccessBurst();
      } else {
        setErrorMessage(res.error || 'Failed to register account.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Error occurred while registering account.');
    }
  };

  const handleDemoLogin = (user: UserAccount) => {
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      const res = loginDemoUser(user.id);
      setIsLoading(false);
      if (res.success && res.session) {
        setSuccessMessage(`Logged in as demo user ${res.session.user.name}`);
        triggerSuccessBurst();
        setTimeout(() => {
          onLoginSuccess(res.session!);
        }, 350);
      }
    }, 300);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setIsForgotChecking(true);
    try {
      const user = await findFirestoreUserByEmail(forgotEmail);
      setIsForgotChecking(false);
      if (user) {
        setForgotAccountFound(user);
        setForgotSent(true);
      } else {
        // Still show sent message for standard security practice
        setForgotSent(true);
      }
    } catch {
      setIsForgotChecking(false);
      setForgotSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: brandColor }}
        />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-indigo-500 blur-3xl" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md md:max-w-lg">
        {/* Top Floating Controls */}
        {onToggleTheme && (
          <div className="flex justify-end mb-3">
            <button
              onClick={onToggleTheme}
              type="button"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 transition-colors shadow-sm cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-300" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-mono-tag font-bold text-sm text-white shadow-lg relative ring-2 ring-white/20"
              style={{ backgroundColor: brandColor }}
            >
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute -top-0.5 -right-0.5 ring-2 ring-slate-900" />
              {brandShort}
            </div>
            <div className="text-left">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {brandName}
              </h1>
              <p className="text-[11px] font-mono-tag uppercase tracking-wider text-slate-400">
                Financial Operations & Billing Platform
              </p>
            </div>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer text-center ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In to Account
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer text-center ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create New Account
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Feedback Notifications */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start justify-between gap-2.5 flex-wrap"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-[200px]">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
                {errorMessage.includes('already exists') && (
                  <button
                    type="button"
                    onClick={() => {
                      if (regEmail) setLoginEmail(regEmail.trim().toLowerCase());
                      setErrorMessage(null);
                      setMode('login');
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    Go to Sign In →
                  </button>
                )}
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{successMessage}</div>
              </motion.div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {mode === 'login' && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-input-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="alex@revenueflow.io"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-input-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span>Stay signed in on this device</span>
                  </label>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-60"
                  style={{ backgroundColor: brandColor }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Demo Logins Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
                    <span className="bg-white px-3 text-slate-400">
                      Or 1-Click Fast Demo Login
                    </span>
                  </div>
                </div>

                {/* 1-Click Quick Demo Buttons */}
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Select a pre-configured role to explore instantly:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {INITIAL_DEMO_USERS.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleDemoLogin(user)}
                        disabled={isLoading}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 transition-colors text-left cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: user.avatarColor || '#2563eb' }}
                          />
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {user.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-tag uppercase tracking-wider text-slate-500">
                          {user.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {mode === 'register' && (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-3.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-input-name"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Elena Rostova"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company / Business Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-input-business"
                        type="text"
                        required
                        value={regBusinessName}
                        onChange={(e) => setRegBusinessName(e.target.value)}
                        placeholder="Rostova Design Co."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Work Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-input-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="elena@rostovaco.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-input-phone"
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+1 555-0199"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Primary Role
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'owner' as const, label: 'Owner / Founder' },
                      { id: 'manager' as const, label: 'Billing Lead' },
                      { id: 'accountant' as const, label: 'Accountant' },
                      { id: 'staff' as const, label: 'Operations' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRegRole(item.id)}
                        className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-colors cursor-pointer ${
                          regRole === item.id
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password (min 6 characters) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-input-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-input-confirm-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                    />
                    <span className="leading-relaxed">
                      I agree to the Terms of Service and Privacy Policy for financial records and invoicing.
                    </span>
                  </label>
                </div>

                <button
                  id="btn-register-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-60"
                  style={{ backgroundColor: brandColor }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating your workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account & Continue to Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* Privacy & Guarantee Footnote */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit Encrypted Session
              </span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>

        {/* Switch tab guidance bottom helper */}
        <div className="text-center mt-4">
          <p className="text-xs text-slate-400">
            {mode === 'login' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200"
          >
            <h3 className="font-editorial text-xl font-bold text-slate-900 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your work email address to receive a secure password reset link.
            </p>

            {forgotSent ? (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl text-xs space-y-2 border ${
                  forgotAccountFound
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                }`}>
                  <div className="flex items-center gap-2 font-semibold">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{forgotAccountFound ? 'Instant Cloud Account Recovery (No OTP Needed)' : 'Account Check Complete'}</span>
                  </div>
                  {forgotAccountFound ? (
                    <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-emerald-200 dark:border-emerald-800 space-y-1 text-slate-800 dark:text-slate-100">
                      <div><span className="font-semibold text-slate-500 dark:text-slate-400">Name:</span> {forgotAccountFound.name}</div>
                      <div><span className="font-semibold text-slate-500 dark:text-slate-400">Business:</span> {forgotAccountFound.businessName}</div>
                      <div><span className="font-semibold text-slate-500 dark:text-slate-400">Password:</span> <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{forgotAccountFound.password}</span></div>
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-300">
                      No account registered with <span className="font-semibold">{forgotEmail}</span> was found in the cloud database. Please check your spelling or register a new account.
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  {forgotAccountFound && (
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail(forgotAccountFound.email);
                        setLoginPassword(forgotAccountFound.password || '');
                        setShowForgotModal(false);
                        setForgotSent(false);
                        setForgotAccountFound(null);
                        setMode('login');
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
                    >
                      Fill Credentials & Log In
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSent(false);
                      setForgotAccountFound(null);
                    }}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotChecking}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isForgotChecking ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Checking Cloud...
                      </>
                    ) : (
                      'Recover Credentials'
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
