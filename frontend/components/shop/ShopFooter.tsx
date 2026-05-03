'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { fetchPages, type PagePublic } from '@/lib/api';
import { spacing } from '@/lib/design-tokens';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import { NewsletterForm } from '@/components/shop/NewsletterForm';
import { resolveMediaSrc } from '@/lib/media-url';

export interface FooterLink {
  label: string;
  url: string;
}

const DEFAULT_FOOTER_DESCRIPTION = "Découvrez l'art du parfum marocain.";

export interface FooterSettings {
  site_logo?: string | null;
  footer_description?: string | null;
  footer_col1_title?: string | null;
  footer_col1_links?: FooterLink[];
  footer_col2_title?: string | null;
  footer_col2_links?: FooterLink[];
  footer_col3_title?: string | null;
  footer_col3_links?: FooterLink[];
  footer_newsletter_enabled?: boolean;
  footer_social_facebook?: string | null;
  footer_social_instagram?: string | null;
  footer_social_tiktok?: string | null;
  footer_social_linkedin?: string | null;
  footer_social_youtube?: string | null;
  footer_copyright?: string | null;
}

const defaultCol1Links: FooterLink[] = [
  { label: 'À propos', url: '/catalogue' },
  { label: 'Contact', url: '#contact' },
  { label: 'Packs', url: '/pack-builder' },
];
const defaultCol2Links: FooterLink[] = [
  { label: 'Livraison', url: '/cart' },
  { label: 'FAQ', url: '#faq' },
];
const defaultCol3Links: FooterLink[] = [
  { label: 'Catalogue', url: '/catalogue' },
  { label: 'Panier', url: '/cart' },
  { label: 'Connexion', url: '/login' },
];

function parseLinks(val: unknown): FooterLink[] {
  if (Array.isArray(val)) {
    return val.filter((item) => item && typeof item.label === 'string' && typeof item.url === 'string');
  }
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.filter((item: unknown) => item && typeof (item as FooterLink).label === 'string' && typeof (item as FooterLink).url === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function ShopFooter() {
  const { t } = useTranslation();
  const locale = useLanguageStore((s) => s.locale);
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [footerPages, setFooterPages] = useState<PagePublic[]>([]);

  useEffect(() => {
    api
      .get<{ settings: FooterSettings & Record<string, unknown> }>('/settings/shop')
      .then((res) => setSettings(res.data?.settings ?? null))
      .catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    fetchPages({ show_in_footer: true })
      .then(setFooterPages)
      .catch(() => setFooterPages([]));
  }, []);

  const description = settings?.footer_description || t('footer.description') || DEFAULT_FOOTER_DESCRIPTION;
  const siteLogoRaw = settings?.site_logo ?? null;
  const siteLogo = siteLogoRaw ? resolveMediaSrc(String(siteLogoRaw)) : null;
  const col1Title = settings?.footer_col1_title ?? t('footer.company');
  const col1LinksBase = parseLinks(settings?.footer_col1_links).length ? parseLinks(settings?.footer_col1_links) : defaultCol1Links;
  const col1Links = [
    ...col1LinksBase,
    ...footerPages.map((p) => ({
      label: locale === 'ar' && p.title_ar ? (p.title_ar ?? p.title ?? '') : (p.title ?? ''),
      url: `/pages/${p.slug}`,
    })),
  ];
  const col2Title = settings?.footer_col2_title ?? t('footer.help');
  const col2Links = parseLinks(settings?.footer_col2_links).length ? parseLinks(settings?.footer_col2_links) : defaultCol2Links;
  const col3Title = settings?.footer_col3_title ?? t('footer.links');
  const col3Links = parseLinks(settings?.footer_col3_links).length ? parseLinks(settings?.footer_col3_links) : defaultCol3Links;
  const newsletterEnabled = settings?.footer_newsletter_enabled !== false;
  const copyright = settings?.footer_copyright ?? t('footer.rights');

  const socials: { key: string; url: string | null | undefined; label: string; Icon: React.FC }[] = [
    { key: 'facebook', url: settings?.footer_social_facebook, label: 'Facebook', Icon: FacebookIcon },
    { key: 'instagram', url: settings?.footer_social_instagram, label: 'Instagram', Icon: InstagramIcon },
    { key: 'tiktok', url: settings?.footer_social_tiktok, label: 'TikTok', Icon: TikTokIcon },
    { key: 'linkedin', url: settings?.footer_social_linkedin, label: 'LinkedIn', Icon: LinkedInIcon },
    { key: 'youtube', url: settings?.footer_social_youtube, label: 'YouTube', Icon: YouTubeIcon },
  ];

  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        padding: `${spacing[7]}px 24px ${spacing[4]}px`,
        marginTop: spacing[7],
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="scentara-footer-grid" style={{ marginBottom: 48 }}>
          <div>
            {siteLogo ? (
              <img
                src={siteLogo}
                style={{
                  width: 80,
                  height: 140,
                  objectFit: 'contain',
                  border: '2px solid #c8960a',
                  borderRadius: 12,
                  background: '#ffffff',
                  padding: 6,
                  marginBottom: 16,
                  display: 'block',
                }}
              />
            ) : (
              <p style={{ margin: '0 0 12px', fontFamily: 'var(--font-display), serif', fontSize: 20, fontWeight: 600, color: 'var(--color-text)' }}>SCENTARA</p>
            )}
            <p style={{ margin: 0, fontFamily: 'var(--font-body), sans-serif', fontSize: 14, lineHeight: 1.6, color: 'var(--color-muted)', maxWidth: 320 }}>
              {description}
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 16px', fontFamily: 'var(--font-body), sans-serif', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)' }}>
              {col1Title}
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col1Links.map((link) => (
                <Link key={link.url + link.label} href={link.url} style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 14, color: 'var(--color-text)', textDecoration: 'none' }}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p style={{ margin: '0 0 16px', fontFamily: 'var(--font-body), sans-serif', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)' }}>
              {col2Title}
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col2Links.map((link) => (
                <Link key={link.url + link.label} href={link.url} style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 14, color: 'var(--color-text)', textDecoration: 'none' }}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p style={{ margin: '0 0 16px', fontFamily: 'var(--font-body), sans-serif', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)' }}>
              {col3Title}
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col3Links.map((link) => (
                <Link key={link.url + link.label} href={link.url} style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 14, color: 'var(--color-text)', textDecoration: 'none' }}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        {newsletterEnabled && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24, marginBottom: 32 }}>
            <p style={{ margin: '0 0 16px', fontFamily: 'var(--font-body), sans-serif', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)' }}>
              {t('footer.newsletter')}
            </p>
            <NewsletterForm />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body), sans-serif', fontSize: 13, color: 'var(--color-muted)' }}>
            {copyright}
          </p>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {socials.map(({ key, url, label, Icon }) => (url ? <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} style={{ color: 'var(--color-muted)' }}><Icon /></a> : null))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1.05-.08 6.33 6.33 0 00-6.33 6.33 6.33 6.33 0 0010.29 4.94v-6.1a8.16 8.16 0 004.4 1.26v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
