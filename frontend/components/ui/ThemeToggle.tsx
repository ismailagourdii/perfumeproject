'use client';

import React from 'react';
import { useThemeStore } from '@/store/themeStore';

export interface ThemeToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Bouton soleil/lune pour basculer entre thème clair et sombre. */
export function ThemeToggle({ className, style }: ThemeToggleProps) {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
      className={className}
      style={{
        width: 40,
        height: 40,
        borderRadius: 9999,
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface2)',
        color: 'var(--color-gold)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s, color 0.2s, border-color 0.2s',
        ...style,
      }}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
