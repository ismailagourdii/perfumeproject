'use client';

import React, { useMemo, useState } from 'react';
import type { GenderCategory, Perfume, PerfumeSize } from '@/types/shared-types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { spacing, typography } from '@/lib/design-tokens';
import { useTranslation } from '@/lib/i18n';
import { resolveMediaSrc } from '@/lib/media-url';

export interface PerfumeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  perfumes: Perfume[];
  size?: PerfumeSize;
  onSelect: (perfume: Perfume) => void;
}

type FilterTab = GenderCategory | 'tous';

const FILTER_TABS: { key: FilterTab; labelKey: string }[] = [
  { key: 'tous', labelKey: 'product.all' },
  { key: 'homme', labelKey: 'product.male' },
  { key: 'femme', labelKey: 'product.female' },
  { key: 'mixte', labelKey: 'product.unisex' },
];

export function PerfumeSelectionModal({
  isOpen,
  onClose,
  perfumes,
  size = '20ml',
  onSelect,
}: PerfumeSelectionModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<FilterTab>('tous');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return perfumes.filter((p) => {
      if (tab !== 'tous' && p.category !== tab) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.notesTop.join(' ').toLowerCase().includes(q) ||
        p.notesHeart.join(' ').toLowerCase().includes(q) ||
        p.notesBase.join(' ').toLowerCase().includes(q)
      );
    });
  }, [perfumes, query, tab]);

  const selectedPerfume = filtered.find((p) => p.id === selectedId) ?? null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('product.selectPerfum')} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
        <Input
          label={t('product.search')}
          placeholder={t('product.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
          {FILTER_TABS.map(({ key, labelKey }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  padding: `${spacing[1]}px ${spacing[3]}px`,
                  borderRadius: 999,
                  backgroundColor: active ? 'var(--color-gold)' : 'transparent',
                  color: active ? 'var(--color-on-gold)' : 'var(--color-text)',
                  fontFamily: typography.fontBody,
                  fontSize: 13,
                  textTransform: 'uppercase',
                }}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: spacing[3],
          }}
        >
          {filtered.map((perfume) => {
            const isSelected = perfume.id === selectedId;
            const imageRaw =
              (perfume as { imageUrl?: string; image?: string }).imageUrl ||
              (perfume as { imageUrl?: string; image?: string }).image ||
              '';
            const imageUrl = imageRaw ? resolveMediaSrc(String(imageRaw)) : '';
            const notesPreview = [
              ...perfume.notesTop,
              ...perfume.notesHeart,
              ...perfume.notesBase,
            ]
              .filter(Boolean)
              .slice(0, 3)
              .join(', ');
            const categoryLabel = perfume.category === 'homme' ? 'HOMME' : perfume.category === 'femme' ? 'FEMME' : 'MIXTE';
            return (
              <div
                key={perfume.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(perfume.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(perfume.id);
                  }
                }}
                style={{
                  background: 'var(--color-surface)',
                  border: isSelected ? '2px solid var(--color-gold)' : '1px solid var(--color-border)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: isSelected ? '0 0 0 3px rgba(200,150,10,0.15)' : undefined,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: 140,
                      background: '#ffffff',
                      borderRadius: '8px 8px 0 0',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={perfume.name}
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'contain',
                          background: '#ffffff',
                          borderRadius: '8px',
                          padding: '8px',
                          boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'rgba(200,150,10,0.1)',
                            border: '1px solid rgba(200,150,10,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                          }}
                        >
                          🧴
                        </div>
                      </div>
                    )}
                    {isSelected && (
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#c8960a',
                          color: 'white',
                          fontSize: 14,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div style={{ padding: `0 ${spacing[2]}px ${spacing[2]}px` }}>
                    <h3 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>
                      {perfume.name}
                    </h3>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: 4,
                        fontFamily: typography.fontBody,
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--color-muted)',
                      }}
                    >
                      {categoryLabel}
                    </span>
                    {notesPreview && (
                      <p style={{ margin: '4px 0 0', fontFamily: typography.fontBody, fontSize: 12, color: 'var(--color-gold)' }}>
                        {notesPreview}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing[2], marginTop: spacing[3] }}>
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button
            variant="primary"
            disabled={!selectedPerfume}
            onClick={() => {
              if (selectedPerfume) {
                onSelect(selectedPerfume);
                onClose();
              }
            }}
          >
            {t('common.select')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
