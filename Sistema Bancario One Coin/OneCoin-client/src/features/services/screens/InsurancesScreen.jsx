// src/features/services/screens/InsurancesScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MotiView } from 'moti';
import { HeartPulse, Car, Heart, CheckCircle } from 'lucide-react-native';
import {
  COLORS, SPACING, FONT_SIZE, SHADOWS,
  RADIUS, ANIMATION, FONT_WEIGHT,
} from '../../../shared/constants/theme.js';
import Button from '../../../shared/components/common/Button.jsx';
import { Card, StaggerItem } from '../../../shared/components/common/Common.jsx';

const InsuranceOption = ({ title, description, icon: Icon, benefits, color, index, onApply }) => {
  return (
    <StaggerItem index={index}>
      <Card style={[styles.cardContainer, { borderColor: color + '30', borderWidth: 1 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardType}>{description}</Text>
          </View>
          <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
            <Icon size={28} color={color} />
          </View>
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
          textStyle={{ color: '#fff', fontWeight: FONT_WEIGHT.bold }}
        />
      </Card>
    </StaggerItem>
  );
};

export default function InsurancesScreen() {
  const handleApply = (insuranceName) => {
    Alert.alert(
      'Solicitud Recibida',
      `Has iniciado tu solicitud para el ${insuranceName}. Un asesor se pondrá en contacto contigo en las próximas 24 horas.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StaggerItem index={0}>
        <View style={styles.header}>
          <Text style={styles.title}>Protege lo que más importa</Text>
          <Text style={styles.subtitle}>
            Encuentra el seguro ideal con cobertura completa y atención 24/7.
          </Text>
        </View>
      </StaggerItem>

      <InsuranceOption
        index={1}
        title="Seguro de Accidentes"
        description="Protección para cualquier imprevisto"
        icon={HeartPulse}
        color="#3B82F6" // Blue
        benefits={[
          'Cobertura total de gastos médicos',
          'Atención en emergencias y hospitalización',
          'Protección en caso de invalidez',
          'Sin deducible en la red de clínicas afiliadas',
        ]}
        onApply={() => handleApply('Seguro de Accidentes Personales')}
      />

      <InsuranceOption
        index={2}
        title="Seguro de Vehículo"
        description="Tranquilidad total al volante"
        icon={Car}
        color="#F59E0B" // Amber/Orange
        benefits={[
          'Cobertura contra daños a terceros',
          'Protección ante robo total o parcial',
          'Asistencia vial y grúa 24/7 sin costo',
          'Auto sustituto en caso de siniestro',
        ]}
        onApply={() => handleApply('Seguro de Vehículo')}
      />

      <InsuranceOption
        index={3}
        title="Seguro de Vida"
        description="Seguridad para el futuro de tu familia"
        icon={Heart}
        color="#EF4444" // Red
        benefits={[
          'Protección financiera para tus seres queridos',
          'Cobertura de gastos funerarios',
          'Cobertura mundial permanente',
          'Anticipo por enfermedades graves',
        ]}
        onApply={() => handleApply('Seguro de Vida')}
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
    textAlign: 'center',
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
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  cardType: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textLight,
    marginTop: 4,
    lineHeight: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsContainer: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
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
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 20,
  }
});
