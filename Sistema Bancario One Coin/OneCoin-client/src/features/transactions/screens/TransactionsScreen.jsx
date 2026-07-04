// src/features/transactions/screens/TransactionsScreen.jsx
import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, Pressable, Platform,
} from 'react-native';
import { MotiView } from 'moti';
import { ArrowLeftRight, TrendingUp, TrendingDown, Clock } from 'lucide-react-native';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT,
  RADIUS, SHADOWS, ANIMATION, LETTER_SPACING,
} from '../../../shared/constants/theme.js';
import useTransactions from '../hooks/useTransactions.js';
import { LoadingSpinner, EmptyState, StaggerItem } from '../../../shared/components/common/Common.jsx';
import Button from '../../../shared/components/common/Button.jsx';

const fmt = (v) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(v);

const isCredit = (type) =>
  ['deposito', 'recibida', 'ingreso', 'credit', 'deposit', 'salary'].some((k) =>
    type?.toLowerCase().includes(k)
  );

// ─── Transaction Row ───────────────────────────────────────────────────────
const TxRow = ({ item, index }) => {
  const credit = isCredit(item.type);
  return (
    <StaggerItem index={index}>
      <View style={styles.txCard}>
        {/* Left accent line */}
        <View style={[styles.txLine, { backgroundColor: credit ? COLORS.success : COLORS.error }]} />

        {/* Icon */}
        <View style={[styles.txIcon, { backgroundColor: credit ? COLORS.successLight : COLORS.errorLight }]}>
          {credit
            ? <TrendingUp size={16} color={COLORS.success} strokeWidth={2} />
            : <TrendingDown size={16} color={COLORS.error}   strokeWidth={2} />
          }
        </View>

        {/* Info */}
        <View style={styles.txInfo}>
          <Text style={styles.txType} numberOfLines={1}>{item.type?.toUpperCase()}</Text>
          <View style={styles.txDateRow}>
            <Clock size={10} color={COLORS.textLight} />
            <Text style={styles.txDate}>
              {new Date(item.date).toLocaleDateString('es-GT', {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Amount + status */}
        <View style={styles.txRight}>
          <Text style={[styles.txAmount, { color: credit ? COLORS.success : COLORS.error }]}>
            {credit ? '+' : '-'}{fmt(item.amount)}
          </Text>
          <View style={[styles.txStatus, {
            backgroundColor: credit ? COLORS.successLight : COLORS.backgroundDark,
            borderColor: credit ? 'rgba(16,185,129,0.25)' : COLORS.border,
          }]}>
            <Text style={[styles.txStatusText, { color: credit ? COLORS.success : COLORS.textSecondary }]}>
              {item.status?.toUpperCase() ?? 'OK'}
            </Text>
          </View>
        </View>
      </View>
    </StaggerItem>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────
export const TransactionsScreen = ({ navigation }) => {
  const { transactions, loading, fetchTransactions } = useTransactions();

  return (
    <View style={styles.container}>

      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={ANIMATION.spring.gentle}
        style={styles.header}
      >
        <View>
          <Text style={styles.headerTitle}>Historial</Text>
          <Text style={styles.headerSub}>Todos tus movimientos</Text>
        </View>
      </MotiView>

      {/* List */}
      {loading && transactions.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <TxRow item={item} index={index} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading} onRefresh={fetchTransactions}
              colors={[COLORS.accent]} tintColor={COLORS.accent}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Sin transacciones aún"
              message="Aquí aparecerán tus depósitos, retiros y transferencias."
              icon={<ArrowLeftRight size={30} color={COLORS.textLight} strokeWidth={1.5} />}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...SHADOWS.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.black,
    color: COLORS.textOnDark, letterSpacing: -0.5,
  },
  headerSub: { fontSize: FONT_SIZE.xs, color: COLORS.textOnDarkMuted, marginTop: 2 },

  list: { padding: SPACING.md, paddingBottom: 120, flexGrow: 1 },

  // TxCard
  txCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.xs,
  },
  txLine: { width: 3, alignSelf: 'stretch' },
  txIcon: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: SPACING.sm, flexShrink: 0,
  },
  txInfo: { flex: 1, paddingVertical: SPACING.sm },
  txType: {
    fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.text,
  },
  txDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  txDate:    { fontSize: FONT_SIZE.xs, color: COLORS.textLight },

  txRight: { alignItems: 'flex-end', paddingRight: SPACING.sm, paddingVertical: SPACING.sm },
  txAmount: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.black },
  txStatus: {
    marginTop: 4, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  txStatusText: { fontSize: 9, fontWeight: FONT_WEIGHT.bold, letterSpacing: 0.5 },
});

export default TransactionsScreen;
