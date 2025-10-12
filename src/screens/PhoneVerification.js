// PhoneVerification.js — handles OTP / MFA verification (mocked for Expo test mode)
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function PhoneVerification({ route, navigation }) {
  // ✅ Expect valid params from AuthScreen
  const { userId, phoneNumber } = route.params;
  const [verificationId, setVerificationId] = useState(null);
  const [code, setCode] = useState("");

  // 🟡 Simulate sending OTP (test mode only)
  const sendVerification = async () => {
    try {
      console.log("Simulating OTP send for test mode");
      setVerificationId("test-id");
      Alert.alert("Code Sent", `An OTP was sent to ${phoneNumber}`);
    } catch (error) {
      console.log("Verification error:", error);
      Alert.alert("Error", error.message);
    }
  };

  // 🟢 Simulate verifying OTP code
  const confirmCode = async () => {
    if (!code.trim()) {
      Alert.alert("Missing Code", "Please enter the 6-digit code.");
      return;
    }

    if (code === "123456") {
      try {
        await updateDoc(doc(db, "users", userId), { verified: true });
        Alert.alert("Success", "Phone number verified!");
        navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
      } catch (error) {
        console.log("Firestore update error:", error);
        Alert.alert("Error", "Could not update verification status.");
      }
    } else {
      Alert.alert("Invalid Code", "Please try again using 123456 (test mode).");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Phone</Text>
      <Text style={styles.subtitle}>We’ll send a code to {phoneNumber}</Text>

      {!verificationId ? (
        <TouchableOpacity style={styles.btn} onPress={sendVerification}>
          <Text style={styles.btnText}>Send Code</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity style={styles.btn} onPress={confirmCode}>
            <Text style={styles.btnText}>Verify</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={sendVerification}>
            <Text style={styles.resend}>Resend Code</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        onPress={() =>
          navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] })
        }
      >
        <Text style={styles.skip}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "#F4F6F4", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#2F6B3C", textAlign: "center" },
  subtitle: { textAlign: "center", color: "#4b5563", marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#C7D3CA",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F9FBF9",
    marginVertical: 12,
  },
  btn: { backgroundColor: "#E8B64D", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#1B1B1B", fontWeight: "bold", fontSize: 16 },
  resend: { color: "#2F6B3C", textAlign: "center", marginTop: 10 },
  skip: { textAlign: "center", color: "#2F6B3C", marginTop: 15 },
});
