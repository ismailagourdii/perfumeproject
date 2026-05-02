'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';

export default function AdminInventoryPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<unknown>(null);
  const [localPatch, setLocalPatch] = useState<Record<string, { stock20ml?: number; stock50ml?: number }>>({});

  useEffect(() => {
    api
      .get<{ items?: Array<Record<string, unknown>> }>('/admin/inventory')
      .then((res) => setRows(res.data?.items ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  function getRow(row: Record<string, unknown>) {
    const id = row.id;
    const patch = localPatch[String(id)];
    return {
      ...row,
      stock20ml: patch?.stock20ml ?? row.stock_20ml ?? row.stock20ml ?? 0,
      stock50ml: patch?.stock50ml ?? row.stock_50ml ?? row.stock50ml ?? 0,
    };
  }

  function setPatch(id: unknown, p: { stock20ml?: number; stock50ml?: number }) {
    setLocalPatch((prev) => ({ ...prev, [String(id)]: { ...prev[String(id)], ...p } }));
  }

  async function saveRow(row: Record<string, unknown>) {
    const r = getRow(row);
    setSavingId(row.id);
    try {
      await api.put(`/admin/inventory/${row.id}`, {
        stock20ml: r.stock20ml,
        stock50ml: r.stock50ml,
      });
      setRows((prev) =>
        prev.map((x) => (x.id === row.id ? { ...x, stock_20ml: r.stock20ml, stock_50ml: r.stock50ml } : x))
      );
      setLocalPatch((prev) => {
        const next = { ...prev };
        delete next[String(row.id)];
        return next;
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Inventaire</h1>
        <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
          Ajustez les stocks par référence.
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
              <th style={{ paddingBottom: spacing[2] }}>Produit</th>
              <th style={{ paddingBottom: spacing[2] }}>Stock 20ml</th>
              <th style={{ paddingBottom: spacing[2] }}>Stock 50ml</th>
              <th style={{ paddingBottom: spacing[2] }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const r = getRow(row);
              return (
                <tr key={String(row.id)} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: `${spacing[2]}px 0` }}>{String(row.name ?? '')}</td>
                  <td style={{ padding: `${spacing[2]}px 0` }}>
                    <input
                      type="number"
                      value={Number(r.stock20ml) || 0}
                      onChange={(e) => setPatch(row.id, { stock20ml: Number(e.target.value) })}
                      style={{
                        width: 80,
                        backgroundColor: 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        color: 'var(--color-text)',
                        padding: '4px 8px',
                      }}
                    />
                  </td>
                  <td style={{ padding: `${spacing[2]}px 0` }}>
                    <input
                      type="number"
                      value={Number(r.stock50ml) || 0}
                      onChange={(e) => setPatch(row.id, { stock50ml: Number(e.target.value) })}
                      style={{
                        width: 80,
                        backgroundColor: 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        color: 'var(--color-text)',
                        padding: '4px 8px',
                      }}
                    />
                  </td>
                  <td style={{ padding: `${spacing[2]}px 0` }}>
                    <button
                      type="button"
                      onClick={() => saveRow(row)}
                      disabled={savingId === row.id}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'transparent',
                        color: 'var(--color-gold-light)',
                        fontSize: 12,
                        cursor: savingId === row.id ? 'not-allowed' : 'pointer',
                        opacity: savingId === row.id ? 0.6 : 1,
                      }}
                    >
                      Enregistrer
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ paddingTop: spacing[3], color: 'var(--color-muted)' }}>
                  Aucun produit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
