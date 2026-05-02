'use client';

import React, { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';

function formatMAD(v: number | undefined | null) {
  return `${Number(v ?? 0).toLocaleString('fr-MA')} MAD`;
}

export default function SuperadminOrdersPage() {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api
      .get<{ orders?: Array<Record<string, unknown>> }>('/admin/orders')
      .then((res) => setOrders(res.data?.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && String(o.status).toLowerCase() !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        String(o.number ?? '').toLowerCase().includes(q) ||
        String(o.customerName ?? '').toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, search]);

  async function updateStatus(orderId: unknown, newStatus: string) {
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((s) => (s ? { ...s, status: newStatus } : null));
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Commandes</h1>
        <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
          Filtrez et gérez les statuts.
        </p>
      </header>

      <section style={{ display: 'flex', gap: spacing[3], flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input
            placeholder="Rechercher par numéro ou client"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            backgroundColor: 'var(--color-surface2)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: `${spacing[2]}px ${spacing[3]}px`,
            fontFamily: typography.fontBody,
            fontSize: 13,
          }}
        >
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmé</option>
          <option value="shipped">Expédié</option>
          <option value="delivered">Livré</option>
          <option value="cancelled">Annulé</option>
        </select>
      </section>

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
              <th style={{ paddingBottom: spacing[2] }}>Client</th>
              <th style={{ paddingBottom: spacing[2] }}>Total</th>
              <th style={{ paddingBottom: spacing[2] }}>Statut</th>
              <th style={{ paddingBottom: spacing[2] }}>Paiement</th>
              <th style={{ paddingBottom: spacing[2] }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr
                key={String(order.id)}
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                onClick={() => setSelectedOrder(order)}
              >
                <td style={{ padding: `${spacing[2]}px 0` }}>#{String(order.number ?? '')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(order.customerName ?? '')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{formatMAD(order.total as number)}</td>
                <td style={{ padding: `${spacing[2]}px 0` }} onClick={(e) => e.stopPropagation()}>
                  <select
                    value={String(order.status ?? '')}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    disabled={updating}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 12,
                    }}
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="shipped">Expédié</option>
                    <option value="delivered">Livré</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(order.paymentMethod ?? '')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(order.date ?? '')}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ paddingTop: spacing[3], color: 'var(--color-muted)' }}>
                  Aucune commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Commande #${selectedOrder.number}` : ''}
        size="lg"
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], fontSize: 14 }}>
            <div>
              <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>Client</span>
              <div>{String(selectedOrder.customerName ?? '')}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                {String(selectedOrder.customerPhone ?? '')} · {String(selectedOrder.customerCity ?? '')}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>Statut</span>
              <div>
                <OrderStatusBadge status={String(selectedOrder.status ?? 'pending')} />
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>Total</span>
              <div>{formatMAD(selectedOrder.total as number)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
