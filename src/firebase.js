// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC1exOirsSxGKNzF_OiaXPWUOpEF-lLYQ0",
  authDomain: "sowani-cb945.firebaseapp.com",
  projectId: "sowani-cb945",
  storageBucket: "sowani-cb945.firebasestorage.app",
  messagingSenderId: "386338102479",
  appId: "1:386338102479:web:7d166cc1c02bccdd8bebba",
  measurementId: "G-V3BGP3ML7J",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);
