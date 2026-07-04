// src/features/accounts/screens/AccountDetailScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Alert,
  ScrollView, Pressable, Platform,
} from 'react-native';
import { MotiView } from 'moti';
import {
  ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine,
  TrendingUp, TrendingDown, Clock, Wallet,
} from 'lucide-react-native';
import {
  COLORS, SPACING, FONT_SIZE, SHADOWS,
  RADIUS, ANIMATION, FONT_WEIGHT, LETTER_SPACING,
} from '../../../shared/constants/theme.js';
import useAccounts from '../hooks/useAccounts.js';
import useTransactions from '../../transactions/hooks/useTransactions.js';
import Button from '../../../shared/components/common/Button.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import { Card, LoadingSpinner, StaggerItem, SectionHeader } from '../../../shared/components/common/Common.jsx';

// ─── Action Button Component ──────────────────────────────────────────────
const ActionBtn = ({ icon: Icon, label, onPress, variant = 'default', index = 0 }) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  return (
    <StaggerItem index={index} style={styles.actionItemWrapper}>
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <MotiView
            animate={{ scale: pressed ? 0.94 : 1 }}
            transition={ANIMATION.spring.snappy}
            style={styles.actionItem}
          >
            <View style={[
              styles.actionIconWrap,
              isPrimary && styles.actionIconPrimary,
              isDanger && styles.actionIconDanger,
            ]}>
              <Icon
                size={22}
                color={isPrimary || isDanger ? COLORS.textOnDark : COLORS.primary}
                strokeWidth={2}
              />
            </View>
            <Text style={[
              styles.actionLabel,
              isPrimary && styles.actionLabelPrimary,
            ]}>
              {label}
            </Text>
          </MotiView>
        )}
      </Pressable>
    </StaggerItem>
  );
};

