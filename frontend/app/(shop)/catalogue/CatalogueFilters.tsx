'use client';

import Link from 'next/link';
import { spacing } from '@/lib/design-tokens';
import { useTranslation } from '@/lib/i18n';

const TABS = [
  { key: 'tous', labelKey: 'product.all' },
  { key: 'homme', labelKey: 'product.male' },
  { key: 'femme', labelKey: 'product.female' },
  { key: 'mixte', labelKey: 'product.unisex' },
] as const;

const SIZES = [
  { key: '20ml', label: '20ml' },
  { key: '50ml', label: '50ml' },
] as const;

export function CatalogueFilters({
  category,
  size,
}: {
  category: string;
  size: string;
}) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[3], justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
        {TABS.map(({ key, labelKey }) => {
          const active = key === category;
          return (
            <Link key={key} href={`/catalogue?category=${key}&size=${size}`}>
              <button
                type="button"
                style={{
                  borderRadius: 999,
                  padding: `${spacing[1]}px ${spacing[3]}px`,
                  border: '1px solid var(--color-border)',
                  backgroundColor: active ? 'var(--color-gold)' : 'transparent',
                  color: active ? 'var(--color-on-gold)' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: 13,
                  textTransform: 'uppercase',
                }}
              >
                {t(labelKey)}
              </button>
            </Link>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        <span style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: 12, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
          {t('product.size')}
        </span>
        <div style={{ display: 'inline-flex', backgroundColor: 'var(--color-surface2)', borderRadius: 999, border: '1px solid var(--color-border)', padding: 2 }}>
          {SIZES.map(({ key, label }) => {
            const active = key === size;
            return (
              <Link key={key} href={`/catalogue?category=${category}&size=${key}`}>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: `${spacing[1]}px ${spacing[3]}px`,
                    backgroundColor: active ? 'var(--color-gold)' : 'transparent',
                    color: active ? 'var(--color-on-gold)' : 'var(--color-text)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body), sans-serif',
                    fontSize: 12,
                  }}
                >
                  {label}
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
