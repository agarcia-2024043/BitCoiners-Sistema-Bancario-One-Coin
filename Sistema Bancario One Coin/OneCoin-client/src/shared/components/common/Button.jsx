// src/shared/components/common/Button.jsx
import React from 'react';
import { Text, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import {
  COLORS, SPACING, FONT_SIZE, RADIUS,
  SHADOWS, ANIMATION, FONT_WEIGHT, LETTER_SPACING,
} from '../../constants/theme.js';

export const Button = ({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, ...props
}) => {
  const isDisabled = disabled || loading;

  const variantMap = {
    primary:   { bg: styles.primary,   text: styles.textPrimary },
    secondary: { bg: styles.secondary, text: styles.textSecondary },
    ghost:     { bg: styles.ghost,     text: styles.textGhost },
    danger:    { bg: styles.danger,    text: styles.textDanger },
    outline:   { bg: styles.outline,   text: styles.textOutline },
    gold:      { bg: styles.gold,      text: styles.textGold },
  };
  const sizeMap = {
    sm: { bg: styles.sizeSm, text: styles.textSm },
    md: { bg: styles.sizeMd, text: styles.textMd },
    lg: { bg: styles.sizeLg, text: styles.textLg },
  };

  const v = variantMap[variant] || variantMap.primary;
  const s = sizeMap[size] || sizeMap.md;

  const spinnerColor =
    variant === 'secondary' || variant === 'ghost' || variant === 'outline'
      ? COLORS.accent
      : COLORS.textOnDark;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={[styles.base, v.bg, s.bg, isDisabled && styles.disabled, style]}
      {...props}
    >
      {({ pressed }) => (
        <MotiView
          animate={{
            scale:   pressed && !isDisabled ? ANIMATION.pressScale  : 1,
            opacity: pressed && !isDisabled ? ANIMATION.pressOpacity : 1,
          }}
          transition={ANIMATION.spring.snappy}
          style={styles.inner}
        >
          {loading
            ? <ActivityIndicator color={spinnerColor} size="small" />
            : <Text style={[styles.text, v.text, s.text, textStyle]}>{title}</Text>
          }
        </MotiView>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inner: { alignItems: 'center', justifyContent: 'center', width: '100%' },

  // Sizes
  sizeSm: { paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md },
  sizeMd: { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.lg },
  sizeLg: { paddingVertical: SPACING.md,     paddingHorizontal: SPACING.xl },

  // Variants
  primary:   { backgroundColor: COLORS.primary, ...SHADOWS.sm },
  secondary: { backgroundColor: COLORS.backgroundDark, borderWidth: 1, borderColor: COLORS.border },
  ghost:     { backgroundColor: 'transparent' },
  danger:    { backgroundColor: COLORS.error, ...SHADOWS.sm },
  outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  gold:      { backgroundColor: COLORS.accent, ...SHADOWS.sm },

  disabled: { opacity: 0.45 },

  // Text base
  text: {
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: LETTER_SPACING.wide,
  },
  textSm: { fontSize: FONT_SIZE.sm },
  textMd: { fontSize: FONT_SIZE.md },
  textLg: { fontSize: FONT_SIZE.lg },

  // Text variants
  textPrimary:   { color: COLORS.textOnDark },
  textSecondary: { color: COLORS.text },
  textGhost:     { color: COLORS.accent },
  textDanger:    { color: COLORS.textOnDark },
  textOutline:   { color: COLORS.primary },
  textGold:      { color: COLORS.primary },
});

export default Button;
