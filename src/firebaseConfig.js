import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEAwHQr8icOI-Ct348J1RZCGzCzEokH2g",
  authDomain: "sunnysites-ba2ce.firebaseapp.com",
  projectId: "sunnysites-ba2ce",
  storageBucket: "sunnysites-ba2ce.appspot.com",
  messagingSenderId: "1032381624180",
  appId: "1:1032381624180:web:43bc712864bdc11982c621",
  measurementId: "G-SE60F7JMVC",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
//const auth = getAuth(firebaseApp);

export { db, firebaseApp };
