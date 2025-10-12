import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import { useStripe, CardField } from "@stripe/stripe-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function CheckoutScreen({ route, navigation }) {
  // get items passed from the Cart screen (or empty array if none)
  const { cartItems = [] } = route?.params || {};

  // just calculating totals for the checkout summary
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems
    .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
    .toFixed(2);

  // set up local states for name, payment info, and UI feedback
  const [name, setName] = useState("");
  const [cardDetails, setCardDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const { confirmPayment } = useStripe(); // main Stripe hook

  // converts special characters to safe HTML for use in the PDF receipt
  const escapeHtml = (txt) =>
    txt
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  // builds and shares a simple receipt PDF after payment
  const generateAndSharePDF = async (paymentStatus) => {
    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #1B1B1B;
              background-color: #F4F6F4;
            }
            .header { text-align: center; margin-bottom: 24px; }
            .title {
              color: #2F6B3C;
              font-size: 26px;
              font-weight: bold;
            }
            .divider {
              border-bottom: 2px solid #E8B64D;
              margin: 20px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              border-bottom: 1px dashed #CBD5C0;
            }
            .status-success { color: #3A915F; font-weight: bold; }
            .status-failed { color: #C94B32; font-weight: bold; }
            .total {
              font-weight: bold;
              font-size: 18px;
              color: #2F6B3C;
            }
            footer {
              text-align: center;
              font-size: 13px;
              color: #4F5D4E;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Gear Up</div>
            <div>Official Payment Receipt</div>
          </div>

          <div class="divider"></div>
          <div>
            <div class="row"><b>Customer:</b><span>${escapeHtml(name || "Guest")}</span></div>
            <div class="row"><b>Date:</b><span>${new Date().toLocaleString()}</span></div>
            <div class="row">
              <b>Status:</b>
              <span class="${
                paymentStatus === "Payment Successful"
                  ? "status-success"
                  : "status-failed"
              }">${paymentStatus}</span>
            </div>
          </div>

          <div class="divider"></div>
          <h3>Items Purchased</h3>
          ${cartItems
            .map(
              (item) => `
              <div class="row">
                <span>${item.quantity} × ${escapeHtml(item.name)}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>`
            )
            .join("")}
          <div class="divider"></div>
          <div class="row total"><span>Total Items:</span><span>${totalItems}</span></div>
          <div class="row total"><span>Total Paid:</span><span>$${totalPrice}</span></div>
          <footer>
            Thanks for supporting Adventure Gear Marketplace.<br />
            For help, contact: support@adventuregear.com
          </footer>
        </body>
      </html>
    `;

    try {
      // create + share the file using Expo’s print and sharing modules
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error("PDF share error:", err);
      Alert.alert("PDF Error", "Could not open or share the receipt file.");
    }
  };

  // main function that handles the Stripe payment process
  const handlePayment = async () => {
    Keyboard.dismiss(); // hides keyboard before processing
    setStatus(null);
    setLoading(true);

    // quick validation to prevent blank input
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter the name on the card.");
      setLoading(false);
      return;
    }
    if (!cardDetails?.complete) {
      Alert.alert("Validation", "Please complete all card details.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: ask backend to create a PaymentIntent
      const res = await fetch("http://172.20.10.9:3000/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(totalPrice * 100) }),
      });

      const data = await res.json();
      if (!res.ok || !data.clientSecret)
        throw new Error(data.error || "Failed to create payment intent");

      // Step 2: confirm payment with Stripe SDK
      const { error, paymentIntent } = await confirmPayment(data.clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: { billingDetails: { name } },
      });

      // either success or failure
      if (error) {
        setStatus("failed");
        Alert.alert("Payment Failed", error.message);
        await generateAndSharePDF("Payment Failed");
      } else if (paymentIntent) {
        setStatus("success");
        Alert.alert("Payment Successful", "Your payment has been confirmed!");
        await generateAndSharePDF("Payment Successful");

        // return to dashboard after successful payment
        navigation.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        });
      }
    } catch (err) {
      setStatus("failed");
      Alert.alert("Error", err.message || "Payment could not be processed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.summary}>Items: {totalItems}</Text>
        <Text style={styles.summary}>Total: ${totalPrice}</Text>

        {/* input for the cardholder’s name */}
        <Text style={styles.label}>Name on Card</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
        />

        {/* Stripe card input field (handles all card data securely) */}
        <Text style={styles.label}>Card Details</Text>
        <CardField
          postalCodeEnabled={false}
          placeholders={{
            number: "4242 4242 4242 4242",
            expiration: "MM/YY",
            cvc: "CVC",
          }}
          cardStyle={{
            backgroundColor: "#FFFFFF",
            textColor: "#1B1B1B",
            borderColor: "#CBD5C0",
            borderWidth: 1,
            borderRadius: 8,
          }}
          style={{
            width: "100%",
            height: 50,
            marginVertical: 12,
          }}
          onCardChange={setCardDetails}
        />

        {/* if still processing, show a spinner instead of the button */}
        {loading ? (
          <ActivityIndicator size="large" color="#2F6B3C" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePayment}>
            <Text style={styles.buttonText}>Pay ${totalPrice}</Text>
          </TouchableOpacity>
        )}

        {/* show message based on payment status */}
        {status && (
          <Text
            style={[
              styles.statusText,
              { color: status === "success" ? "#3A915F" : "#C94B32" },
            ]}
          >
            {status === "success"
              ? "Payment Successful"
              : "Payment Failed — Please try again"}
          </Text>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F4F6F4",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2F6B3C",
    textAlign: "center",
    marginBottom: 12,
  },
  summary: {
    fontSize: 18,
    color: "#4F5D4E",
    textAlign: "center",
    marginBottom: 8,
  },
  label: {
    marginTop: 14,
    color: "#4F5D4E",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5C0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  button: {
    backgroundColor: "#E8B64D",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#1B1B1B",
    fontWeight: "700",
    textAlign: "center",
  },
  statusText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#2F6B3C",
    paddingVertical: 12,
    borderRadius: 8,
  },
  backText: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },
});
