'use client';

import { useTranslation } from '@/lib/i18n';

export function NewsletterForm() {
  const { t } = useTranslation();
  return (
    <form
      style={{ display: 'flex', gap: 8, maxWidth: 400 }}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder={t('footer.emailPlaceholder')}
        aria-label={t('footer.emailPlaceholder')}
        style={{
          flex: 1,
          padding: '12px 16px',
          fontFamily: 'var(--font-body), sans-serif',
          fontSize: 14,
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text)',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '12px 20px',
          backgroundColor: 'var(--color-text)',
          color: 'var(--color-surface)',
          fontFamily: 'var(--font-body), sans-serif',
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        {t('footer.subscribe')}
      </button>
    </form>
  );
}
