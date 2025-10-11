import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';

import Landing from "./src/screens/Landing";
import TrialDashboard from "./src/screens/TrialDashboard";
import AuthScreen from "./src/screens/AuthScreen";
import Dashboard from "./src/screens/Dashboard";
import AdminDashboard from "./src/screens/AdminDashboard";
import PhoneVerification from "./src/screens/PhoneVerification";
import MapScreen from "./src/screens/MapScreen";
import ProductDetails from "./src/screens/ProductDetails";
import CartScreen from "./src/screens/CartScreen";
import CheckoutScreen from "./src/screens/CheckoutScreen";
import StoreScreen from "./src/screens/StoreScreen";
import ProductScreen from "./src/screens/ProductScreen";
import PDFScreen from "./src/screens/PDFScreen";
import ShareTrailScreen from "./src/screens/ShareTrailScreen";
import AdminScreen from "./src/screens/AdminScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for Dashboard
const DashboardTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Store') iconName = focused ? 'storefront' : 'storefront-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#28a745',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Store" component={StoreScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [cart, setCart] = useState([]);
  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey="pk_test_51SGYc1KaGuQ3wTb2qC9x0XhlySw78TCDBOmf0oU4ZaIa61cEDSvdPpHGsWesqoNzEn8bxlAatgzEorE5L0gmnuA500JQYGtP2S"
        merchantIdentifier="merchant.com.adventuregear"
        urlScheme="adventuregear"
      >
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Landing"
            screenOptions={{
              headerStyle: { backgroundColor: "#1e3a8a" },
              headerTintColor: "#fff",
              headerTitleAlign: "center",
              headerBackTitleVisible: false,
            }}
          >
            <Stack.Screen name="Landing" component={Landing} options={{ headerShown: false }} />
            <Stack.Screen name="TrialDashboard" component={TrialDashboard} options={{ title: "Trial Mode" }} />
            <Stack.Screen name="Auth" component={AuthScreen} options={{ title: "Login / Signup" }} />
            <Stack.Screen
              name="Dashboard"
              component={DashboardTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="PhoneVerification" component={PhoneVerification} options={{ title: "Verify Phone" }} />
            <Stack.Screen name="Product" component={ProductScreen} />
            <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ title: "Product Details" }} />
            <Stack.Screen name="Cart" options={{ title: "Your Cart" }}>
              {props => <CartScreen {...props} cart={cart} setCart={setCart} />}
            </Stack.Screen>
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
            <Stack.Screen name="PDF" component={PDFScreen} />
            <Stack.Screen name="ShareTrail" component={ShareTrailScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} options={{ title: "Admin" }} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: "Admin Dashboard" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </StripeProvider>
    </SafeAreaProvider>
  );
}