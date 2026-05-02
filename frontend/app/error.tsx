'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body), sans-serif',
      }}
    >
      <h1 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 600 }}>Une erreur est survenue</h1>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--color-muted)', textAlign: 'center', maxWidth: 400 }}>
        Le chargement a échoué. Réessayez ou revenez à l&apos;accueil.
      </p>
      <Button onClick={reset} variant="primary" size="lg">
        Réessayer
      </Button>
      <a href="/" style={{ display: 'inline-block', marginTop: 16, fontSize: 14, color: 'var(--color-gold)' }}>
        Retour à l&apos;accueil
      </a>
    </div>
  );
}
