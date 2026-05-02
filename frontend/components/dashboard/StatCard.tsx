'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { spacing, typography } from '@/lib/design-tokens';

export function StatCard({
  icon,
  label,
  value,
  trendLabel,
  trendDirection,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trendLabel?: string;
  trendDirection?: 'up' | 'down';
}) {
  const isPositive = trendDirection === 'up';
  const isNegative = trendDirection === 'down';

  return (
    <Card variant="stat">
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 999,
              border: '1px solid var(--color-border)',
              color: 'var(--color-gold-light)',
            }}
          >
            {icon}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing[2] }}>
          <span style={{ fontFamily: typography.fontDisplay, fontSize: 26, color: 'var(--color-text)' }}>{value}</span>
          {trendLabel && (
            <span
              style={{
                fontSize: 12,
                color: isPositive ? 'var(--color-success)' : isNegative ? 'var(--color-error)' : 'var(--color-muted)',
              }}
            >
              {trendLabel}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
