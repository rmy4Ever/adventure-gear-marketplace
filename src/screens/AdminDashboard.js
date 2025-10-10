import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";

export default function AdminDashboard({ navigation }) {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧺 Form fields for adding gear items
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // 🔁 Real-time updates from Firestore
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubProducts();
    };
  }, []);

  // ➕ Add new gear item
  const handleAddItem = async () => {
    if (!itemName || !price || !description) {
      Alert.alert("Error", "Please fill in all fields before adding.");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        name: itemName,
        price: parseFloat(price),
        description,
        createdAt: new Date(),
      });
      Alert.alert("Success", `${itemName} added to marketplace!`);
      setItemName("");
      setPrice("");
      setDescription("");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // 🔒 Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Auth");
  };

  // 👁️ Navigate to real user dashboard
  const handleViewUserDashboard = () => {
    navigation.navigate("Dashboard");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F6B3C" />
        <Text style={{ color: "#555", marginTop: 10 }}>Loading data...</Text>
      </View>
    );
  }

  // 🎛️ Admin View
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>
      <Text style={styles.subHeader}>
        Total Users: {users.length} | Products: {products.length}
      </Text>

      {/* 👁️ View as User Button */}
      <TouchableOpacity
        style={styles.viewUserBtn}
        onPress={handleViewUserDashboard}
      >
        <Text style={styles.viewUserText}>🟢 View User Dashboard</Text>
      </TouchableOpacity>

      {/* 🧾 Add Gear Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add New Adventure Gear</Text>
        <TextInput
          placeholder="Item Name"
          value={itemName}
          onChangeText={setItemName}
          style={styles.input}
        />
        <TextInput
          placeholder="Price (e.g. 59.99)"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
          style={styles.input}
        />
        <TextInput
          placeholder="Short Description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 70 }]}
          multiline
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
          <Text style={styles.addBtnText}>+ Add Gear</Text>
        </TouchableOpacity>
      </View>

      {/* 📦 Product List */}
      <Text style={styles.sectionHeader}>Marketplace Inventory</Text>
      {products.length === 0 ? (
        <Text style={styles.emptyText}>No products added yet.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
              <Text style={styles.productDesc}>{item.description}</Text>
            </View>
          )}
        />
      )}

      {/* 👥 Users */}
      <Text style={styles.sectionHeader}>Registered Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.roleTag}>Role: {item.role || "user"}</Text>
          </View>
        )}
      />

      {/* 🔒 Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F4F6F4",
    paddingBottom: 60,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2F6B3C",
    textAlign: "center",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#2F6B3C",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1B1B1B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#C7D3CA",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#F9FBF9",
  },
  addBtn: {
    backgroundColor: "#2F6B3C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  viewUserBtn: {
    backgroundColor: "#E8B64D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  viewUserText: {
    color: "#1B1B1B",
    fontWeight: "600",
    fontSize: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2F6B3C",
    marginBottom: 8,
    marginTop: 15,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#E8B64D",
  },
  productName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1B1B1B",
  },
  productPrice: {
    color: "#2F6B3C",
    fontWeight: "600",
    marginTop: 3,
  },
  productDesc: {
    color: "#4b5563",
    fontSize: 14,
    marginTop: 3,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#8B5E3C",
  },
  userEmail: {
    fontSize: 15,
    fontWeight: "600",
  },
  roleTag: {
    color: "#2F6B3C",
    fontSize: 13,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginVertical: 10,
  },
  logoutBtn: {
    backgroundColor: "#8B5E3C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
