// src/features/favorites/screens/FavoritesScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Modal, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme.js';
import useFavorites from '../hooks/useFavorites.js';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import Input from '../../../shared/components/common/Input.jsx';

export const FavoritesScreen = ({ navigation }) => {
  const { favorites, loading, fetchFavorites, addFavorite, deleteFavorite } = useFavorites();
  const [modalVisible, setModalVisible] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      accountNumber: '',
      alias: ''
    }
  });

  const onAddSubmit = async (data) => {
    try {
      await addFavorite(data);
      Alert.alert('Éxito', 'Favorito agregado correctamente.');
      setModalVisible(false);
      reset();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo guardar el favorito.');
    }
  };

  const handleDeletePress = (item) => {
    Alert.alert(
      'Eliminar Favorito',
      `¿Estás seguro de eliminar a ${item.alias}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteFavorite(item.id || item._id);
              Alert.alert('Éxito', 'Favorito eliminado.');
            } catch (err) {
              Alert.alert('Error', err.message || 'No se pudo eliminar.');
            }
          }
        }
      ]
    );
  };

  const handleQuickTransfer = (item) => {
    navigation.navigate('Transactions', {
      screen: 'TransferScreen',
      params: { toAccountId: item.accountNumber }
    });
  };

  const renderItem = ({ item }) => {
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.infoCol}>
            <Text style={styles.aliasText}>{item.alias}</Text>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.numberText}>No. {item.accountNumber}</Text>
          </View>
          <View style={styles.actionIcons}>
            <TouchableOpacity 
              onPress={() => handleQuickTransfer(item)} 
              style={styles.iconBtn}
            >
              <MaterialIcons name="send" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeletePress(item)} 
              style={styles.iconBtn}
            >
              <MaterialIcons name="delete-outline" size={22} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cuentas Favoritas</Text>
        <Button
          title="Agregar"
          onPress={() => {
            reset();
            setModalVisible(true);
          }}
          style={styles.addBtn}
        />
      </View>

      {loading && favorites.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchFavorites}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No hay favoritos"
              message="Registra tus cuentas más frecuentes para realizar transferencias rápidas."
              icon={<MaterialIcons name="favorite-border" size={30} color={COLORS.textLight} />}
            />
          }
        />
      )}

      {/* Add Favorite Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.text, opacity: 0.5 }]} />
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Favorito</Text>
            
            <Controller
              control={control}
              name="name"
              rules={{ required: 'El nombre del beneficiario es requerido' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nombre del Beneficiario"
                  placeholder="Juan Pérez"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="accountNumber"
              rules={{ required: 'El número de cuenta es requerido' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Número de Cuenta (ej. ACC123456)"
                  placeholder="ACC123456"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.accountNumber?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="alias"
              rules={{ required: 'El alias es requerido' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Alias"
                  placeholder="Mi hermano, Mamá, etc."
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.alias?.message}
                />
              )}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                variant="secondary"
                style={styles.modalBtn}
              />
              <Button
                title="Guardar"
                onPress={handleSubmit(onAddSubmit)}
                loading={loading}
                style={styles.modalBtn}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  listContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  card: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  aliasText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  nameText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    marginTop: 2,
  },
  numberText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
    borderRadius: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  modalBtn: {
    width: '48%',
  },
});

export default FavoritesScreen;
