'use client';

import React from 'react';
import type { CartItem } from '@/types/shared-types';
import { Button } from '@/components/ui/Button';
import { spacing, typography, zIndices } from '@/lib/design-tokens';
import { useTranslation } from '@/lib/i18n';

export interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  total: number;
  onClose: () => void;
  onGoToCart: () => void;
}

export function CartDrawer({ isOpen, items, total, onClose, onGoToCart }: CartDrawerProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div
      className="scentara-cart-drawer-wrapper"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'var(--color-overlay)',
        backdropFilter: 'blur(16px)',
        zIndex: zIndices.modal,
      }}
      onClick={onClose}
    >
      <aside
        className="scentara-cart-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-soft)',
          borderLeft: '1px solid var(--color-border)',
          padding: spacing[4],
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[3],
          color: 'var(--color-text)',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing[2] }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 22, textTransform: 'uppercase', color: 'var(--color-text)' }}>
              {t('cart.title')}
            </h2>
            <p style={{ margin: '4px 0 0', fontFamily: typography.fontBody, fontSize: 13, color: 'var(--color-muted)' }}>
              {items.length === 0 ? t('cart.empty') : `${items.length} article${items.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le panier"
            style={{
              borderRadius: 999,
              border: 'none',
              width: 32,
              height: 32,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: 'var(--color-muted)',
            }}
          >
            ×
          </button>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {items.length === 0 ? (
            <p style={{ margin: 0, fontFamily: typography.fontBody, fontSize: 14, color: 'var(--color-text)' }}>
              Ajoutez vos parfums favoris ou composez un pack sur-mesure.
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: spacing[2], alignItems: 'flex-start' }}>
                <div
                  aria-hidden
                  style={{
                    width: 52,
                    height: 84,
                    borderRadius: 16,
                    border: '1px solid var(--color-gold)',
                    background: 'linear-gradient(140deg, color-mix(in srgb, var(--color-cream) 20%, transparent), var(--color-bg))',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontFamily: typography.fontBody, fontSize: 14, color: 'var(--color-text)' }}>
                    {item.kind === 'single' ? item.perfume.name : `Pack ${item.packType === 'duo' ? 'Duo' : 'Trio'}`}
                  </p>
                  <p style={{ margin: 0, fontFamily: typography.fontBody, fontSize: 12, color: 'var(--color-muted)' }}>
                    {item.kind === 'single' ? item.size : item.perfumes.map((p) => p.name).join(' • ')}
                  </p>
                  <p style={{ margin: '4px 0 0', fontFamily: typography.fontBody, fontSize: 14, color: 'var(--color-gold-light)' }}>
                    {(item.kind === 'single' ? item.unitPrice * item.quantity : item.totalPrice * item.quantity).toLocaleString('fr-MA')} MAD
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>Qté : {item.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <footer style={{ borderTop: '1px solid var(--color-border)', paddingTop: spacing[3], display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: typography.fontBody, color: 'var(--color-text)' }}>
            <span style={{ fontSize: 13, textTransform: 'uppercase' }}>{t('cart.total')}</span>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{total.toLocaleString('fr-MA')} MAD</span>
          </div>
          <Button variant="primary" fullWidth onClick={onGoToCart} disabled={items.length === 0}>
            {t('cart.viewCart')}
          </Button>
        </footer>
      </aside>
    </div>
  );
}
