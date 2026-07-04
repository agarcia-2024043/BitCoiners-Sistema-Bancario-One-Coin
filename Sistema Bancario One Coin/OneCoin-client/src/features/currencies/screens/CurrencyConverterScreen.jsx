// src/features/currencies/screens/CurrencyConverterScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Modal, FlatList } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { ChevronDown } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS, FONT_WEIGHT } from '../../../shared/constants/theme.js';
import useCurrencies from '../hooks/useCurrencies.js';
import Input from '../../../shared/components/common/Input.jsx';
import { Card } from '../../../shared/components/common/Common.jsx';

const CurrencyPickerModal = ({ visible, rates, onSelect, onClose, title }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={pickerStyles.backdrop} onPress={onClose} />
      <View style={pickerStyles.sheet}>
        <View style={pickerStyles.handle} />
        <Text style={pickerStyles.sheetTitle}>{title}</Text>
        <FlatList
          data={rates}
          keyExtractor={(item) => item.code}
          style={pickerStyles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { onSelect(item.code); onClose(); }}
              style={({ pressed }) => [pickerStyles.row, pressed && { opacity: 0.7 }]}
            >
              <Text style={pickerStyles.code}>{item.code}</Text>
              <Text style={pickerStyles.name}>{item.name}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
};

const pickerStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.xl,
    maxHeight: '60%', ...SHADOWS.xl,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.md },
  sheetTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text, marginBottom: SPACING.md },
  list: { maxHeight: 300 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  code: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary, width: 60 },
  name: { fontSize: FONT_SIZE.sm, color: COLORS.text },
});

export const CurrencyConverterScreen = () => {
  const { rates, loading, fetchRates } = useCurrencies();
  const [realtimeResult, setRealtimeResult] = useState(null);
  
  const [pickerConfig, setPickerConfig] = useState({ visible: false, targetField: null, title: '' });

  const { control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { from: 'USD', to: 'GTQ', amount: '' }
  });

  const fromVal = watch('from');
  const toVal = watch('to');
  const amountVal = watch('amount');

  const fromName = rates.find(r => r.code === fromVal)?.name || '';
  const toName = rates.find(r => r.code === toVal)?.name || '';

  useEffect(() => {
    const amt = Number(amountVal);
    if (!amt || isNaN(amt) || amt <= 0) {
      setRealtimeResult(null);
      return;
    }

    const fromObj = rates.find(r => r.code === fromVal.toUpperCase().trim());
    const toObj = rates.find(r => r.code === toVal.toUpperCase().trim());

    if (fromObj && toObj) {
      const convertedValue = (amt / fromObj.rate) * toObj.rate;
      setRealtimeResult(convertedValue);
    } else {
      setRealtimeResult(null);
    }
  }, [fromVal, toVal, amountVal, rates]);

  const openPicker = (field, title) => {
    setPickerConfig({ visible: true, targetField: field, title });
  };

  const closePicker = () => setPickerConfig(prev => ({ ...prev, visible: false }));

  const handleSelectCurrency = (code) => {
    setValue(pickerConfig.targetField, code);
  };

  return (
    <>
      <CurrencyPickerModal
        visible={pickerConfig.visible}
        rates={rates}
        title={pickerConfig.title}
        onSelect={handleSelectCurrency}
        onClose={closePicker}
      />
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRates} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
        <Text style={styles.title}>Conversor de Divisas</Text>
        <Text style={styles.subtitle}>Calcula conversiones al instante y consulta cotizaciones en vivo.</Text>

        <Card style={styles.converterCard}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.pickerLabel}>De</Text>
              <Pressable style={styles.pickerBtn} onPress={() => openPicker('from', 'Selecciona divisa origen')}>
                <Text style={styles.pickerText} numberOfLines={1}>
                  {fromVal ? `${fromVal} - ${fromName}` : 'Seleccionar'}
                </Text>
                <ChevronDown size={18} color={COLORS.textLight} />
              </Pressable>
            </View>
            <View style={styles.col}>
              <Text style={styles.pickerLabel}>A</Text>
              <Pressable style={styles.pickerBtn} onPress={() => openPicker('to', 'Selecciona divisa destino')}>
                <Text style={styles.pickerText} numberOfLines={1}>
                  {toVal ? `${toVal} - ${toName}` : 'Seleccionar'}
                </Text>
                <ChevronDown size={18} color={COLORS.textLight} />
              </Pressable>
            </View>
          </View>

          <Controller
            control={control}
            name="amount"
            rules={{ 
              required: 'El monto es requerido',
              validate: val => !isNaN(Number(val)) && Number(val) > 0 || 'Monto debe ser mayor a 0'
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Monto a Convertir"
                placeholder="0.00"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.amount?.message}
              />
            )}
          />

          {realtimeResult !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Resultado Estimado:</Text>
              <Text style={styles.resultValue}>
                {Number(amountVal).toFixed(2)} {fromVal.toUpperCase().trim()} = {realtimeResult.toFixed(2)} {toVal.toUpperCase().trim()}
              </Text>
            </View>
          )}
        </Card>

        <Text style={styles.tableTitle}>Tasas de Cambio de Divisas</Text>
        <Card style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCol}>Código</Text>
            <Text style={styles.headerCol}>Divisa</Text>
            <Text style={[styles.headerCol, styles.alignRight]}>Valor (Ref USD)</Text>
          </View>
          {rates.map((item) => (
            <View key={item.code} style={styles.tableRow}>
              <Text style={styles.rowCode}>{item.code}</Text>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={[styles.rowRate, styles.alignRight]}>{item.rate.toFixed(4)}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  converterCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
  },
  resultBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
  },
  tableTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  tableCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  headerCol: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowCode: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  rowName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  rowRate: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  alignRight: {
    textAlign: 'right',
  },
  pickerLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginBottom: 6,
    fontWeight: '600',
  },
  pickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    marginBottom: SPACING.md,
  },
  pickerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: 'bold',
  }
});

export default CurrencyConverterScreen;
