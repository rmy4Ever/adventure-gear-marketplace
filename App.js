<<<<<<< Updated upstream
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StripeProvider } from "@stripe/stripe-react-native";

import Landing from "./src/screens/Landing"; // landing screen – first thing users see
import TrialDashboard from "./src/screens/TrialDashboard"; // trial dashboard – demo mode for guests
import AuthScreen from "./src/screens/AuthScreen"; // auth screen – handles login and signup
import Dashboard from "./src/screens/Dashboard"; // main dashboard – full access after login
import AdminDashboard from "./src/screens/AdminDashboard"; // admin dashboard – restricted to admins
import PhoneVerification from "./src/screens/PhoneVerification"; // phone verification – optional MFA step
import MapScreen from "./src/screens/MapScreen"; // map screen – store locations, weather, giphy
import ProductDetails from "./src/screens/ProductDetails"; // product details – info about selected gear
import CartScreen from "./src/screens/CartScreen"; // cart screen – review and edit items before checkout
import CheckoutScreen from "./src/screens/CheckoutScreen"; // checkout screen – handles payment and receipts
=======
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // For tab icons
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Add this
import AuthScreen from './src/screens/AuthScreen';
import MapScreen from './src/screens/MapScreen';
import StoreScreen from './src/screens/StoreScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import PDFScreen from './src/screens/PDFScreen';
import ShareTrailScreen from './src/screens/ShareTrailScreen';
import AdminScreen from './src/screens/AdminScreen'; // Add this
>>>>>>> Stashed changes

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
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
<<<<<<< Updated upstream
    <StripeProvider
      publishableKey="pk_test_51SGYc1KaGuQ3wTb2qC9x0XhlySw78TCDBOmf0oU4ZaIa61cEDSvdPpHGsWesqoNzEn8bxlAatgzEorE5L0gmnuA500JQYGtP2S" //Public API key for Stripe
      merchantIdentifier="merchant.com.adventuregear" // used for Apple Pay setup if needed
      urlScheme="adventuregear" // supports deep linking (optional)
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
          <Stack.Screen name="Dashboard" component={Dashboard} options={{ title: "Dashboard" }} />
          <Stack.Screen name="PhoneVerification" component={PhoneVerification} options={{ title: "Verify Phone", headerStyle: { backgroundColor: "#1e3a8a" }, headerTintColor: "#fff" }} />
          <Stack.Screen name="MapScreen" component={MapScreen} options={{ title: "Adventure Map" }} />
          <Stack.Screen name="CartScreen" component={CartScreen} options={{ title: "Your Cart" }} />
          <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ title: "Product Details" }} />
          <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={{ title: "Checkout" }} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: "Admin Dashboard" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
=======
    <SafeAreaProvider> {/* Wrap the app */}
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Auth">
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen
            name="Dashboard"
            component={DashboardTabs}
            options={{ headerShown: false }} // Hide header for tabs
          />
          <Stack.Screen name="Product" component={ProductScreen} />
          <Stack.Screen name="Cart">
            {props => <CartScreen {...props} cart={cart} setCart={setCart} />}
          </Stack.Screen>
          <Stack.Screen name="PDF" component={PDFScreen} />
          <Stack.Screen name="ShareTrail" component={ShareTrailScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} /> {/* Add here */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
>>>>>>> Stashed changes
  );
}
