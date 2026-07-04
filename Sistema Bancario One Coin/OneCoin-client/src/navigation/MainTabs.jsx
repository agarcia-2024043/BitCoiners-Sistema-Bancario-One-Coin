// src/navigation/MainTabs.jsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import {
  Landmark, ArrowLeftRight, DollarSign, Star, User, History, Send
} from 'lucide-react-native';
import {
  COLORS, SPACING, RADIUS, SHADOWS, ANIMATION,
  FONT_SIZE, FONT_WEIGHT,
} from '../shared/constants/theme.js';

// Screens
import AccountsScreen      from '../features/accounts/screens/AccountsScreen.jsx';
import AccountDetailScreen from '../features/accounts/screens/AccountDetailScreen.jsx';
import CreateAccountScreen from '../features/accounts/screens/CreateAccountScreen.jsx';
import TransactionsScreen  from '../features/transactions/screens/TransactionsScreen.jsx';
import TransferScreen      from '../features/transactions/screens/TransferScreen.jsx';
import CurrencyConverterScreen from '../features/currencies/screens/CurrencyConverterScreen.jsx';
import FavoritesScreen     from '../features/favorites/screens/FavoritesScreen.jsx';
import ProfileScreen         from '../features/profile/screens/ProfileScreen.jsx';
import NotificationsScreen   from '../features/profile/screens/NotificationsScreen.jsx';
import CardsScreen           from '../features/cards/screens/CardsScreen.jsx';
import InsurancesScreen      from '../features/services/screens/InsurancesScreen.jsx';

const Tab = createBottomTabNavigator();

// ─── Stack options ────────────────────────────────────────────────────────
const stackScreenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.textOnDark,
  headerTitleStyle: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textOnDark,
  },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: COLORS.background },
  animation: 'fade_from_bottom',
};

const AccountsStack = createNativeStackNavigator();
const AccountsNavigator = () => (
  <AccountsStack.Navigator screenOptions={stackScreenOptions}>
    <AccountsStack.Screen name="AccountsList"  component={AccountsScreen}      options={{ headerShown: false }} />
    <AccountsStack.Screen name="AccountDetail" component={AccountDetailScreen} options={{ title: 'Detalle de Cuenta' }} />
    <AccountsStack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ title: 'Nueva Cuenta' }} />
  </AccountsStack.Navigator>
);

const HistoryStack = createNativeStackNavigator();
const HistoryNavigator = () => (
  <HistoryStack.Navigator screenOptions={stackScreenOptions}>
    <HistoryStack.Screen name="TransactionsList" component={TransactionsScreen} options={{ title: 'Historial' }} />
  </HistoryStack.Navigator>
);

const TransferStack = createNativeStackNavigator();
const TransferNavigator = () => (
  <TransferStack.Navigator screenOptions={stackScreenOptions}>
    <TransferStack.Screen name="TransferScreen" component={TransferScreen} options={{ title: 'Transferencia' }} />
  </TransferStack.Navigator>
);

const CurrenciesStack = createNativeStackNavigator();
const CurrenciesNavigator = () => (
  <CurrenciesStack.Navigator screenOptions={stackScreenOptions}>
    <CurrenciesStack.Screen name="CurrencyRates" component={CurrencyConverterScreen} options={{ title: 'Conversor de Divisas' }} />
  </CurrenciesStack.Navigator>
);

const FavoritesStack = createNativeStackNavigator();
const FavoritesNavigator = () => (
  <FavoritesStack.Navigator screenOptions={stackScreenOptions}>
    <FavoritesStack.Screen name="FavoritesList" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
  </FavoritesStack.Navigator>
);

const ProfileStack = createNativeStackNavigator();
const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={stackScreenOptions}>
    <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
    <ProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
    <ProfileStack.Screen name="Cards" component={CardsScreen} options={{ title: 'Tarjetas' }} />
    <ProfileStack.Screen name="Insurances" component={InsurancesScreen} options={{ title: 'Seguros' }} />
  </ProfileStack.Navigator>
);

// ─── Custom Tab Bar ───────────────────────────────────────────────────────
const TAB_ICONS = {
  Accounts:     Landmark,
  History:      History,
  Transfer:     Send,
  Currencies:   DollarSign,
  Favorites:    Star,
  Profile:      User,
};
const TAB_LABELS = {
  Accounts:     'Cuentas',
  History:      'Historial',
  Transfer:     'Transferir',
  Currencies:   'Divisas',
  Favorites:    'Favoritos',
  Profile:      'Perfil',
};

function CustomTabBar({ state, navigation }) {
  return (
    <View style={styles.tabBarOuter}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const IconComponent = TAB_ICONS[route.name];
          const label = TAB_LABELS[route.name] || route.name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              {/* Active pill */}
              <MotiView
                animate={{ opacity: isFocused ? 1 : 0, scale: isFocused ? 1 : 0.7 }}
                transition={ANIMATION.spring.bouncy}
                style={styles.tabActivePill}
              />

              {/* Dot indicator */}
              <MotiView
                animate={{ opacity: isFocused ? 1 : 0, scale: isFocused ? 1 : 0 }}
                transition={ANIMATION.spring.snappy}
                style={styles.tabDot}
              />

              {/* Icon */}
              <MotiView
                animate={{ translateY: isFocused ? -1 : 0, scale: isFocused ? 1.1 : 1 }}
                transition={ANIMATION.spring.snappy}
              >
                {IconComponent && (
                  <IconComponent
                    size={isFocused ? 21 : 20}
                    color={isFocused ? COLORS.accent : COLORS.textLight}
                    strokeWidth={isFocused ? 2.2 : 1.8}
                  />
                )}
              </MotiView>

              {/* Label */}
              <MotiView animate={{ opacity: isFocused ? 1 : 0.5 }} transition={ANIMATION.timing.fast}>
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                  {label}
                </Text>
              </MotiView>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Tabs ─────────────────────────────────────────────────────────────
export const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Accounts"     component={AccountsNavigator} />
    <Tab.Screen name="History"      component={HistoryNavigator} />
    <Tab.Screen name="Transfer"     component={TransferNavigator} />
    <Tab.Screen name="Currencies"   component={CurrenciesNavigator} />
    <Tab.Screen name="Favorites"    component={FavoritesNavigator} />
    <Tab.Screen name="Profile"      component={ProfileNavigator} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: SPACING.lg,
    right: SPACING.lg,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,          // #0A0A0A — igual que sidebar web
    borderRadius: RADIUS.xxl,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...SHADOWS.xl,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    minHeight: 52,
    position: 'relative',
  },
  tabActivePill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(197,168,128,0.12)',  // gold tint activo
    borderRadius: RADIUS.xl,
    marginHorizontal: 2,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(197,168,128,0.18)',
  },
  tabDot: {
    position: 'absolute',
    top: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,            // dot dorado
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 3,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textLight,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: COLORS.accent,                      // texto dorado activo
    fontWeight: FONT_WEIGHT.bold,
  },
});

export default MainTabs;
