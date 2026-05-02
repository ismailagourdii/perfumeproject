'use client';

import React from 'react';
import { spacing, typography } from '@/lib/design-tokens';

export interface Step {
  index: number;
  label: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <ol
      style={{
        display: 'flex',
        gap: spacing[3],
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      {steps.map((step) => {
        const isActive = step.index === currentStep;
        const isCompleted = step.index < currentStep;
        return (
          <li
            key={step.index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[1],
              opacity: isActive || isCompleted ? 1 : 0.6,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '1px solid var(--color-gold)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  isActive || isCompleted ? 'var(--color-gold)' : 'transparent',
                color: isActive || isCompleted ? 'var(--color-bg)' : 'var(--color-cream)',
                fontFamily: typography.fontBody,
                fontSize: 12,
              }}
            >
              {step.index}
            </span>
            <span
              style={{
                fontFamily: typography.fontBody,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.08,
                color: 'var(--color-cream)',
              }}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
