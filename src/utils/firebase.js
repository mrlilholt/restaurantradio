// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBE-tTGjKKp7CubFxvA86GNEepq6YkEqOo",
  authDomain: "restaurant-radio.firebaseapp.com",
  projectId: "restaurant-radio",
  storageBucket: "restaurant-radio.firebasestorage.app",
  messagingSenderId: "476039958992",
  appId: "1:476039958992:web:8d2ff396f9673c4bf5a9d5",
  measurementId: "G-K7LZRY02HX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);