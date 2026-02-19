import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAv0w9mgKlQueq5kBCtOnGseXzbEorGKuE",
  authDomain: "hotel-erp-a8e38.firebaseapp.com",
  projectId: "hotel-erp-a8e38",
  storageBucket: "hotel-erp-a8e38.firebasestorage.app",
  messagingSenderId: "344378058320",
  appId: "1:344378058320:web:2a3dec0e91cac5883d9355",
  measurementId: "G-8HPK0XPW06"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
