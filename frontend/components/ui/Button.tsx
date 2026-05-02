'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { radii, spacing, typography, transitions } from '@/lib/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: `${spacing[1]}px ${spacing[3]}px`, fontSize: 13 },
  md: { padding: `${spacing[2]}px ${spacing[4]}px`, fontSize: 14 },
  lg: { padding: `${spacing[3]}px ${spacing[5]}px`, fontSize: 15 },
};

const baseStyle: React.CSSProperties = {
  borderRadius: radii.md,
  borderWidth: 1,
  borderStyle: 'solid',
  fontFamily: typography.fontBody,
  fontWeight: 500,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing[2],
  cursor: 'pointer',
  transition: `background-color ${transitions.medium}, color ${transitions.medium}, border-color ${transitions.medium}`,
  outline: 'none',
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-gold)',
    color: 'var(--color-on-gold)',
    borderColor: 'var(--color-gold)',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--color-gold-light)',
    borderColor: 'var(--color-gold)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-cream)',
    borderColor: 'transparent',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  fullWidth,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled ?? loading;
  return (
    <button
      type="button"
      disabled={isDisabled}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
        width: fullWidth ? '100%' : undefined,
        opacity: isDisabled ? 0.6 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
        ...style,
      }}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: '2px solid var(--color-on-gold)',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      )}
      <span>{children}</span>
    </button>
  );
}
