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
import CountryPicker from "react-native-country-picker-modal";

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState(null);
  const [phone, setPhone] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const validatePhone = (num) => /^\+[1-9]\d{6,14}$/.test(num);

  const handleAuth = async () => {
    try {
      let userCredential;

      if (isSignup) {
        if (!email || !password || !fullName || !country) {
          Alert.alert("Missing info", "Please fill in all required fields.");
          return;
        }

        if (phone && !validatePhone(phone)) {
          Alert.alert(
            "Invalid number",
            "Please include country code (e.g. +6799912345)."
          );
          return;
        }

        // Create account in Firebase Auth
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Save user data to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullName,
          country: country.name,
          email,
          phone: phone || null,
          verified: false,
          role: "user",
          visits: 1,
          createdAt: new Date(),
        });

        Alert.alert("Success", "Account created successfully!");

        // Go to phone verification if user entered a valid number
        if (phone) {
          navigation.navigate("PhoneVerification", {
            userId: userCredential.user.uid,  // send the ID to the next screen
            phoneNumber: phone,               // match the expected param name
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          });
        }

      } else {
        // --- LOGIN ---
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, "users", userCredential.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          Alert.alert("Error", "User not found in Firestore.");
          return;
        }

        const userData = userSnap.data();
        navigation.reset({
          index: 0,
          routes: [{ name: userData.role === "admin" ? "AdminDashboard" : "Dashboard" }],
        });
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.logo}>Gear Up</Text>
        <Text style={styles.subtitle}>
          {isSignup
            ? "Create an account to get started"
            : "Welcome back, adventurer!"}
        </Text>

        <View style={styles.card}>
          {isSignup && (
            <>
              {/* Full Name */}
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                placeholderTextColor="#6b7280"
              />

              {/* Country */}
              <Text style={styles.label}>Country</Text>
              <TouchableOpacity
                style={[styles.input, styles.countryField]}
                onPress={() => setShowCountryPicker(true)}
              >
                {country ? (
                  <Text style={{ color: "#111" }}>
                    {country.emoji ? `${country.emoji} ${country.name}` : country.name}
                  </Text>
                ) : (
                  <Text style={{ color: "#6b7280" }}>Tap to choose your country</Text>
                )}
                <Text style={{ color: "#6b7280" }}>▼</Text>
              </TouchableOpacity>

              {showCountryPicker && (
                <CountryPicker
                  visible
                  withFlag
                  withFilter
                  withCountryNameButton={false}
                  containerButtonStyle={{ display: "none" }}
                  onSelect={(c) => {
                    setCountry(c);
                    setShowCountryPicker(false);
                  }}
                  onClose={() => setShowCountryPicker(false)}
                />
              )}

              {/* Phone */}
              <Text style={styles.label}>Phone</Text>
              <TextInput
                placeholder="Optional (e.g. +6799912345)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
                placeholderTextColor="#6b7280"
              />
            </>
          )}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#6b7280"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
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
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: "#F4F6F4" },
  scrollContent: { paddingVertical: 40, paddingHorizontal: 20 },
  logo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2F6B3C",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#2F6B3C",
    elevation: 6,
  },
  label: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#C7D3CA",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#F9FBF9",
  },
  countryField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: "#E8B64D",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#1B1B1B", fontWeight: "bold", fontSize: 16 },
  switchText: {
    color: "#2F6B3C",
    textAlign: "center",
    marginTop: 15,
    fontWeight: "500",
  },
});
