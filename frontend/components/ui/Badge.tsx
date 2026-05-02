'use client';

import React, { ReactNode } from 'react';
import { radii, spacing, typography } from '@/lib/design-tokens';

export type BadgeSize = 'sm' | 'md';
export type BadgeStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

const statusVar: Record<BadgeStatus, string> = {
  pending: 'var(--color-status-pending)',
  confirmed: 'var(--color-status-confirmed)',
  shipped: 'var(--color-status-shipped)',
  delivered: 'var(--color-status-delivered)',
  cancelled: 'var(--color-status-cancelled)',
};

export interface BadgeProps {
  children?: ReactNode;
  status: BadgeStatus;
  showDot?: boolean;
  size?: BadgeSize;
}

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: { padding: `${spacing[1]}px ${spacing[2]}px`, fontSize: 11 },
  md: { padding: `${spacing[1]}px ${spacing[3]}px`, fontSize: 12 },
};

export function Badge({ children, status, showDot = false, size = 'md' }: BadgeProps) {
  const tone = statusVar[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing[1],
        borderRadius: radii.full,
        border: `1px solid ${tone}`,
        color: tone,
        fontFamily: typography.fontBody,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: 0.06,
        backgroundColor: 'var(--color-surface2)',
        ...sizeStyles[size],
      }}
    >
      {showDot && (
        <span
          aria-hidden
          style={{
            width: size === 'sm' ? 6 : 7,
            height: size === 'sm' ? 6 : 7,
            borderRadius: radii.full,
            backgroundColor: tone,
          }}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
