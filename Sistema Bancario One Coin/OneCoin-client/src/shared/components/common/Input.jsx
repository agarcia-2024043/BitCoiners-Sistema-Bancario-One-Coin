// src/shared/components/common/Input.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import {
  COLORS, SPACING, FONT_SIZE, RADIUS,
  FONT_WEIGHT, ANIMATION,
} from '../../constants/theme.js';

export const Input = ({
  label, error, style, containerStyle,
  leftIcon, rightIcon, hint, ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isFocused && styles.labelFocused, hasError && styles.labelError]}>
          {label}
        </Text>
      )}

      <MotiView
        animate={{
          borderColor: hasError ? COLORS.error : isFocused ? COLORS.borderFocus : COLORS.border,
          shadowOpacity: isFocused ? 0.15 : 0,
        }}
        transition={ANIMATION.spring.gentle}
        style={[
          styles.wrapper,
          props.editable === false && styles.wrapperDisabled,
          style,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon  && styles.inputWithLeft,
            rightIcon && styles.inputWithRight,
            props.editable === false && styles.inputDisabled,
          ]}
          placeholderTextColor={COLORS.textLight}
          onFocus={(e) => { setIsFocused(true);  props.onFocus?.(e); }}
          onBlur={(e)  => { setIsFocused(false); props.onBlur?.(e);  }}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </MotiView>

      {(error || hint) && (
        <MotiView
          from={{ opacity: 0, translateY: -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={ANIMATION.timing.fast}
        >
          <Text style={[styles.helper, hasError && styles.helperError]}>
            {error || hint}
          </Text>
        </MotiView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md, width: '100%' },

  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  labelFocused: { color: COLORS.accentDark },
  labelError:   { color: COLORS.error },

  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0,
    elevation: 0,
  },
  wrapperDisabled: { backgroundColor: COLORS.backgroundDark, borderColor: COLORS.border },

  iconLeft:  { paddingLeft: SPACING.md, paddingRight: SPACING.xs },
  iconRight: { paddingRight: SPACING.md, paddingLeft: SPACING.xs },

  input: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  inputWithLeft:  { paddingLeft: SPACING.xs },
  inputWithRight: { paddingRight: SPACING.xs },
  inputDisabled:  { color: COLORS.textLight },

  helper:      { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: SPACING.xs - 2, marginLeft: 2 },
  helperError: { color: COLORS.error },
});

export default Input;
