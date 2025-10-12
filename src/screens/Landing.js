// Landing.js — splash screen for the app
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";

export default function Landing({ navigation }) {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      }}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* dark overlay so text pops against background */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Gear Up</Text>
        <Text style={styles.subtitle}>
          Explore the best adventure gear and discover what’s out there — no login required.
        </Text>

        {/* button to enter trial mode */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("TrialDashboard")}
        >
          <Text style={styles.btnText}>Try the App</Text>
        </TouchableOpacity>

        {/* button to go to signup/login */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate("Auth")}
        >
          <Text style={styles.secondaryText}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  // adds a dark transparent layer for readability
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // main heading
  title: {
    color: "#01b729ff",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  // tagline below the title
  subtitle: {
    color: "#F9FAF9", // off-white for contrast
    fontSize: 16,
    textAlign: "center",
    marginBottom: 35,
    lineHeight: 22,
  },

  // big green button for trial mode
  primaryBtn: {
    backgroundColor: "#2F6B3C", // forest green
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 10,
  },
  btnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },

  // simple link-style button for login/signup
  secondaryBtn: { padding: 10 },
  secondaryText: {
    color: "#E8B64D", // gold underline to match theme
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
