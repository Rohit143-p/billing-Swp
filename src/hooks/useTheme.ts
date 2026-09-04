import { useState, useEffect } from 'react';
import { ThemeMode } from '../types';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

const THEME_STORAGE_KEY = 'revenueflow_theme';

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read theme from localStorage', e);
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const applyTheme = async () => {
      let resolvedDark = false;
      if (themeMode === 'dark') {
        resolvedDark = true;
      } else if (themeMode === 'light') {
        resolvedDark = false;
      } else {
        resolvedDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(resolvedDark);

      if (resolvedDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }

      // 1. Update native Capacitor Android / iOS Status Bar
      if (Capacitor.isNativePlatform()) {
        try {
          if (resolvedDark) {
            await StatusBar.setStyle({ style: Style.Dark }); // White text/icons on dark bg
            await StatusBar.setBackgroundColor({ color: '#020617' });
          } else {
            await StatusBar.setStyle({ style: Style.Light }); // Dark text/icons on light bg
            await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
          }
        } catch (err) {
          console.warn('Capacitor StatusBar update error:', err);
        }
      }

      // 2. Dynamically update mobile web browser status bar & theme-color
      try {
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
          metaTheme = document.createElement('meta');
          metaTheme.setAttribute('name', 'theme-color');
          document.head.appendChild(metaTheme);
        }
        metaTheme.setAttribute('content', resolvedDark ? '#020617' : '#FFFFFF');

        let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!metaStatusBar) {
          metaStatusBar = document.createElement('meta');
          metaStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
          document.head.appendChild(metaStatusBar);
        }
        metaStatusBar.setAttribute('content', resolvedDark ? 'black-translucent' : 'default');
      } catch (e) {
        console.warn('Could not update meta theme-color', e);
      }
    };

    applyTheme();

    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (e) {
      console.warn('Could not persist theme', e);
    }

    // If in system mode, listen for OS theme changes
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  const toggleTheme = () => {
    // Quick toggle between light and dark
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      // If currently system, flip based on current resolved state
      return isDark ? 'light' : 'dark';
    });
  };

  return {
    themeMode,
    setThemeMode,
    isDark,
    toggleTheme
  };
}
