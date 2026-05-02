import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'scentara_theme';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

function getDefaultTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const t = parsed?.state?.theme;
    if (t === 'light' || t === 'dark') return t;
  } catch {}
  return 'light';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggle: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          return { theme: next };
        }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const theme = state.theme ?? getDefaultTheme();
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('theme-light', 'theme-dark');
          document.documentElement.classList.add(`theme-${theme}`);
        }
      },
    }
  )
);

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const t = parsed?.state?.theme;
    return t === 'light' || t === 'dark' ? t : 'light';
  } catch {
    return 'light';
  }
}
