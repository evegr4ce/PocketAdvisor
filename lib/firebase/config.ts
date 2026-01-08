import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAfxtrw1wrOBjk3l1Ff928-MF8dCRfMlpg",
  authDomain: "pocketadvisor-9620d.firebaseapp.com",
  projectId: "pocketadvisor-9620d",
  storageBucket: "pocketadvisor-9620d.firebasestorage.app",
  messagingSenderId: "589268023148",
  appId: "1:589268023148:web:bbc553c56508e5a45b6549",
  measurementId: "G-WBGPCHGS0Q",
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Analytics only works in browser
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  
  if (typeof window !== "undefined" && !analytics) {
    analytics = getAnalytics(app);
  }
}

export { app, auth, db, analytics };
