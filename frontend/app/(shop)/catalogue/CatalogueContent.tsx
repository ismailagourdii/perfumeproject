'use client';

import Link from 'next/link';
import type { Perfume } from '@/types/shared-types';
import { ProductCard } from '@/components/shop/ProductCard';
import { CatalogueFilters } from './CatalogueFilters';
import { spacing } from '@/lib/design-tokens';
import { useTranslation } from '@/lib/i18n';

type TabKey = 'tous' | 'homme' | 'femme' | 'mixte';

export function CatalogueContent({
  perfumes,
  current_page,
  last_page,
  category,
  size,
}: {
  perfumes: Perfume[];
  current_page: number;
  last_page: number;
  category: TabKey;
  size: '20ml' | '50ml';
}) {
  const { t } = useTranslation();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <main
        style={{
          padding: `${spacing[6]}px 24px ${spacing[7]}px`,
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        <header style={{ marginBottom: 32 }}>
          <p
            style={{
              margin: '0 0 8px',
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-muted)',
            }}
          >
            {t('catalogue.collection')}
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display), serif',
              fontSize: 36,
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            {t('catalogue.title')}
          </h1>
        </header>

        <CatalogueFilters category={category} size={size} />

        <div className="scentara-product-grid" style={{ marginTop: 32 }}>
          {perfumes.map((perfume: Perfume) => (
            <ProductCard key={perfume.id} perfume={perfume} size={size} />
          ))}
        </div>

        {perfumes.length === 0 && (
          <p style={{ marginTop: 48, textAlign: 'center', fontFamily: 'var(--font-body), sans-serif', fontSize: 16, color: 'var(--color-muted)' }}>
            {t('product.noProductsInCategory')}
          </p>
        )}

        <nav
          aria-label="Pagination catalogue"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            marginTop: 48,
            flexWrap: 'wrap',
          }}
        >
          {current_page > 1 && (
            <Link
              href={`/catalogue?category=${category}&size=${size}&page=${current_page - 1}`}
              style={{
                padding: '10px 20px',
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--color-text)',
                textDecoration: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                backgroundColor: 'var(--color-surface)',
              }}
            >
              {t('common.prevPage')}
            </Link>
          )}
          <span style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 14, color: 'var(--color-muted)' }}>
            {t('common.page')} {current_page} {t('common.of')} {last_page || 1}
          </span>
          {current_page < last_page && (
            <Link
              href={`/catalogue?category=${category}&size=${size}&page=${current_page + 1}`}
              style={{
                padding: '10px 20px',
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--color-text)',
                textDecoration: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                backgroundColor: 'var(--color-surface)',
              }}
            >
              {t('common.nextPage')}
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
