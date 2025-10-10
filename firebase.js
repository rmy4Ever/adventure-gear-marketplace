import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseConfig } from "./firebaseConfig"; // make sure this path is correct

// --- Initialize Firebase App ---
const app = initializeApp(firebaseConfig);

// --- Set up Auth (handles persistence for both web and mobile) ---
let auth;

if (typeof window !== "undefined") {
  // web-based environment
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence);
} else {
  // native environment (Expo / React Native)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// --- Initialize Firestore ---
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

// --- Export instances ---
export { auth, db };
