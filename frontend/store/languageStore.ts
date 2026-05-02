import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'scentara_locale';

export type Locale = 'fr' | 'ar';

interface LanguageState {
  locale: Locale;
  toggle: () => void;
  setLocale: (locale: Locale) => void;
}

function getDefaultLocale(): Locale {
  if (typeof window === 'undefined') return 'fr';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const l = parsed?.state?.locale;
    if (l === 'fr' || l === 'ar') return l;
  } catch {}
  return 'fr';
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: 'fr',
      toggle: () =>
        set((s) => {
          const next: Locale = s.locale === 'ar' ? 'fr' : 'ar';
          return { locale: next };
        }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ locale: s.locale }),
      onRehydrateStorage: () => (state) => {
        if (!state || typeof document === 'undefined') return;
        const locale = state.locale ?? getDefaultLocale();
        document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', locale === 'ar' ? 'ar' : 'fr');
      },
    }
  )
);

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'fr';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const l = parsed?.state?.locale;
    return l === 'fr' || l === 'ar' ? l : 'fr';
  } catch {
    return 'fr';
  }
}
