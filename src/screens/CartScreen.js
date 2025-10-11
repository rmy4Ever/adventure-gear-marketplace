import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function CartScreen({ route, navigation }) {
  // grab any existing cart items + the callback from dashboard
  const { cartItems: initialCart = [], onUpdateCart } = route.params;
  const [cartItems, setCartItems] = useState(initialCart);

  // when user navigates back to the cart, make sure it’s updated
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.cartItems) {
        setCartItems(route.params.cartItems);
      }
    }, [route.params?.cartItems])
  );

  // automatically recalculate total whenever cart updates
  const total = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  // add one more item
  const increaseQty = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart);
    if (onUpdateCart) onUpdateCart(updatedCart); // keeps dashboard in sync
  };

  // subtract one (and remove completely if it hits zero)
  const decreaseQty = (id) => {
    const updatedCart = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    setCartItems(updatedCart);
    if (onUpdateCart) onUpdateCart(updatedCart);
  };

  // remove this item completely with one tap
  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    if (onUpdateCart) onUpdateCart(updatedCart);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Cart</Text>

      {/* if cart is empty, just show a friendly message */}
      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        // otherwise, list all cart items
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              {/* product image */}
              <Image source={{ uri: item.image }} style={styles.image} />

              {/* name, price, and quantity controls */}
              <View style={styles.details}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>
                  ${item.price.toFixed(2)} × {item.quantity}
                </Text>

                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => decreaseQty(item.id)}
                  >
                    <Text style={styles.qtyText}>−</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtyValue}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => increaseQty(item.id)}
                  >
                    <Text style={styles.qtyText}>＋</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeItem(item.id)}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* only show checkout section if there are items */}
      {cartItems.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.total}>Total: ${total}</Text>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() =>
              navigation.navigate("CheckoutScreen", { cartItems })
            }
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // main layout
  container: { flex: 1, backgroundColor: "#F4F6F4", padding: 16 },

  // heading at top
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2F6B3C",
    textAlign: "center",
    marginBottom: 10,
  },

  // empty cart message
  empty: {
    textAlign: "center",
    color: "#4F5D4E",
    fontSize: 16,
    marginTop: 50,
  },

  // each item container
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },

  // product thumbnail
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#E6EAE2",
  },

  // text block beside image
  details: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#1B1B1B" },
  price: { fontSize: 14, color: "#3A915F", marginVertical: 4 },

  // quantity row (plus/minus + remove)
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  qtyBtn: {
    backgroundColor: "#CBD5C0",
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  qtyText: { fontSize: 20, color: "#1B1B1B" },
  qtyValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B1B1B",
    marginHorizontal: 10,
  },

  // remove button (right side)
  removeBtn: {
    marginLeft: "auto",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  removeText: {
    color: "#C94B32",
    fontWeight: "bold",
    fontSize: 13,
  },

  // total + checkout button at bottom
  summary: {
    marginTop: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#CBD5C0",
    alignItems: "center",
  },
  total: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2F6B3C",
    marginBottom: 10,
  },
  checkoutBtn: {
    backgroundColor: "#E8B64D",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  checkoutText: {
    color: "#1B1B1B",
    fontWeight: "bold",
    fontSize: 16,
  },
});
