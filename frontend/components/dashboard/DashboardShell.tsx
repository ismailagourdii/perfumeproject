'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useAuthStore } from '@/store/authStore';
import api, { API_SUPER_ADMIN, logout as apiLogout } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

const superadminNav = [
  { labelKey: 'dashboard.overview', href: '/dashboard/superadmin/overview' },
  { labelKey: 'dashboard.orders', href: '/dashboard/superadmin/orders' },
  { labelKey: 'dashboard.products', href: '/dashboard/superadmin/products' },
  { labelKey: 'dashboard.slider', href: '/dashboard/superadmin/slider' },
  { labelKey: 'dashboard.media', href: '/dashboard/superadmin/media' },
  { labelKey: 'dashboard.banners', href: '/dashboard/superadmin/banners' },
  { labelKey: 'dashboard.collections', href: '/dashboard/superadmin/collections' },
  { labelKey: 'dashboard.pages', href: '/dashboard/superadmin/pages' },
  { labelKey: 'dashboard.settings', href: '/dashboard/superadmin/settings' },
  { labelKey: 'dashboard.admins', href: '/dashboard/superadmin/admins' },
];

const adminNav = [
  { labelKey: 'dashboard.overview', href: '/dashboard/admin/overview' },
  { labelKey: 'dashboard.orders', href: '/dashboard/admin/orders' },
  { labelKey: 'dashboard.inventory', href: '/dashboard/admin/inventory' },
];

const userNav = [
  { labelKey: 'dashboard.myOrders', href: '/dashboard/user/orders' },
  { labelKey: 'dashboard.profile', href: '/dashboard/user/profile' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, token, role, logout, _hasHydrated, setHasHydrated } = useAuthStore();
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    return () => unsub?.();
    // setHasHydrated est stable (Zustand) ; éviter de relancer rehydrate à chaque rendu
    // eslint-disable-next-line react-hooks/exhaustive-deps -- exécution unique au montage
  }, []);

  useEffect(() => {
    api
      .get<{ settings?: Record<string, unknown>; data?: { site?: { site_logo?: string | null } } }>(`${API_SUPER_ADMIN}/settings`)
      .then((res) => {
        const flatLogo = (res.data?.settings as Record<string, unknown> | undefined)?.site_logo as string | null | undefined;
        const nestedLogo = res.data?.data?.site?.site_logo ?? null;
        setSiteLogo((flatLogo ?? nestedLogo) || null);
      })
      .catch(() => {
        setSiteLogo(null);
      });
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user && !token) {
      router.replace('/login');
    }
    // router (next/navigation) peut changer d’identité à chaque rendu et provoquer une boucle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, user, token]);

  if (!_hasHydrated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-muted)',
          fontFamily: typography.fontBody,
        }}
      >
        {t('common.loading')}
      </div>
    );
  }

  if (!user && !token) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-muted)',
          fontFamily: typography.fontBody,
        }}
      >
        {t('common.redirecting')}
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      logout();
      router.push('/login');
    }
  };

  const navItems =
    role === 'superadmin'
      ? superadminNav
      : role === 'admin'
        ? adminNav
        : userNav;

  return (
    <div
      className="scentara-dashboard-shell"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface)',
        display: 'flex',
      }}
    >
      <aside
        className="scentara-dashboard-sidebar"
        style={{
          width: 260,
          backgroundColor: 'var(--color-surface2)',
          borderRight: '1px solid var(--color-border)',
          padding: spacing[5],
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          minHeight: '100vh',
        }}
      >
        <div>
          <Link
            href="/dashboard"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: spacing[2],
              marginBottom: spacing[4],
            }}
          >
            {siteLogo && (
              <div
                style={{
                  width: 70,
                  height: 122,
                  borderRadius: 10,
                  border: '2px solid #c8960a',
                  background: '#ffffff',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={siteLogo}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            )}
          </Link>
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[1],
            }}
          >
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: `${spacing[2]}px ${spacing[3]}px`,
                    borderRadius: 8,
                    color: isActive ? 'var(--color-gold)' : 'var(--color-cream)',
                    fontSize: 14,
                    textDecoration: 'none',
                    backgroundColor: isActive ? 'var(--color-surface2)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-gold)' : '3px solid transparent',
                  }}
                >
                  {item.labelKey === 'dashboard.slider' || item.labelKey === 'dashboard.media' || item.labelKey === 'dashboard.collections'
                    ? `🖼️ ${t(item.labelKey)}`
                    : item.labelKey === 'dashboard.pages'
                      ? `📄 ${t(item.labelKey)}`
                      : t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: spacing[3],
          }}
        >
          <div
            style={{
              marginBottom: spacing[2],
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-cream)',
            }}
          >
            {user?.name ?? 'Invité'}
          </div>
          <div
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 0.08,
              color: 'var(--color-muted)',
              border: '1px solid var(--color-border)',
              marginBottom: spacing[3],
            }}
          >
            {role ?? '—'}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              marginBottom: spacing[2],
            }}
          >
            <LanguageToggle />
            <ThemeToggle />
            <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
              {t('common.theme')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={handleLogout}
          >
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          padding: spacing[6],
          backgroundColor: 'var(--color-surface)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
