'use client';

import Link from 'next/link';
import { useLanguageStore } from '@/store/languageStore';
import { ProductCard } from '@/components/shop/ProductCard';
import { spacing, typography } from '@/lib/design-tokens';
import type { Perfume } from '@/types/shared-types';
import { ProductDetailActions } from './ProductDetailActions';
import { resolveMediaSrc } from '@/lib/media-url';

type PerfumeWithAr = Perfume & {
  name_ar?: string | null;
  description_ar?: string | null;
  notes_ar?: { top?: string[]; heart?: string[]; base?: string[] };
  notesTopAr?: string[];
  notesHeartAr?: string[];
  notesBaseAr?: string[];
  intensity_ar?: string | null;
};

function getNotesArrays(perfume: PerfumeWithAr, useAr: boolean) {
  if (useAr && perfume.notes_ar) {
    const n = perfume.notes_ar;
    return {
      top: Array.isArray(n.top) ? n.top : [],
      heart: Array.isArray(n.heart) ? n.heart : [],
      base: Array.isArray(n.base) ? n.base : [],
    };
  }
  if (useAr && (perfume.notesTopAr || perfume.notesHeartAr || perfume.notesBaseAr)) {
    return {
      top: Array.isArray(perfume.notesTopAr) ? perfume.notesTopAr : [],
      heart: Array.isArray(perfume.notesHeartAr) ? perfume.notesHeartAr : [],
      base: Array.isArray(perfume.notesBaseAr) ? perfume.notesBaseAr : [],
    };
  }
  const notes = (perfume as { notes?: { top?: string[]; heart?: string[]; base?: string[] } }).notes;
  return {
    top: (notes?.top ?? perfume.notesTop ?? []) as string[],
    heart: (notes?.heart ?? perfume.notesHeart ?? []) as string[],
    base: (notes?.base ?? perfume.notesBase ?? []) as string[],
  };
}

const labelsFr = {
  back: '← Retour au catalogue',
  eauDeParfum: 'Eau de parfum',
  notesTop: 'Notes de tête',
  notesHeart: 'Notes de cœur',
  notesBase: 'Notes de fond',
  youMayLike: 'Vous aimerez aussi',
};

const labelsAr = {
  back: '→ العودة إلى الكتالوج',
  eauDeParfum: 'ماء عطر',
  notesTop: 'نوتات الرأس',
  notesHeart: 'نوتات القلب',
  notesBase: 'نوتات القاعدة',
  youMayLike: 'قد يعجبك أيضاً',
};

export function ProductDetailContent({
  perfume,
  related,
}: {
  perfume: PerfumeWithAr;
  related: Perfume[];
}) {
  const locale = useLanguageStore((s) => s.locale);
  const useAr = locale === 'ar';
  const hasAr =
    useAr &&
    (Boolean((perfume as PerfumeWithAr).name_ar) ||
      Boolean((perfume as PerfumeWithAr).description_ar) ||
      Boolean((perfume as PerfumeWithAr).notes_ar) ||
      Boolean((perfume as PerfumeWithAr).notesTopAr?.length));

  const displayName = useAr && (perfume as PerfumeWithAr).name_ar
    ? (perfume as PerfumeWithAr).name_ar!
    : perfume.name;
  const displayDescription = useAr && (perfume as PerfumeWithAr).description_ar
    ? (perfume as PerfumeWithAr).description_ar!
    : (perfume.description ?? '');
  const notes = getNotesArrays(perfume as PerfumeWithAr, useAr && hasAr);
  const isRtl = useAr && hasAr;
  const labels = useAr && hasAr ? labelsAr : labelsFr;

  const imageRaw =
    (perfume as { imageUrl?: string; image?: string }).imageUrl ||
    (perfume as { imageUrl?: string; image?: string }).image ||
    '';
  const imageUrl = imageRaw ? resolveMediaSrc(String(imageRaw)) : '';

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        padding: `${spacing[6]}px ${spacing[4]}px ${spacing[6]}px`,
        fontFamily: isRtl ? "'Noto Sans Arabic', sans-serif" : typography.fontBody,
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.2fr)', gap: spacing[6], alignItems: 'center' }}>
          <div
            style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#ffffff',
              padding: 24,
              minHeight: 360,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayName}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 320,
                  objectFit: 'contain',
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '24px',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 320,
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(200,150,10,0.1)',
                    border: '1px solid rgba(200,150,10,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                  }}
                >
                  🧴
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3],
              direction: isRtl ? 'rtl' : 'ltr',
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            <Link
              href="/catalogue"
              style={{
                fontFamily: isRtl ? "'Noto Sans Arabic', sans-serif" : typography.fontBody,
                fontSize: 12,
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              {labels.back}
            </Link>
            <p
              style={{
                margin: 0,
                fontFamily: isRtl ? "'Noto Sans Arabic', sans-serif" : typography.fontBody,
                letterSpacing: 0.32,
                textTransform: 'uppercase',
                fontSize: 11,
                color: 'var(--color-muted)',
              }}
            >
              {labels.eauDeParfum} — {perfume.category}
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: isRtl ? "'Noto Sans Arabic', sans-serif" : typography.fontDisplay,
                fontSize: 36,
                letterSpacing: 0.18,
                textTransform: 'uppercase',
                color: 'var(--color-text)',
              }}
            >
              {displayName}
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text)', opacity: 0.9 }}>
              {displayDescription}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: spacing[3],
                marginTop: spacing[2],
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    letterSpacing: 0.16,
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                  }}
                >
                  {labels.notesTop}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text)' }}>
                  {Array.isArray(notes.top) ? notes.top.join(', ') || '—' : '—'}
                </p>
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    letterSpacing: 0.16,
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                  }}
                >
                  {labels.notesHeart}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text)' }}>
                  {Array.isArray(notes.heart) ? notes.heart.join(', ') || '—' : '—'}
                </p>
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    letterSpacing: 0.16,
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                  }}
                >
                  {labels.notesBase}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text)' }}>
                  {Array.isArray(notes.base) ? notes.base.join(', ') || '—' : '—'}
                </p>
              </div>
            </div>

            <ProductDetailActions perfume={perfume} />
          </div>
        </div>

        {related.length > 0 && (
          <section style={{ marginTop: spacing[4] }}>
            <h2
              style={{
                margin: 0,
                fontFamily: typography.fontDisplay,
                fontSize: 24,
                letterSpacing: 0.14,
                textTransform: 'uppercase',
                color: 'var(--color-text)',
              }}
            >
              {labels.youMayLike}
            </h2>
            <div className="scentara-product-grid" style={{ marginTop: spacing[3] }}>
              {related.slice(0, 4).map((p: Perfume) => (
                <ProductCard key={p.id} perfume={p} size="20ml" />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
