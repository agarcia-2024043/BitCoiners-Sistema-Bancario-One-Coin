// src/features/transactions/screens/TransferScreen.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Alert,
  ScrollView, Pressable, Modal, FlatList, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MotiView } from 'moti';
import {
  ArrowLeftRight, Search, CheckCircle,
  ChevronDown, ChevronUp, Wallet, Info, ArrowRight,
} from 'lucide-react-native';
import {
  COLORS, SPACING, FONT_SIZE, RADIUS,
  ANIMATION, FONT_WEIGHT, SHADOWS, LETTER_SPACING,
} from '../../../shared/constants/theme.js';
import useTransactions from '../hooks/useTransactions.js';
import useAccounts from '../../accounts/hooks/useAccounts.js';
import useFavorites from '../../favorites/hooks/useFavorites.js';
import Button from '../../../shared/components/common/Button.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import { LoadingSpinner } from '../../../shared/components/common/Common.jsx';

import accountClient from '../../../shared/api/accountClient.js';

// ─── Limit Progress Bar ────────────────────────────────────────────────────
const LimitBar = ({ used, max, label }) => {
  const pct = Math.min((used / max) * 100, 100);
  const isWarning = pct > 70;
  const barColor = pct >= 100 ? COLORS.error : isWarning ? COLORS.warning : COLORS.success;

  return (
    <View style={limStyles.container}>
      <View style={limStyles.header}>
        <Text style={limStyles.label}>{label}</Text>
        <Text style={[limStyles.value, { color: barColor }]}>
          {new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(used)}
          <Text style={limStyles.max}> / {new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(max)}</Text>
        </Text>
      </View>
      <View style={limStyles.track}>
        <MotiView
          animate={{ width: `${pct}%` }}
          transition={ANIMATION.spring.gentle}
          style={[limStyles.fill, { backgroundColor: barColor }]}
        />
      </View>
    </View>
  );
};

const limStyles = StyleSheet.create({
  container: { marginBottom: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },
  value: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold },
  max: { color: COLORS.textLight, fontWeight: FONT_WEIGHT.regular },
  track: { height: 6, backgroundColor: COLORS.backgroundDark, borderRadius: RADIUS.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: RADIUS.full },
});

// ─── Account Picker Modal ──────────────────────────────────────────────────
const TYPE_ACCENT = {
  ahorro:    '#C5A880',
  monetaria: '#A3845B',
  corriente: '#9BA3AF',
};

const AccountPickerModal = ({ visible, accounts, onSelect, onClose }) => {
  const fmt = (v) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(v);
  const typeLabel = { ahorro: 'Ahorro', monetaria: 'Monetaria', corriente: 'Corriente' };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={pickerStyles.backdrop} onPress={onClose} />
      <View style={pickerStyles.sheet}>
        <View style={pickerStyles.handle} />
        <Text style={pickerStyles.sheetTitle}>Seleccionar Cuenta Origen</Text>
        <Text style={pickerStyles.sheetSub}>Elige desde qué cuenta deseas transferir</Text>

        {accounts.length === 0 ? (
          <View style={pickerStyles.emptyBox}>
            <Text style={pickerStyles.emptyText}>No tienes cuentas disponibles</Text>
          </View>
        ) : (
          <FlatList
            data={accounts}
            keyExtractor={(item) => String(item.id)}
            style={pickerStyles.list}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => {
              const accent = TYPE_ACCENT[item.type] || COLORS.accent;
              const label = typeLabel[item.type] || item.type;
              const displayName = item.name && item.name !== item.type
                ? item.name
                : `${label} ${item.accountNumber.slice(-4)}`;
              return (
                <Pressable
                  onPress={() => { onSelect(item); onClose(); }}
                  style={({ pressed }) => [pickerStyles.accountRow, pressed && { opacity: 0.8 }]}
                >
                  <View style={[pickerStyles.accountIcon, { backgroundColor: accent + '22', borderColor: accent + '44' }]}>
                    <Wallet size={18} color={accent} strokeWidth={2} />
                  </View>
                  <View style={pickerStyles.accountMeta}>
                    <Text style={pickerStyles.accountName}>{displayName}</Text>
                    <Text style={pickerStyles.accountNum}>•••• {item.accountNumber.slice(-4)}</Text>
                  </View>
                  <View style={pickerStyles.accountRight}>
                    <Text style={[pickerStyles.accountBalance, { color: accent }]}>{fmt(item.balance)}</Text>
                    <View style={[pickerStyles.typeBadge, { borderColor: accent + '55', backgroundColor: accent + '18' }]}>
                      <Text style={[pickerStyles.typeBadgeText, { color: accent }]}>{label.toUpperCase()}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
};

const pickerStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.surface || '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    maxHeight: '70%',
    ...SHADOWS.xl,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  sheetSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  list: { maxHeight: 400 },
  emptyBox: { paddingVertical: SPACING.xl, alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background || '#FAFAFA',
    gap: SPACING.sm,
  },
  accountIcon: {
    width: 40, height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountMeta: { flex: 1 },
  accountName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold || '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  accountNum: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  accountRight: { alignItems: 'flex-end', gap: 4 },
  accountBalance: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold || 'bold',
    letterSpacing: 0.5,
  },
});

// ─── Selected Account Preview ─────────────────────────────────────────────
const SelectedAccountChip = ({ account, onPress }) => {
  const accent = TYPE_ACCENT[account.type] || COLORS.accent;
  const typeLabel = { ahorro: 'Ahorro', monetaria: 'Monetaria', corriente: 'Corriente' }[account.type] || account.type;
  const displayName = account.name && account.name !== account.type
    ? account.name
    : `${typeLabel} #${account.accountNumber.slice(-4)}`;
  const fmt = (v) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(v);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [chipStyles.chip, pressed && { opacity: 0.85 }]}
    >
      <View style={[chipStyles.iconWrap, { backgroundColor: accent + '22', borderColor: accent + '44' }]}>
        <Wallet size={16} color={accent} strokeWidth={2} />
      </View>
      <View style={chipStyles.chipInfo}>
        <Text style={chipStyles.chipName}>{displayName}</Text>
        <Text style={chipStyles.chipNum}>•••• {account.accountNumber.slice(-4)}  ·  {fmt(account.balance)}</Text>
      </View>
      <ChevronDown size={16} color={COLORS.textLight} />
    </Pressable>
  );
};

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.backgroundDark || '#F3F4F6',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: 8,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  chipInfo: { flex: 1 },
  chipName: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold || '600', color: COLORS.text },
  chipNum: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: 1 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────
