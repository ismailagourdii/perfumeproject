'use client';

import React, { useEffect, useState } from 'react';
import api, { API_SUPER_ADMIN } from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function SuperadminAdminsPage() {
  const [admins, setAdmins] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<{ admins?: Array<Record<string, unknown>> }>(`${API_SUPER_ADMIN}/users`)
      .then((res) => setAdmins(Array.isArray(res.data?.admins) ? res.data.admins : []))
      .catch(() => setAdmins([]))
      .finally(() => setLoading(false));
  }, []);

  async function createAdmin() {
    setSaving(true);
    try {
      const res = await api.post(`${API_SUPER_ADMIN}/users`, form);
      const created = (res.data as Record<string, unknown>)?.admin ?? res.data;
      setAdmins((prev) => [created as Record<string, unknown>, ...prev]);
      setModalOpen(false);
      setForm({ name: '', email: '', password: '' });
    } finally {
      setSaving(false);
    }
  }

  async function deleteAdmin(id: unknown) {
    try {
      await api.delete(`${API_SUPER_ADMIN}/users/${id}`);
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // ignore
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[3] }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Admins</h1>
          <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
            Comptes administrateurs.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Créer un admin</Button>
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
              <th style={{ paddingBottom: spacing[2] }}>Nom</th>
              <th style={{ paddingBottom: spacing[2] }}>Email</th>
              <th style={{ paddingBottom: spacing[2] }}>Créé le</th>
              <th style={{ paddingBottom: spacing[2] }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={String(admin.id)} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(admin.name ?? '')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(admin.email ?? '')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(admin.createdAt ?? '')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>
                  <Button size="sm" variant="ghost" onClick={() => deleteAdmin(admin.id)}>
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && admins.length === 0 && (
              <tr>
                <td colSpan={4} style={{ paddingTop: spacing[3], color: 'var(--color-muted)' }}>
                  Aucun administrateur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Créer un administrateur"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          <Input
            label="Nom"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing[2] }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button loading={saving} onClick={createAdmin}>Créer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
