import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4gSV46B43oKgAVJc61i2xTmtqf9Z-Cdg",
  authDomain: "mapitsi-ams.firebaseapp.com",
  projectId: "mapitsi-ams",
  storageBucket: "mapitsi-ams.firebasestorage.app",
  messagingSenderId: "815897357003",
  appId: "1:815897357003:web:793b6f91584b77bb5ac94e",
  measurementId: "G-CK1V19GFQT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, signInAnonymously, onAuthStateChanged, signOut };