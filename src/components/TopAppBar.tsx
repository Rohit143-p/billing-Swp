import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, X, Settings, LogOut, User, ChevronDown, Database, Smartphone, Sun, Moon } from 'lucide-react';
import { TabType, NotificationItem, BusinessConfig, UserAccount } from '../types';

interface TopAppBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  currency: string;
  onCurrencyToggle: () => void;
  config?: BusinessConfig;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  firebaseConnected?: boolean;
  onOpenMobileInstall?: () => void;
  onOpenCloudSyncModal?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab,
  onSelectTab,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  currency,
  onCurrencyToggle,
  config,
  currentUser,
  onLogout,
  firebaseConnected = true,
  onOpenMobileInstall,
  onOpenCloudSyncModal,
  isDark = false,
  onToggleTheme
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking anywhere outside of the navbar components or on Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu, showNotifications]);

  const brandShort = config?.brandShort || 'RF';
  const businessName = config?.businessName || 'RevenueFlow';
  const brandColor = config?.brandColor || '#2563eb';

  // Compute initials for current user
  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'RF';

  const handleTabClick = (tab: TabType) => {
    setShowUserMenu(false);
    setShowNotifications(false);
    onSelectTab(tab);
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center px-2.5 sm:px-8 h-14 sm:h-16">
        {/* Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button 
            onClick={() => handleTabClick('dashboard')}
            className="flex items-center gap-1.5 sm:gap-3 focus:outline-none group text-left cursor-pointer min-w-0"
          >
            <div
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-mono-tag font-bold text-xs text-white shadow-sm relative transition-opacity group-hover:opacity-90 shrink-0"
              style={{ backgroundColor: brandColor }}
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-slate-900" />
              {brandShort}
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 min-w-0">
              <span className="font-editorial text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[100px] xs:max-w-[140px] sm:max-w-xs md:max-w-md">
                {businessName}
              </span>
              <span className="hidden lg:inline-block text-[10px] tracking-[0.2em] font-semibold text-slate-400 font-mono-tag shrink-0">
                PRO
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { id: 'dashboard' as const, label: 'Dashboard' },
            { id: 'billing' as const, label: 'Billing' },
            { id: 'analytics' as const, label: 'Analytics' },
            { id: 'expenses' as const, label: 'Expenses' },
            { id: 'menu' as const, label: 'Configuration' }
          ].map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 relative shrink-0">
          {/* Firestore Cloud Sync Interactive Badge (hidden on very narrow mobile to prevent crowding) */}
          <button
            type="button"
            onClick={onOpenCloudSyncModal}
            title={firebaseConnected ? "Connected to Google Cloud Firestore (Click to view live stats & force sync)" : "Connecting to Firestore..."}
            className={`hidden xs:flex items-center gap-1 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-[10px] sm:text-[11px] font-mono-tag font-semibold transition-all cursor-pointer shadow-2xs ${
              firebaseConnected
                ? 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 animate-pulse'
            }`}
          >
            <Database className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Firestore</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${firebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </button>

          {/* Mobile App & APK Button (Desktop & Tablet) */}
          {onOpenMobileInstall && (
            <button
              onClick={onOpenMobileInstall}
              title="Install Mobile App / Generate APK"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>
          )}

          {/* Quick Config Button (Desktop only - on mobile it's in bottom bar) */}
          <button
            onClick={() => handleTabClick('menu')}
            title="Open Business Configuration"
            className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border ${
              currentTab === 'menu'
                ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Config</span>
          </button>

          {/* Quick Currency Toggle Pill */}
          <button
            onClick={onCurrencyToggle}
            title="Switch display currency"
            className="flex items-center gap-0.5 sm:gap-1 text-xs font-semibold px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline text-slate-400 font-normal">CURR:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{currency}</span>
          </button>

          {/* Theme Toggle Button (Light/Dark) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300 hover:-rotate-12 transition-transform" />
              )}
            </button>
          )}

          {/* Notifications Button & Dropdown */}
          <div ref={notificationsRef} className="relative shrink-0">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label="Notifications"
              className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors active:scale-95 cursor-pointer shadow-xs shrink-0"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Notification Popover - Fixed on mobile, absolute on desktop */}
            {showNotifications && (
              <>
                {/* Backdrop on mobile */}
                <div 
                  className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40 sm:hidden"
                  onClick={() => setShowNotifications(false)} 
                />
                <div className="fixed inset-x-3 top-[calc(4rem+env(safe-area-inset-top,0px))] sm:inset-auto sm:right-0 sm:top-12 w-auto sm:w-80 md:w-96 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          {unreadCount} NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={onClearAllNotifications}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto mt-2 touch-scroll">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => onMarkNotificationRead(notif.id)}
                          className={`py-3 px-2.5 rounded-lg cursor-pointer transition-colors flex items-start gap-2.5 ${
                            notif.read ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-900/40'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            notif.type === 'alert' ? 'bg-red-500' : notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{notif.title}</p>
                              <span className="text-[10px] text-slate-400">{notif.time}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">{notif.description}</p>
                          </div>
                          {!notif.read && (
                            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar / Menu Trigger & Dropdown */}
          <div ref={userMenuRef} className="relative shrink-0">
            <button
              id="topbar-user-menu-btn"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              title={currentUser ? `${currentUser.name} (${currentUser.role})` : "Account Menu"}
              className="flex items-center gap-1.5 p-1 sm:pl-1.5 sm:pr-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            >
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-md text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs"
                style={{ backgroundColor: currentUser?.avatarColor || brandColor }}
              >
                {userInitials}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate text-left">
                {currentUser?.name || 'Account'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* User Account Popover - Fixed on mobile, absolute on desktop */}
            {showUserMenu && (
              <>
                {/* Backdrop on mobile */}
                <div 
                  className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40 sm:hidden"
                  onClick={() => setShowUserMenu(false)} 
                />
                <div className="fixed inset-x-3 top-[calc(4rem+env(safe-area-inset-top,0px))] sm:inset-auto sm:right-0 sm:top-11 w-auto sm:w-64 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-start gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div
                      className="w-10 h-10 rounded-lg text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: currentUser?.avatarColor || brandColor }}
                    >
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser?.name || 'User'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {currentUser?.email || 'user@company.com'}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono-tag font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                          {currentUser?.role || 'Member'}
                        </span>
                        {currentUser?.businessName && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[110px]">
                            {currentUser.businessName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-1 text-xs">
                    {onToggleTheme && (
                      <button
                        onClick={() => {
                          onToggleTheme();
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {isDark ? (
                            <Sun className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Moon className="w-4 h-4 text-slate-500" />
                          )}
                          <span>Theme Mode</span>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {isDark ? 'Dark' : 'Light'}
                        </span>
                      </button>
                    )}

                    {onOpenMobileInstall && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenMobileInstall();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer sm:hidden"
                      >
                        <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Install Mobile App</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        handleTabClick('menu');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Business Configuration</span>
                    </button>

                    <button
                      id="btn-user-logout"
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out / Switch User</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notification Popover - Fixed on mobile, absolute on desktop */}
          {showNotifications && (
            <>
              {/* Backdrop on mobile */}
              <div 
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40 sm:hidden"
                onClick={() => setShowNotifications(false)} 
              />
              <div className="fixed inset-x-3 top-16 sm:inset-auto sm:right-0 sm:top-12 w-auto sm:w-80 md:w-96 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={onClearAllNotifications}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto mt-2 touch-scroll">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => onMarkNotificationRead(notif.id)}
                        className={`py-3 px-2.5 rounded-lg cursor-pointer transition-colors flex items-start gap-2.5 ${
                          notif.read ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-900/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          notif.type === 'alert' ? 'bg-red-500' : notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{notif.title}</p>
                            <span className="text-[10px] text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">{notif.description}</p>
                        </div>
                        {!notif.read && (
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
