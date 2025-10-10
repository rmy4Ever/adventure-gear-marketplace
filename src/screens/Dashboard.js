import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const products = [
  {
    id: "1",
    name: "Mountain Tent",
    price: "$129.99",
    image: "https://unsplash.com/photos/a-tent-is-lit-up-in-the-dark-4sAWTm8JWbA",
  },
  {
    id: "2",
    name: "Camping Lantern",
    price: "$39.99",
    image: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba",
  },
  {
    id: "3",
    name: "Hiking Backpack",
    price: "$89.99",
    image: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b",
  },
];

export default function Dashboard({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // load user data and update their visit count
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // listen to user document in real time
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);

        // every time the dashboard loads, increase visit count and log last login time
        if (data.visits) {
          await setDoc(
            userRef,
            { visits: data.visits + 1, lastLogin: new Date() },
            { merge: true }
          );
        } else {
          // if visits field doesn’t exist, add it
          await setDoc(
            userRef,
            { visits: 1, lastLogin: new Date() },
            { merge: true }
          );
        }
      }
      setLoading(false);
    });

    return unsubscribe; // stop listening when user leaves the screen
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* show welcome message */}
      {userData && (
        <Text style={styles.welcomeText}>
          {userData.visits <= 1
            ? "Welcome!"
            : `Welcome back, ${
                userData.fullName?.split(" ")[0] || "adventurer"
              }!`}
        </Text>
      )}

      <Text style={styles.header}>Gear Up and Explore</Text>

      {/* product list */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price}</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e3a8a",
    textAlign: "center",
    marginVertical: 15,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  price: {
    fontSize: 16,
    color: "#2563eb",
    marginVertical: 6,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  welcomeText: {
    fontSize: 18,
    textAlign: "center",
    color: "#374151",
    marginBottom: 10,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
