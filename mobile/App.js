import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, StyleSheet, Alert } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import TransacoesScreen from './screens/TransacoesScreen';
import InvestimentosScreen from './screens/InvestimentosScreen';
import ImportarScreen from './screens/ImportarScreen';
import AvisosScreen from './screens/AvisosScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { Ionicons } from '@expo/vector-icons';

// ✅ SERVIÇO DE API COM TIMEOUT
export const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Requisição excedeu o tempo limite')), timeout)
    )
  ]);
};

// ✅ COMPONENTE DE LOADING
function LoadingOverlay({ visible }) {
  if (!visible) return null;

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    </View>
  );
}

// ✅ COMPONENTE DE ERRO DE CONEXÃO
function ErrorAlert({ error, onRetry, onDismiss }) {
  if (!error) return null;

  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorBox}>
        <Ionicons name="alert-circle" size={32} color="#DC2626" />
        <Text style={styles.errorTitle}>Erro de Conexão</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <View style={styles.errorButtons}>
          {onRetry && (
            <Text
              onPress={onRetry}
              style={[styles.errorButton, styles.retryButton]}
            >
              Tentar Novamente
            </Text>
          )}
          <Text
            onPress={onDismiss}
            style={[styles.errorButton, styles.dismissButton]}
          >
            OK
          </Text>
        </View>
      </View>
    </View>
  );
}

function AppTabs({ token }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;

            if (route.name === "Dashboard") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Transações") {
              iconName = focused ? "list" : "list-outline";
            } else if (route.name === "Investimentos") {
              iconName = focused ? "cash" : "cash-outline";
            } else if (route.name === "Importar") {
              iconName = focused ? "cloud-upload" : "cloud-upload-outline";
            } else if (route.name === "Avisos") {
              iconName = focused ? "alert-circle" : "alert-circle-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#6366F1",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Dashboard">
          {props => (
            <DashboardScreen
              {...props}
              token={token}
              setLoading={setLoading}
              setError={setError}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Transações">
          {props => (
            <TransacoesScreen
              {...props}
              token={token}
              setLoading={setLoading}
              setError={setError}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Investimentos">
          {props => (
            <InvestimentosScreen
              {...props}
              token={token}
              setLoading={setLoading}
              setError={setError}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Importar">
          {props => (
            <ImportarScreen
              {...props}
              token={token}
              setLoading={setLoading}
              setError={setError}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Avisos">
          {props => (
            <AvisosScreen {...props} />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <LoadingOverlay visible={loading} />
      <ErrorAlert
        error={error}
        onRetry={() => setError(null)}
        onDismiss={() => setError(null)}
      />
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    setToken(null);
    setError(null);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Login">
            {props => (
              <LoginScreen
                {...props}
                setToken={setToken}
                setLoading={setLoading}
                setError={setError}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="App">
            {props => (
              <AppTabs {...props} token={token} onLogout={handleLogout} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>

      <LoadingOverlay visible={loading} />
      <ErrorAlert
        error={error}
        onDismiss={() => setError(null)}
      />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  errorBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    maxWidth: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  errorButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    color: 'white',
  },
  dismissButton: {
    backgroundColor: '#E5E7EB',
    color: '#333',
  },
});