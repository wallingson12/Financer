import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import TransacoesScreen from './screens/TransacoesScreen';
import InvestimentosScreen from './screens/InvestimentosScreen';
import ImportarScreen from './screens/ImportarScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { Ionicons } from '@expo/vector-icons';

function AppTabs({ token }) {
  return (
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
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Dashboard">
        {props => <DashboardScreen {...props} token={token} />}
      </Tab.Screen>

      <Tab.Screen name="Transações">
        {props => <TransacoesScreen {...props} token={token} />}
      </Tab.Screen>

      <Tab.Screen name="Investimentos">
        {props => <InvestimentosScreen {...props} token={token} />}
      </Tab.Screen>

      <Tab.Screen name="Importar">
        {props => <ImportarScreen {...props} token={token} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [token, setToken] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} setToken={setToken} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="App">
            {props => <AppTabs {...props} token={token} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}