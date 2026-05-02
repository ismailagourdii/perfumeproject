'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchPageBySlug } from '@/lib/api';
import type { PageFull } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { spacing, typography } from '@/lib/design-tokens';

export default function PublicPageBySlug() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const locale = useLanguageStore((s) => s.locale);
  const [page, setPage] = useState<PageFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    setLoading(true);
    setNotFound(false);
    fetchPageBySlug(slug)
      .then((res) => {
        setPage(res.page);
      })
      .catch(() => {
        setPage(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: spacing[6], textAlign: 'center', color: 'var(--color-muted)' }}>
        Chargement…
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: spacing[6] }}>
        <p style={{ marginBottom: spacing[4], color: 'var(--color-muted)' }}>Page introuvable.</p>
        <Link href="/" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 500 }}>
          ← Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const useAr = locale === 'ar' && page.title_ar != null && page.title_ar !== '';
  const title = useAr ? (page.title_ar ?? page.title) : (page.title ?? '');
  const content = useAr ? (page.content_ar ?? page.content) : (page.content ?? '');
  const isRtl = useAr;

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: `${spacing[6]}px 24px`,
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      <nav style={{ marginBottom: spacing[4], fontSize: 14, color: 'var(--color-muted)' }} aria-label="Fil d'Ariane">
        <Link href="/" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>→</span>
        <span style={{ color: 'var(--color-text)' }}>{title}</span>
      </nav>

      <article>
        <h1
          style={{
            margin: '0 0 24px',
            fontFamily: typography.fontDisplay,
            fontSize: 36,
            fontWeight: 600,
            lineHeight: 1.2,
            color: 'var(--color-text)',
          }}
        >
          {title}
        </h1>
        <div
          className="scentara-page-prose"
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: 'var(--color-text)',
          }}
          dangerouslySetInnerHTML={{ __html: content || '<p></p>' }}
        />
      </article>
    </div>
  );
}
