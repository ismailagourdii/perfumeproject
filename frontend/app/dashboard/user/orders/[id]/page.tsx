'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';

function formatMAD(v: number | undefined | null) {
  return `${Number(v ?? 0).toLocaleString('fr-MA')} MAD`;
}

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const;
const STEP_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
};

export default function UserOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get<{ order?: Record<string, unknown> }>(`/user/orders/${id}`)
      .then((res) => setOrder(res.data?.order ?? res.data ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return null;

  const statusStr = String(order?.status ?? 'pending').toLowerCase();
  const stepIndex = STEPS.indexOf(statusStr as (typeof STEPS)[number]);
  const currentStep = stepIndex >= 0 ? stepIndex : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>
          Commande #{String(order?.number ?? order?.reference ?? id ?? '')}
        </h1>
        <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
          Détails de votre commande.
        </p>
      </header>

      {order && (
        <>
          <section
            style={{
              borderRadius: 16,
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface2)',
              padding: spacing[3],
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[2] }}>
              <div>
                <div style={{ fontSize: 14 }}>Passée le {String(order.date ?? order.createdAt ?? '—')}</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>Paiement : {String(order.paymentMethod ?? '—')}</div>
              </div>
              <OrderStatusBadge status={String(order.status ?? 'pending')} />
            </div>
            <div style={{ display: 'flex', gap: spacing[2], marginTop: spacing[3], flexWrap: 'wrap' }}>
              {STEPS.map((step, i) => (
                <div
                  key={step}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: `2px solid ${i <= currentStep ? 'var(--color-gold)' : 'var(--color-border)'}`,
                      backgroundColor: i <= currentStep ? 'var(--color-gold)' : 'transparent',
                    }}
                  />
                  <span style={{ fontSize: 12, color: i <= currentStep ? 'var(--color-text)' : 'var(--color-muted)' }}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
            <div
              style={{
                borderRadius: 16,
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface2)',
                padding: spacing[3],
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: spacing[2], fontSize: 16 }}>Articles</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                {(order.items as Array<Record<string, unknown>>)?.map((item) => (
                  <div
                    key={String(item.id)}
                    style={{
                      display: 'flex',
                      gap: spacing[2],
                      alignItems: 'center',
                      padding: spacing[2],
                      borderRadius: 12,
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                    }}
                  >
                    {!!item.imageUrl && (
                      <img
                        src={String(item.imageUrl)}
                        alt=""
                        style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div>{String(item.label ?? item.name ?? '')}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                        x{String(item.quantity ?? 1)}
                      </div>
                    </div>
                    <div>{formatMAD(item.totalPrice as number ?? item.total as number)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              <div
                style={{
                  borderRadius: 16,
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface2)',
                  padding: spacing[3],
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: spacing[2], fontSize: 16 }}>Récapitulatif</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sous-total</span>
                    <span>{formatMAD(order.subtotal as number)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Livraison</span>
                    <span>{formatMAD(order.deliveryFee as number)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginTop: 6 }}>
                    <span>Total</span>
                    <span>{formatMAD(order.total as number)}</span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  borderRadius: 16,
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface2)',
                  padding: spacing[3],
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: spacing[2], fontSize: 16 }}>Livraison & paiement</h2>
                <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>
                    <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>Adresse</span>
                    <div>{String(order.addressLine1 ?? order.address ?? '—')}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                      {String(order.customerName ?? '')} · Tél : {String(order.customerPhone ?? '')}
                    </div>
                  </div>
                  <div style={{ marginTop: spacing[2] }}>
                    <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>Mode de paiement</span>
                    <div>{String(order.paymentMethod ?? '—')}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {!loading && !order && (
        <div style={{ color: 'var(--color-muted)' }}>Commande introuvable.</div>
      )}
    </div>
  );
}
