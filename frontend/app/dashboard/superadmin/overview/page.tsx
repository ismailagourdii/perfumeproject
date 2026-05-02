'use client';

import React, { useEffect, useState } from 'react';
import api, { API_SUPER_ADMIN } from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { StatCard } from '@/components/dashboard/StatCard';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';

function formatMAD(v: number | undefined | null) {
  return `${Number(v ?? 0).toLocaleString('fr-MA')} MAD`;
}

export default function SuperadminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [recentOrders, setRecentOrders] = useState<Array<Record<string, unknown>>>([]);
  const [chartData, setChartData] = useState<Array<{ date: string; orders: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ stats?: Record<string, unknown>; recentOrders?: Array<Record<string, unknown>>; ordersLast30Days?: Array<{ date: string; orders: number }> }>(`${API_SUPER_ADMIN}/overview`)
      .then((res) => {
        if (cancelled) return;
        setStats(res.data?.stats ?? {});
        setRecentOrders(res.data?.recentOrders ?? []);
        setChartData(res.data?.ordersLast30Days ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setStats({});
          setRecentOrders([]);
          setChartData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[5] }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 30 }}>
          Vue d’ensemble
        </h1>
        <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
          Indicateurs clés des ventes et des commandes.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: spacing[4],
        }}
      >
        <StatCard
          icon="💰"
          label="Revenu total"
          value={loading ? '…' : formatMAD(stats.totalRevenue as number)}
        />
        <StatCard
          icon="🧾"
          label="Commandes aujourd’hui"
          value={loading ? '…' : String(stats.ordersToday ?? 0)}
        />
        <StatCard
          icon="🧴"
          label="Produits"
          value={loading ? '…' : String(stats.totalProducts ?? 0)}
        />
        <StatCard
          icon="👤"
          label="Utilisateurs"
          value={loading ? '…' : String(stats.totalUsers ?? 0)}
        />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
        <div
          style={{
            backgroundColor: 'var(--color-surface2)',
            borderRadius: 16,
            border: '1px solid var(--color-border)',
            padding: spacing[4],
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: spacing[2], fontSize: 16 }}>
            Commandes (30 derniers jours)
          </h2>
          <div style={{ minHeight: 200, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            {chartData.length === 0 && !loading && (
              <span style={{ color: 'var(--color-muted)', fontSize: 13 }}>Aucune donnée</span>
            )}
            {chartData.slice(-14).map((d, i) => (
              <div
                key={d.date}
                style={{
                  flex: 1,
                  height: Math.max(4, (d.orders / Math.max(1, Math.max(...chartData.map((x) => x.orders)))) * 120),
                  backgroundColor: 'var(--color-gold)',
                  borderRadius: 4,
                  opacity: 0.9,
                }}
                title={`${d.date}: ${d.orders}`}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface2)',
            borderRadius: 16,
            border: '1px solid var(--color-border)',
            padding: spacing[4],
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: spacing[2], fontSize: 16 }}>
            Dernières commandes
          </h2>
          <div style={{ maxHeight: 320, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--color-muted)' }}>
                  <th style={{ paddingBottom: spacing[2] }}>Commande</th>
                  <th style={{ paddingBottom: spacing[2] }}>Client</th>
                  <th style={{ paddingBottom: spacing[2] }}>Total</th>
                  <th style={{ paddingBottom: spacing[2] }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: Record<string, unknown>) => (
                  <tr key={String(order.id)} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: `${spacing[2]}px 0` }}>#{String(order.number ?? '')}</td>
                    <td style={{ padding: `${spacing[2]}px 0` }}>{String(order.customerName ?? '')}</td>
                    <td style={{ padding: `${spacing[2]}px 0` }}>{formatMAD(order.total as number)}</td>
                    <td style={{ padding: `${spacing[2]}px 0` }}>
                      <OrderStatusBadge status={String(order.status ?? 'pending')} />
                    </td>
                  </tr>
                ))}
                {!loading && recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ paddingTop: spacing[3], color: 'var(--color-muted)' }}>
                      Aucune commande récente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
