// src/features/profile/screens/ProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image,
  Alert, ScrollView, Pressable, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MotiView } from 'moti';
import {
  User, Mail, MapPin, Briefcase, DollarSign, Phone,
  Edit3, LogOut, ChevronRight, Shield, Bell, Camera, CreditCard, ShieldCheck
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../../../shared/utils/cloudinary.js';
import {
  COLORS, SPACING, FONT_SIZE, SHADOWS,
  RADIUS, ANIMATION, FONT_WEIGHT, LETTER_SPACING,
} from '../../../shared/constants/theme.js';
import authClient from '../../../shared/api/authClient.js';
import useAuthStore from '../../../shared/store/authStore.js';
import useAccounts from '../../accounts/hooks/useAccounts.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../../../shared/components/common/Button.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import { Card, LoadingSpinner, StaggerItem, Divider } from '../../../shared/components/common/Common.jsx';

// ─── Stat Card ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, index }) => (
  <StaggerItem index={index} style={styles.statCardWrapper}>
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '20' }]}>
        <Icon size={18} color={color} strokeWidth={2} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </StaggerItem>
);

// ─── Settings Row ─────────────────────────────────────────────────────────
const SettingsRow = ({ icon: Icon, label, onPress, color = COLORS.text, index }) => (
  <StaggerItem index={index}>
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <MotiView
          animate={{ opacity: pressed ? 0.7 : 1 }}
          style={styles.settingsRow}
        >
          <View style={styles.settingsIcon}>
            <Icon size={18} color={color} strokeWidth={1.8} />
          </View>
          <Text style={[styles.settingsLabel, { color }]}>{label}</Text>
          <ChevronRight size={16} color={COLORS.textLight} />
        </MotiView>
      )}
    </Pressable>
  </StaggerItem>
);

