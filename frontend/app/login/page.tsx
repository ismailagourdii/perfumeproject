'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { radii, spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { login as apiLogin } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const loginStore = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await apiLogin(email, password);
      loginStore({ user, token });
      if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'user') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const ax = err as { code?: string; message?: string; response?: { data?: { message?: string; errors?: { email?: string[] } } } };
      if (ax?.code === 'ECONNABORTED' || ax?.message === 'Network Error') {
        setError('Le serveur ne répond pas. Démarrez le backend Laravel (php artisan serve) puis réessayez.');
      } else {
        const data = ax?.response?.data as { message?: string; errors?: { email?: string[] } } | undefined;
        const msg = data?.message ?? data?.errors?.email?.[0];
        setError(msg || 'Identifiants invalides. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-cream)',
        fontFamily: typography.fontBody,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[6],
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gold radial glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(200,150,10,0.14) 0%, transparent 55%)',
        }}
      />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        <div style={{ marginBottom: spacing[4], textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              fontFamily: typography.fontBody,
              fontSize: 13,
              letterSpacing: 0.06,
              color: 'var(--color-muted)',
              textDecoration: 'none',
            }}
          >
            ← {t('auth.backHome')}
          </Link>
        </div>

        {/* Card: dark surface, gold border */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: radii.lg,
            padding: spacing[6],
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <h1
            style={{
              margin: 0,
              fontFamily: typography.fontDisplay,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 0.2,
              color: 'var(--color-gold)',
              textAlign: 'center',
            }}
          >
            ✦ SCENTARA
          </h1>
          <p
            style={{
              margin: `${spacing[2]}px 0 ${spacing[5]}px`,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: 0.2,
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              textAlign: 'center',
            }}
          >
            PARFUMS DE LUXE
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}
          >
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              autoComplete="email"
            />
            <Input
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error && (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-error)' }}>{error}</p>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
              size="lg"
              style={{
                backgroundColor: 'var(--color-gold)',
                color: 'var(--color-on-gold)',
                borderColor: 'var(--color-gold)',
                marginTop: spacing[2],
              }}
              className="scentara-login-btn"
            >
              {t('auth.submit')}
            </Button>
          </form>
        </div>

        <p
          style={{
            marginTop: spacing[4],
            marginBottom: 0,
            fontSize: 13,
            color: 'var(--color-muted)',
            textAlign: 'center',
          }}
        >
          Accès admin ?{' '}
          <Link href="/dashboard" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
            Aller au tableau de bord
          </Link>
        </p>
      </div>
    </main>
  );
}
