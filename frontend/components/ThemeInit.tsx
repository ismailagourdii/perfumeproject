'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

/** Applique theme-light / theme-dark sur <html> au montage et à chaque changement de thème. */
export function ThemeInit() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${theme}`);
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}
