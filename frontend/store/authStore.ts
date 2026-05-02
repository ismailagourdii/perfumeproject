import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/shared-types';

const AUTH_STORAGE_KEY = 'scentara_auth';
const AUTH_COOKIE_NAME = 'scentara_token';
const COOKIE_MAX_AGE_DAYS = 7;

function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

interface AuthState {
  user: User | null;
  token: string | null;
  role: User['role'] | null;
  _hasHydrated: boolean;
  login: (payload: { user: User; token: string }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setHasHydrated: (value: boolean) => void;
}

type AuthPersisted = Pick<AuthState, 'user' | 'token' | 'role'>;

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], AuthPersisted>(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      _hasHydrated: false,
      login: ({ user, token }) => {
        setAuthCookie(token);
        set({ user, token, role: user.role });
      },
      logout: () => {
        clearAuthCookie();
        set({ user: null, token: null, role: null });
      },
      isAuthenticated: () => get().token !== null,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (typeof document !== 'undefined' && state?.token) setAuthCookie(state.token);
        if (typeof document !== 'undefined') useAuthStore.getState().setHasHydrated(true);
      },
    }
  )
);
