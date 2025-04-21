import { db, auth } from "./firebase"
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  orderBy,
  setDoc,
  limit,
} from "firebase/firestore"
import type { ResumeData } from "@/components/resume-form"

// Collection name
const RESUMES_COLLECTION = "resumes"
const USERS_COLLECTION = "users"

// Interface for resume document with metadata
export interface ResumeDocument {
  id: string
  name: string
  data: ResumeData
  userId: string | null
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
}

// Interface for user document
export interface UserDocument {
  id: string
  email: string
  displayName: string
  photoURL: string
  createdAt: Date
  lastLogin: Date
  isAdmin: boolean
}

// Save a new resume
export async function saveResume(resumeData: ResumeData, name: string): Promise<string> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Get current user ID if authenticated
    const userId = auth?.currentUser?.uid || null

    if (!userId) {
      console.warn("No authenticated user found when saving resume. Resume will be saved anonymously.")
    }

    // Create a new document in Firestore
    const docRef = await addDoc(collection(db, RESUMES_COLLECTION), {
      name,
      data: resumeData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublic: false,
    })

    console.log("Resume saved with ID:", docRef.id)

    // Also save to user's resumes subcollection if authenticated
    if (userId) {
      await setDoc(doc(db, `users/${userId}/resumes`, docRef.id), {
        name,
        data: resumeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublic: false,
      })
      console.log("Resume also saved to user's personal collection")
    }

    return docRef.id
  } catch (error) {
    console.error("Error saving resume:", error)
    throw new Error(`Failed to save resume: ${error.message}`)
  }
}

// Update an existing resume
export async function updateResume(resumeId: string, resumeData: ResumeData, name: string): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const resumeRef = doc(db, RESUMES_COLLECTION, resumeId)
    const userId = auth?.currentUser?.uid || null

    await updateDoc(resumeRef, {
      name,
      data: resumeData,
      updatedAt: serverTimestamp(),
    })

    console.log("Resume updated:", resumeId)

    // Also update in user's resumes subcollection if authenticated
    if (userId) {
      const userResumeRef = doc(db, `users/${userId}/resumes`, resumeId)
      await updateDoc(userResumeRef, {
        name,
        data: resumeData,
        updatedAt: serverTimestamp(),
      })
      console.log("Resume also updated in user's personal collection")
    }
  } catch (error) {
    console.error("Error updating resume:", error)
    throw new Error(`Failed to update resume: ${error.message}`)
  }
}

// Get a resume by ID
export async function getResumeById(resumeId: string): Promise<ResumeDocument | null> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const resumeRef = doc(db, RESUMES_COLLECTION, resumeId)
    const resumeSnap = await getDoc(resumeRef)

    if (resumeSnap.exists()) {
      const data = resumeSnap.data()
      return {
        id: resumeSnap.id,
        name: data.name,
        data: data.data,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isPublic: data.isPublic || false,
      }
    } else {
      console.log("No resume found with ID:", resumeId)
      return null
    }
  } catch (error) {
    console.error("Error getting resume:", error)
    throw new Error(`Failed to get resume: ${error.message}`)
  }
}

// Get all resumes for the current user
export async function getUserResumes(): Promise<ResumeDocument[]> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const userId = auth?.currentUser?.uid

    if (!userId) {
      console.log("No authenticated user")
      return []
    }

    // First try to get from user's subcollection for better performance
    const userResumesQuery = query(collection(db, `users/${userId}/resumes`), orderBy("updatedAt", "desc"))

    const userResumesSnapshot = await getDocs(userResumesQuery)

    if (!userResumesSnapshot.empty) {
      const resumes: ResumeDocument[] = []

      userResumesSnapshot.forEach((doc) => {
        const data = doc.data()
        resumes.push({
          id: doc.id,
          name: data.name,
          data: data.data,
          userId: userId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          isPublic: data.isPublic || false,
        })
      })

      return resumes
    }

    // Fallback to main collection if subcollection is empty
    const resumesQuery = query(
      collection(db, RESUMES_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
    )

    const querySnapshot = await getDocs(resumesQuery)
    const resumes: ResumeDocument[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      resumes.push({
        id: doc.id,
        name: data.name,
        data: data.data,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isPublic: data.isPublic || false,
      })
    })

    return resumes
  } catch (error) {
    console.error("Error getting user resumes:", error)
    throw new Error(`Failed to get user resumes: ${error.message}`)
  }
}

