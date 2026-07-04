// src/features/auth/screens/RegisterScreen.jsx
import React from 'react';
import {
  View, StyleSheet, Text, ScrollView,
  Alert, Platform,
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

export const RegisterScreen = ({ navigation }) => {
  const { handleRegister, loading } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { firstName: '', lastName: '', username: '', email: '', password: '' },
  });

  const onSubmit = async (data) => {
    const result = await handleRegister(data);
    if (result.success) {
      Alert.alert('Registro Exitoso', 'Tu cuenta fue creada. Ahora puedes iniciar sesión.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } else {
      Alert.alert('Error de Registro', result.error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header dark */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={ANIMATION.spring.gentle}
        style={styles.headerCard}
      >
        <View style={styles.decorCircle} />
        <Text style={styles.labelSmall}>ONE COIN</Text>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete al sistema bancario digital</Text>
      </MotiView>

      {/* Form */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ ...ANIMATION.spring.gentle, delay: 80 }}
        style={styles.formCard}
      >
        {[
          { name: 'firstName', label: 'Nombre',           placeholder: 'Tu nombre',          rules: { required: 'Requerido' } },
          { name: 'lastName',  label: 'Apellido',         placeholder: 'Tu apellido',         rules: { required: 'Requerido' } },
          { name: 'username',  label: 'Usuario',          placeholder: 'nombre_usuario',      rules: { required: 'Requerido' }, extra: { autoCapitalize: 'none' } },
          { name: 'email',     label: 'Correo',           placeholder: 'ejemplo@correo.com',  rules: {
              required: 'Requerido',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
            }, extra: { keyboardType: 'email-address', autoCapitalize: 'none' } },
          { name: 'password',  label: 'Contraseña',       placeholder: '••••••••',            rules: {
              required: 'Requerida',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            }, extra: { secureTextEntry: true, autoCapitalize: 'none' } },
        ].map(({ name, label, placeholder, rules, extra = {} }) => (
          <Controller
            key={name}
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={label}
                placeholder={placeholder}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors[name]?.message}
                {...extra}
              />
            )}
          />
        ))}

        <Button
          title="Crear Cuenta"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.btn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Inicia sesión
          </Text>
        </View>
      </MotiView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background, paddingBottom: SPACING.xxl },

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
  decorCircle: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(197,168,128,0.06)', top: -50, right: -40,
  },
  labelSmall: {
    fontSize: 10, color: COLORS.accent, fontWeight: FONT_WEIGHT.black,
    letterSpacing: 3, marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xxxl, fontWeight: FONT_WEIGHT.black,
    color: COLORS.textOnDark, letterSpacing: -1,
  },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textOnDarkMuted, marginTop: 4 },

  formCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },

  btn: { marginTop: SPACING.xs, borderRadius: RADIUS.md },

  footer: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: SPACING.lg, flexWrap: 'wrap',
  },
  footerText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  link: { fontSize: FONT_SIZE.sm, color: COLORS.accentDark, fontWeight: FONT_WEIGHT.bold },
});

export default RegisterScreen;
