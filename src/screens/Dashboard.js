<<<<<<< Updated upstream
// Dashboard.js — scroll-away top bar (natural behavior)
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
import MapView, { Marker } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";

export default function Dashboard({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // handles logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Auth");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to log out. Please try again.");
    }
  };

  // load user info for greeting
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) setUserData(snap.data());
      setLoadingUser(false);
    });
    return unsub;
  }, []);

  // load products from both API and Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://172.20.10.9:3000/products");
        const serverProducts = await res.json();

        const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
          const firestoreProducts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const combined = [
            ...serverProducts.map((p) => ({
              id: `server-${p.id}`,
              name: p.name,
              price: parseFloat(p.price),
              image: p.image,
              description: p.description,
            })),
            ...firestoreProducts.map((p) => ({
              id: `firestore-${p.id}`,
              name: p.name,
              price: parseFloat(p.price),
              image: p.image,
              description: p.description,
            })),
          ];

          setProducts(combined);
          setLoadingProducts(false);
        });

        return () => unsub();
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products.");
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // cart logic
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + (product.quantity || 1) }
            : p
        );
      } else {
        return [...prev, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  if (loadingUser || loadingProducts) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F6B3C" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#C94B32" }}>{error}</Text>
      </View>
    );
  }

  const locations = [
    { id: 1, title: "Suva Adventure Store", latitude: -18.1416, longitude: 178.4419 },
    { id: 2, title: "Nadi Adventure Outlet", latitude: -17.7732, longitude: 177.436 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F4F6F4" />

      <FlatList
        ListHeaderComponent={
          <>
            {/* 🟩 Scroll-away top bar */}
            <View style={styles.topBar}>
              <Text style={styles.pageTitle}>Dashboard</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {userData && (
              <Text style={styles.welcomeText}>
                {userData.visits <= 1
                  ? "Welcome!"
                  : `Welcome back, ${userData.fullName?.split(" ")[0] || "adventurer"}!`}
              </Text>
            )}

            {/* Map section */}
            <View style={styles.mapCard}>
              <Text style={styles.mapTitle}>Adventure Stores in Fiji</Text>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: -17.8,
                  longitude: 178.0,
                  latitudeDelta: 2.5,
                  longitudeDelta: 3.5,
                }}
                tintColor="#2F6B3C"
                customMapStyle={[
                  { elementType: "geometry", stylers: [{ color: "#E8EDE6" }] },
                  { elementType: "labels.text.fill", stylers: [{ color: "#2F6B3C" }] },
                  { featureType: "water", stylers: [{ color: "#C9E1D0" }] },
                  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#DDEBD6" }] },
                ]}
              >
                {locations.map((loc) => (
                  <Marker
                    key={loc.id}
                    coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                    title={loc.title}
                    pinColor="#2F6B3C"
                  />
                ))}
              </MapView>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => navigation.navigate("MapScreen")}
              >
                <Text style={styles.mapButtonText}>Open Full Map</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.header}>Gear Up and Explore</Text>
          </>
        }
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{
                uri:
                  item.image ||
                  "https://cdn.pixabay.com/photo/2016/11/21/15/12/backpack-1845734_1280.jpg",
              }}
              style={styles.image}
            />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>${item.price}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("ProductDetails", {
                  product: item,
                  onAddToCart: (productWithQty) => addToCart(productWithQty),
                })
              }
            >
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* 🟨 Bottom checkout bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cartArea}
          onPress={() =>
            cartItems.length === 0
              ? alert("Your cart is empty.")
              : navigation.navigate("CartScreen", {
                  cartItems,
                  onUpdateCart: (updatedCart) => setCartItems(updatedCart),
                })
          }
        >
          <Text style={styles.cartText}>{cartCount} item(s)</Text>
          <Text style={styles.viewCart}>Tap to view your cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() =>
            cartItems.length === 0
              ? alert("Add something to your cart first.")
              : navigation.navigate("CheckoutScreen", { cartItems })
          }
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
=======
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const Dashboard = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [products, setProducts] = useState([
    { id: '1', name: 'Tent XL', price: 150, image: 'https://via.placeholder.com/100' },
    { id: '2', name: 'Hiking Boots', price: 80, image: 'https://via.placeholder.com/100' },
    { id: '3', name: 'Sleeping Bag', price: 60, image: 'https://via.placeholder.com/100' },
  ]);
  const lat = -17.7134; // Suva, Fiji (placeholder, update to Yosemite later)
  const lon = 178.0650;
  const apiKey = '3b2f8c2519e62a0fa3b82bd268e9e6c2'; // Replace with your key

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        setWeather(response.data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };
    fetchWeather();
  }, [lat, lon, apiKey]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Product', { product: item })}>
      <View style={styles.productItem}>
        <Text>{item.name} - ${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Adventure Gear Marketplace</Text>
      {weather && (
        <View style={styles.weather}>
          <Text style={styles.weatherText}>
            Weather in Suva: {weather.main.temp}°C, {weather.weather[0].description}
          </Text>
        </View>
      )}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        style={styles.productList}
      />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{ latitude: lat, longitude: lon }}
          title="Gear Store"
          description="Local adventure gear hub"
        />
      </MapView>
    </SafeAreaView>
>>>>>>> Stashed changes
  );
}

const styles = StyleSheet.create({
<<<<<<< Updated upstream
  container: { flex: 1, backgroundColor: "#F4F6F4" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // ✅ Top bar that scrolls away naturally
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 0.3,
    borderBottomColor: "#DADADA",
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2F6B3C",
  },
  logoutButton: {
    backgroundColor: "#8B5E3C",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 18,
    textAlign: "center",
    color: "#4F5D4E",
    marginVertical: 10,
    fontWeight: "500",
  },
  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 15,
    elevation: 3,
    overflow: "hidden",
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F6B3C",
    textAlign: "center",
    marginVertical: 8,
  },
  map: { width: "100%", height: 180 },
  mapButton: {
    backgroundColor: "#E8B64D",
    paddingVertical: 10,
    alignItems: "center",
  },
  mapButtonText: { color: "#1B1B1B", fontWeight: "bold" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2F6B3C",
    textAlign: "center",
    marginVertical: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  image: { width: "100%", height: 160, borderRadius: 8, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "bold", color: "#1B1B1B" },
  price: { fontSize: 16, color: "#3A915F", marginVertical: 6 },
  button: {
    backgroundColor: "#2F6B3C",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "600" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 10,
  },
  cartText: { fontSize: 16, fontWeight: "600", color: "#4F5D4E" },
  viewCart: { fontSize: 13, color: "#6B7280" },
  checkoutButton: {
    backgroundColor: "#E8B64D",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  checkoutText: { color: "#1B1B1B", fontWeight: "bold", fontSize: 15 },
});
=======
  container: { flex: 1 },
  header: { fontSize: 20, textAlign: 'center', margin: 10 },
  weather: { padding: 10, backgroundColor: '#f0f0f0' },
  weatherText: { fontSize: 16, textAlign: 'center' },
  productList: { flex: 1, maxHeight: 150 },
  productItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  map: { flex: 2 },
});

export default Dashboard;
>>>>>>> Stashed changes
