'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function UserProfilePage() {
  const [profile, setProfile] = useState({ name: '', phone: '', city: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    api
      .get<Record<string, unknown>>('/user/profile')
      .then((res) => {
        const d = res.data as Record<string, unknown>;
        setProfile({
          name: String(d?.name ?? ''),
          phone: String(d?.phone ?? ''),
          city: String(d?.city ?? ''),
          address: String(d?.address ?? d?.addressLine1 ?? ''),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await api.put('/user/profile', profile);
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setSavingPassword(true);
    try {
      await api.post('/user/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--color-muted)' }}>Chargement…</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Profil</h1>
        <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
          Informations personnelles et mot de passe.
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
        <div
          style={{
            borderRadius: 16,
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface2)',
            padding: spacing[3],
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: spacing[3], fontSize: 16 }}>
            Informations de contact
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <Input
              label="Nom"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
            <Input
              label="Téléphone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
            <Input
              label="Ville"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
            <Input
              label="Adresse"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>
          <div style={{ marginTop: spacing[4], display: 'flex', justifyContent: 'flex-end' }}>
            <Button loading={savingProfile} onClick={saveProfile}>
              Enregistrer le profil
            </Button>
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
          <h2 style={{ marginTop: 0, marginBottom: spacing[3], fontSize: 16 }}>
            Changer le mot de passe
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <Input
              label="Mot de passe actuel"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <Input
              label="Nouveau mot de passe"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <Input
              label="Confirmer le nouveau mot de passe"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
            <div style={{ marginTop: spacing[2], display: 'flex', justifyContent: 'flex-end' }}>
              <Button loading={savingPassword} onClick={changePassword}>
                Mettre à jour le mot de passe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
