import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbG3qKjdGm4VFjJYttBVXD_OJwYA6jREQ",
  authDomain: "gear-market-place.firebaseapp.com",
  projectId: "gear-market-place",
  storageBucket: "gear-market-place.firebasestorage.app",
  messagingSenderId: "685304140745",
  appId: "1:685304140745:web:ba2a958a9bb86fb1e54e18",
  measurementId: "G-GV0MSZ7TQ3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);