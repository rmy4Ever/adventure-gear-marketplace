import React from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";

const trialProducts = [
  { id: "1", name: "Hiking Backpack", price: "$79.99", image: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b" },
  { id: "2", name: "Camping Stove", price: "$49.99", image: "https://images.unsplash.com/photo-1616400619177-ef5a8e48b5da" },
];

export default function TrialDashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore Our Gear</Text>
      <FlatList
        data={trialProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price}</Text>
          </View>
        )}
      />
      <Text style={styles.cta}>
        Want to see more?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Auth")}>
          Log in or Sign up!
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafb" },
  header: { fontSize: 22, fontWeight: "bold", color: "#1e3a8a", marginBottom: 20, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, alignItems: "center" },
  image: { width: "100%", height: 150, borderRadius: 8, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: "bold" },
  price: { color: "#2563eb", fontWeight: "600" },
  cta: { textAlign: "center", marginTop: 20, color: "#4b5563" },
  link: { color: "#2563eb", fontWeight: "600" },
});
