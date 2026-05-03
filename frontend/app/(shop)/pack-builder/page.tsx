'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PackStepIndicator } from '@/components/shop/PackStepIndicator';
import { PerfumeSelectionModal } from '@/components/shop/PerfumeSelectionModal';
import { usePackBuilderStore } from '@/store/packBuilderStore';
import { useCartStore } from '@/store/cartStore';
import api, { fetchPerfumes } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import type { PackType, PerfumeSize, Perfume } from '@/types/shared-types';
import { resolveMediaSrc } from '@/lib/media-url';

export interface PackSettings {
  duo_20ml_price?: number;
  duo_50ml_price?: number;
  trio_20ml_price?: number;
  trio_50ml_price?: number;
  duo_discount_percent?: number;
  trio_discount_percent?: number;
}

export default function PackBuilderPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { packType, size, slots, setPackType, setSize, setSlot, reset } = usePackBuilderStore();
  const add = useCartStore((s) => s.add);
  const [currentStep, setCurrentStep] = useState(1);
  const [modalSlotIndex, setModalSlotIndex] = useState<number | null>(null);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [packSettings, setPackSettings] = useState<PackSettings | null>(null);

  useEffect(() => {
    fetchPerfumes({ per_page: 100 })
      .then((r) => setPerfumes(r.data))
      .catch(() => setPerfumes([]));
  }, []);

  useEffect(() => {
    api
      .get<{ settings: PackSettings & Record<string, unknown> }>('/settings/shop')
      .then((res) => setPackSettings(res.data?.settings ?? null))
      .catch(() => setPackSettings(null));
  }, []);

  const priceKey = `${packType}_${size}_price` as keyof PackSettings;
  const discountKey = `${packType}_discount_percent` as keyof PackSettings;
  const packPrice = packSettings ? Number(packSettings[priceKey] ?? 0) : 0;
  const discountPercent = packSettings ? Number(packSettings[discountKey] ?? 0) : 0;
  const { discountAmount, total } = useMemo(() => {
    const d = (packPrice * discountPercent) / 100;
    return { discountAmount: d, total: Math.round((packPrice - d) * 100) / 100 };
  }, [packPrice, discountPercent]);

  const filledPerfumes = slots.map((s) => s.perfume).filter(Boolean) as Perfume[];
  const filledSlots = slots.filter((s) => s.perfume != null).length;
  const requiredSlots = packType === 'duo' ? 2 : 3;
  const canContinueFromStep3 = filledSlots >= requiredSlots;
  const isComplete = filledPerfumes.length === slots.length;

  const handleConfirmPack = () => {
    if (!isComplete) return;
    add({
      id: `pack-${packType}-${size}-${Date.now()}`,
      kind: 'pack',
      packType,
      size,
      perfumes: filledPerfumes,
      basePrice: packPrice,
      discountPercentage: discountPercent,
      totalPrice: total,
      quantity: 1,
    });
    reset();
    router.push('/cart');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        padding: `${spacing[6]}px ${spacing[4]}px ${spacing[6]}px`,
        fontFamily: typography.fontBody,
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: spacing[5] }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          <p style={{ margin: 0, fontFamily: typography.fontBody, letterSpacing: 0.32, textTransform: 'uppercase', fontSize: 11, color: 'var(--color-muted)' }}>
            {t('pack.subtitle')}
          </p>
          <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 32, letterSpacing: 0.18, textTransform: 'uppercase', color: 'var(--color-text)' }}>
            {t('pack.title')}
          </h1>
        </header>

        <PackStepIndicator currentStep={currentStep} />

        <section className="scentara-pack-builder-section">
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            {currentStep === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing[3] }}>
                {(['duo', 'trio'] as PackType[]).map((type) => {
                  const isActive = type === packType;
                  const pct = packSettings ? Number(packSettings[`${type}_discount_percent` as keyof PackSettings] ?? (type === 'duo' ? 10 : 15)) : type === 'duo' ? 10 : 15;
                  const discountLabel = `-${Math.round(pct)}%`;
                  return (
                    <Card key={type} variant="pack" selected={isActive} onClick={() => setPackType(type)}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h2
                            style={{
                              margin: 0,
                              fontFamily: typography.fontDisplay,
                              fontSize: 20,
                              textTransform: 'uppercase',
                              color: isActive ? 'var(--color-gold)' : 'var(--color-muted)',
                            }}
                          >
                            {type === 'duo' ? t('pack.duo') : t('pack.trio')}
                          </h2>
                          <span
                            style={{
                              borderRadius: 999,
                              padding: `${spacing[1]}px ${spacing[2]}px`,
                              background: 'linear-gradient(120deg, var(--color-gold-light), var(--color-gold))',
                              color: 'var(--color-on-gold)',
                              fontFamily: typography.fontBody,
                              fontSize: 11,
                              textTransform: 'uppercase',
                            }}
                          >
                            {discountLabel}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            color: isActive ? 'var(--color-text)' : 'var(--color-muted)',
                            opacity: isActive ? 0.9 : 0.8,
                          }}
                        >
                          {type === 'duo'
                            ? 'Deux sillages complémentaires, parfaits à partager ou alterner.'
                            : 'Trois signatures pour explorer toutes vos facettes.'}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text)', opacity: 0.9 }}>
                  Choisissez le format qui correspond à votre rituel, en 20ml nomade ou 50ml signature.
                </p>
                <div style={{ display: 'inline-flex', backgroundColor: 'var(--color-surface2)', borderRadius: 999, border: '1px solid var(--color-border)', padding: 2 }}>
                  {(['20ml', '50ml'] as PerfumeSize[]).map((value) => {
                    const active = value === size;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSize(value)}
                        style={{
                          border: 'none',
                          borderRadius: 999,
                          padding: `${spacing[1]}px ${spacing[3]}px`,
                          backgroundColor: active ? 'var(--color-gold)' : 'transparent',
                          color: active ? 'var(--color-on-gold)' : 'var(--color-text)',
                          cursor: 'pointer',
                          fontFamily: typography.fontBody,
                          fontSize: 13,
                        }}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text)', opacity: 0.9 }}>
                  Sélectionnez vos parfums, un emplacement à la fois. Vous pouvez mixer les univers Homme, Femme et Mixte.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[3] }}>
                  {slots.map((slot) => {
                    const selectedProduct = slot.perfume;
                    const imageRaw = selectedProduct
                      ? (selectedProduct as { imageUrl?: string; image?: string }).imageUrl ||
                        (selectedProduct as { imageUrl?: string; image?: string }).image ||
                        ''
                      : '';
                    const imageUrl = imageRaw ? resolveMediaSrc(String(imageRaw)) : '';
                    const notesPreview = selectedProduct
                      ? [...selectedProduct.notesTop, ...selectedProduct.notesHeart, ...selectedProduct.notesBase].filter(Boolean).slice(0, 2).join(', ')
                      : '';
                    return (
                      <Card key={slot.index} variant="product">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                          {selectedProduct && (
                            <>
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={selectedProduct.name}
                                  style={{
                                    width: '100%',
                                    height: '100px',
                                    objectFit: 'contain',
                                    background: '#ffffff',
                                    borderRadius: '8px',
                                    marginBottom: 12,
                                    padding: 8,
                                    boxSizing: 'border-box',
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '100%',
                                    height: 100,
                                    background: '#ffffff',
                                    borderRadius: '8px',
                                    marginBottom: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 32,
                                  }}
                                >
                                  🧴
                                </div>
                              )}
                            </>
                          )}
                          <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.14, color: 'var(--color-muted)' }}>
                            Emplacement {slot.index + 1}
                          </p>
                          {selectedProduct ? (
                            <>
                              <h3 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 18, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text)' }}>
                                {selectedProduct.name}
                              </h3>
                              {notesPreview && (
                                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-gold)' }}>{notesPreview}</p>
                              )}
                            </>
                          ) : (
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>Aucune sélection pour le moment.</p>
                          )}
                          <div style={{ marginTop: spacing[2] }}>
                            <Button size="sm" onClick={() => setModalSlotIndex(slot.index)}>
                              {selectedProduct ? t('pack.modify') : t('pack.selectSlot')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text)', opacity: 0.9 }}>
                  Vérifiez les détails de votre coffret avant de l'ajouter au panier.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  {slots.map((slot) => (
                    <div
                      key={slot.index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: spacing[2],
                        padding: `${spacing[2]}px 0`,
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <span style={{ fontFamily: typography.fontBody, fontSize: 13, color: 'var(--color-text)' }}>Emplacement {slot.index + 1}</span>
                      <span style={{ fontFamily: typography.fontBody, fontSize: 13, color: slot.perfume ? 'var(--color-text)' : 'var(--color-muted)' }}>
                        {slot.perfume ? slot.perfume.name : 'À sélectionner'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[2], marginTop: spacing[2] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Button variant="ghost" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))} disabled={currentStep === 1}>
                  {t('pack.prevStep')}
                </Button>
                {currentStep < 4 ? (
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (currentStep === 3 && !canContinueFromStep3) return;
                      setCurrentStep((s) => Math.min(4, s + 1));
                    }}
                    disabled={currentStep === 3 && !canContinueFromStep3}
                    style={currentStep === 3 && !canContinueFromStep3 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                  >
                    {t('pack.continue')}
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleConfirmPack} disabled={!isComplete}>
                    {t('pack.order')}
                  </Button>
                )}
              </div>
              {currentStep === 3 && !canContinueFromStep3 && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)', textAlign: 'center' }}>
                  Veuillez sélectionner {requiredSlots - filledSlots} parfum(s) restant(s)
                </p>
              )}
            </div>
          </div>

          <aside
            style={{
              borderRadius: 24,
              border: '1px solid var(--color-border)',
              background: 'linear-gradient(150deg, var(--color-surface2), var(--color-bg))',
              padding: spacing[4],
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3],
              color: 'var(--color-text)',
            }}
          >
            <h2 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 20, textTransform: 'uppercase' }}>{t('pack.summary')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2], fontFamily: typography.fontBody, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{packType === 'duo' ? t('pack.duo') : t('pack.trio')}</span>
                <span>{size}</span>
              </div>
              {packPrice > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Prix du coffret</span>
                    <span>{packPrice.toLocaleString('fr-MA')} MAD</span>
                  </div>
                  {discountPercent > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gold-light)' }}>
                      <span>Remise pack (-{discountPercent}%)</span>
                      <span>-{discountAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: spacing[2], marginTop: spacing[1] }}>
                    <span style={{ textTransform: 'uppercase' }}>{t('pack.totalPrice')}</span>
                    <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-gold-light)' }}>{total.toLocaleString('fr-MA')} MAD</span>
                  </div>
                </>
              )}
              {packPrice <= 0 && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>Chargement des tarifs…</p>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>
              Livraison offerte sur Casablanca, participation aux frais pour les autres villes selon la grille indiquée au moment du paiement.
            </p>
          </aside>
        </section>
      </div>

      {modalSlotIndex !== null && (
        <PerfumeSelectionModal
          isOpen={modalSlotIndex !== null}
          onClose={() => setModalSlotIndex(null)}
          perfumes={perfumes}
          size={size}
          onSelect={(perfume) => {
            setSlot(modalSlotIndex, perfume);
            setModalSlotIndex(null);
          }}
        />
      )}
    </main>
  );
}
