// TrialDashboard.js — guest version of the app
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";

export default function TrialDashboard({ navigation }) {
  // store product list and loading state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  // pull in demo products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://172.20.10.9:3000/products");
        const data = await res.json();

        // reformat product data so it's easier to render
        const formatted = data.map((item) => ({
          id: item.id.toString(),
          name: item.name,
          price: `$${item.price}`,
          image: item.image,
          description: item.description,
        }));

        setProducts(formatted);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // map markers for the free-trial map
  const locations = [
    {
      id: 1,
      title: "Suva Adventure Store",
      latitude: -18.1416,
      longitude: 178.4419,
      description: "Located in the capital — Suva city center.",
    },
    {
      id: 2,
      title: "Nadi Adventure Outlet",
      latitude: -17.7732,
      longitude: 177.436,
      description: "Your west coast adventure hub near the airport.",
    },
  ];

  // show alert if user tries to open locked features
  const handleRestrictedAccess = () => {
    Alert.alert(
      "Sign up required",
      "Sign up or log in to view full details, buy gear, and save favorites!",
      [{ text: "OK", onPress: () => navigation.navigate("Auth") }]
    );
  };

  // show spinner while fetching demo products
  if (loadingProducts) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F6B3C" />
        <Text>Loading adventure gear...</Text>
      </View>
    );
  }

  // show a fallback message if something breaks
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#C94B32" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* top banner that reminds user this is just guest mode */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          You’re in guest mode — sign up to unlock full features
        </Text>
      </View>

      {/* product listing scroll */}
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Adventure Gear Marketplace</Text>
            <Text style={styles.subHeader}>
              Explore the app without signing in
            </Text>

            {/* map preview showing two sample stores */}
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
              >
                {locations.map((loc) => (
                  <Marker
                    key={loc.id}
                    coordinate={{
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                    }}
                    title={loc.title}
                    description={loc.description}
                    pinColor="#2F6B3C"
                  >
                    <Callout>
                      <View style={{ width: 180 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                          {loc.title}
                        </Text>
                        <Text style={{ fontSize: 13, color: "#374151" }}>
                          {loc.description}
                        </Text>
                      </View>
                    </Callout>
                  </Marker>
                ))}
              </MapView>
            </View>

            <Text style={styles.header2}>Popular Gear</Text>
          </>
        }
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price}</Text>

            {/* when guest tries to view details */}
            <TouchableOpacity style={styles.button} onPress={handleRestrictedAccess}>
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* bottom bar that nudges user to sign up */}
      <View style={styles.bottomBar}>
        <Text style={styles.cta}>
          To unlock the full features of this app, please
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            Alert.alert(
              "Unlock Full Access",
              "Sign up or log in to access checkout, weather maps, and more!",
              [{ text: "OK", onPress: () => navigation.navigate("Auth") }]
            );
          }}
        >
          <Text style={styles.loginText}>Sign up / Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F4" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // guest banner across the top
  banner: {
    backgroundColor: "#E8B64D", // gold banner
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  bannerText: {
    color: "#1B1B1B",
    fontWeight: "600",
    fontSize: 14,
  },

  // title + subheading
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2F6B3C",
    textAlign: "center",
    marginTop: 10,
  },
  subHeader: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 15,
  },

  // small map section
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
  map: { width: "100%", height: 220 },

  header2: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2F6B3C",
    textAlign: "center",
    marginVertical: 10,
  },

  // each gear card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
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

  // sign-up reminder bar at the bottom
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 12,
    alignItems: "center",
    elevation: 10,
  },
  cta: { fontSize: 15, color: "#374151", marginBottom: 6 },
  loginButton: {
    backgroundColor: "#E8B64D",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  loginText: { color: "#1B1B1B", fontWeight: "600" },
});
