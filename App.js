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

const Stack = createStackNavigator();

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_51SGYc1KaGuQ3wTb2qC9x0XhlySw78TCDBOmf0oU4ZaIa61cEDSvdPpHGsWesqoNzEn8bxlAatgzEorE5L0gmnuA500JQYGtP2S" //Public API key for Stripe
      merchantIdentifier="merchant.com.adventuregear" // used for Apple Pay setup if needed
      urlScheme="adventuregear" // supports deep linking (optional)
    >
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Landing"
          screenOptions={{
            headerStyle: { backgroundColor: "#2F6B3C" },
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
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: "Admin" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}
