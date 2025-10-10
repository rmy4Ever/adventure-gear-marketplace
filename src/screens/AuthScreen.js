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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleAuth = async () => {
    try {
      let userCredential;

      if (isSignup) {
        // sign up a new user
        if (!email || !password || !fullName || !country) {
          Alert.alert("Missing info", "Please fill out all fields.");
          return;
        }

        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // save new user data
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
        // reset navigation so user can't go back
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          });
        }, 500);

      } else {
        // user login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, "users", userCredential.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          Alert.alert("Error", "User record not found in database.");
          return;
        }

        const userData = userSnap.data();

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
        <Text style={styles.logo}>Adventure Gear Marketplace</Text>
        <Text style={styles.subtitle}>
          {isSignup ? "Create an account to get started" : "Welcome back, adventurer!"}
        </Text>

        <View style={styles.card}>
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

          <TouchableOpacity style={styles.primaryBtn} onPress={handleAuth}>
            <Text style={styles.btnText}>{isSignup ? "SIGN UP" : "LOGIN"}</Text>
          </TouchableOpacity>

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
  keyboardView: { flex: 1, backgroundColor: "#f9fafb" },
  scrollView: { flex: 1 },
  scrollContent: { paddingVertical: 40, paddingHorizontal: 20 },
  logo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 25,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
    fontSize: 16,
    color: "#111827",
  },
  primaryBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  switchText: {
    color: "#2563eb",
    textAlign: "center",
    marginTop: 15,
    fontWeight: "500",
  },
});