// Get the most recent resume for the current user
export async function getMostRecentResume(): Promise<ResumeDocument | null> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const userId = auth?.currentUser?.uid

    if (!userId) {
      console.log("No authenticated user")
      return null
    }

    // First try to get from user's subcollection for better performance
    const userResumesQuery = query(collection(db, `users/${userId}/resumes`), orderBy("updatedAt", "desc"), limit(1))

    const userResumesSnapshot = await getDocs(userResumesQuery)

    if (!userResumesSnapshot.empty) {
      const doc = userResumesSnapshot.docs[0]
      const data = doc.data()

      return {
        id: doc.id,
        name: data.name,
        data: data.data,
        userId: userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isPublic: data.isPublic || false,
      }
    }

    // Fallback to main collection if subcollection is empty
    const resumesQuery = query(
      collection(db, RESUMES_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(1),
    )

    const querySnapshot = await getDocs(resumesQuery)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()

      return {
        id: doc.id,
        name: data.name,
        data: data.data,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isPublic: data.isPublic || false,
      }
    }

    return null
  } catch (error) {
    console.error("Error getting most recent resume:", error)
    throw new Error(`Failed to get most recent resume: ${error.message}`)
  }
}

// Delete a resume
export async function deleteResume(resumeId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const userId = auth?.currentUser?.uid

    // Delete from main collection
    await deleteDoc(doc(db, RESUMES_COLLECTION, resumeId))
    console.log("Resume deleted from main collection:", resumeId)

    // Also delete from user's subcollection if authenticated
    if (userId) {
      await deleteDoc(doc(db, `users/${userId}/resumes`, resumeId))
      console.log("Resume also deleted from user's personal collection")
    }
  } catch (error) {
    console.error("Error deleting resume:", error)
    throw new Error(`Failed to delete resume: ${error.message}`)
  }
}

// Get all public resumes
export async function getPublicResumes(): Promise<ResumeDocument[]> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const resumesQuery = query(
      collection(db, RESUMES_COLLECTION),
      where("isPublic", "==", true),
      orderBy("updatedAt", "desc"),
    )

    const querySnapshot = await getDocs(resumesQuery)
    const resumes: ResumeDocument[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      resumes.push({
        id: doc.id,
        name: data.name,
        data: data.data,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isPublic: data.isPublic || false,
      })
    })

    return resumes
  } catch (error) {
    console.error("Error getting public resumes:", error)
    throw new Error(`Failed to get public resumes: ${error.message}`)
  }
}

// Toggle resume public status
export async function toggleResumePublicStatus(resumeId: string, isPublic: boolean): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const userId = auth?.currentUser?.uid

    // Update in main collection
    const resumeRef = doc(db, RESUMES_COLLECTION, resumeId)
    await updateDoc(resumeRef, {
      isPublic,
      updatedAt: serverTimestamp(),
    })

    console.log(`Resume ${isPublic ? "published" : "unpublished"}:`, resumeId)

    // Also update in user's subcollection if authenticated
    if (userId) {
      const userResumeRef = doc(db, `users/${userId}/resumes`, resumeId)
      await updateDoc(userResumeRef, {
        isPublic,
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error toggling resume public status:", error)
    throw new Error(`Failed to toggle resume public status: ${error.message}`)
  }
}

// Save anonymous resume (for non-authenticated users)
export async function saveAnonymousResume(resumeData: ResumeData, name: string): Promise<string> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Create a new document in Firestore with a null userId
    const docRef = await addDoc(collection(db, RESUMES_COLLECTION), {
      name,
      data: resumeData,
      userId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublic: false,
    })

    console.log("Anonymous resume saved with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error saving anonymous resume:", error)
    throw new Error(`Failed to save anonymous resume: ${error.message}`)
  }
}

// Claim anonymous resumes when a user logs in
export async function claimAnonymousResumes(anonymousResumeIds: string[]): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const userId = auth?.currentUser?.uid

    if (!userId || anonymousResumeIds.length === 0) {
      return
    }

    // Update each resume to associate with the current user
    for (const resumeId of anonymousResumeIds) {
      const resumeRef = doc(db, RESUMES_COLLECTION, resumeId)
      const resumeSnap = await getDoc(resumeRef)

      if (resumeSnap.exists() && resumeSnap.data().userId === null) {
        // Update the main collection
        await updateDoc(resumeRef, {
          userId,
          updatedAt: serverTimestamp(),
        })

        // Also add to user's subcollection
        const resumeData = resumeSnap.data()
        await setDoc(doc(db, `users/${userId}/resumes`, resumeId), {
          name: resumeData.name,
          data: resumeData.data,
          createdAt: resumeData.createdAt,
          updatedAt: serverTimestamp(),
          isPublic: resumeData.isPublic || false,
        })

        console.log(`Anonymous resume ${resumeId} claimed by user ${userId}`)
      }
    }
  } catch (error) {
    console.error("Error claiming anonymous resumes:", error)
    throw new Error(`Failed to claim anonymous resumes: ${error.message}`)
  }
}

