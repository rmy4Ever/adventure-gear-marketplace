import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { firebaseConfig } from "../../firebaseConfig";

const PhoneVerification = ({ navigation, route }) => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const recaptchaVerifier = useRef(null);

  // ✅ userId passed from Auth or Dashboard
  const userId = route?.params?.userId;

  // Send verification code
  const sendVerification = async () => {
    try {
      if (!phone.startsWith("+")) {
        Alert.alert("Error", "Please include your country code (e.g., +679...).");
        return;
      }

      const phoneProvider = new PhoneAuthProvider(auth);
      const id = await phoneProvider.verifyPhoneNumber(phone, recaptchaVerifier.current);
      setVerificationId(id);
      Alert.alert("Success", "Verification code sent to your phone!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Confirm verification code
  const confirmCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);

      await setDoc(
        doc(db, "users", userId),
        {
          phone,
          verified: true,
          verifiedAt: new Date(),
        },
        { merge: true }
      );

      Alert.alert("Verified", "Your phone number has been verified!");
      navigation.navigate("Dashboard");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Verify Your Phone Number</Text>
        <Text style={styles.subtitle}>
          Adding your phone number helps keep your account safe and secure.
        </Text>

        {/* Input phone number */}
        <TextInput
          placeholder="Phone number (e.g. +6791234567)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={sendVerification}>
          <Text style={styles.btnText}>Send Verification Code</Text>
        </TouchableOpacity>

        {/* Input OTP code */}
        {verificationId && (
          <>
            <TextInput
              placeholder="Enter the 6-digit code"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              style={styles.input}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={confirmCode}>
              <Text style={styles.btnText}>Confirm Code</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("Dashboard")}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      {/* Required reCAPTCHA verifier */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />
    </KeyboardAvoidingView>
  );
};

export default PhoneVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  card: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a8a",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  skipBtn: {
    marginTop: 15,
    alignItems: "center",
  },
  skipText: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "500",
  },
});
