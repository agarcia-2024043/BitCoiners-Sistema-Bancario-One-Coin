// src/shared/components/common/Common.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import {
  COLORS, SPACING, FONT_SIZE, RADIUS,
  SHADOWS, ANIMATION, FONT_WEIGHT,
} from '../../constants/theme.js';

// ─── Loading Spinner ───────────────────────────────────────────────────────
export const LoadingSpinner = ({ color = COLORS.accent }) => (
  <View style={styles.spinnerContainer}>
    <MotiView
      from={{ scale: 0.85, opacity: 0.4 }}
      animate={{ scale: 1.1, opacity: 1 }}
      transition={{
        type: 'timing', duration: 700,
        easing: Easing.inOut(Easing.ease),
        loop: true, repeatReverse: true,
      }}
      style={[styles.spinnerDot, { backgroundColor: color }]}
    />
    <MotiView
      from={{ scale: 0.85, opacity: 0.2 }}
      animate={{ scale: 1.15, opacity: 0.6 }}
      transition={{
        type: 'timing', duration: 700, delay: 200,
        easing: Easing.inOut(Easing.ease),
        loop: true, repeatReverse: true,
      }}
      style={[styles.spinnerRing, { borderColor: color }]}
    />
  </View>
);

// ─── Empty State ──────────────────────────────────────────────────────────
export const EmptyState = ({ title = 'No hay datos', message, icon }) => (
  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={ANIMATION.spring.gentle}
    style={styles.emptyContainer}
  >
    {icon && <View style={styles.emptyIcon}>{icon}</View>}
    <Text style={styles.emptyTitle}>{title}</Text>
    {message && <Text style={styles.emptyMsg}>{message}</Text>}
  </MotiView>
);

// ─── Card ─────────────────────────────────────────────────────────────────
export const Card = ({ children, style, delay = 0, animate = true }) => {
  if (!animate) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12, scale: 0.98 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ ...ANIMATION.spring.gentle, delay }}
      style={[styles.card, style]}
    >
      {children}
    </MotiView>
  );
};

// ─── Stagger Item ─────────────────────────────────────────────────────────
export const StaggerItem = ({ children, index = 0, style }) => (
  <MotiView
    from={{ opacity: 0, translateY: 24 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ ...ANIMATION.spring.gentle, delay: index * ANIMATION.stagger }}
    style={style}
  >
    {children}
  </MotiView>
);

// ─── Section Header ───────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <View style={styles.sectionHeader}>
    <View style={{ flex: 1 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSub}>{subtitle}</Text>}
    </View>
    {action}
  </View>
);

// ─── Divider ──────────────────────────────────────────────────────────────
export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

// ─── Badge ────────────────────────────────────────────────────────────────
export const Badge = ({ label, variant = 'default' }) => {
  const map = {
    default: { bg: COLORS.backgroundDark, text: COLORS.textSecondary, border: COLORS.border },
    success: { bg: COLORS.successLight,   text: COLORS.success,       border: 'rgba(16,185,129,0.25)' },
    error:   { bg: COLORS.errorLight,     text: COLORS.error,         border: 'rgba(239,68,68,0.25)' },
    gold:    { bg: COLORS.accentSurface,  text: COLORS.accentDark,    border: COLORS.accentLight },
    dark:    { bg: COLORS.primary,        text: COLORS.textOnDark,    border: 'rgba(255,255,255,0.1)' },
  };
  const c = map[variant] || map.default;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Spinner
  spinnerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.background, minHeight: 200,
  },
  spinnerDot: {
    width: 12, height: 12,
    borderRadius: RADIUS.full,
    position: 'absolute',
  },
  spinnerRing: {
    width: 44, height: 44,
    borderRadius: RADIUS.full,
    borderWidth: 2.5,
    backgroundColor: 'transparent',
  },

  // Empty State
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: SPACING.xl, minHeight: 220,
  },
  emptyIcon: {
    width: 72, height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  emptyMsg: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm, marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  sectionSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },

  // Divider
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.xs },

  // Badge
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