// ─── Transaction Row ──────────────────────────────────────────────────────
const TransactionRow = ({ tx, index }) => {
  const isCredit =
    tx.type.toLowerCase().includes('deposito') ||
    tx.type.toLowerCase().includes('recibida') ||
    tx.type.toLowerCase().includes('ingreso') ||
    tx.type.toLowerCase().includes('credit');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val);

  return (
    <StaggerItem index={index}>
      <View style={styles.txRow}>
        {/* Color indicator line */}
        <View style={[styles.txIndicator, { backgroundColor: isCredit ? COLORS.success : COLORS.error }]} />

        {/* Icon */}
        <View style={[
          styles.txIconWrap,
          { backgroundColor: isCredit ? COLORS.successLight : COLORS.errorLight }
        ]}>
          {isCredit
            ? <TrendingUp size={16} color={COLORS.success} strokeWidth={2} />
            : <TrendingDown size={16} color={COLORS.error} strokeWidth={2} />
          }
        </View>

        {/* Info */}
        <View style={styles.txInfo}>
          <Text style={styles.txType} numberOfLines={1}>
            {tx.type.toUpperCase()}
          </Text>
          <View style={styles.txDateRow}>
            <Clock size={10} color={COLORS.textLight} />
            <Text style={styles.txDate}>
              {new Date(tx.date).toLocaleDateString('es-GT', {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <Text style={[styles.txAmount, { color: isCredit ? COLORS.success : COLORS.error }]}>
          {isCredit ? '+' : '-'} {formatCurrency(tx.amount)}
        </Text>
      </View>
    </StaggerItem>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────
export const AccountDetailScreen = ({ route, navigation }) => {
  const { account } = route.params;
  const { deposit, withdraw, loading } = useAccounts();
  const { transactions, loading: txLoading, fetchTransactions } = useTransactions(account.accountNumber);

  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [amount, setAmount] = useState('');
  const [errorText, setErrorText] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val);

  const handleOpenAction = (type) => {
    setActionType(type);
    setAmount('');
    setErrorText('');
    setModalVisible(true);
  };

  const handleActionSubmit = async () => {
    const numAmt = Number(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setErrorText('Ingresa un monto válido mayor a 0');
      return;
    }
    try {
      if (actionType === 'depositar') {
        await deposit(account.id, numAmt);
        Alert.alert('Éxito', 'Depósito realizado exitosamente.');
      } else {
        if (numAmt > account.balance) {
          setErrorText('Fondos insuficientes para este retiro');
          return;
        }
        await withdraw(account.id, numAmt);
        Alert.alert('Éxito', 'Retiro realizado exitosamente.');
      }
      setModalVisible(false);
      fetchTransactions();
      navigation.navigate('AccountsList');
    } catch (err) {
      setErrorText(err.message || 'Error al procesar la solicitud');
    }
  };

  const handleTransfer = () => {
    navigation.navigate('Transactions', {
      screen: 'TransferScreen',
      params: { fromAccountId: account.accountNumber },
    });
  };

  const type = account.type?.toLowerCase() || 'ahorro';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero Card ── */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={ANIMATION.spring.gentle}
        style={styles.heroCard}
      >
        <View style={styles.heroDecorCircle1} />
        <View style={styles.heroDecorCircle2} />

        <View style={styles.heroRow}>
          <View style={styles.heroIconWrap}>
            <Wallet size={20} color={COLORS.textOnDark} strokeWidth={2} />
          </View>
          <View style={styles.heroTypeBadge}>
            <Text style={styles.heroTypeBadgeText}>{type.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.heroAccountLabel}>Número de Cuenta</Text>
        <Text style={styles.heroAccountNum}>{account.accountNumber}</Text>

        <View style={styles.heroBalanceDivider} />
        <Text style={styles.heroBalanceLabel}>SALDO DISPONIBLE</Text>
        <Text style={styles.heroBalance}>{formatCurrency(account.balance)}</Text>
      </MotiView>

      {/* ── Action Grid ── */}
      <View style={styles.actionsGrid}>
        <ActionBtn
          icon={ArrowLeftRight}
          label="Transferir"
          onPress={handleTransfer}
          variant="primary"
          index={0}
        />
        <ActionBtn
          icon={ArrowDownToLine}
          label="Depositar"
          onPress={() => handleOpenAction('depositar')}
          index={1}
        />
        <ActionBtn
          icon={ArrowUpFromLine}
          label="Retirar"
          onPress={() => handleOpenAction('retirar')}
          variant="danger"
          index={2}
        />
      </View>

      {/* ── Activity Section ── */}
      <View style={styles.activitySection}>
        <SectionHeader
          title="Actividad Reciente"
          subtitle={`${transactions.length} movimientos`}
        />

        {txLoading ? (
          <LoadingSpinner />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyTx}>
            <Clock size={28} color={COLORS.textLight} strokeWidth={1.5} />
            <Text style={styles.emptyTxText}>Sin movimientos registrados</Text>
          </View>
        ) : (
          <Card style={styles.txCard} animate={false}>
            {transactions.map((tx, idx) => (
              <View key={tx.id}>
                <TransactionRow tx={tx} index={idx} />
                {idx < transactions.length - 1 && <View style={styles.txDivider} />}
              </View>
            ))}
          </Card>
        )}
      </View>

      {/* ── Action Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={ANIMATION.timing.fast}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setModalVisible(false)} />
          <MotiView
            from={{ opacity: 0, translateY: 60, scale: 0.94 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={ANIMATION.spring.bouncy}
            style={styles.modalSheet}
          >
            {/* Pill handle */}
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>
              {actionType === 'depositar' ? '💰 Realizar Depósito' : '📤 Realizar Retiro'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Cuenta {account.accountNumber}
            </Text>

            <Input
              label="Monto en GTQ"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={(txt) => { setAmount(txt); setErrorText(''); }}
              error={errorText}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalBtn}
              />
              <Button
                title="Confirmar"
                onPress={handleActionSubmit}
                loading={loading}
                style={styles.modalBtn}
              />
            </View>
          </MotiView>
        </MotiView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    paddingBottom: 100,
  },

  // ── Hero
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  heroDecorCircle1: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60, right: -40,
  },
  heroDecorCircle2: {
    position: 'absolute', width: 120, height: 120,
    borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30, left: -10,
  },
  heroRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.lg,
  },
  heroIconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroTypeBadgeText: {
    fontSize: 10, color: 'rgba(255,255,255,0.9)',
    fontWeight: FONT_WEIGHT.bold, letterSpacing: LETTER_SPACING.wider,
  },
  heroAccountLabel: {
    fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase', letterSpacing: LETTER_SPACING.wider,
  },
  heroAccountNum: {
    fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textOnDark, letterSpacing: LETTER_SPACING.wide,
    marginBottom: SPACING.md,
  },
  heroBalanceDivider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: SPACING.sm,
  },
  heroBalanceLabel: {
    fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase', letterSpacing: LETTER_SPACING.widest,
  },
  heroBalance: {
    fontSize: FONT_SIZE.xxxl, fontWeight: FONT_WEIGHT.heavy,
    color: COLORS.textOnDark, marginTop: 4,
  },

  // ── Action Grid
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  actionItemWrapper: { flex: 1, alignItems: 'center' },
  actionItem: { alignItems: 'center', gap: SPACING.xs },
  actionIconWrap: {
    width: 56, height: 56, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.sm,
  },
  actionIconPrimary: { backgroundColor: COLORS.primary },
  actionIconDanger: { backgroundColor: COLORS.error },
  actionLabel: {
    fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  actionLabelPrimary: { color: COLORS.primary },

  // ── Activity
  activitySection: { marginBottom: SPACING.md },
  emptyTx: {
    alignItems: 'center', padding: SPACING.xl, gap: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  emptyTxText: {
    fontSize: FONT_SIZE.sm, color: COLORS.textLight,
    fontWeight: FONT_WEIGHT.medium,
  },
  txCard: { padding: 0, overflow: 'hidden' },
  txRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  txIndicator: { width: 3, height: 36, borderRadius: 2 },
  txIconWrap: {
    width: 32, height: 32, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txType: {
    fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  txDateRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  txDate: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  txAmount: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  txDivider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: SPACING.md },

  // ── Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    ...SHADOWS.xl,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center', marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text, marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: FONT_SIZE.sm, color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm,
  },
  modalBtn: { flex: 1 },
});

export default AccountDetailScreen;
