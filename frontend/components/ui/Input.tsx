'use client';

import React, { InputHTMLAttributes, ReactNode } from 'react';
import { radii, spacing, typography, transitions } from '@/lib/design-tokens';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, style, ...rest }: InputProps) {
  const hasError = Boolean(error);
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[1],
        fontFamily: typography.fontBody,
        width: '100%',
      }}
    >
      {label && (
        <span
          style={{
            fontSize: 13,
            color: 'var(--color-cream)',
            opacity: 0.88,
          }}
        >
          {label}
        </span>
      )}
      <div
        className="scentara-input-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          borderRadius: radii.md,
          padding: `${spacing[2]}px ${spacing[3]}px`,
          border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
          backgroundColor: 'var(--color-surface2)',
          transition: `border-color ${transitions.fast}, box-shadow 0.2s ease`,
        }}
      >
        {icon && (
          <span
            style={{
              color: hasError ? 'var(--color-error)' : 'var(--color-muted)',
            }}
          >
            {icon}
          </span>
        )}
        <input
          {...rest}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-cream)',
            fontFamily: typography.fontBody,
            fontSize: 14,
            padding: 0,
            ...style,
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: 12, color: 'var(--color-error)' }}>{error}</span>
      )}
    </label>
  );
}
