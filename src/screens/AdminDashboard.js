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
  Image,
  ScrollView,
} from "react-native";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";

export default function AdminDashboard({ navigation }) {
  // basic data states
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // input form states
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // pasteable image URL

  // fetch users and products in real-time from Firestore
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

  // add a new gear item to Firestore
  const handleAddItem = async () => {
    if (!itemName || !price || !description || !imageUrl) {
      Alert.alert("Error", "Please fill in all fields including image URL.");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        name: itemName,
        price: parseFloat(price),
        description,
        image: imageUrl,
        createdAt: new Date(),
      });
      Alert.alert("Success", `${itemName} added to marketplace!`);
      setItemName("");
      setPrice("");
      setDescription("");
      setImageUrl("");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // delete a product by id
  const handleDeleteItem = async (id, name) => {
    try {
      await deleteDoc(doc(db, "products", id));
      Alert.alert("Deleted", `${name} has been removed from the marketplace.`);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // logout the admin
  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Auth");
  };

  // view normal dashboard
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

  return (
    <View style={styles.container}>
      {/* header that stays at top */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtnTop}>
          <Text style={styles.logoutTextTop}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.subHeader}>
          Total Users: {users.length} | Products: {products.length}
        </Text>

        {/* view user dashboard button */}
        <TouchableOpacity
          style={styles.viewUserBtn}
          onPress={handleViewUserDashboard}
        >
          <Text style={styles.viewUserText}>View User Dashboard</Text>
        </TouchableOpacity>

        {/* add new gear form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Adventure Gear</Text>
          <TextInput
            placeholder="Item Name"
            value={itemName}
            onChangeText={setItemName}
            style={styles.input}
            placeholderTextColor="#6b7280"
          />
          <TextInput
            placeholder="Price (e.g. 59.99)"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            style={styles.input}
            placeholderTextColor="#6b7280"
          />
          <TextInput
            placeholder="Short Description"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 70 }]}
            multiline
            placeholderTextColor="#6b7280"
          />
          <TextInput
            placeholder="Image URL (paste link here)"
            value={imageUrl}
            onChangeText={setImageUrl}
            style={styles.input}
            placeholderTextColor="#6b7280"
          />

          {/* show a small image preview */}
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: "100%",
                height: 150,
                borderRadius: 8,
                marginBottom: 10,
              }}
            />
          ) : null}

          <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
            <Text style={styles.addBtnText}>Add Gear</Text>
          </TouchableOpacity>
        </View>

        {/* product list */}
        <Text style={styles.sectionHeader}>Marketplace Inventory</Text>
        {products.length === 0 ? (
          <Text style={styles.emptyText}>No products added yet.</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      width: "100%",
                      height: 120,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                ) : null}
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>${item.price}</Text>
                <Text style={styles.productDesc}>{item.description}</Text>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteItem(item.id, item.name)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* user list */}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F4",
  },
  topHeader: {
    backgroundColor: "#098a25ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutBtnTop: {
    backgroundColor: "#E8B64D",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  logoutTextTop: {
    color: "#1B1B1B",
    fontWeight: "600",
  },
  subHeader: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    marginVertical: 12,
  },
  viewUserBtn: {
    backgroundColor: "#E8B64D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 15,
  },
  viewUserText: {
    color: "#1B1B1B",
    fontWeight: "600",
    fontSize: 15,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2F6B3C",
    marginLeft: 20,
    marginBottom: 8,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E8B64D",
  },
  productName: { fontWeight: "bold", fontSize: 16, color: "#1B1B1B" },
  productPrice: { color: "#2F6B3C", fontWeight: "600", marginTop: 3 },
  productDesc: { color: "#4b5563", fontSize: 14, marginTop: 3 },
  deleteBtn: {
    backgroundColor: "#C94B32",
    paddingVertical: 8,
    marginTop: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteText: { color: "white", fontWeight: "bold" },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#8B5E3C",
  },
  userEmail: { fontSize: 15, fontWeight: "600" },
  roleTag: { color: "#2F6B3C", fontSize: 13 },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginVertical: 10,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
