// src/features/auth/screens/LoginScreen.jsx
import React from 'react';
import {
  View, StyleSheet, Text, Image,
  ScrollView, Alert, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MotiView } from 'moti';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT,
  RADIUS, SHADOWS, ANIMATION,
} from '../../../shared/constants/theme.js';
import Button from '../../../shared/components/common/Button.jsx';
import Input  from '../../../shared/components/common/Input.jsx';
import useAuth from '../hooks/useAuth.js';

export const LoginScreen = ({ navigation }) => {
  const { handleLogin, loading } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    const result = await handleLogin(data.email, data.password);
    if (!result.success) Alert.alert('Error de inicio de sesión', result.error);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header dark card */}
      <MotiView
        from={{ opacity: 0, translateY: -24 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={ANIMATION.spring.gentle}
        style={styles.headerCard}
      >
        {/* Decoration circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <View style={styles.logoWrap}>
          <Image
            source={require('../../../../assets/logo-banco.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.labelSmall}>ONE</Text>
          <Text style={styles.title}>COIN</Text>
          <Text style={styles.subtitle}>Tu banca móvil segura y rápida</Text>
        </View>

        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeBadgeText}>Sesión segura</Text>
        </View>
      </MotiView>

      {/* Form card */}
      <MotiView
        from={{ opacity: 0, translateY: 24 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ ...ANIMATION.spring.gentle, delay: 100 }}
        style={styles.formCard}
      >
        <Text style={styles.formTitle}>Iniciar Sesión</Text>
        <Text style={styles.formSub}>Ingresa tus credenciales para continuar</Text>

        <View style={styles.divider} />

        <Controller
          control={control}
          name="email"
          rules={{
            required: 'El correo es requerido',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'La contraseña es requerida',
            minLength: { value: 6, message: 'Mínimo 6 caracteres' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Contraseña"
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Button
          title="Iniciar Sesión"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.btn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerNotice}>
            ¿No tienes cuenta? Acércate a tu agencia bancaria para que un
            administrador cree tu cuenta de cliente.
          </Text>
        </View>
      </MotiView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingBottom: SPACING.xxl,
  },

  // Header dark card
  headerCard: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  decorCircle1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(197,168,128,0.05)', top: -60, right: -50,
  },
  decorCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(197,168,128,0.04)', bottom: -30, left: -20,
  },
  logoWrap: {
    width: 72, height: 72,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(197,168,128,0.12)',
    borderWidth: 1, borderColor: 'rgba(197,168,128,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logo: { width: 48, height: 48 },
  headerText: { marginBottom: SPACING.md },
  labelSmall: {
    fontSize: 10, color: COLORS.accent, fontWeight: FONT_WEIGHT.black,
    letterSpacing: 3, marginBottom: 2,
  },
  title: {
    fontSize: FONT_SIZE.xxxl, fontWeight: FONT_WEIGHT.black,
    color: COLORS.textOnDark, letterSpacing: -1,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm, color: COLORS.textOnDarkMuted,
    marginTop: SPACING.xs,
  },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: RADIUS.full, alignSelf: 'flex-start',
  },
  activeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  activeBadgeText: {
    fontSize: 10, color: COLORS.success, fontWeight: FONT_WEIGHT.bold,
  },

  // Form card
  formCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  formTitle: {
    fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.black,
    color: COLORS.text, letterSpacing: -0.5,
  },
  formSub: {
    fontSize: FONT_SIZE.sm, color: COLORS.textLight,
    marginTop: 4, marginBottom: SPACING.md,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md },

  btn: { marginTop: SPACING.xs, borderRadius: RADIUS.md },

  footer: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  footerNotice: {
    fontSize: FONT_SIZE.sm, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 18,
  },
});

export default LoginScreen;
