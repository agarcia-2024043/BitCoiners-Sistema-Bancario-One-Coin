// src/features/accounts/screens/AccountsScreen.jsx
import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, Pressable, Platform,
} from 'react-native';
import { MotiView } from 'moti';
import { Wallet, Plus, ChevronRight } from 'lucide-react-native';
import {
  COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS,
  ANIMATION, FONT_WEIGHT, LETTER_SPACING,
} from '../../../shared/constants/theme.js';
import useAccounts from '../hooks/useAccounts.js';
import { LoadingSpinner, EmptyState, StaggerItem } from '../../../shared/components/common/Common.jsx';

// ─── Tipo de cuenta config ─────────────────────────────────────────────────
const ACCOUNT_META = {
  ahorro:    { label: 'Ahorro',    bg: '#0A0A0A',   accent: '#C5A880' },
  monetaria: { label: 'Monetaria', bg: '#141414',   accent: '#A3845B' },
  corriente: { label: 'Corriente', bg: '#1C1C1C',   accent: '#EFE6D9' },
};

// ─── Bank Card ─────────────────────────────────────────────────────────────
const BankCard = ({ item, onPress, index }) => {
  const type = item.type?.toLowerCase() || 'ahorro';
  const meta = ACCOUNT_META[type] || ACCOUNT_META.ahorro;
  const fmt  = (v) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(v);

  return (
    <StaggerItem index={index}>
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <MotiView
            animate={{ scale: pressed ? 0.975 : 1 }}
            transition={ANIMATION.spring.snappy}
            style={[styles.bankCard, { backgroundColor: meta.bg }]}
          >
            {/* Deco */}
            <View style={[styles.deco1, { backgroundColor: meta.accent, opacity: 0.08 }]} />
            <View style={[styles.deco2, { backgroundColor: meta.accent, opacity: 0.05 }]} />

            {/* Header */}
            <View style={styles.cardRow}>
              <View style={[styles.cardIconWrap, { borderColor: meta.accent + '33' }]}>
                <Wallet size={16} color={meta.accent} strokeWidth={2} />
              </View>
              <View style={[styles.cardBadge, { borderColor: meta.accent + '40', backgroundColor: meta.accent + '18' }]}>
                <Text style={[styles.cardBadgeText, { color: meta.accent }]}>{meta.label.toUpperCase()}</Text>
              </View>
            </View>

            {/* Account name & number */}
            <Text style={styles.cardName}>{item.name || `${meta.label} #${String(item.accountNumber).slice(-4)}`}</Text>
            <Text style={styles.cardNum}>No. {item.accountNumber}</Text>

            {/* Balance */}
            <View style={[styles.cardBalanceRow, { borderTopColor: meta.accent + '25' }]}>
              <View>
                <Text style={styles.cardBalanceLabel}>Saldo disponible</Text>
                <Text style={[styles.cardBalanceValue, { color: meta.accent }]}>{fmt(item.balance)}</Text>
              </View>
              <ChevronRight size={18} color={meta.accent} opacity={0.6} />
            </View>
          </MotiView>
        )}
      </Pressable>
    </StaggerItem>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────
export const AccountsScreen = ({ navigation }) => {
  const { accounts, totalBalance, loading, fetchAccounts } = useAccounts();
  const fmt = (v) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(v);

  return (
    <View style={styles.container}>

      {/* Hero Banner */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={ANIMATION.spring.gentle}
        style={styles.hero}
      >
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        <View style={styles.heroBadge}>
          <View style={styles.heroDot} />
          <Text style={styles.heroBadgeText}>Saldo actualizado</Text>
        </View>

        <Text style={styles.heroLabel}>Saldo Consolidado Total</Text>
        <Text style={styles.heroValue}>{fmt(totalBalance)}</Text>
        <Text style={styles.heroSub}>
          {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} activa{accounts.length !== 1 ? 's' : ''}
        </Text>
      </MotiView>

      {/* List */}
      {loading && accounts.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <BankCard
              item={item} index={index}
              onPress={() => navigation.navigate('AccountDetail', { account: item })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading} onRefresh={fetchAccounts}
              colors={[COLORS.accent]} tintColor={COLORS.accent}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>Mis Cuentas</Text>
              <Text style={styles.listHeaderSub}>Gestiona tus cuentas bancarias</Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="Sin cuentas abiertas"
              message="Abre tu primera cuenta de ahorro, monetaria o corriente."
              icon={<Wallet size={30} color={COLORS.textLight} strokeWidth={1.5} />}
            />
          }
        />
      )}

      {/* FAB */}
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...ANIMATION.spring.bouncy, delay: 400 }}
        style={styles.fabWrap}
      >
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
          onPress={() => navigation.navigate('CreateAccount')}
        >
          <Plus size={26} color={COLORS.primary} strokeWidth={2.5} />
        </Pressable>
      </MotiView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Hero
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: SPACING.xl + 4,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  heroCircle1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(197,168,128,0.05)', top: -60, right: -50,
  },
  heroCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(197,168,128,0.04)', bottom: -30, left: -20,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: RADIUS.full, alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  heroDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success,
  },
  heroBadgeText: { fontSize: 10, color: COLORS.success, fontWeight: FONT_WEIGHT.bold },
  heroLabel: {
    fontSize: FONT_SIZE.xs, color: COLORS.textOnDarkMuted,
    textTransform: 'uppercase', letterSpacing: LETTER_SPACING.widest,
    marginBottom: SPACING.xs,
  },
  heroValue: {
    fontSize: FONT_SIZE.display, fontWeight: FONT_WEIGHT.black,
    color: COLORS.accent, letterSpacing: LETTER_SPACING.tight,
  },
  heroSub: { fontSize: FONT_SIZE.sm, color: COLORS.textOnDarkMuted, marginTop: SPACING.xs },

  // List
  list: { padding: SPACING.md, paddingBottom: 130, flexGrow: 1 },
  listHeader: { marginBottom: SPACING.sm, marginTop: SPACING.xs },
  listHeaderTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.black, color: COLORS.text },
  listHeaderSub:   { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: 2 },

  // Bank Card
  bankCard: {
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.md, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    ...SHADOWS.md,
  },
  deco1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    top: -50, right: -40,
  },
  deco2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    bottom: -30, left: -10,
  },
  cardRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.xl,
  },
  cardIconWrap: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBadge: {
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  cardBadgeText: { fontSize: 9, fontWeight: FONT_WEIGHT.black, letterSpacing: 1.5 },
  cardName: {
    fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
    marginBottom: 2,
  },
  cardNum: {
    fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: LETTER_SPACING.wider, marginBottom: SPACING.lg,
  },
  cardBalanceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderTopWidth: 1, paddingTop: SPACING.sm,
  },
  cardBalanceLabel: {
    fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase', letterSpacing: LETTER_SPACING.wider,
  },
  cardBalanceValue: {
    fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.black, marginTop: 2,
  },

  // FAB
  fabWrap: { position: 'absolute', bottom: SPACING.xl + 70, right: SPACING.lg },
  fab: {
    backgroundColor: COLORS.accent,
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.glow,
  },
});

export default AccountsScreen;
