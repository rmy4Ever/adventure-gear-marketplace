import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import ProductCard from "../components/ProductCard";

export default function DashboardScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔁 Get products in real time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 👑 Check if logged-in user is admin
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().role === "admin") {
          setIsAdmin(true);
        }
      }
    });
    return unsubscribeAuth;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F6B3C" />
        <Text style={{ color: "#555", marginTop: 10 }}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Adventure Gear Marketplace</Text>
      <Text style={styles.subHeader}>Explore the outdoors in style 🌿</Text>

      {/* 🔙 Back to Admin (only for admin accounts) */}
      {isAdmin && (
        <TouchableOpacity
          onPress={() => navigation.navigate("AdminDashboard")}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>🔙 Back to Admin</Text>
        </TouchableOpacity>
      )}

      {products.length === 0 ? (
        <Text style={styles.emptyText}>No gear available yet.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate("ProductDetails", { product: item })
              }
            />
          )}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F4", // misty forest background
    padding: 15,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2F6B3C", // forest green
    textAlign: "center",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 15,
  },
  backBtn: {
    backgroundColor: "#E8B64D", // golden amber
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  backText: {
    color: "#1B1B1B",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 15,
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
