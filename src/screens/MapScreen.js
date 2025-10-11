import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Constants from "expo-constants";

export default function MapScreen() {
  // state to store weather info, gif, and loading state
  const [weather, setWeather] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // this keeps track of the current location the user tapped
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: -18.1416, // default to Suva
    longitude: 178.4419,
  });

  // pull the API keys from app config
  const weatherApiKey = Constants.expoConfig.extra.openWeatherApiKey;
  const giphyApiKey = Constants.expoConfig.extra.giphyApiKey;

  // function to get both weather and giphy gif based on location
  const fetchWeatherAndGif = async (lat, lon) => {
    try {
      setLoading(true);

      // step 1: call OpenWeather API for live weather info
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`
      );
      const weatherData = await weatherRes.json();

      // just in case weather info doesn’t come through
      if (!weatherData.weather) throw new Error("No weather info found");
      setWeather(weatherData);

      // grab the general condition like “Rain”, “Clouds”, etc.
      const weatherDesc = weatherData.weather[0].main;

      // step 2: use that keyword to fetch a Giphy animation
      const giphyRes = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${weatherDesc}&limit=1`
      );
      const giphyData = await giphyRes.json();

      // if no gif is found, just show a fallback one
      const gif =
        giphyData.data[0]?.images?.downsized_medium?.url ||
        "https://media.giphy.com/media/26tPghhb310e6ShcE/giphy.gif";
      setGifUrl(gif);
    } catch (err) {
      console.error("Weather/GIF fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // when the screen loads, fetch weather for the default location (Suva)
  useEffect(() => {
    fetchWeatherAndGif(selectedLocation.latitude, selectedLocation.longitude);
  }, []);

  // this runs when a user taps somewhere on the map
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    fetchWeatherAndGif(latitude, longitude);
  };

  return (
    <View style={styles.container}>
      {/* map area – user can tap to get weather anywhere */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 3.0,
          longitudeDelta: 3.0,
        }}
        onPress={handleMapPress} // tap on the map to trigger weather update
      >
        <Marker
          coordinate={selectedLocation}
          title="Selected Location"
          description={weather?.weather?.[0]?.description || "Tap map for weather"}
        />
      </MapView>

      {/* weather info box with animation */}
      <View style={styles.weatherBox}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text>Fetching weather data...</Text>
          </View>
        ) : weather ? (
          <>
            <Text style={styles.city}>
              {weather.name || "Unknown Location"}
            </Text>
            <Text style={styles.temp}>{weather.main.temp.toFixed(1)}°C</Text>
            <Text style={styles.desc}>
              {weather.weather[0].description}
            </Text>

            {gifUrl && (
              <Image
                source={{ uri: gifUrl }}
                style={styles.gif}
                resizeMode="contain"
              />
            )}
          </>
        ) : (
          <Text style={{ color: "#6b7280" }}>
            Tap anywhere on the map to see weather info.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "65%" },
  center: { justifyContent: "center", alignItems: "center" },
  weatherBox: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -10,
    elevation: 5,
  },
  city: { fontSize: 22, fontWeight: "bold", color: "#1e3a8a" },
  temp: { fontSize: 36, fontWeight: "700", color: "#2563eb" },
  desc: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  gif: { width: 200, height: 200, marginTop: 10, borderRadius: 10 },
});
