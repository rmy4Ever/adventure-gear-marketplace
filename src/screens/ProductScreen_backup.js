import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';

const ProductScreen = ({ route }) => {
  const { product } = route.params;
  const [weather, setWeather] = useState(null);
  const lat = 37.8651; // Yosemite National Park
  const lon = -119.5383;
  const apiKey = 'your_openweathermap_api_key'; // Replace with your key

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{product.name}</Text>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.price}>Price: ${product.price}</Text>
      {weather && (
        <Text style={styles.weather}>
          Weather in Yosemite: {weather.main.temp}°C, {weather.weather[0].description}
        </Text>
      )}
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
          title="Yosemite Trail"
        />
      </MapView>
      <TouchableOpacity style={styles.button} onPress={() => alert('Added to Cart!')}>
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 20, textAlign: 'center', margin: 10 },
  image: { width: 100, height: 100, alignSelf: 'center' },
  price: { fontSize: 16, textAlign: 'center', margin: 10 },
  weather: { fontSize: 16, textAlign: 'center', margin: 10 },
  map: { flex: 1, marginVertical: 10 },
  button: { backgroundColor: '#28a745', padding: 10, borderRadius: 5 },
  buttonText: { color: 'white', textAlign: 'center' },
});

export default ProductScreen;