import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import Landing from "./src/screens/Landing";                // trial entry page
import TrialDashboard from "./src/screens/TrialDashboard";  // limited-access dashboard
import AuthScreen from "./src/screens/AuthScreen";          // login/signup
import Dashboard from "./src/screens/Dashboard";            // full user dashboard
import AdminDashboard from "./src/screens/AdminDashboard";  // admin dashboard
import PhoneVerification from "./src/screens/PhoneVerification"; // MFA screen

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerStyle: { backgroundColor: "#1e3a8a" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      >
        {/* 🌍 Public / Trial Flow */}
        <Stack.Screen
          name="Landing"
          component={Landing}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TrialDashboard"
          component={TrialDashboard}
          options={{ title: "Trial Mode" }}
        />

        {/* 🔐 Authenticated Flow */}
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ title: "Login / Signup" }}
        />

        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ title: "Dashboard" }}
        />

        {/* ☎️ Optional MFA / Phone Verification */}
        <Stack.Screen
          name="PhoneVerification"
          component={PhoneVerification}
          options={{
            title: "Verify Phone",
            headerStyle: { backgroundColor: "#1e3a8a" },
            headerTintColor: "#fff",
          }}
        />

        {/* 🧩 Admin Dashboard */}
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{ title: "Admin Dashboard" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
