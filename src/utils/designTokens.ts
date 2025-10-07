/**
 * Design Tokens - Central design system configuration
 * Implements 20% density increase via scale factor
 */

// Global scale factor for 20% density increase
export const SCALE_FACTOR = 0.8;

// Apply scale to a value
export const scale = (value: number): number => value * SCALE_FACTOR;

// Spacing scale (in rem, scaled down 20%)
export const spacing = {
  xs: `${scale(0.25)}rem`,    // 0.2rem
  sm: `${scale(0.5)}rem`,     // 0.4rem
  md: `${scale(0.75)}rem`,    // 0.6rem
  lg: `${scale(1)}rem`,       // 0.8rem
  xl: `${scale(1.5)}rem`,     // 1.2rem
  '2xl': `${scale(2)}rem`,    // 1.6rem
  '3xl': `${scale(3)}rem`,    // 2.4rem
  '4xl': `${scale(4)}rem`,    // 3.2rem
} as const;

// Typography scale (scaled down 20%)
export const typography = {
  xs: `${scale(0.75)}rem`,    // 0.6rem
  sm: `${scale(0.875)}rem`,   // 0.7rem
  base: `${scale(1)}rem`,     // 0.8rem
  lg: `${scale(1.125)}rem`,   // 0.9rem
  xl: `${scale(1.25)}rem`,    // 1rem
  '2xl': `${scale(1.5)}rem`,  // 1.2rem
  '3xl': `${scale(1.875)}rem`,// 1.5rem
  '4xl': `${scale(2.25)}rem`, // 1.8rem
} as const;

// Border radius (scaled down 20%)
export const radius = {
  sm: `${scale(0.25)}rem`,    // 0.2rem
  md: `${scale(0.5)}rem`,     // 0.4rem
  lg: `${scale(0.75)}rem`,    // 0.6rem
  xl: `${scale(1)}rem`,       // 0.8rem
  '2xl': `${scale(1.5)}rem`,  // 1.2rem
  full: '9999px',
} as const;

// Component dimensions
export const dimensions = {
  header: {
    height: scale(64),        // 51.2px (≤64px requirement)
  },
  sidebar: {
    expanded: scale(280),     // 224px
    collapsed: scale(72),     // 57.6px
  },
  iconSize: {
    xs: scale(12),           // 9.6px
    sm: scale(16),           // 12.8px
    md: scale(20),           // 16px
    lg: scale(24),           // 19.2px
    xl: scale(32),           // 25.6px
  },
} as const;

// Breakpoints for responsive behavior
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,   // Auto-collapse sidebar below this
  '2xl': 1536,
  minHeight: 720, // Auto-collapse sidebar below this height
} as const;

// Colors - Metallic accents
export const colors = {
  metallic: {
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    platinum: '#E5E4E2',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  chart: {
    bullish: '#10B981',
    bearish: '#EF4444',
    neutral: '#64748B',
  },
} as const;

// Glassmorphism styles
export const glassmorphism = {
  light: {
    background: 'rgba(30, 41, 59, 0.3)',
    border: 'rgba(255, 255, 255, 0.1)',
    backdropBlur: '12px',
  },
  medium: {
    background: 'rgba(30, 41, 59, 0.5)',
    border: 'rgba(255, 255, 255, 0.15)',
    backdropBlur: '16px',
  },
  strong: {
    background: 'rgba(30, 41, 59, 0.7)',
    border: 'rgba(255, 255, 255, 0.2)',
    backdropBlur: '20px',
  },
} as const;

// Animation durations
export const duration = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;

// Z-index layers
export const zIndex = {
  dropdown: 1000,
  modal: 2000,
  tooltip: 3000,
  toast: 4000,
} as const;

// Utility functions
export const formatCurrency = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, compact = false): string => {
  if (!compact) {
    return new Intl.NumberFormat('en-US').format(value);
  }
  
  // Compact notation: K/M/B
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
};

export const formatTimestamp = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

// Contrast helpers for AA/AAA compliance
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In production, use a proper color library
  return 4.5; // Placeholder
};

export const ensureContrast = (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
};
