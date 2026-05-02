'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { fetchCities, fetchShopSettings, createOrder } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import type { City, PaymentMethodCode, ShopSettings } from '@/types/shared-types';

export default function CartPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { items, total, updateQty, remove, clear } = useCartStore();
  const [cities, setCities] = useState<City[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode>('cod');
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');

  useEffect(() => {
    Promise.all([fetchCities(), fetchShopSettings()]).then(([fetchedCities, fetchedSettings]) => {
      setCities(fetchedCities);
      setSettings(fetchedSettings);
      if (fetchedCities[0]) setSelectedCityId(fetchedCities[0].id);
      const defaultPayment = fetchedSettings.paymentMethods.find((m) => m.code === 'cod')?.code ?? fetchedSettings.paymentMethods[0]?.code ?? 'cod';
      setPaymentMethod(defaultPayment);
    }).catch(() => {});
  }, []);

  const subtotal = total();
  const city = cities.find((c) => c.id === selectedCityId) ?? null;
  const deliveryFee = city?.deliveryFee ?? 0;
  const grandTotal = subtotal + deliveryFee;
  const bankDetails = settings?.bankDetails;

  const handlePlaceOrder = async () => {
    if (!selectedCityId || items.length === 0) return;
    setLoading(true);
    try {
      const order = await createOrder({
        items,
        city_id: selectedCityId,
        address_line1: address1,
        address_line2: address2 || undefined,
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
      });
      clear();
      router.push(`/orders/${order.id}`);
    } finally {
      setLoading(false);
    }
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
          <p style={{ margin: 0, fontFamily: typography.fontBody, letterSpacing: 0.32, textTransform: 'uppercase', fontSize: 11, color: 'var(--color-muted)' }}>{t('pack.step4')}</p>
          <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 32, letterSpacing: 0.18, textTransform: 'uppercase', color: 'var(--color-text)' }}>{t('cart.titleDelivery')}</h1>
        </header>

        <section className="scentara-cart-section" style={{ gap: spacing[5], alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {items.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text)' }}>{t('cart.empty')}</p>
            ) : (
              items.map((item) => {
                const imageUrl = item.image ?? (item.kind === 'single' ? (item.perfume as { imageUrl?: string }).imageUrl : item.perfumes?.[0] ? (item.perfumes[0] as { imageUrl?: string }).imageUrl : '');
                const itemName = item.kind === 'single' ? item.perfume.name : (item.packType === 'duo' ? t('pack.duo') : t('pack.trio'));
                return (
                  <div
                    key={`${item.id}-${item.size}`}
                    style={{
                      display: 'flex',
                      gap: spacing[3],
                      paddingBottom: spacing[3],
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 96,
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        background: '#ffffff',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={itemName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: '8px',
                            background: '#ffffff',
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
                            fontSize: 24,
                          }}
                        >
                          🧴
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: spacing[2] }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text)' }}>
                            {itemName}
                          </p>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>
                            {item.kind === 'single' ? item.size : item.perfumes.map((p) => p.name).join(' • ')}
                          </p>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-gold-light)' }}>
                          {(item.kind === 'single' ? item.unitPrice : item.totalPrice) * item.quantity} MAD
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginTop: spacing[1] }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid var(--color-border)',
                            borderRadius: 8,
                            backgroundColor: 'var(--color-surface2)',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) remove(item.id, item.size);
                              else updateQty(item.id, item.quantity - 1, item.size);
                            }}
                            style={{
                              width: 36,
                              height: 32,
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--color-text)',
                              cursor: 'pointer',
                              fontSize: 16,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            −
                          </button>
                          <span
                            style={{
                              minWidth: 32,
                              textAlign: 'center',
                              fontSize: 13,
                              fontFamily: typography.fontBody,
                              color: 'var(--color-text)',
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.quantity + 1, item.size)}
                            style={{
                              width: 36,
                              height: 32,
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--color-text)',
                              cursor: 'pointer',
                              fontSize: 16,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.id, item.size)}
                          style={{ border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', fontSize: 12 }}
                        >
                          {t('cart.remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
            <h2 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 20, textTransform: 'uppercase' }}>{t('cart.delivery')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              <label style={{ fontSize: 13, color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                {t('cart.city')}
                <select
                  value={selectedCityId ?? ''}
                  onChange={(e) => setSelectedCityId(Number(e.target.value))}
                  style={{
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface2)',
                    color: 'var(--color-text)',
                    padding: `${spacing[2]}px ${spacing[3]}px`,
                    fontFamily: typography.fontBody,
                    fontSize: 13,
                  }}
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <Input label={t('cart.address')} placeholder="Numéro, rue..." value={address1} onChange={(e) => setAddress1(e.target.value)} />
              <Input label={t('cart.address2')} placeholder="Optionnel" value={address2} onChange={(e) => setAddress2(e.target.value)} />
              <Input label={t('cart.name')} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <Input label={t('cart.phone')} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>

            <div style={{ marginTop: spacing[2], display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              <h3 style={{ margin: 0, fontFamily: typography.fontBody, fontSize: 13, textTransform: 'uppercase', color: 'var(--color-text)' }}>{t('cart.payment')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                {settings?.paymentMethods.map((method) => (
                  <label key={method.code} style={{ display: 'flex', alignItems: 'center', gap: spacing[2], fontSize: 13, cursor: 'pointer', color: 'var(--color-text)' }}>
                    <input
                      type="radio"
                      name="payment"
                      value={method.code}
                      checked={paymentMethod === method.code}
                      onChange={() => setPaymentMethod(method.code)}
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
              {paymentMethod === 'virement' && bankDetails && (
                <div
                  style={{
                    marginTop: spacing[1],
                    padding: spacing[2],
                    borderRadius: 12,
                    border: '1px dashed var(--color-border)',
                    backgroundColor: 'var(--color-surface2)',
                    fontSize: 12,
                    color: 'var(--color-text)',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 600 }}>Virement bancaire</p>
                  <p style={{ margin: '4px 0 0' }}>Banque : {bankDetails.bankName}</p>
                  <p style={{ margin: '2px 0 0' }}>RIB : {bankDetails.rib}</p>
                  <p style={{ margin: '2px 0 0' }}>Titulaire : {bankDetails.holder}</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: spacing[3], display: 'flex', flexDirection: 'column', gap: spacing[2], fontSize: 13, color: 'var(--color-text)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('cart.subtotal')}</span>
                <span>{subtotal.toLocaleString('fr-MA')} MAD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('cart.delivery')}</span>
                <span>{deliveryFee.toLocaleString('fr-MA')} MAD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: spacing[2], marginTop: spacing[1] }}>
                <span style={{ textTransform: 'uppercase' }}>{t('cart.total')}</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-gold-light)' }}>{grandTotal.toLocaleString('fr-MA')} MAD</span>
              </div>
            </div>

            <Button variant="primary" size="lg" fullWidth loading={loading} disabled={items.length === 0 || !selectedCityId} onClick={handlePlaceOrder}>
              {t('cart.checkout')}
            </Button>
          </aside>
        </section>
      </div>
    </main>
  );
}
