'use client';

import Link from 'next/link';
import type { Perfume, PerfumeSize, GenderCategory } from '@/types/shared-types';
import { useCartStore } from '@/store/cartStore';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';

export interface ProductCardProps {
  perfume: Perfume;
  size: PerfumeSize;
  /** Hide cart button (e.g. when used in a list that has its own actions) */
  showCart?: boolean;
}

function categoryLabel(category: GenderCategory, locale: 'fr' | 'ar', t: (k: string) => string): string {
  if (locale === 'ar') {
    const map: Record<GenderCategory, string> = {
      homme: t('product.male'),
      femme: t('product.female'),
      mixte: t('product.unisex'),
    };
    return map[category];
  }
  const map: Record<GenderCategory, string> = {
    homme: 'HOMME',
    femme: 'FEMME',
    mixte: 'MIXTE',
  };
  return map[category];
}

function BottlePlaceholder() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="72" height="72" viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="32" cy="32" r="30" fill="rgba(200,150,10,0.08)" stroke="rgba(200,150,10,0.25)" strokeWidth="1" />
        <path
          d="M28 18h8v6a8 8 0 0 1 8 8v20a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V32a8 8 0 0 1 8-8v-6Z"
          fill="rgba(200,150,10,0.15)"
          stroke="#c8960a"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}

export function ProductCard({ perfume, size, showCart = true }: ProductCardProps) {
  const { t } = useTranslation();
  const locale = useLanguageStore((s) => s.locale);
  const add = useCartStore((s) => s.add);
  const price = size === '20ml' ? perfume.price20ml : perfume.price50ml;
  const imageUrl =
    (perfume as { imageUrl?: string; image?: string }).imageUrl ||
    (perfume as { imageUrl?: string; image?: string }).image ||
    '';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      id: `single-${perfume.id}-${size}`,
      kind: 'single',
      perfume,
      size,
      unitPrice: price,
      quantity: 1,
    });
  };

  const cat = categoryLabel(perfume.category, locale, t);

  return (
    <Link href={`/catalogue/${perfume.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <article className="scentara-luxury-product-card scentara-product-card">
        <div className="scentara-luxury-image-zone">
          {imageUrl ? (
            <img
              className="scentara-luxury-img"
              src={imageUrl}
              alt={perfume.name}
              loading="lazy"
            />
          ) : (
            <BottlePlaceholder />
          )}
          <div className="scentara-luxury-overlay">
            {showCart && (
              <button
                type="button"
                className="scentara-luxury-overlay-btn"
                onClick={handleAdd}
                aria-label={`${t('product.addToCart')} ${perfume.name}`}
              >
                {t('product.addToCart')}
              </button>
            )}
            <span className="scentara-luxury-overlay-link">{t('product.viewProduct')}</span>
          </div>
        </div>
        <div style={{ padding: '20px 20px 24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#a09070',
              marginBottom: 8,
            }}
          >
            <span>{cat}</span>
            <span style={{ letterSpacing: '0.2em' }}>· EDP</span>
          </div>
          <h3
            style={{
              margin: '0 0 8px',
              fontFamily: "var(--font-display), 'Cormorant Garamond', serif",
              fontSize: 20,
              fontWeight: 600,
              color: '#1a1208',
              lineHeight: 1.2,
            }}
          >
            {perfume.name}
          </h3>
          <div
            style={{
              width: 32,
              height: 1,
              background: '#c8960a',
              opacity: 0.4,
              marginBottom: 8,
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 500,
              color: '#c8960a',
              letterSpacing: '0.03em',
            }}
          >
            {price.toLocaleString('fr-MA')} MAD
          </p>
        </div>
      </article>
    </Link>
  );
}
