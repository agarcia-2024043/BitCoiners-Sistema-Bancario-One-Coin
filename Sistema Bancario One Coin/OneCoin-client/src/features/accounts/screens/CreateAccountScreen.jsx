// src/features/accounts/screens/CreateAccountScreen.jsx
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, FONT_WEIGHT } from '../../../shared/constants/theme.js';
import useAccounts from '../hooks/useAccounts.js';
import Button from '../../../shared/components/common/Button.jsx';

const ACCOUNT_TYPES = [
  {
    value: 'ahorro',
    label: 'Ahorro',
    description: 'Genera intereses sobre tus saldos acumulados.',
    icon: '💰',
    accent: '#C5A880',
  },
  {
    value: 'monetaria',
    label: 'Monetaria',
    description: 'Ideal para transacciones y pagos diarios.',
    icon: '💳',
    accent: '#A3845B',
  },
  {
    value: 'corriente',
    label: 'Corriente',
    description: 'Facilidades de giros y transferencias extendidas.',
    icon: '🔄',
    accent: '#EFE6D9',
  },
];

export const CreateAccountScreen = ({ navigation }) => {
  const { createAccount, loading } = useAccounts();
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'ahorro', name: '' }
  });

  const selectedType = watch('type');
  const selectedMeta = ACCOUNT_TYPES.find(t => t.value === selectedType);

  const onSubmit = async (data) => {
    try {
      await createAccount(data.type, data.name.trim() || undefined);
      Alert.alert(
        '¡Cuenta Creada!',
        `Tu cuenta "${data.name.trim() || selectedMeta?.label}" fue creada exitosamente.`,
        [{ text: 'Ver mis cuentas', onPress: () => navigation.navigate('AccountsList') }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo crear la cuenta.');
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Text style={styles.title}>Abrir Nueva Cuenta</Text>
      <Text style={styles.subtitle}>Selecciona el tipo de cuenta que deseas aperturar:</Text>

      {/* Type Selector */}
      <Controller
        control={control}
        name="type"
        render={() => (
          <View style={styles.typesContainer}>
            {ACCOUNT_TYPES.map((type) => {
              const isSelected = selectedType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  activeOpacity={0.75}
                  onPress={() => setValue('type', type.value)}
                  style={[
                    styles.typeCard,
                    isSelected && { borderColor: type.accent, borderWidth: 2.5 }
                  ]}
                >
                  <View style={styles.typeRow}>
                    <View style={[
                      styles.iconWrap,
                      isSelected && { backgroundColor: type.accent + '22' }
                    ]}>
                      <Text style={styles.typeIcon}>{type.icon}</Text>
                    </View>
                    <View style={styles.typeInfo}>
                      <Text style={[
                        styles.typeLabel,
                        isSelected && { color: type.accent }
                      ]}>
                        {type.label}
                      </Text>
                      <Text style={styles.typeDescription}>{type.description}</Text>
                    </View>
                    <View style={[
                      styles.radio,
                      isSelected && { borderColor: type.accent, backgroundColor: type.accent }
                    ]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />

      {/* Account Name */}
      <View style={styles.nameSection}>
        <Text style={styles.nameLabel}>NOMBRE DE LA CUENTA <Text style={styles.optional}>(opcional)</Text></Text>
        <Text style={styles.nameSub}>
          Dale un nombre fácil de recordar. Si no pones uno, se llamará "{selectedMeta?.label} #1", "#2", etc.
        </Text>
        <Controller
          control={control}
          name="name"
          rules={{ maxLength: { value: 40, message: 'Máximo 40 caracteres' } }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.nameInputWrap}>
              <TextInput
                style={styles.nameInput}
                placeholder={`Ej: ${selectedMeta?.label} principal, Ahorros viaje...`}
                placeholderTextColor={COLORS.textLight}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                maxLength={40}
              />
            </View>
          )}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️  Puedes tener hasta <Text style={styles.infoBold}>5 cuentas de cada tipo</Text> (ahorro, monetaria, corriente).
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Cancelar"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={styles.btnCancel}
        />
        <Button
          title={`Crear ${selectedMeta?.label}`}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.btnCreate}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: 40, flexGrow: 1 },

  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold || 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },

  // Type cards
  typesContainer: { gap: SPACING.sm, marginBottom: SPACING.lg },
  typeCard: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg || 12,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.backgroundDark || '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIcon: { fontSize: 22 },
  typeInfo: { flex: 1 },
  typeLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold || 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  typeDescription: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, lineHeight: 16 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },

  // Name section
  nameSection: { marginBottom: SPACING.lg },
  nameLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold || 'bold',
    color: COLORS.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  optional: {
    fontWeight: '400',
    color: COLORS.textLight,
    textTransform: 'none',
    fontSize: FONT_SIZE.xs,
  },
  nameSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  nameInputWrap: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md || 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  nameInput: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    height: 40,
  },
  errorText: { fontSize: FONT_SIZE.xs, color: COLORS.error || '#EF4444', marginTop: 4 },

  // Info box
  infoBox: {
    backgroundColor: (COLORS.accentSurface || '#FBF8F3'),
    borderRadius: RADIUS.md || 8,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: (COLORS.accentLight || '#E8D9C0'),
  },
  infoText: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, lineHeight: 18 },
  infoBold: { fontWeight: FONT_WEIGHT.bold || 'bold', color: COLORS.text },

  // Buttons
  actions: { flexDirection: 'row', gap: SPACING.sm },
  btnCancel: { flex: 1 },
  btnCreate: { flex: 2 },
});

export default CreateAccountScreen;
