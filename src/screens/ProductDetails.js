import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

export default function ProductDetails({ route, navigation }) {
  // pull in the product data + callback from the Dashboard
  const { product, onAddToCart } = route.params;

  // track how many of this product the user wants
  const [quantity, setQuantity] = useState(1);

  // when user taps "Add to Cart"
  const handleAdd = () => {
    if (quantity < 1) return; // sanity check
    onAddToCart({ ...product, quantity }); // send item + qty back to dashboard/cart
    Alert.alert(
      "Added to Cart",
      `${quantity} × ${product.name} added successfully!`
    );
  };

  // increase or decrease the item count
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* product image */}
        <Image source={{ uri: product.image }} style={styles.image} />

        {/* name + price section */}
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price}</Text>

        {/* description (fallback text if not provided) */}
        <Text style={styles.description}>
          {product.description ||
            `Whether you're hiking, camping, or exploring new terrain, the ${product.name} is built for reliability and performance.`}
        </Text>

        {/* quantity controls */}
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={decreaseQuantity}>
            <Text style={styles.qtyText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qtyValue}>{quantity}</Text>

          <TouchableOpacity style={styles.qtyBtn} onPress={increaseQuantity}>
            <Text style={styles.qtyText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* add to cart button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>

        {/* back button just returns to dashboard */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // general layout + background
  container: { flex: 1, backgroundColor: "#F4F6F4" },
  scrollContent: { padding: 16, paddingBottom: 100 },

  // product image at the top
  image: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    marginBottom: 16,
  },

  // name + price text
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2F6B3C", // primary green
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: "#E8B64D", // gold accent
    marginBottom: 12,
    fontWeight: "600",
  },

  // description paragraph
  description: {
    fontSize: 15,
    color: "#4F5D4E",
    lineHeight: 22,
  },

  // quantity selector row
  qtyRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  qtyBtn: {
    backgroundColor: "#CBD5C0", // soft neutral background
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  qtyText: { fontSize: 20, color: "#1B1B1B" },
  qtyValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B1B1B",
    marginHorizontal: 15,
  },

  // add-to-cart button
  addButton: {
    backgroundColor: "#2F6B3C",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },

  // back button styled differently to contrast
  backButton: {
    backgroundColor: "#E8B64D",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  backText: {
    color: "#1B1B1B",
    fontWeight: "700",
    fontSize: 15,
  },
});
