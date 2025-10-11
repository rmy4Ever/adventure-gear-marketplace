// AuthScreen.js — handles both login + signup in one page
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const AuthScreen = ({ navigation }) => {
  // form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");

  // toggle between signup + login mode
  const [isSignup, setIsSignup] = useState(false);

  // main auth handler (for both signup + login)
  const handleAuth = async () => {
    try {
      let userCredential;

      if (isSignup) {
        // 🔸 sign up a brand-new user
        if (!email || !password || !fullName || !country) {
          Alert.alert("Missing info", "Please fill out all fields.");
          return;
        }

        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // save the user data into Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullName,
          country,
          email,
          role: "user",
          verified: false,
          visits: 1,
          createdAt: new Date(),
        });

        Alert.alert("Success", "Account created successfully.");

        // after signup → straight to dashboard
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          });
        }, 500);

      } else {
        // 🔹 user login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, "users", userCredential.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          Alert.alert("Error", "User record not found in database.");
          return;
        }

        const userData = userSnap.data();

        // redirect admin vs normal user
        if (userData.role === "admin") {
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "AdminDashboard" }],
            });
          }, 500);
        } else {
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Dashboard" }],
            });
          }, 500);
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 🌿 App title + tagline */}
        <Text style={styles.logo}>Adventure Gear Marketplace</Text>
        <Text style={styles.subtitle}>
          {isSignup ? "Create an account to get started" : "Welcome back, adventurer!"}
        </Text>

        {/* 📦 Main form card */}
        <View style={styles.card}>
          {/* only show these when signing up */}
          {isSignup && (
            <>
              <TextInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                placeholderTextColor="#6b7280"
              />
              <TextInput
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
                style={styles.input}
                placeholderTextColor="#6b7280"
              />
            </>
          )}

          {/* shared fields for both login + signup */}
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#6b7280"
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#6b7280"
          />

          {/* 🔘 Main button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAuth}>
            <Text style={styles.btnText}>{isSignup ? "SIGN UP" : "LOGIN"}</Text>
          </TouchableOpacity>

          {/* toggle text link */}
          <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
            <Text style={styles.switchText}>
              {isSignup
                ? "Already have an account? Log in"
                : "Don’t have an account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: "#F4F6F4" },
  scrollView: { flex: 1 },
  scrollContent: { paddingVertical: 40, paddingHorizontal: 20 },

  // main title
  logo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2F6B3C", // 🌿 matches dashboard green
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 25,
    textAlign: "center",
  },

  // white form card
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderLeftWidth: 5,
    borderLeftColor: "#2F6B3C", // left accent bar for consistency
  },

  // input boxes
  input: {
    borderWidth: 1,
    borderColor: "#C7D3CA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#F9FBF9",
    fontSize: 16,
    color: "#111827",
  },

  // primary button
  primaryBtn: {
    backgroundColor: "#E8B64D", // 🟨 soft gold to match theme
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: {
    color: "#1B1B1B",
    fontWeight: "bold",
    fontSize: 16,
  },

  // switch between login/signup
  switchText: {
    color: "#2F6B3C",
    textAlign: "center",
    marginTop: 15,
    fontWeight: "500",
  },
});
