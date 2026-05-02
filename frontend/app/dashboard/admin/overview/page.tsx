'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { StatCard } from '@/components/dashboard/StatCard';

function formatMAD(v: number | undefined | null) {
  return `${Number(v ?? 0).toLocaleString('fr-MA')} MAD`;
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, unknown>>({});

  useEffect(() => {
    api
      .get<{ stats?: Record<string, unknown> }>('/admin/overview')
      .then((res) => setStats(res.data?.stats ?? {}))
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[5] }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 30 }}>
          Vue d’ensemble (jour)
        </h1>
        <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
          Résumé de la journée.
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
          icon="🧾"
          label="Commandes aujourd’hui"
          value={loading ? '…' : String(stats.ordersToday ?? 0)}
        />
        <StatCard
          icon="💰"
          label="Revenu aujourd’hui"
          value={loading ? '…' : formatMAD(stats.revenueToday as number)}
        />
      </section>
    </div>
  );
}
