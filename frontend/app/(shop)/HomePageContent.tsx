'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeroCarousel } from '@/components/shop/HeroCarousel';
import { ProductCard } from '@/components/shop/ProductCard';
import api from '@/lib/api';
import type { Perfume } from '@/types/shared-types';
import { spacing, typography } from '@/lib/design-tokens';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import { resolveMediaSrc } from '@/lib/media-url';

const CATEGORY_HOMME_IMG =
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80';
const CATEGORY_FEMME_IMG =
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80';

interface HomeCollection {
  id: number;
  key: string;
  title_fr: string | null;
  title_ar: string | null;
  subtitle_fr: string | null;
  subtitle_ar: string | null;
  image: string | null;
  link: string | null;
  sort_order: number;
  is_active: boolean;
}

function resolveCollectionImage(key: string, image: string | null | undefined): string {
  const raw = String(image ?? '').trim();
  if (raw) {
    return resolveMediaSrc(raw);
  }
  if (key.toLowerCase() === 'homme') return CATEGORY_HOMME_IMG;
  if (key.toLowerCase() === 'femme') return CATEGORY_FEMME_IMG;
  return CATEGORY_HOMME_IMG;
}



export function HomePageContent({
  popularProducts,
  newProducts,
}: {
  popularProducts: Perfume[];
  newProducts: Perfume[];
}) {
  const { t } = useTranslation();
  const locale = useLanguageStore((s) => s.locale);
  const [collections, setCollections] = useState<HomeCollection[]>([]);

  useEffect(() => {
    api
      .get<HomeCollection[] | { data?: HomeCollection[] }>('/collections')
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray((res.data as { data?: HomeCollection[] })?.data)
            ? (res.data as { data?: HomeCollection[] }).data ?? []
            : [];
        const ordered = list
          .filter((item) => item?.is_active !== false)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        setCollections(ordered);
      })
      .catch(() => {
        setCollections([]);
      });
  }, []);

  return (
    <>
      <HeroCarousel />

      <section className="scentara-home-products-section">
        <header className="scentara-section-header">
          <p className="scentara-section-header__label" style={{ fontFamily: typography.fontBody }}>
            {t('home.popularSub')}
          </p>
          <h2 className="scentara-section-header__title">{t('home.popular')}</h2>
          <div className="scentara-section-header__rule" aria-hidden />
        </header>
        <div className="scentara-product-grid">
          {popularProducts.map((perfume) => (
            <ProductCard key={perfume.id} perfume={perfume} size="20ml" />
          ))}
        </div>
        {popularProducts.length === 0 && (
          <p style={{ marginTop: spacing[4], fontFamily: typography.fontBody, fontSize: 14, color: 'var(--color-muted)' }}>
            {t('product.noProductsInCategory')}
          </p>
        )}
      </section>

      <section className="scentara-home-categories-section">
        <header className="scentara-section-header">
          <p className="scentara-section-header__label" style={{ fontFamily: typography.fontBody }}>
            {t('home.categoriesLabel')}
          </p>
          <h2 className="scentara-section-header__title">{t('home.categoriesTitle')}</h2>
          <div className="scentara-section-header__rule" aria-hidden />
        </header>
        <div className="scentara-category-cards-grid">
          {collections.map((collection) => {
            const title = (locale === 'ar' ? collection.title_ar : collection.title_fr) || collection.key.toUpperCase();
            const subtitle = (locale === 'ar' ? collection.subtitle_ar : collection.subtitle_fr) || t('home.categoriesSubtitle');
            const href = (collection.link && collection.link.trim()) || `/catalogue?category=${encodeURIComponent(collection.key)}`;
            return (
              <Link key={collection.id} href={href} className="scentara-category-card-link" style={{ display: 'block' }}>
                <div className="scentara-category-card">
                  <img
                    className="scentara-category-card__img"
                    src={resolveCollectionImage(collection.key, collection.image)}
                    alt={title}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="scentara-category-card__gradient" aria-hidden />
                  <div className="scentara-category-card__content">
                    <h3 className="scentara-category-card__name">{title}</h3>
                    <p className="scentara-category-card__subtitle">{subtitle}</p>
                    <span className="scentara-category-card__arrow" aria-hidden>
                      {locale === 'ar' ? '←' : '→'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {newProducts.length > 0 && (
      <section className="scentara-home-products-section">
        <header className="scentara-section-header">
          <p className="scentara-section-header__label" style={{ fontFamily: typography.fontBody }}>
            {t('home.newSub')}
          </p>
          <h2 className="scentara-section-header__title">{t('home.new')}</h2>
          <div className="scentara-section-header__rule" aria-hidden />
        </header>
        <div className="scentara-product-grid">
          {newProducts.map((perfume) => (
            <ProductCard key={perfume.id} perfume={perfume} size="20ml" />
          ))}
        </div>

        <div style={{ marginTop: spacing[6], textAlign: 'center' }}>
          <Link
            href="/catalogue"
            style={{
              fontFamily: typography.fontBody,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-gold)',
              textDecoration: 'none',
            }}
          >
            {t('home.viewAll')} →
          </Link>
        </div>
      </section>
      )}
    </>
  );
}
