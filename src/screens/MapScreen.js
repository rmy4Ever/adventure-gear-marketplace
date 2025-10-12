// MapScreen.js — user can name trails before saving, delete later if needed
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export default function MapScreen() {
  const [trailMarkers, setTrailMarkers] = useState([]); // saved trails
  const [selectedLocation, setSelectedLocation] = useState(null); // what user tapped
  const [weather, setWeather] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTrailId, setSelectedTrailId] = useState(null);
  const [customTrailName, setCustomTrailName] = useState(""); // input field for Android naming
  const [isNaming, setIsNaming] = useState(false); // toggle for naming input

  const weatherApiKey = Constants.expoConfig.extra.openWeatherApiKey;
  const giphyApiKey = Constants.expoConfig.extra.giphyApiKey;

  // this just helps make Giphy look better
  const weatherKeywordMap = {
    Rain: "heavy tropical rain storm",
    Clouds: "cloudy sky ocean breeze",
    Clear: "sunny island paradise beach",
    Thunderstorm: "lightning thunder tropical storm",
    Mist: "foggy morning mountains",
    Drizzle: "light rain drizzle umbrella",
    Snow: "snowfall mountain winter",
    Wind: "windy weather leaves flying",
    Fog: "fog rolling hills",
  };

  // load saved trails
  useEffect(() => {
    const loadMarkers = async () => {
      try {
        const saved = await AsyncStorage.getItem("trailMarkers");
        if (saved) setTrailMarkers(JSON.parse(saved));
      } catch (err) {
        console.log("failed to load markers:", err);
      }
    };
    loadMarkers();
  }, []);

  const saveMarkers = async (markers) => {
    try {
      await AsyncStorage.setItem("trailMarkers", JSON.stringify(markers));
    } catch (err) {
      console.log("failed to save markers:", err);
    }
  };

  // when the user taps on the map (not a marker)
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedTrailId(null);
    setSelectedLocation({ latitude, longitude });
    fetchWeatherAndGif(latitude, longitude);
  };

  // when user taps on an existing trail
  const handleTrailSelect = (marker) => {
    setSelectedTrailId(marker.id);
    setSelectedLocation({
      latitude: marker.latitude,
      longitude: marker.longitude,
    });
    fetchWeatherAndGif(marker.latitude, marker.longitude);
  };

  // get the weather and gif for that spot
  const fetchWeatherAndGif = async (lat, lon) => {
    try {
      setLoading(true);
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`
      );
      const weatherData = await weatherRes.json();
      if (!weatherData.weather) throw new Error("No weather info found");
      setWeather(weatherData);

      const weatherDesc = weatherData.weather[0].main;
      const keyword =
        weatherKeywordMap[weatherDesc] || `${weatherDesc} weather nature`;
      const searchQuery = `${keyword} in ${weatherData.name || "nature"}`;

      const giphyRes = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&rating=g`
      );
      const giphyData = await giphyRes.json();

      const randomIndex = Math.floor(Math.random() * giphyData.data.length);
      const gif =
        giphyData.data[randomIndex]?.images?.downsized_medium?.url ||
        "https://media.giphy.com/media/26tPghhb310e6ShcE/giphy.gif";
      setGifUrl(gif);
    } catch (err) {
      console.error("Weather/GIF fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // share a new trail (ask for name first)
  const handleShareTrail = async () => {
    if (!selectedLocation || !weather) {
      Alert.alert("Hold up", "Tap a spot on the map first.");
      return;
    }

    // use Alert.prompt on iOS
    if (Platform.OS === "ios") {
      Alert.prompt(
        "Name Your Trail",
        "Enter a name for this trail:",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Save",
            onPress: (trailName) => saveTrailWithName(trailName || "Unnamed Trail"),
          },
        ],
        "plain-text"
      );
    } else {
      // for Android, open inline text box
      setIsNaming(true);
    }
  };

  // helper to save trail with given name
  const saveTrailWithName = (trailName) => {
    const newTrail = {
      id: Date.now().toString(),
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      title: trailName,
    };

    const updated = [...trailMarkers, newTrail];
    setTrailMarkers(updated);
    saveMarkers(updated);
    setSelectedLocation(null);
    setCustomTrailName("");
    setIsNaming(false);

    Alert.alert("Trail Shared", `${trailName} added to your map.`);
  };

  // delete a saved trail
  const handleDeleteTrail = () => {
    const trail = trailMarkers.find((t) => t.id === selectedTrailId);
    if (!trail) return;

    Alert.alert(
      "Remove Trail?",
      `Do you want to delete ${trail.title || "this trail"} from your map?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = trailMarkers.filter((t) => t.id !== selectedTrailId);
            setTrailMarkers(updated);
            saveMarkers(updated);
            setSelectedTrailId(null);
            setSelectedLocation(null);
            Alert.alert("Trail Removed", `${trail.title} was deleted.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Map area */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -18.1416,
          longitude: 178.4419,
          latitudeDelta: 3.0,
          longitudeDelta: 3.0,
        }}
        onPress={handleMapPress}
      >
        {trailMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            pinColor={marker.id === selectedTrailId ? "#E8B64D" : "#2F6B3C"}
            onPress={(e) => {
              e.stopPropagation(); // stops map press firing behind it
              handleTrailSelect(marker);
            }}
          />
        ))}

        {selectedLocation && !selectedTrailId && (
          <Marker
            coordinate={selectedLocation}
            title="Selected Trail"
            pinColor="#E8B64D"
          />
        )}
      </MapView>

      {/* info + buttons */}
      <ScrollView contentContainerStyle={styles.weatherBox}>
        <Text style={styles.title}>Your Adventure Trails</Text>
        <Text style={styles.subtitle}>
          Tap on the map to name and share your trail. Tap a saved pin to delete it.
        </Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text>Fetching weather data...</Text>
          </View>
        ) : weather ? (
          <>
            <Text style={styles.city}>{weather.name || "Unknown Location"}</Text>
            <Text style={styles.temp}>{weather.main.temp.toFixed(1)}°C</Text>
            <Text style={styles.desc}>{weather.weather[0].description}</Text>
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
            Tap anywhere on the map to preview your trail.
          </Text>
        )}

        {isNaming ? (
          <>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter trail name..."
              value={customTrailName}
              onChangeText={setCustomTrailName}
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => saveTrailWithName(customTrailName || "Unnamed Trail")}
            >
              <Text style={styles.actionText}>Save Trail</Text>
            </TouchableOpacity>
          </>
        ) : selectedTrailId ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#C94B32" }]}
            onPress={handleDeleteTrail}
          >
            <Text style={styles.actionText}>Delete Trail</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionButton} onPress={handleShareTrail}>
            <Text style={styles.actionText}>Share Trail</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F4" },
  map: { width: "100%", height: "55%" },
  center: { justifyContent: "center", alignItems: "center" },
  weatherBox: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -10,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#2F6B3C", textAlign: "center" },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginVertical: 8,
  },
  city: { fontSize: 22, fontWeight: "bold", color: "#1e3a8a" },
  temp: { fontSize: 36, fontWeight: "700", color: "#2563eb" },
  desc: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  gif: {
    width: 220,
    height: 220,
    marginTop: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#C7D3CA",
    borderRadius: 8,
    width: "80%",
    padding: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  actionButton: {
    backgroundColor: "#2F6B3C",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
