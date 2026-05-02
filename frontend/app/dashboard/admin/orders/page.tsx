'use client';

import React, { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Input } from '@/components/ui/Input';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';

function formatMAD(v: number | undefined | null) {
  return `${Number(v ?? 0).toLocaleString('fr-MA')} MAD`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [carriers, setCarriers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<unknown>(null);
  const [localPatch, setLocalPatch] = useState<Record<string, { status?: string; carrierId?: string; trackingNumber?: string }>>({});

  useEffect(() => {
    api
      .get<{ orders?: Array<Record<string, unknown>>; carriers?: Array<Record<string, unknown>> }>('/admin/orders')
      .then((res) => {
        setOrders(res.data?.orders ?? []);
        setCarriers(res.data?.carriers ?? []);
      })
      .catch(() => {
        setOrders([]);
        setCarriers([]);
      })
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

  function getOrderRow(order: Record<string, unknown>) {
    const id = order.id;
    const patch = localPatch[String(id)];
    return {
      ...order,
      status: patch?.status ?? order.status,
      carrierId: patch?.carrierId ?? order.carrierId,
      trackingNumber: patch?.trackingNumber ?? order.trackingNumber,
    };
  }

  function setOrderPatch(id: unknown, p: { status?: string; carrierId?: string; trackingNumber?: string }) {
    setLocalPatch((prev) => ({ ...prev, [String(id)]: { ...prev[String(id)], ...p } }));
  }

  async function saveRow(order: Record<string, unknown>) {
    const row = getOrderRow(order);
    setSavingId(order.id);
    try {
      await api.put(`/admin/orders/${order.id}`, {
        status: row.status,
        carrierId: row.carrierId,
        trackingNumber: row.trackingNumber,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, ...row } : o))
      );
      setLocalPatch((prev) => {
        const next = { ...prev };
        delete next[String(order.id)];
        return next;
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Commandes</h1>
        <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
          Mettez à jour les statuts et assignez les transporteurs.
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
              <th style={{ paddingBottom: spacing[2] }}>Transporteur</th>
              <th style={{ paddingBottom: spacing[2] }}>N° suivi</th>
              <th style={{ paddingBottom: spacing[2] }}>Date</th>
              <th style={{ paddingBottom: spacing[2] }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const row = getOrderRow(order);
              return (
                <tr key={String(order.id)} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: `${spacing[2]}px 0` }}>#{String(order.number ?? '')}</td>
                  <td style={{ padding: `${spacing[2]}px 0` }}>{String(order.customerName ?? '')}</td>
                  <td style={{ padding: `${spacing[2]}px 0` }}>{formatMAD(order.total as number)}</td>
                  <td style={{ padding: `${spacing[2]}px 0` }}>
                    <select
                      value={String(row.status ?? '')}
                      onChange={(e) => setOrderPatch(order.id, { status: e.target.value })}
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
                    <div style={{ marginTop: 4 }}>
                      <OrderStatusBadge status={String(row.status ?? 'pending')} />
                    </div>
                  </td>
                  <td style={{ padding: `${spacing[2]}px 0` }}>
                    <select
                      value={String(row.carrierId ?? '')}
                      onChange={(e) => setOrderPatch(order.id, { carrierId: e.target.value || undefined })}
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 12,
                        minWidth: 100,
                      }}
                    >
                      <option value="">—</option>
                      {carriers.map((c) => (
                        <option key={String(c.id)} value={String(c.id)}>{String(c.name ?? '')}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: `${spacing[2]}px 0` }}>
                    <input
                      value={String(row.trackingNumber ?? '')}
                      onChange={(e) => setOrderPatch(order.id, { trackingNumber: e.target.value })}
                      style={{
                        width: 120,
                        backgroundColor: 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        color: 'var(--color-text)',
                        padding: '4px 8px',
                        fontSize: 12,
                      }}
                    />
                  </td>
                  <td style={{ padding: `${spacing[2]}px 0` }}>{String(order.date ?? '')}</td>
                  <td style={{ padding: `${spacing[2]}px 0` }}>
                    <button
                      type="button"
                      onClick={() => saveRow(row)}
                      disabled={savingId === order.id}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'transparent',
                        color: 'var(--color-gold-light)',
                        fontSize: 12,
                        cursor: savingId === order.id ? 'not-allowed' : 'pointer',
                        opacity: savingId === order.id ? 0.6 : 1,
                      }}
                    >
                      Enregistrer
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ paddingTop: spacing[3], color: 'var(--color-muted)' }}>
                  Aucune commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
