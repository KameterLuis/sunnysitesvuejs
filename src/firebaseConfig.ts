import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "sunny-sites-517e5.firebaseapp.com",
  projectId: "sunny-sites-517e5",
  storageBucket: "sunny-sites-517e5.appspot.com",
  messagingSenderId: "321699843935",
  appId: "1:321699843935:web:c14c692842cd273109f0ea",
  measurementId: "G-BHB9RT8Q6H",
};

const firebaseApp = initializeApp(firebaseConfig);

const db = initializeFirestore(firebaseApp, {});

export { db, firebaseApp };