// ─── Main Screen ──────────────────────────────────────────────────────────
export const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuthStore();
  const { totalBalance, accounts, fetchAccounts } = useAccounts();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Guarda los cambios tanto en el store como en AsyncStorage persistente por usuario
  const saveLocalProfile = async (updates) => {
    const updatedUser = { ...user, ...updates };
    updateUser(updatedUser);
    if (updatedUser.username) {
      await AsyncStorage.setItem(`@profile_${updatedUser.username}`, JSON.stringify({
        fullName: updatedUser.fullName,
        address: updatedUser.address,
        phoneNumber: updatedUser.phoneNumber,
        jobName: updatedUser.jobName,
        monthlyIncome: updatedUser.monthlyIncome,
        avatar: updatedUser.avatar,
      }));
    }
  };

  const pickAndUploadImage = async () => {
    try {
      // 1. Pedir permisos
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería para cambiar la foto de perfil.');
        return;
      }

      // 2. Seleccionar imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarLoading(true);
        const imageUri = result.assets[0].uri;

        // 3. Subir a Cloudinary
        const secureUrl = await uploadImageToCloudinary(imageUri);

        // 4. Actualizar estado local y AsyncStorage
        await saveLocalProfile({ avatar: secureUrl });
        Alert.alert('¡Éxito!', 'Foto de perfil actualizada correctamente.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'No se pudo actualizar la foto de perfil.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      address: user?.address || '',
      phoneNumber: user?.phoneNumber || '',
      jobName: user?.jobName || '',
      monthlyIncome: user?.monthlyIncome ? String(user.monthlyIncome) : '',
    },
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorText('');
    try {
      const response = await authClient.get('/me');
      // /me devuelve { sub, username, role } — combinamos con los datos del store local
      const data = response.data?.user || response.data;
      
      // Recuperar los datos adicionales guardados localmente para este usuario
      const savedLocalStr = await AsyncStorage.getItem(`@profile_${data.username || user?.username}`);
      const savedLocal = savedLocalStr ? JSON.parse(savedLocalStr) : {};

      const merged = {
        ...user,
        ...savedLocal,
        username: data.username || user?.username,
        email: data.email || user?.email,
      };
      
      updateUser(merged);
      setValue('fullName', merged.fullName || '');
      setValue('address', merged.address || '');
      setValue('phoneNumber', merged.phoneNumber || '');
      setValue('jobName', merged.jobName || '');
      setValue('monthlyIncome', String(merged.monthlyIncome || ''));
    } catch (_err) {
      // Si /me falla, usamos los datos que ya están en el store local sin mostrar error
      setValue('fullName', user?.fullName || '');
      setValue('address', user?.address || '');
      setValue('phoneNumber', user?.phoneNumber || '');
      setValue('jobName', user?.jobName || '');
      setValue('monthlyIncome', String(user?.monthlyIncome || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAccounts();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorText('');
    try {
      const payload = {
        fullName: data.fullName,
        address: data.address,
        phoneNumber: data.phoneNumber,
        jobName: data.jobName,
        monthlyIncome: Number(data.monthlyIncome),
      };
      // Guardamos los cambios en el store local de manera persistente
      await saveLocalProfile(payload);
      setIsEditing(false);
      Alert.alert('¡Éxito!', 'Perfil actualizado correctamente.');
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo actualizar.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: logout },
      ],
    );
  };

  const avatarUri = user?.avatar;
  const isHttpAvatar = avatarUri && avatarUri.startsWith('http');
  const avatarSource = isHttpAvatar ? { uri: avatarUri } : require('../../../../assets/avatarDefault.png');

  if (loading && !isEditing) return <LoadingSpinner />;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero Header ── */}
      <MotiView
        from={{ opacity: 0, translateY: -24 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={ANIMATION.spring.gentle}
        style={styles.heroBanner}
      >
        <View style={styles.heroDecorCircle1} />
        <View style={styles.heroDecorCircle2} />

        {/* Avatar */}
        <Pressable onPress={pickAndUploadImage} style={styles.avatarRing}>
          <Image source={avatarSource} style={styles.avatar} />
          <View style={styles.avatarEditOverlay}>
            <Camera size={20} color="#fff" />
          </View>
          {avatarLoading && (
            <View style={styles.avatarLoadingOverlay}>
              <LoadingSpinner color="#fff" />
            </View>
          )}
        </Pressable>

        {/* User info */}
        <Text style={styles.heroName}>{user?.fullName || user?.username || 'Usuario'}</Text>
        <Text style={styles.heroEmail}>{user?.email || ''}</Text>

        {/* Username badge */}
        {user?.username && (
          <View style={styles.usernameBadge}>
            <Text style={styles.usernameBadgeText}>@{user.username}</Text>
          </View>
        )}
      </MotiView>

      {/* ── Stats Row ── */}
      <View style={styles.statsRow}>
        <StatCard
          label="Saldo Total"
          value={formatCurrency(totalBalance)}
          icon={DollarSign}
          color={COLORS.primary}
          index={0}
        />
        <StatCard
          label="Cuentas"
          value={String(accounts?.length ?? 0)}
          icon={Shield}
          color={COLORS.success}
          index={1}
        />
      </View>

      {/* ── Profile Form ── */}
      <StaggerItem index={2}>
        <View style={styles.formSection}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Información Personal</Text>
            {!isEditing && (
              <Pressable onPress={() => setIsEditing(true)} style={styles.editBtn}>
                <Edit3 size={14} color={COLORS.primary} />
                <Text style={styles.editBtnText}>Editar</Text>
              </Pressable>
            )}
          </View>

          {/* Read-only fields */}
          <View style={styles.readOnlyRow}>
            <User size={14} color={COLORS.textLight} />
            <View style={styles.readOnlyContent}>
              <Text style={styles.readOnlyLabel}>Usuario</Text>
              <Text style={styles.readOnlyValue}>{user?.username || '—'}</Text>
            </View>
          </View>
          <Divider />
          <View style={styles.readOnlyRow}>
            <Mail size={14} color={COLORS.textLight} />
            <View style={styles.readOnlyContent}>
              <Text style={styles.readOnlyLabel}>Correo</Text>
              <Text style={styles.readOnlyValue}>{user?.email || '—'}</Text>
            </View>
          </View>
          <Divider />

          {/* Editable fields */}
          <Controller
            control={control}
            name="fullName"
            rules={{ required: 'El nombre es requerido' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nombre Completo"
                placeholder="Tu nombre completo"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={isEditing}
                error={errors.fullName?.message}
                leftIcon={<User size={16} color={COLORS.textLight} />}
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            rules={{ required: 'La dirección es requerida' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Dirección"
                placeholder="Ciudad, Guatemala"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={isEditing}
                error={errors.address?.message}
                leftIcon={<MapPin size={16} color={COLORS.textLight} />}
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            rules={{ required: 'El teléfono es requerido' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Teléfono"
                placeholder="0000-0000"
                keyboardType="phone-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={isEditing}
                error={errors.phoneNumber?.message}
                leftIcon={<User size={16} color={COLORS.textLight} />}
              />
            )}
          />

          <Controller
            control={control}
            name="jobName"
            rules={{ required: 'El puesto es requerido' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Puesto / Empresa"
                placeholder="Puesto de trabajo"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={isEditing}
                error={errors.jobName?.message}
                leftIcon={<Briefcase size={16} color={COLORS.textLight} />}
              />
            )}
          />

          <Controller
            control={control}
            name="monthlyIncome"
            rules={{
              required: 'Los ingresos son requeridos',
              validate: (val) => (!isNaN(Number(val)) && Number(val) >= 100) || 'Debe ser al menos Q100',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Ingresos Mensuales (GTQ)"
                placeholder="0.00"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={isEditing}
                error={errors.monthlyIncome?.message}
                leftIcon={<DollarSign size={16} color={COLORS.textLight} />}
              />
            )}
          />

          {errorText ? (
            <Text style={styles.errorText}>{errorText}</Text>
          ) : null}

          {isEditing && (
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={ANIMATION.spring.bouncy}
              style={styles.editActions}
            >
              <Button
                title="Cancelar"
                onPress={() => { setIsEditing(false); fetchProfile(); }}
                variant="outline"
                style={styles.btnHalf}
              />
              <Button
                title="Guardar"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                style={styles.btnHalf}
              />
            </MotiView>
          )}
        </View>
      </StaggerItem>

      {/* ── Services List ── */}
      <StaggerItem index={3}>
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Adquirir servicios</Text>
          <View style={styles.settingsList}>
            <SettingsRow
              icon={CreditCard}
              label="Solicitar tarjeta"
              index={1}
              onPress={() => navigation.navigate('Cards')}
            />
            <SettingsRow
              icon={ShieldCheck}
              label="Solicitar seguro"
              index={2}
              onPress={() => navigation.navigate('Insurances')}
            />
          </View>
        </View>
      </StaggerItem>

      {/* ── Settings List ── */}
      <StaggerItem index={4}>
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Configuración</Text>
          <View style={styles.settingsList}>
            <SettingsRow
              icon={Bell}
              label="Notificaciones"
              index={1}
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>
        </View>
      </StaggerItem>

      {/* ── Logout ── */}
      <StaggerItem index={5}>
        <Pressable onPress={handleLogoutPress}>
          {({ pressed }) => (
            <MotiView
              animate={{ opacity: pressed ? 0.75 : 1 }}
              style={styles.logoutRow}
            >
              <View style={styles.logoutIcon}>
                <LogOut size={18} color={COLORS.error} strokeWidth={2} />
              </View>
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </MotiView>
          )}
        </Pressable>
      </StaggerItem>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },

  // ── Hero
  heroBanner: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    ...SHADOWS.lg,
  },
  heroDecorCircle1: {
    position: 'absolute', width: 220, height: 220,
    borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60, right: -60,
  },
  heroDecorCircle2: {
    position: 'absolute', width: 160, height: 160,
    borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -50, left: -40,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: COLORS.accent,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.md,
    position: 'relative',
  },
  avatar: { width: '100%', height: '100%' },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textOnDark, textAlign: 'center',
  },
  heroEmail: {
    fontSize: FONT_SIZE.sm, color: COLORS.textOnDarkMuted,
    marginTop: 2, textAlign: 'center',
  },
  usernameBadge: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(197,168,128,0.15)',
    paddingHorizontal: SPACING.md, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1,
    borderColor: 'rgba(197,168,128,0.3)',
  },
  usernameBadgeText: {
    fontSize: FONT_SIZE.sm, color: COLORS.textOnDark,
    fontWeight: FONT_WEIGHT.medium,
  },

  // ── Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    marginTop: -SPACING.lg,
  },
  statCardWrapper: { flex: 1 },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'flex-start',
    ...SHADOWS.md,
  },
  statIconWrap: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text, marginBottom: 2,
  },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },

  // ── Form
  formSection: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOWS.md,
  },
  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md,
  },
  formTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: SPACING.sm, paddingVertical: 5,
    borderRadius: RADIUS.md,
  },
  editBtnText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: FONT_WEIGHT.medium },

  // Read-only rows
  readOnlyRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.sm,
  },
  readOnlyContent: { flex: 1 },
  readOnlyLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  readOnlyValue: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: FONT_WEIGHT.medium },

  errorText: {
    fontSize: FONT_SIZE.sm, color: COLORS.error,
    marginBottom: SPACING.sm, textAlign: 'center',
  },
  editActions: {
    flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm,
  },
  btnHalf: { flex: 1 },

  // ── Settings
  settingsSection: {
    marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
  },
  settingsSectionTitle: {
    fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textLight, textTransform: 'uppercase',
    letterSpacing: LETTER_SPACING.wider, marginBottom: SPACING.xs,
    marginLeft: 2,
  },
  settingsList: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    overflow: 'hidden', ...SHADOWS.sm,
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  settingsIcon: {
    width: 32, height: 32, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center', justifyContent: 'center',
  },
  settingsLabel: {
    flex: 1, fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },
  settingsDivider: { marginHorizontal: SPACING.lg },

  // ── Logout
  logoutRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.sm, marginHorizontal: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.md, ...SHADOWS.sm,
    borderWidth: 1, borderColor: COLORS.errorLight,
  },
  logoutIcon: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: {
    fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.error,
  },
});

export default ProfileScreen;
