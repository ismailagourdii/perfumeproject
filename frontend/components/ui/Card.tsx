'use client';

import React, { ReactNode } from 'react';
import { radii, spacing, transitions } from '@/lib/design-tokens';

export type CardVariant = 'product' | 'pack' | 'stat';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  onClick?: () => void;
  selected?: boolean;
}

const paddingByVariant: Record<CardVariant, number> = {
  product: spacing[3],
  pack: spacing[4],
  stat: spacing[3],
};

export function Card({ children, variant = 'product', onClick, selected }: CardProps) {
  return (
    <article
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        position: 'relative',
        borderRadius: radii.lg,
        padding: paddingByVariant[variant],
        backgroundColor: 'var(--color-surface2)',
        border: `1px solid ${selected ? 'var(--color-gold)' : 'var(--color-border)'}`,
        boxShadow: 'var(--shadow-soft)',
        cursor: onClick ? 'pointer' : 'default',
        transition: `border-color ${transitions.medium}, box-shadow ${transitions.medium}, transform ${transitions.medium}`,
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </article>
  );
}
