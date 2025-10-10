import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";

export default function Landing({ navigation }) {
  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" }}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Adventure Gear Marketplace</Text>
        <Text style={styles.subtitle}>
          Explore the best adventure gear and discover what’s out there — no login required.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("TrialDashboard")}
        >
          <Text style={styles.btnText}>Try the App</Text>
        </TouchableOpacity>

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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#e5e7eb",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  secondaryBtn: { padding: 10 },
  secondaryText: { color: "#fff", textDecorationLine: "underline" },
});
