import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if all required Firebase config values are present
const isFirebaseConfigValid = () => {
  return (
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.authDomain &&
    !!firebaseConfig.projectId &&
    !!firebaseConfig.storageBucket &&
    !!firebaseConfig.messagingSenderId &&
    !!firebaseConfig.appId
  )
}

// Initialize Firebase
let app, db, auth

try {
  if (!isFirebaseConfigValid()) {
    console.error("Firebase configuration is incomplete. Check your environment variables.")
  } else {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    db = getFirestore(app)
    auth = getAuth(app)

    // Log successful initialization
    console.log("Firebase initialized successfully")
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
}

export { app, db, auth }
