'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Shop error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '60vh',
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
        Impossible de charger le contenu. Vérifiez que le serveur est démarré et réessayez.
      </p>
      <Button onClick={reset} variant="primary" size="lg">
        Réessayer
      </Button>
    </div>
  );
}
