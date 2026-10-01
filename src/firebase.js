import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZqnXMmVatE3p6INYnFwjLo07mMJwLtL4",
  authDomain: "tvmax-545f4.firebaseapp.com",
  projectId: "tvmax-545f4",
  storageBucket: "tvmax-545f4.firebasestorage.app",
  messagingSenderId: "301615195233",
  appId: "1:301615195233:web:537c61320f9a6f5339f620",
  measurementId: "G-L9F5Y4CZ89"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
