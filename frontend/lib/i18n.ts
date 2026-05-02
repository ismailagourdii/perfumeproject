'use client';

import { useCallback } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import type { Locale } from '@/store/languageStore';

import fr from '@/messages/fr.json';
import ar from '@/messages/ar.json';

const messages: Record<Locale, Record<string, unknown>> = {
  fr: fr as Record<string, unknown>,
  ar: ar as Record<string, unknown>,
};

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export function useTranslation() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = messages[locale];

  const t = useCallback(
    (key: string): string => {
      const value = getNested(dict, key);
      return value ?? key;
    },
    [dict]
  );

  return { t, locale };
}

export type { Locale };
