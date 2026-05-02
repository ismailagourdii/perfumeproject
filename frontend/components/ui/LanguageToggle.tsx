'use client';

import React from 'react';
import { useLanguageStore } from '@/store/languageStore';

export interface LanguageToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Bouton FR / ع pour basculer entre français et arabe (RTL). */
export function LanguageToggle({ className, style }: LanguageToggleProps) {
  const locale = useLanguageStore((s) => s.locale);
  const toggle = useLanguageStore((s) => s.toggle);
  const isAr = locale === 'ar';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isAr ? 'Passer en français' : 'التبديل إلى العربية'}
      className={className}
      style={{
        width: 40,
        height: 40,
        borderRadius: 9999,
        border: '1px solid var(--color-gold)',
        background: 'var(--color-surface)',
        color: 'var(--color-gold)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body), DM Sans, sans-serif',
        fontSize: 14,
        fontWeight: 600,
        transition: 'background 0.2s, color 0.2s, border-color 0.2s',
        ...style,
      }}
    >
      {isAr ? 'ع' : 'FR'}
    </button>
  );
}
