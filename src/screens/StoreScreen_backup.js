import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const StoreScreen = ({ navigation }) => {
  const products = [
    { id: '1', name: 'Tent XL', price: 150, image: 'https://via.placeholder.com/100' },
    { id: '2', name: 'Hiking Boots', price: 80, image: 'https://via.placeholder.com/100' },
    { id: '3', name: 'Sleeping Bag', price: 60, image: 'https://via.placeholder.com/100' },
  ];

  const renderProduct = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Product', { product: item })}>
      <View style={styles.productItem}>
        <Text>{item.name} - ${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Adventure Gear Store</Text>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          style={styles.productList}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, textAlign: 'center', margin: 10 },
  productList: { flex: 1 },
  productItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});

export default StoreScreen;