export const TransferScreen = ({ route, navigation }) => {
  const { transfer, transactions, loading: txLoading } = useTransactions();
  const { accounts, loading: accLoading } = useAccounts();
  const { favorites } = useFavorites();
  const [recipientName, setRecipientName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [verified, setVerified] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const toAccountIdParam = route.params?.toAccountId || '';

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { toAccountId: '', amount: '' },
  });

  const amountWatch = watch('amount');
  const toAccountWatch = watch('toAccountId');

  // Auto-select first account if only one, or pre-fill from route params
  useEffect(() => {
    if (accounts.length === 1 && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts]);

  useEffect(() => {
    if (toAccountIdParam) {
      setValue('toAccountId', toAccountIdParam);
      handleSearchAccount(toAccountIdParam);
    }
  }, [toAccountIdParam]);

  const getTodayTransfersSum = useCallback(() => {
    const todayStr = new Date().toDateString();
    return transactions
      .filter((tx) => {
        const txDateStr = new Date(tx.date).toDateString();
        const isOutgoing = !tx.type.toLowerCase().includes('deposito') &&
          !tx.type.toLowerCase().includes('recibida');
        return txDateStr === todayStr && isOutgoing;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const handleSearchAccount = async (accountNum) => {
    if (!accountNum) {
      Alert.alert('Búsqueda', 'Ingresa un número de cuenta destino.');
      return;
    }
    setIsSearching(true);
    setVerified(false);
    setRecipientName('');
    
    try {
      const res = await accountClient.get(`/accounts/search?q=${accountNum}`);
      if (res.data && res.data.account) {
        const acc = res.data.account;
        const typeLabel = { ahorro: 'Ahorro', monetaria: 'Monetaria', corriente: 'Corriente' }[acc.type] || acc.type;
        const nameToDisplay = acc.name || `Cuenta ${typeLabel} de terceros`;
        setRecipientName(nameToDisplay);
        setVerified(true);
      }
    } catch (err) {
      Alert.alert('No encontrada', 'No se encontró la cuenta o pertenece a ti mismo.');
      setVerified(false);
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedAccount) {
      Alert.alert('Cuenta Origen', 'Selecciona la cuenta de origen para continuar.');
      return;
    }

    const amountNum = Number(data.amount);
    const todaySum = getTodayTransfersSum();

    if (amountNum > 2000) {
      Alert.alert('Límite Excedido', 'El monto máximo por transferencia es Q2,000.00.');
      return;
    }
    if (todaySum + amountNum > 10000) {
      Alert.alert(
        'Límite Diario Excedido',
        `Hoy has transferido Q${todaySum.toFixed(2)}. Solo puedes transferir hasta Q${(10000 - todaySum).toFixed(2)} más.`,
      );
      return;
    }
    if (selectedAccount.accountNumber === data.toAccountId) {
      Alert.alert('Error', 'No puedes transferir a la misma cuenta de origen.');
      return;
    }

    if (!verified) {
      Alert.alert('Verificación', 'Por favor verifica la cuenta destino usando el botón de lupa.');
      return;
    }

    const typeLabel = { ahorro: 'Ahorro', monetaria: 'Monetaria', corriente: 'Corriente' }[selectedAccount.type] || '';
    const displayName = selectedAccount.name || `${typeLabel} ${selectedAccount.accountNumber.slice(-4)}`;
    const fmt = (v) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(v);

    Alert.alert(
      'Confirmar Transferencia',
      `¿Transferir ${fmt(amountNum)} desde "${displayName}" a "${recipientName}" (${data.toAccountId})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await transfer({
                fromAccountId: selectedAccount.id,
                toAccountId: data.toAccountId,
                amount: amountNum,
              });
              Alert.alert('¡Éxito!', 'Transferencia realizada con éxito.', [
                { text: 'OK', onPress: () => navigation.navigate('History') },
              ]);
            } catch (err) {
              Alert.alert('Error', err.message || 'Error al procesar la transferencia.');
            }
          },
        },
      ],
    );
  };

  const todaySum = getTodayTransfersSum();
  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val);

  const loading = txLoading || accLoading;

  return (
    <>
      <AccountPickerModal
        visible={pickerOpen}
        accounts={accounts}
        onSelect={setSelectedAccount}
        onClose={() => setPickerOpen(false)}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={ANIMATION.spring.gentle}
          style={styles.header}
        >
          <View style={styles.headerIconWrap}>
            <ArrowLeftRight size={24} color={COLORS.textOnDark} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Nueva Transferencia</Text>
            <Text style={styles.headerSub}>Segura y en tiempo real</Text>
          </View>
        </MotiView>

        {/* ── From Account ── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...ANIMATION.spring.gentle, delay: 60 }}
          style={styles.formCard}
        >
          <Text style={styles.sectionLabel}>CUENTA ORIGEN</Text>

          {accLoading && !selectedAccount ? (
            <View style={{ paddingVertical: SPACING.md }}>
              <LoadingSpinner />
            </View>
          ) : selectedAccount ? (
            <SelectedAccountChip
              account={selectedAccount}
              onPress={() => setPickerOpen(true)}
            />
          ) : (
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [styles.selectorBtn, pressed && { opacity: 0.8 }]}
            >
              <View style={styles.selectorLeft}>
                <Wallet size={18} color={COLORS.textLight} strokeWidth={1.5} />
                <Text style={styles.selectorPlaceholder}>
                  {accounts.length === 0 ? 'No tienes cuentas disponibles' : 'Seleccionar cuenta de origen...'}
                </Text>
              </View>
              <ChevronDown size={18} color={COLORS.textLight} />
            </Pressable>
          )}
          {!selectedAccount && !accLoading && (
            <Text style={styles.fieldError}>Debes seleccionar una cuenta de origen</Text>
          )}

          {/* Arrow separator */}
          <View style={styles.arrowRow}>
            <View style={styles.arrowLine} />
            <View style={styles.arrowCircle}>
              <ArrowRight size={16} color={COLORS.textOnDark} />
            </View>
            <View style={styles.arrowLine} />
          </View>

          {/* Destination */}
          <Text style={styles.sectionLabel}>CUENTA DESTINO</Text>
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="toAccountId"
                rules={{ required: 'La cuenta destino es requerida' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Número de cuenta destino (ej. ACC123456)"
                    onBlur={onBlur}
                    onChangeText={(v) => { onChange(v); setVerified(false); setRecipientName(''); }}
                    value={value}
                    error={errors.toAccountId?.message}
                    containerStyle={{ marginBottom: 0 }}
                  />
                )}
              />
            </View>
            <Pressable
              style={({ pressed }) => [styles.searchBtn, pressed && { opacity: 0.8 }]}
              onPress={() => handleSearchAccount(toAccountWatch)}
            >
              <Search size={20} color={COLORS.textOnDark} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Favorites List */}
          {favorites && favorites.length > 0 && (
            <View style={styles.favoritesSection}>
              <Text style={styles.favoritesLabel}>Tus Favoritos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoritesScroll}>
                {favorites.map((fav) => (
                  <Pressable
                    key={fav.id || fav._id}
                    onPress={() => {
                      setValue('toAccountId', fav.accountNumber);
                      handleSearchAccount(fav.accountNumber);
                    }}
                    style={({ pressed }) => [styles.favoriteChip, pressed && { opacity: 0.8 }]}
                  >
                    <View style={styles.favoriteAvatar}>
                      <Text style={styles.favoriteAvatarText}>{fav.alias.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.favoriteAlias}>{fav.alias}</Text>
                      <Text style={styles.favoriteAccount}>•••• {fav.accountNumber.slice(-4)}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {isSearching && (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.verifyRow}>
              <Text style={styles.verifyText}>Verificando cuenta...</Text>
            </MotiView>
          )}
          {verified && recipientName && (
            <MotiView
              from={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={ANIMATION.spring.bouncy}
              style={styles.recipientCard}
            >
              <CheckCircle size={16} color={COLORS.success} />
              <View style={{ flex: 1, marginLeft: SPACING.xs }}>
                <Text style={styles.recipientLabel}>Cuenta verificada</Text>
                <Text style={styles.recipientName}>{recipientName}</Text>
              </View>
            </MotiView>
          )}
        </MotiView>

        {/* ── Amount ── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...ANIMATION.spring.gentle, delay: 120 }}
          style={styles.amountCard}
        >
          <Text style={styles.sectionLabel}>MONTO A TRANSFERIR</Text>
          <Controller
            control={control}
            name="amount"
            rules={{
              required: 'El monto es requerido',
              validate: (val) => (!isNaN(Number(val)) && Number(val) > 0) || 'El monto debe ser mayor a 0',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="0.00"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.amount?.message}
                style={styles.amountInput}
              />
            )}
          />
          {amountWatch && !isNaN(Number(amountWatch)) && Number(amountWatch) > 0 && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.amountPreview}
            >
              <Text style={styles.amountPreviewText}>{formatCurrency(Number(amountWatch))}</Text>
            </MotiView>
          )}
          {selectedAccount && (
            <View style={styles.balanceHint}>
              <Text style={styles.balanceHintText}>
                Saldo disponible: <Text style={styles.balanceHintValue}>{formatCurrency(selectedAccount.balance)}</Text>
              </Text>
            </View>
          )}
        </MotiView>

        {/* ── Limits ── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...ANIMATION.spring.gentle, delay: 180 }}
          style={styles.limitsCard}
        >
          <View style={styles.limitsHeader}>
            <Info size={14} color={COLORS.textSecondary} />
            <Text style={styles.limitsTitle}>Límites de Transferencia</Text>
          </View>
          <LimitBar used={todaySum} max={10000} label="Límite diario (Q10,000)" />
          <LimitBar
            used={amountWatch && !isNaN(Number(amountWatch)) ? Math.min(Number(amountWatch), 2000) : 0}
            max={2000}
            label="Límite por transacción (Q2,000)"
          />
        </MotiView>

        {/* ── Actions ── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...ANIMATION.timing?.fast || ANIMATION.spring.gentle, delay: 240 }}
          style={styles.actions}
        >
          <Button title="Cancelar" onPress={() => navigation.goBack()} variant="outline" style={styles.btn} />
          <Button title="Transferir" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.btn} />
        </MotiView>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.sm, marginBottom: SPACING.lg,
  },
  headerIconWrap: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.sm,
  },
  headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  headerSub: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, marginTop: 1 },

  formCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOWS.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textLight, letterSpacing: LETTER_SPACING.wider,
    marginBottom: SPACING.xs,
  },

  // Selector button (when no account selected)
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundDark || '#F3F4F6',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    marginBottom: SPACING.xs,
  },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  selectorPlaceholder: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  fieldError: { fontSize: FONT_SIZE.xs, color: COLORS.error || '#EF4444', marginBottom: SPACING.xs },

  arrowRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md },
  arrowLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  arrowCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: SPACING.sm,
  },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  searchBtn: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.sm,
  },

  verifyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.xs },
  verifyText: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  recipientCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.md, padding: SPACING.sm,
    marginTop: SPACING.sm, borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  recipientLabel: { fontSize: FONT_SIZE.xs, color: COLORS.success },
  recipientName: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text },

  favoritesSection: { marginTop: SPACING.md },
  favoritesLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginBottom: SPACING.xs },
  favoritesScroll: { gap: SPACING.sm },
  favoriteChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: RADIUS.md, padding: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  favoriteAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  favoriteAvatarText: { color: COLORS.textOnDark, fontWeight: 'bold', fontSize: FONT_SIZE.sm },
  favoriteAlias: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  favoriteAccount: { fontSize: 10, color: COLORS.textLight },

  amountCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOWS.md,
  },
  amountInput: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  amountPreview: {
    alignItems: 'center', paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: RADIUS.md, marginTop: -SPACING.xs,
  },
  amountPreviewText: {
    fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.heavy || 'bold',
    color: COLORS.primary,
  },
  balanceHint: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.backgroundDark || '#F3F4F6',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  balanceHintText: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  balanceHintValue: { fontWeight: FONT_WEIGHT.bold, color: COLORS.text },

  limitsCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  limitsHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md },
  limitsTitle: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textSecondary },

  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  btn: { flex: 1 },
});

export default TransferScreen;
