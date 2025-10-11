import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const MapScreen = () => {
  const [weather, setWeather] = useState(null);
  const lat = -17.7134; // Suva, Fiji (update to Yosemite if desired)
  const lon = 178.0650;
  const apiKey = 'YOUR_VALID_OPENWEATHERMAP_KEY'; // Replace with your key

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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {weather && (
          <View style={styles.weather}>
            <Text style={styles.weatherText}>
              Weather in Suva: {weather.main.temp}°C, {weather.weather[0].description}
            </Text>
          </View>
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
            title="Gear Store"
            description="Local adventure gear hub"
          />
        </MapView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  weather: { padding: 10, backgroundColor: '#f0f0f0' },
  weatherText: { fontSize: 16, textAlign: 'center' },
  map: { flex: 1 },
});

export default MapScreen;