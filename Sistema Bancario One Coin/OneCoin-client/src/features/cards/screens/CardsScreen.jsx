// src/features/cards/screens/CardsScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { MotiView } from 'moti';
import { CreditCard, CheckCircle, ShieldCheck, Zap } from 'lucide-react-native';
import {
  COLORS, SPACING, FONT_SIZE, SHADOWS,
  RADIUS, ANIMATION, FONT_WEIGHT,
} from '../../../shared/constants/theme.js';
import Button from '../../../shared/components/common/Button.jsx';
import { Card, StaggerItem } from '../../../shared/components/common/Common.jsx';

const CardOption = ({ title, type, imageSources, benefits, color, index, onApply }) => {
  return (
    <StaggerItem index={index}>
      <Card style={[styles.cardContainer, { borderColor: color + '30', borderWidth: 1 }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={[styles.cardType, { color }]}>{type}</Text>
          </View>
          <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
            <CreditCard size={24} color={color} />
          </View>
        </View>

        <View style={styles.imagesWrapper}>
          {imageSources.map((src, idx) => (
            <View key={idx} style={styles.imageContainer}>
              <Image source={src} style={styles.cardImage} resizeMode="contain" />
            </View>
          ))}
        </View>

        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, i) => (
            <View key={i} style={styles.benefitRow}>
              <CheckCircle size={16} color={color} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <Button
          title={`Solicitar ${title}`}
          onPress={onApply}
          variant="primary"
          style={{ backgroundColor: color, marginTop: SPACING.lg }}
          textStyle={{ color: '#000', fontWeight: FONT_WEIGHT.bold }}
        />
      </Card>
    </StaggerItem>
  );
};

export default function CardsScreen() {
  const handleApply = (cardName) => {
    Alert.alert(
      'Solicitud Recibida',
      `¡Excelente elección! Hemos recibido tu solicitud para la tarjeta ${cardName}. Te enviaremos un correo con los siguientes pasos.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StaggerItem index={0}>
        <View style={styles.header}>
          <Text style={styles.title}>Solicitud de Tarjetas</Text>
          <Text style={styles.subtitle}>
            Elige la tarjeta que mejor se adapte a tu estilo de vida.
          </Text>
        </View>
      </StaggerItem>

      <CardOption
        index={1}
        title="One Black"
        type="Tarjeta de Débito Premium"
        imageSources={[
          require('../../../../assets/OneBlack1.png'),
          require('../../../../assets/OneBlack2.png')
        ]}
        color="#A9A9A9" // Silver/Grey to contrast black
        benefits={[
          'Sin cobro de manejo de cuenta',
          'Retiros gratuitos a nivel mundial',
          'Tecnología Contactless de máxima seguridad',
          'Programa de recompensas básicas',
        ]}
        onApply={() => handleApply('One Black')}
      />

      <CardOption
        index={2}
        title="One Gold"
        type="Tarjeta de Crédito Exclusiva"
        imageSources={[
          require('../../../../assets/OneGold.png'),
          require('../../../../assets/OneGold1.png')
        ]}
        color={COLORS.accent} // Dorado
        benefits={[
          'Límite de crédito preferencial',
          'Acceso a salas VIP en aeropuertos',
          'Recompensas dobles en viajes y restaurantes',
          'Seguros de viaje y protección de compras incluidos',
        ]}
        onApply={() => handleApply('One Gold')}
      />
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  cardContainer: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  cardType: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagesWrapper: {
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: '90%',
    height: '90%',
  },
  benefitsContainer: {
    marginTop: SPACING.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  benefitIcon: {
    marginTop: 2,
    marginRight: SPACING.sm,
  },
  benefitText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
  }
});
