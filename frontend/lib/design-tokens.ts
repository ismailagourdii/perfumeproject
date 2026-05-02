/** Light theme palette */
export const lightColors = {
  bg: '#faf8f4',
  surface: '#ffffff',
  surface2: '#f0ece4',
  border: 'rgba(150,100,10,0.15)',
  gold: '#b8860a',
  goldLight: '#c9a227',
  cream: '#1a1208',
  text: '#1a1208',
  muted: '#6a5a40',
  error: '#c84a3a',
  success: '#4a8c5c',
  overlay: 'rgba(250,248,244,0.92)',
  skeletonBase: '#e8e4dc',
  skeletonHighlight: '#f0ece4',
} as const;

/** Dark theme palette */
export const darkColors = {
  bg: '#080604',
  surface: '#0f0c08',
  surface2: '#1a1610',
  border: 'rgba(200,150,10,0.15)',
  gold: '#c8960a',
  goldLight: '#f0c040',
  cream: '#f5f0e8',
  text: '#f5f0e8',
  muted: '#a09070',
  error: '#c84a3a',
  success: '#4a8c5c',
  overlay: 'rgba(8,6,4,0.86)',
  skeletonBase: '#0b0906',
  skeletonHighlight: '#1d150d',
} as const;

/** Status colors (shared; contrast handled per theme via border/background) */
export const statusColors = {
  pending: 'var(--color-gold)',
  confirmed: '#2a7db4',
  shipped: '#7a4ab4',
  delivered: 'var(--color-success)',
  cancelled: 'var(--color-error)',
} as const;

export const typography = {
  fontDisplay: "'Cormorant Garamond', serif",
  fontBody: "'DM Sans', sans-serif",
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
  9: 96,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
} as const;

export const zIndices = {
  dropdown: 20,
  modal: 40,
  toast: 50,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export const transitions = {
  fast: '150ms ease-out',
  medium: '220ms ease-out',
  slow: '320ms ease-out',
} as const;

/** Legacy export: resolves to dark theme values for SSR / non-CSS usage */
export const colors = darkColors;
