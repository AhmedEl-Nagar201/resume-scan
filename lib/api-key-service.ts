import { db, auth } from "./firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  updateDoc,
  orderBy,
  limit,
} from "firebase/firestore"
import { nanoid } from "nanoid"
import { isCurrentUserAdmin } from "./resume-service"

// Collection name
const API_KEYS_COLLECTION = "api_keys"

// Interface for API key document
export interface ApiKey {
  id: string
  key: string
  name: string
  domain: string
  userId: string
  createdAt: Date
  lastUsed?: Date
  usageCount: number
  isActive: boolean
  allowedFeatures: string[] // e.g., ["resume-builder", "job-matcher"]
}

// Generate a new API key
export async function generateApiKey(
  name: string,
  domain: string,
  allowedFeatures: string[] = ["resume-builder", "job-matcher"],
): Promise<ApiKey> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const userId = auth?.currentUser?.uid

    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Generate a unique API key
    const key = `rsk_${nanoid(32)}`

    // Create a new document in Firestore
    const apiKeyRef = doc(collection(db, API_KEYS_COLLECTION))
    const apiKey: ApiKey = {
      id: apiKeyRef.id,
      key,
      name,
      domain,
      userId,
      createdAt: new Date(),
      usageCount: 0,
      isActive: true,
      allowedFeatures,
    }

    await setDoc(apiKeyRef, {
      ...apiKey,
      createdAt: serverTimestamp(),
    })

    console.log("API key generated:", apiKey.id)
    return apiKey
  } catch (error) {
    console.error("Error generating API key:", error)
    throw new Error(`Failed to generate API key: ${error.message}`)
  }
}

// Get all API keys for the current user
export async function getUserApiKeys(): Promise<ApiKey[]> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const userId = auth?.currentUser?.uid

    if (!userId) {
      throw new Error("User not authenticated")
    }

    const apiKeysQuery = query(
      collection(db, API_KEYS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    )

    const querySnapshot = await getDocs(apiKeysQuery)
    const apiKeys: ApiKey[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      apiKeys.push({
        id: doc.id,
        key: data.key,
        name: data.name,
        domain: data.domain,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastUsed: data.lastUsed?.toDate(),
        usageCount: data.usageCount || 0,
        isActive: data.isActive !== false, // Default to true if not specified
        allowedFeatures: data.allowedFeatures || ["resume-builder", "job-matcher"],
      })
    })

    return apiKeys
  } catch (error) {
    console.error("Error getting user API keys:", error)
    throw new Error(`Failed to get user API keys: ${error.message}`)
  }
}

// Get API key by key string
export async function getApiKeyByKey(keyString: string): Promise<ApiKey | null> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const apiKeysQuery = query(
      collection(db, API_KEYS_COLLECTION),
      where("key", "==", keyString),
      where("isActive", "==", true),
      limit(1),
    )

    const querySnapshot = await getDocs(apiKeysQuery)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()

    // Update usage statistics
    await updateDoc(doc.ref, {
      lastUsed: serverTimestamp(),
      usageCount: (data.usageCount || 0) + 1,
    })

    return {
      id: doc.id,
      key: data.key,
      name: data.name,
      domain: data.domain,
      userId: data.userId,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastUsed: new Date(), // Use current time since we just updated it
      usageCount: (data.usageCount || 0) + 1, // Increment the count
      isActive: data.isActive !== false,
      allowedFeatures: data.allowedFeatures || ["resume-builder", "job-matcher"],
    }
  } catch (error) {
    console.error("Error getting API key:", error)
    throw new Error(`Failed to get API key: ${error.message}`)
  }
}

// Update API key
export async function updateApiKey(id: string, updates: Partial<ApiKey>): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const userId = auth?.currentUser?.uid

    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Get the API key to verify ownership
    const apiKeyRef = doc(db, API_KEYS_COLLECTION, id)
    const apiKeySnap = await getDoc(apiKeyRef)

    if (!apiKeySnap.exists()) {
      throw new Error("API key not found")
    }

    const apiKeyData = apiKeySnap.data()

    // Verify ownership or admin status
    if (apiKeyData.userId !== userId && !(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: You don't have permission to update this API key")
    }

    // Remove fields that shouldn't be updated directly
    const { id: _, key: __, userId: ___, createdAt: ____, ...validUpdates } = updates

    await updateDoc(apiKeyRef, {
      ...validUpdates,
    })

    console.log("API key updated:", id)
  } catch (error) {
    console.error("Error updating API key:", error)
    throw new Error(`Failed to update API key: ${error.message}`)
  }
}

