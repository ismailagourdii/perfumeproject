'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/lib/i18n';
import api from '@/lib/api';
import { fetchPages, type PagePublic } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { typography } from '@/lib/design-tokens';
import { resolveMediaSrc } from '@/lib/media-url';

const NAV_LINKS = [
  { href: '/', labelKey: 'nav.home', exact: true },
  { href: '/catalogue', labelKey: 'nav.collection', exact: false },
  { href: '/pack-builder', labelKey: 'pack.title', exact: false },
  { href: '/contact', labelKey: 'nav.contact', exact: true },
];

type NavItem = { href: string; labelKey: string | null; label: string | null; exact: boolean };

export function ShopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const locale = useLanguageStore((s) => s.locale);
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [navbarPages, setNavbarPages] = useState<PagePublic[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchOverlayRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [
    ...NAV_LINKS.map((l) => ({ href: l.href, labelKey: l.labelKey, label: null, exact: l.exact })),
    ...navbarPages.map((p) => ({
      href: `/pages/${p.slug}`,
      labelKey: null,
      label: locale === 'ar' && p.title_ar ? (p.title_ar ?? p.title ?? '') : (p.title ?? ''),
      exact: false,
    })),
  ];

  useEffect(() => {
    fetchPages({ show_in_navbar: true })
      .then(setNavbarPages)
      .catch(() => setNavbarPages([]));
  }, []);

  useEffect(() => {
    api
      .get<{ settings?: { site_logo?: string | null } }>('/settings/shop')
      .then((res) => {
        const raw = res.data?.settings?.site_logo;
        setSiteLogo(raw ? resolveMediaSrc(String(raw)) : null);
      })
      .catch(() => setSiteLogo(null));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!accountDropdownOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    window.addEventListener('click', onClickOutside);
    return () => window.removeEventListener('click', onClickOutside);
  }, [accountDropdownOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    setSearchQuery('');
    if (q) router.push(`/catalogue?search=${encodeURIComponent(q)}`);
  };

  const handleSearchOverlayClick = (e: React.MouseEvent) => {
    if (e.target === searchOverlayRef.current) setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    setAccountDropdownOpen(false);
    router.push('/');
  };

  return (
    <header
      className="scentara-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 64,
        overflow: 'visible',
        padding: '0 40px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        className="scentara-navbar-inner"
        style={{
          position: 'relative',
          overflow: 'visible',
          zIndex: 50,
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 90px 1fr',
          alignItems: 'center',
        }}
      >
        <nav
          className="scentara-nav-links"
          style={{
            justifySelf: 'start',
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
          aria-label="Navigation principale"
        >
          {navItems.map(({ href, labelKey, label, exact }) => {
            const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href + (labelKey ?? label ?? '')}
                href={href}
                style={{
                  fontFamily: typography.fontBody,
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? 'var(--color-gold)' : 'var(--color-text)',
                  textDecoration: 'none',
                }}
              >
                {labelKey ? t(labelKey) : label}
              </Link>
            );
          })}
        </nav>

        <div style={{ position: 'relative', overflow: 'visible', width: 90, height: 0 }}>
          {siteLogo ? (
            <Link
              href="/"
              style={{
                display: 'block',
                textDecoration: 'none',
              }}
              className="scentara-navbar-logo-link"
            >
              <div
                className="scentara-navbar-logo-box"
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: -22,
                  width: 72,
                  height: 125,
                  borderRadius: 12,
                  border: '2.5px solid #c8960a',
                  background: '#ffffff',
                  boxShadow: '0 4px 16px rgba(200,150,10,0.2)',
                  zIndex: 100,
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={siteLogo}
                  alt="SCENTARA"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: 4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </Link>
          ) : null}
        </div>

        <div className="scentara-nav-actions" style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            type="button"
            aria-label="Rechercher"
            aria-expanded={searchOpen}
            className="scentara-nav-icon-btn"
            onClick={() => setSearchOpen((o) => !o)}
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            <SearchIcon />
          </button>
          <Link
            href="/cart"
            aria-label={cartCount > 0 ? `${t('nav.cart')} (${cartCount})` : t('nav.cart')}
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text)',
              position: 'relative',
            }}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: 'var(--color-gold)',
                  color: 'var(--color-on-gold)',
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
          <div ref={accountDropdownRef} style={{ position: 'relative' }}>
            {user ? (
              <>
                <button
                  type="button"
                  aria-label="Compte"
                  aria-expanded={accountDropdownOpen}
                  aria-haspopup="true"
                  className="scentara-nav-icon-btn"
                  onClick={() => setAccountDropdownOpen((o) => !o)}
                  style={{
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    minHeight: 44,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  <UserIcon />
                </button>
                {accountDropdownOpen && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 4,
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      padding: '8px 0',
                      minWidth: 180,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      zIndex: 100,
                    }}
                  >
                    <Link
                      href="/dashboard/user/profile"
                      role="menuitem"
                      onClick={() => setAccountDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        fontFamily: 'var(--font-body), sans-serif',
                        fontSize: 14,
                        color: 'var(--color-text)',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-gold)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    >
                      Mon compte
                    </Link>
                    <Link
                      href="/dashboard/user/orders"
                      role="menuitem"
                      onClick={() => setAccountDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        fontFamily: 'var(--font-body), sans-serif',
                        fontSize: 14,
                        color: 'var(--color-text)',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-gold)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    >
                      Mes commandes
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        border: 'none',
                        background: 'none',
                        fontFamily: 'var(--font-body), sans-serif',
                        fontSize: 14,
                        color: 'var(--color-text)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-gold)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                aria-label="Compte"
                style={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  minHeight: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text)',
                }}
              >
                <UserIcon />
              </Link>
            )}
          </div>
          <LanguageToggle />
          <button
            type="button"
            aria-label="Changer le thème"
            onClick={toggleTheme}
            className="scentara-nav-icon-btn"
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            <ThemeIcon />
          </button>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="scentara-nav-hamburger"
            onClick={() => setMobileOpen((o) => !o)}
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div
          ref={searchOverlayRef}
          role="dialog"
          aria-label="Recherche"
          onClick={handleSearchOverlayClick}
          style={{
            width: '100%',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '16px 40px',
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: 1280, margin: '0 auto' }}>
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un parfum..."
              autoComplete="off"
              style={{
                width: '100%',
                padding: '14px 20px',
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: 18,
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                backgroundColor: 'var(--color-surface2)',
                color: 'var(--color-text)',
                outline: 'none',
              }}
            />
          </form>
        </div>
      )}

      {/* Mobile full-screen menu (slide from right) */}
      <div
        className="scentara-nav-mobile-drawer"
        aria-hidden={!mobileOpen}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'var(--color-surface)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          padding: 24,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', textDecoration: 'none' }}>
            {siteLogo ? (
              <div
                className="scentara-nav-mobile-menu-logo"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  border: '2px solid #c8960a',
                  background: '#ffffff',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src={siteLogo} alt="SCENTARA" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4, boxSizing: 'border-box' }} />
              </div>
            ) : (
              <span style={{ fontFamily: typography.fontDisplay, fontSize: 20, fontWeight: 600, color: 'var(--color-text)' }}>✦ SCENTARA</span>
            )}
          </Link>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          {navItems.map(({ href, labelKey, label, exact }) => {
            const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href + (labelKey ?? label ?? '')}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: 'var(--font-display), Cormorant Garamond, serif',
                  fontSize: 24,
                  padding: '16px 0',
                  borderBottom: '1px solid var(--color-border)',
                  color: isActive ? 'var(--color-gold)' : 'var(--color-text)',
                  textDecoration: 'none',
                }}
              >
                {labelKey ? t(labelKey) : label}
              </Link>
            );
          })}

          <div style={{ height: 1, background: 'var(--color-border)', margin: '16px 0' }} />

          <button
            type="button"
            onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
            style={{
              fontFamily: 'var(--font-display), Cormorant Garamond, serif',
              fontSize: 24,
              padding: '16px 0',
              borderBottom: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            {t('product.search')}
          </button>
          {user ? (
            <Link
              href="/dashboard/user/profile"
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-display), Cormorant Garamond, serif',
                fontSize: 24,
                padding: '16px 0',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                textDecoration: 'none',
              }}
            >
              Mon compte
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-display), Cormorant Garamond, serif',
                fontSize: 24,
                padding: '16px 0',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                textDecoration: 'none',
              }}
            >
              {t('nav.login')}
            </Link>
          )}
          <Link
            href="/cart"
            onClick={() => setMobileOpen(false)}
            style={{
              fontFamily: 'var(--font-display), Cormorant Garamond, serif',
              fontSize: 24,
              padding: '16px 0',
              borderBottom: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {t('nav.cart')}
            {cartCount > 0 && (
              <span style={{ minWidth: 22, height: 22, borderRadius: 11, background: 'var(--color-gold)', color: 'var(--color-on-gold)', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </Link>

          <div style={{ height: 1, background: 'var(--color-border)', margin: '16px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0' }}>
            <LanguageToggle />
            <button
              type="button"
              aria-label="Changer le thème"
              onClick={() => toggleTheme()}
              style={{
                width: 44,
                height: 44,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <ThemeIcon />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ThemeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
