import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyAdFrafQ79yR34jnLsZ_z5_bIVvkFKsB4I",
  authDomain: "august-composition-pn50x.firebaseapp.com",
  projectId: "august-composition-pn50x",
  storageBucket: "august-composition-pn50x.firebasestorage.app",
  messagingSenderId: "837545639661",
  appId: "1:837545639661:web:646e940b30b54a47d696e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore DB
export const auth = getAuth(app);
export const db = getFirestore(app);