// Delete API key
export async function deleteApiKey(id: string): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    const userId = auth?.currentUser?.uid

    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Get the API key to verify ownership
    const apiKeyRef = doc(db, API_KEYS_COLLECTION, id)
    const apiKeySnap = await getDoc(apiKeyRef)

    if (!apiKeySnap.exists()) {
      throw new Error("API key not found")
    }

    const apiKeyData = apiKeySnap.data()

    // Verify ownership or admin status
    if (apiKeyData.userId !== userId && !(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: You don't have permission to delete this API key")
    }

    await deleteDoc(apiKeyRef)
    console.log("API key deleted:", id)
  } catch (error) {
    console.error("Error deleting API key:", error)
    throw new Error(`Failed to delete API key: ${error.message}`)
  }
}

// Get all API keys (admin only)
export async function getAllApiKeys(): Promise<ApiKey[]> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Check if current user is admin
    if (!(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: Only admins can access this function")
    }

    const apiKeysQuery = query(collection(db, API_KEYS_COLLECTION), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(apiKeysQuery)
    const apiKeys: ApiKey[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      apiKeys.push({
        id: doc.id,
        key: data.key,
        name: data.name,
        domain: data.domain,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastUsed: data.lastUsed?.toDate(),
        usageCount: data.usageCount || 0,
        isActive: data.isActive !== false,
        allowedFeatures: data.allowedFeatures || ["resume-builder", "job-matcher"],
      })
    })

    return apiKeys
  } catch (error) {
    console.error("Error getting all API keys:", error)
    throw new Error(`Failed to get all API keys: ${error.message}`)
  }
}

// Validate API key for a specific domain and feature
export async function validateApiKey(keyString: string, domain: string, feature: string): Promise<boolean> {
  try {
    console.log(`Validating API key for domain: ${domain}, feature: ${feature}`)

    const apiKey = await getApiKeyByKey(keyString)

    if (!apiKey) {
      console.log("API key not found:", keyString)
      return false
    }

    // Check if the key is active
    if (!apiKey.isActive) {
      console.log("API key is not active")
      return false
    }

    // Special case for local testing - accept any local domain
    const localDomains = ["localhost", "127.0.0.1", "::1"]
    const isLocalDomain =
      localDomains.includes(domain) ||
      domain.includes("localhost:") ||
      domain.includes("127.0.0.1:") ||
      domain === "unknown" // Sometimes referrer is unknown in local testing

    const isApiKeyLocalDomain =
      localDomains.includes(apiKey.domain) || apiKey.domain.includes("localhost:") || apiKey.domain === "*"

    // For local testing, be more permissive with domain validation
    if (isLocalDomain) {
      console.log("Local testing detected. API key domain:", apiKey.domain)

      // If we're testing locally and the API key is for a local domain or wildcard, allow it
      if (isApiKeyLocalDomain) {
        console.log("Local domain match for local testing")

        // Still check if the feature is allowed
        const featureAllowed = apiKey.allowedFeatures.includes(feature) || apiKey.allowedFeatures.includes("*")

        if (!featureAllowed) {
          console.log(`Feature not allowed: '${feature}' not in [${apiKey.allowedFeatures.join(", ")}]`)
        }

        return featureAllowed
      }
    }

    // Regular domain validation for non-localhost
    if (apiKey.domain !== "*" && apiKey.domain !== domain) {
      // Check if the domain is a subdomain of the allowed domain
      const isSubdomain = domain.endsWith(`.${apiKey.domain}`)
      if (!isSubdomain) {
        console.log(`Domain mismatch: Key allows '${apiKey.domain}', request from '${domain}'`)
        return false
      }
    }

    // Check if the feature is allowed
    if (!apiKey.allowedFeatures.includes(feature) && !apiKey.allowedFeatures.includes("*")) {
      console.log(`Feature not allowed: '${feature}' not in [${apiKey.allowedFeatures.join(", ")}]`)
      return false
    }

    console.log("API key validation successful")
    return true
  } catch (error) {
    console.error("Error validating API key:", error)
    return false
  }
}
