'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';

function formatMAD(v: number | undefined | null) {
  return `${Number(v ?? 0).toLocaleString('fr-MA')} MAD`;
}

export default function UserOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ orders?: Array<Record<string, unknown>> }>('/user/orders')
      .then((res) => setOrders(res.data?.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>
          Mes commandes
        </h1>
        <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
          Historique de vos commandes.
        </p>
      </header>

      <section
        style={{
          backgroundColor: 'var(--color-surface2)',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          padding: spacing[3],
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--color-muted)' }}>
              <th style={{ paddingBottom: spacing[2] }}>Commande</th>
              <th style={{ paddingBottom: spacing[2] }}>Date</th>
              <th style={{ paddingBottom: spacing[2] }}>Articles</th>
              <th style={{ paddingBottom: spacing[2] }}>Total</th>
              <th style={{ paddingBottom: spacing[2] }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={String(order.id)}
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                onClick={() => router.push(`/dashboard/user/orders/${order.id}`)}
              >
                <td style={{ padding: `${spacing[2]}px 0` }}>#{String(order.number ?? order.reference ?? order.id ?? '')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(order.date ?? order.createdAt ?? '')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(order.itemsCount ?? (Array.isArray(order.items) ? order.items.length : null) ?? '—')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{formatMAD(order.total as number)}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>
                  <OrderStatusBadge status={String(order.status ?? 'pending')} />
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={5} style={{ paddingTop: spacing[3], color: 'var(--color-muted)' }}>
                  Vous n’avez pas encore passé de commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
