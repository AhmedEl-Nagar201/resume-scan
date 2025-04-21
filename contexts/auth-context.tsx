"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  isFirebaseInitialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false)

  useEffect(() => {
    // Check if Firebase Auth is properly initialized
    if (!auth) {
      console.error("Firebase Auth is not initialized. Check your Firebase configuration.")
      setError("Firebase Authentication is not properly configured.")
      setLoading(false)
      return
    }

    setIsFirebaseInitialized(true)

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user)
        setLoading(false)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError(error.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  // Create or update user document in Firestore
  const createUserDocument = async (user: User, additionalData = {}) => {
    if (!user || !db) return

    const userRef = doc(db, "users", user.uid)

    try {
      const userSnapshot = await getDoc(userRef)

      if (!userSnapshot.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp(),
          ...additionalData,
        })
        console.log("User document created in Firestore")
      } else {
        // Update last login time
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
            ...additionalData,
          },
          { merge: true },
        )
      }
    } catch (error) {
      console.error("Error creating user document:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error("Firebase Authentication is not properly configured.")
      }

      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await createUserDocument(userCredential.user, { lastLogin: serverTimestamp() })
    } catch (error: any) {
      console.error("Error signing in:", error)

      // Provide more user-friendly error messages
      let errorMessage = "Failed to sign in. Please check your credentials."
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later."
      } else if (error.code === "auth/configuration-not-found") {
        errorMessage = "Authentication service is not properly configured. Please contact support."
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error("Firebase Authentication is not properly configured.")
      }

      setError(null)

      // Check if Firebase Authentication is enabled in the project
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await createUserDocument(userCredential.user, { createdAt: serverTimestamp() })
      } catch (error: any) {
        if (error.code === "auth/configuration-not-found") {
          throw new Error(
            "Firebase Authentication is not enabled in your Firebase project. Please enable it in the Firebase console.",
          )
        }
        throw error
      }
    } catch (error: any) {
      console.error("Error signing up:", error)

      // Provide more user-friendly error messages
      let errorMessage = "Failed to create account. Please try again."
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use. Please use a different email or try logging in."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password."
      } else if (error.code === "auth/configuration-not-found") {
        errorMessage =
          "Authentication service is not properly configured. Please make sure Firebase Authentication is enabled in your Firebase project."
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const signInWithGoogle = async () => {
    try {
      if (!auth) {
        throw new Error("Firebase Authentication is not properly configured.")
      }

      setError(null)
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      await createUserDocument(userCredential.user, {
        lastLogin: serverTimestamp(),
        authProvider: "google",
      })
    } catch (error: any) {
      console.error("Error signing in with Google:", error)

      let errorMessage = "Failed to sign in with Google. Please try again."
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed before completing the sign-in."
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Sign-in popup was cancelled."
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Sign-in popup was blocked by the browser. Please allow popups for this site."
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const signOut = async () => {
    try {
      if (!auth) {
        throw new Error("Firebase Authentication is not properly configured.")
      }

      setError(null)
      await firebaseSignOut(auth)
    } catch (error: any) {
      console.error("Error signing out:", error)
      setError(error.message || "Failed to sign out.")
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isFirebaseInitialized,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
