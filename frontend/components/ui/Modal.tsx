'use client';

import React, { ReactNode, useEffect } from 'react';
import { radii, spacing, typography, zIndices } from '@/lib/design-tokens';

export type ModalSize = 'sm' | 'md' | 'lg' | 'fullscreen';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: ModalSize;
}

const sizeMaxWidth: Record<Exclude<ModalSize, 'fullscreen'>, number> = {
  sm: 420,
  md: 640,
  lg: 860,
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFullscreen = size === 'fullscreen';

  return (
    <div
      className="scentara-modal-mobile-full"
      aria-modal
      role="dialog"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndices.modal,
        display: 'flex',
        alignItems: isFullscreen ? 'stretch' : 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-overlay)',
        backdropFilter: 'blur(18px)',
      }}
      onClick={onClose}
    >
      <div
        className="scentara-modal-inner"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: isFullscreen ? '100%' : '100%',
          maxWidth: isFullscreen ? '100%' : sizeMaxWidth[size],
          height: isFullscreen ? '100%' : 'auto',
          margin: isFullscreen ? 0 : spacing[5],
          borderRadius: isFullscreen ? 0 : radii.lg,
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-soft)',
          padding: isFullscreen ? spacing[5] : spacing[4],
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[3],
          color: 'var(--color-cream)',
        }}
      >
        {title && (
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing[2],
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: typography.fontDisplay,
                fontWeight: 600,
                fontSize: 22,
              }}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              style={{
                borderRadius: radii.full,
                border: 'none',
                width: 32,
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: 'var(--color-muted)',
              }}
            >
              ×
            </button>
          </header>
        )}
        <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}