// Update the resume form component to automatically save to Firestore
export async function autoSaveResume(resumeData: ResumeData): Promise<void> {
  try {
    const userId = auth?.currentUser?.uid

    if (!userId) {
      // Just save to localStorage if not authenticated
      localStorage.setItem("autoSavedResume", JSON.stringify(resumeData))
      return
    }

    // Check if there's an existing resume ID in localStorage
    const existingResumeId = localStorage.getItem("currentResumeId")
    const resumeName = localStorage.getItem("currentResumeName") || "Untitled Resume"

    if (existingResumeId) {
      await updateResume(existingResumeId, resumeData, resumeName)
    } else {
      const newResumeId = await saveResume(resumeData, resumeName)
      localStorage.setItem("currentResumeId", newResumeId)
    }

    // Also save to localStorage as backup
    localStorage.setItem("autoSavedResume", JSON.stringify(resumeData))
  } catch (error) {
    console.error("Error auto-saving resume:", error)
    // Still save to localStorage even if Firestore save fails
    localStorage.setItem("autoSavedResume", JSON.stringify(resumeData))
  }
}

// Admin functions

// Check if the current user is an admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    if (!db || !auth?.currentUser) {
      return false
    }

    const userRef = doc(db, USERS_COLLECTION, auth.currentUser.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return userSnap.data().isAdmin === true
    }

    return false
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Get all users (admin only)
export async function getAllUsers(): Promise<UserDocument[]> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Check if current user is admin
    if (!(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: Only admins can access this function")
    }

    const usersQuery = query(collection(db, USERS_COLLECTION), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(usersQuery)
    const users: UserDocument[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        id: doc.id,
        email: data.email || "",
        displayName: data.displayName || "",
        photoURL: data.photoURL || "",
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate() || new Date(),
        isAdmin: data.isAdmin === true,
      })
    })

    return users
  } catch (error) {
    console.error("Error getting all users:", error)
    throw new Error(`Failed to get users: ${error.message}`)
  }
}

// Get all resumes (admin only)
export async function getAllResumes(): Promise<ResumeDocument[]> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Check if current user is admin
    if (!(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: Only admins can access this function")
    }

    const resumesQuery = query(collection(db, RESUMES_COLLECTION), orderBy("updatedAt", "desc"))
    const querySnapshot = await getDocs(resumesQuery)
    const resumes: ResumeDocument[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      resumes.push({
        id: doc.id,
        name: data.name,
        data: data.data,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isPublic: data.isPublic || false,
      })
    })

    return resumes
  } catch (error) {
    console.error("Error getting all resumes:", error)
    throw new Error(`Failed to get resumes: ${error.message}`)
  }
}

// Get resumes for a specific user (admin only)
export async function getUserResumesById(userId: string): Promise<ResumeDocument[]> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Check if current user is admin
    if (!(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: Only admins can access this function")
    }

    const resumesQuery = query(
      collection(db, RESUMES_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
    )

    const querySnapshot = await getDocs(resumesQuery)
    const resumes: ResumeDocument[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      resumes.push({
        id: doc.id,
        name: data.name,
        data: data.data,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isPublic: data.isPublic || false,
      })
    })

    return resumes
  } catch (error) {
    console.error(`Error getting resumes for user ${userId}:`, error)
    throw new Error(`Failed to get user resumes: ${error.message}`)
  }
}

// Set user as admin (admin only)
export async function setUserAsAdmin(userId: string, isAdmin: boolean): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Check if current user is admin
    if (!(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: Only admins can access this function")
    }

    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      isAdmin,
      updatedAt: serverTimestamp(),
    })

    console.log(`User ${userId} admin status set to ${isAdmin}`)
  } catch (error) {
    console.error(`Error setting admin status for user ${userId}:`, error)
    throw new Error(`Failed to set admin status: ${error.message}`)
  }
}

// Delete user (admin only)
export async function deleteUserById(userId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Check if current user is admin
    if (!(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: Only admins can access this function")
    }

    // Delete user document
    await deleteDoc(doc(db, USERS_COLLECTION, userId))

    // Delete all user's resumes
    const resumesQuery = query(collection(db, RESUMES_COLLECTION), where("userId", "==", userId))
    const resumesSnapshot = await getDocs(resumesQuery)

    const batch = db.batch()
    resumesSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    console.log(`User ${userId} and all their resumes deleted`)
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error)
    throw new Error(`Failed to delete user: ${error.message}`)
  }
}
