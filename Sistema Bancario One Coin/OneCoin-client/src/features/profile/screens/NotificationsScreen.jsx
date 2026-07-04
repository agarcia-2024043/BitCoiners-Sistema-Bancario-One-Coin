// src/features/profile/screens/NotificationsScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Bell, ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react-native';
import { MotiView } from 'moti';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ANIMATION, FONT_WEIGHT } from '../../../shared/constants/theme.js';
import useTransactions from '../../transactions/hooks/useTransactions.js';
import { LoadingSpinner, EmptyState, StaggerItem } from '../../../shared/components/common/Common.jsx';

export const NotificationsScreen = () => {
  const { transactions, loading, fetchTransactions } = useTransactions();

  const getNotificationDetails = (tx) => {
    const isCredit = ['deposito', 'recibida', 'ingreso', 'credit', 'deposit', 'salary'].some((k) =>
      tx.type?.toLowerCase().includes(k)
    );
    const amountStr = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(tx.amount);
    
    let text = '';
    let icon = isCredit ? TrendingUp : TrendingDown;
    let color = isCredit ? COLORS.success : COLORS.error;

    if (isCredit) {
      if (tx.type.toLowerCase().includes('deposito')) {
        text = `Has recibido un depósito de ${amountStr} a tu cuenta ${tx.toAccount.slice(-4)}.`;
      } else {
        text = `Te han transferido ${amountStr} desde la cuenta ${tx.fromAccount || 'Externa'}.`;
      }
    } else {
      if (tx.type.toLowerCase().includes('retiro')) {
        text = `Has retirado ${amountStr} de tu cuenta ${tx.fromAccount.slice(-4)}.`;
      } else {
        text = `Has transferido ${amountStr} hacia la cuenta ${tx.toAccount || 'Externa'}.`;
      }
    }

    return { text, icon, color };
  };

  const renderItem = ({ item, index }) => {
    const { text, icon: Icon, color } = getNotificationDetails(item);
    
    return (
      <StaggerItem index={index}>
        <View style={styles.notificationCard}>
          <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
            <Icon size={20} color={color} />
          </View>
          <View style={styles.contentWrap}>
            <Text style={styles.messageText}>{text}</Text>
            <Text style={styles.dateText}>
              {new Date(item.date).toLocaleDateString('es-GT', {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </StaggerItem>
    );
  };

  return (
    <View style={styles.container}>
      {loading && transactions.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchTransactions}
              colors={[COLORS.accent]}
              tintColor={COLORS.accent}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No hay notificaciones"
              message="Aún no tienes movimientos recientes para mostrarte aquí."
              icon={<Bell size={30} color={COLORS.textLight} strokeWidth={1.5} />}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 40,
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contentWrap: {
    flex: 1,
  },
  messageText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
    lineHeight: 20,
    marginBottom: 4,
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  }
});

export default NotificationsScreen;
