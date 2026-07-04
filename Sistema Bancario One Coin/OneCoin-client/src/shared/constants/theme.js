// src/shared/constants/theme.js — OneCoin Design System (dark + gold)

// ─── Color Palette ─────────────────────────────────────────────────────────
export const COLORS = {
  // Brand darks (matches web #0A0A0A sidebar)
  primary:       '#0A0A0A',
  primaryLight:  '#1C1C1C',
  primaryDark:   '#000000',
  primaryGlow:   'rgba(197, 168, 128, 0.18)',

  // Gold accent (matches web #C5A880 / #A3845B)
  accent:        '#C5A880',
  accentDark:    '#A3845B',
  accentLight:   '#EFE6D9',
  accentSurface: '#FAF6F0',

  // Neutrals
  background:     '#FFFFFF',
  backgroundDark: '#F5F5F5',
  surface:        '#FFFFFF',
  surfaceElevated:'#FAFAFA',

  // Text
  text:            '#0A0A0A',
  textSecondary:   '#52525B',  // zinc-600
  textLight:       '#A1A1AA',  // zinc-400
  textOnDark:      '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.55)',

  // Legacy alias
  secondary: '#71717A',

  // Semantic
  error:        '#EF4444',
  errorLight:   'rgba(239,68,68,0.10)',
  success:      '#10B981',
  successLight: 'rgba(16,185,129,0.10)',
  warning:      '#F59E0B',
  warningLight: 'rgba(245,158,11,0.10)',

  // UI chrome
  border:       '#E4E4E7',   // zinc-200
  borderFocus:  '#C5A880',
  divider:      'rgba(0,0,0,0.06)',

  // Glass
  glass:        'rgba(255,255,255,0.80)',
  glassDark:    'rgba(10,10,10,0.88)',
  glassBorder:  'rgba(255,255,255,0.20)',

  // Gradients (LinearGradient arrays)
  gradientPrimary: ['#0A0A0A', '#1C1C1C'],
  gradientGold:    ['#C5A880', '#A3845B'],
  gradientSuccess: ['#059669', '#10B981'],
};

// ─── Spacing ───────────────────────────────────────────────────────────────
export const SPACING = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl:64,
};

// ─── Border Radius ─────────────────────────────────────────────────────────
export const RADIUS = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  xxl:  36,
  full: 9999,
};

// ─── Font Sizes ────────────────────────────────────────────────────────────
export const FONT_SIZE = {
  xs:      11,
  sm:      13,
  md:      15,
  lg:      17,
  xl:      20,
  xxl:     24,
  xxxl:    32,
  display: 40,
};

// ─── Font Weights ──────────────────────────────────────────────────────────
export const FONT_WEIGHT = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  heavy:    '800',
  black:    '900',
};

// ─── Letter Spacing ────────────────────────────────────────────────────────
export const LETTER_SPACING = {
  tight:   -0.5,
  normal:   0,
  wide:     0.5,
  wider:    1,
  widest:   2,
};

// ─── Shadows ───────────────────────────────────────────────────────────────
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 16,
  },
  glow: {
    shadowColor: '#C5A880',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
};

// ─── Animation Config ──────────────────────────────────────────────────────
export const ANIMATION = {
  spring: {
    gentle: { type: 'spring', damping: 20, stiffness: 200 },
    bouncy: { type: 'spring', damping: 14, stiffness: 300 },
    snappy: { type: 'spring', damping: 25, stiffness: 400 },
    slow:   { type: 'spring', damping: 30, stiffness: 120 },
  },
  timing: {
    fast:     { type: 'timing', duration: 150 },
    normal:   { type: 'timing', duration: 250 },
    slow:     { type: 'timing', duration: 400 },
    verySlow: { type: 'timing', duration: 600 },
  },
  stagger:       60,
  pressScale:    0.97,
  pressOpacity:  0.82,
};

export default { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, LETTER_SPACING, SHADOWS, ANIMATION };
