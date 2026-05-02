'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';

/** Applique dir (rtl/ltr) et lang (ar/fr) sur <html> au montage et à chaque changement de langue. */
export function LocaleInit() {
  const locale = useLanguageStore((s) => s.locale);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', locale === 'ar' ? 'ar' : 'fr');
  }, [locale]);

  return null;
}
