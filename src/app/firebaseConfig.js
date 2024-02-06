// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwkJYeJtdBDoAKXT5iVBZOufw27llBSzA",
  authDomain: "fir-offline-9dbff.firebaseapp.com",
  projectId: "fir-offline-9dbff",
  storageBucket: "fir-offline-9dbff.appspot.com",
  messagingSenderId: "860031926128",
  appId: "1:860031926128:web:6e9a19652653c5de8099b5",
  measurementId: "G-5Z4Y7T0BTL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;