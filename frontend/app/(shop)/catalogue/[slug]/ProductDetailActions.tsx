'use client';

import { useState } from 'react';
import type { Perfume, PerfumeSize } from '@/types/shared-types';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { spacing, typography } from '@/lib/design-tokens';

export function ProductDetailActions({ perfume }: { perfume: Perfume }) {
  const [size, setSize] = useState<PerfumeSize>('20ml');
  const add = useCartStore((s) => s.add);
  const p = perfume as Perfume & { price_20ml?: number; price_50ml?: number };
  const price =
    size === '20ml'
      ? (perfume.price20ml ?? p.price_20ml ?? 0)
      : (perfume.price50ml ?? p.price_50ml ?? 0);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginTop: spacing[3] }}>
        <div style={{ display: 'inline-flex', backgroundColor: 'var(--color-surface2)', borderRadius: 999, border: '1px solid var(--color-border)', padding: 2 }}>
          {(['20ml', '50ml'] as const).map((key) => {
            const active = key === size;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSize(key)}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: `${spacing[1]}px ${spacing[3]}px`,
                  backgroundColor: active ? 'var(--color-gold)' : 'transparent',
                  color: active ? 'var(--color-on-gold)' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontFamily: typography.fontBody,
                  fontSize: 12,
                }}
              >
                {key}
              </button>
            );
          })}
        </div>
        <span style={{ fontFamily: typography.fontBody, fontSize: 18, fontWeight: 600, color: 'var(--color-gold-light)' }}>
          {price.toLocaleString('fr-MA')} MAD
        </span>
      </div>
      <div style={{ marginTop: spacing[2] }}>
        <Button
          size="lg"
          onClick={() =>
            add({
              id: `single-${perfume.id}-${size}`,
              kind: 'single',
              perfume,
              size,
              unitPrice: price,
              quantity: 1,
            })
          }
        >
          Ajouter au panier
        </Button>
      </div>
    </>
  );
}
