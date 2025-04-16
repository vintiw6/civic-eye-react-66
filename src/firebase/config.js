
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxAAH5RdxFu27E8CsOYyp9cC8pMfIGbOY",
  authDomain: "citizenalert-497d9.firebaseapp.com",
  databaseURL: "https://citizenalert-497d9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "citizenalert-497d9",
  storageBucket: "citizenalert-497d9.firebasestorage.app",
  messagingSenderId: "806466831128",
  appId: "1:806466831128:web:e7c1c73d36aeaab798146d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
