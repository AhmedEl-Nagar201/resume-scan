import { db, auth } from "./firebase"
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp, query, orderBy } from "firebase/firestore"
import { isCurrentUserAdmin } from "./resume-service"

// Collection name
const PROMPTS_COLLECTION = "prompts"

// Interface for prompt document
export interface Prompt {
  id: string
  name: string
  description: string
  content: string
  defaultContent: string
  updatedAt: Date
}

// Default prompts
const DEFAULT_PROMPTS = {
  "analyze-job-match": {
    name: "Analyze Job Match",
    description: "Prompt used to analyze how well a resume matches a job description",
    content: `
You are an expert resume analyst and career coach. You need to analyze how well a resume matches a job description.

RESUME:
{resumeText}

JOB DESCRIPTION:
{jobDescription}

Analyze the match between the resume and job description. Provide the following:
1. Overall match percentage (0-100)
2. List of skills mentioned in the job description that are missing from the resume
3. Relevant experience the candidate has vs. what's missing
4. Specific suggestions for improving sections of the resume to better match the job

Format your response as a JSON object with the following structure:
{
  "overallMatch": number,
  "missingSkills": string[],
  "relevantExperience": {
    "has": string[],
    "missing": string[]
  },
  "improvementSuggestions": [
    {
      "section": string,
      "current": string,
      "improved": string
    }
  ]
}

IMPORTANT: Your response must be valid JSON. Do not include any text before or after the JSON object.
Do not include markdown formatting or code blocks. Just return the raw JSON object.
`,
  },
  "identify-sections-to-improve": {
    name: "Identify Sections to Improve",
    description: "Prompt used to identify which sections of the resume need improvement",
    content: `
You are an expert resume analyst. Based on the job description and match analysis, identify which sections of the resume need improvement.

JOB DESCRIPTION:
{jobDescription}

MATCH ANALYSIS:
{matchAnalysis}

RESUME SECTIONS:
- summary: The professional summary
- skills: The skills section
{experienceSections}
{educationSections}

Return a JSON array of section identifiers that need improvement. For example:
["summary", "skills", "experience-1"]

IMPORTANT: Your response must be valid JSON. Do not include any text before or after the JSON array.
`,
  },
  "improve-section": {
    name: "Improve Section",
    description: "Prompt used to improve a specific section of the resume",
    content: `
You are an expert resume writer with years of experience helping job seekers optimize their resumes for specific positions.

JOB DESCRIPTION:
{jobDescription}

SECTION TO IMPROVE: {sectionType}

CURRENT CONTENT:
{currentContent}

MATCH ANALYSIS:
{matchAnalysis}

Your task is to improve this section to better match the job description. Make the following improvements:
1. Add relevant keywords from the job description
2. Highlight relevant qualifications and experiences
3. Use action verbs and quantifiable achievements
4. Maintain a professional tone
{skillsInstruction}

Return only the improved content without any additional text or explanation.
Do Not Use Bold or any text formatting, output as .txt not .md
`,
  },
}

// Get default prompts without requiring database access
export function getDefaultPrompts(): Prompt[] {
  return Object.entries(DEFAULT_PROMPTS).map(([id, prompt]) => ({
    id,
    name: prompt.name,
    description: prompt.description,
    content: prompt.content,
    defaultContent: prompt.content,
    updatedAt: new Date(),
  }))
}

// Initialize prompts in Firestore if they don't exist (admin only)
export async function initializePrompts(): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Check if current user is admin
    if (!(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: Only admins can initialize prompts")
    }

    // Check if prompts collection exists and has documents
    const promptsQuery = query(collection(db, PROMPTS_COLLECTION))
    const promptsSnapshot = await getDocs(promptsQuery)

    if (promptsSnapshot.empty) {
      console.log("Initializing default prompts in Firestore...")

      // Create default prompts
      for (const [id, prompt] of Object.entries(DEFAULT_PROMPTS)) {
        await setDoc(doc(db, PROMPTS_COLLECTION, id), {
          name: prompt.name,
          description: prompt.description,
          content: prompt.content,
          defaultContent: prompt.content,
          updatedAt: serverTimestamp(),
        })
      }

      console.log("Default prompts initialized successfully")
    }
  } catch (error) {
    console.error("Error initializing prompts:", error)
    throw error
  }
}

// Get all prompts
export async function getPrompts(): Promise<Prompt[]> {
  try {
    if (!db || !auth.currentUser) {
      console.log("Firestore not initialized or user not logged in, returning default prompts")
      return getDefaultPrompts()
    }

    // Check if user is admin
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
      console.log("User is not an admin, returning default prompts")
      return getDefaultPrompts()
    }

    try {
      // Try to initialize prompts if they don't exist
      await initializePrompts()
    } catch (error) {
      console.warn("Could not initialize prompts:", error)
      // Continue anyway, we'll try to read existing prompts
    }

    try {
      const promptsQuery = query(collection(db, PROMPTS_COLLECTION), orderBy("name"))
      const promptsSnapshot = await getDocs(promptsQuery)

      if (promptsSnapshot.empty) {
        console.log("No prompts found in database, returning default prompts")
        return getDefaultPrompts()
      }

      const prompts: Prompt[] = []

      promptsSnapshot.forEach((doc) => {
        const data = doc.data()
        prompts.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          content: data.content,
          defaultContent: data.defaultContent,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        })
      })

      return prompts
    } catch (error) {
      console.error("Error fetching prompts from database:", error)
      return getDefaultPrompts()
    }
  } catch (error) {
    console.error("Error getting prompts:", error)
    // Return default prompts as fallback
    return getDefaultPrompts()
  }
}

// Get a specific prompt by ID
export async function getPromptById(promptId: string): Promise<Prompt | null> {
  try {
    // If the prompt ID exists in default prompts, we can always return that as fallback
    const defaultPrompt = DEFAULT_PROMPTS[promptId]
    if (!defaultPrompt) {
      return null // Prompt ID doesn't exist even in defaults
    }

    if (!db || !auth.currentUser) {
      // Return default prompt if no database or user
      return {
        id: promptId,
        name: defaultPrompt.name,
        description: defaultPrompt.description,
        content: defaultPrompt.content,
        defaultContent: defaultPrompt.content,
        updatedAt: new Date(),
      }
    }

    try {
      const promptRef = doc(db, PROMPTS_COLLECTION, promptId)
      const promptSnap = await getDoc(promptRef)

      if (promptSnap.exists()) {
        const data = promptSnap.data()
        return {
          id: promptSnap.id,
          name: data.name,
          description: data.description,
          content: data.content,
          defaultContent: data.defaultContent,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        }
      }

      // If prompt doesn't exist in database but exists in defaults,
      // return the default without trying to write to database
      return {
        id: promptId,
        name: defaultPrompt.name,
        description: defaultPrompt.description,
        content: defaultPrompt.content,
        defaultContent: defaultPrompt.content,
        updatedAt: new Date(),
      }
    } catch (error) {
      console.error(`Error fetching prompt ${promptId} from database:`, error)
      // Return default prompt as fallback
      return {
        id: promptId,
        name: defaultPrompt.name,
        description: defaultPrompt.description,
        content: defaultPrompt.content,
        defaultContent: defaultPrompt.content,
        updatedAt: new Date(),
      }
    }
  } catch (error) {
    console.error(`Error getting prompt ${promptId}:`, error)
    throw error
  }
}

// Update a prompt (admin only)
export async function updatePrompt(promptId: string, content: string): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Check if current user is admin
    if (!(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: Only admins can update prompts")
    }

    // Check if the prompt exists in defaults
    if (!DEFAULT_PROMPTS[promptId]) {
      throw new Error(`Prompt ${promptId} not found in default prompts`)
    }

    const promptRef = doc(db, PROMPTS_COLLECTION, promptId)
    const promptSnap = await getDoc(promptRef)

    if (!promptSnap.exists()) {
      // If the prompt doesn't exist in the database yet, create it first
      const defaultPrompt = DEFAULT_PROMPTS[promptId]
      await setDoc(promptRef, {
        name: defaultPrompt.name,
        description: defaultPrompt.description,
        content: defaultPrompt.content,
        defaultContent: defaultPrompt.content,
        updatedAt: serverTimestamp(),
      })
    }

    // Now update the content
    await setDoc(
      promptRef,
      {
        content,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    console.log(`Prompt ${promptId} updated successfully`)
  } catch (error) {
    console.error(`Error updating prompt ${promptId}:`, error)
    throw error
  }
}

// Reset a prompt to its default content (admin only)
export async function resetPromptToDefault(promptId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized")
    }

    // Check if current user is admin
    if (!(await isCurrentUserAdmin())) {
      throw new Error("Unauthorized: Only admins can reset prompts")
    }

    // Check if the prompt exists in defaults
    const defaultPrompt = DEFAULT_PROMPTS[promptId]
    if (!defaultPrompt) {
      throw new Error(`Prompt ${promptId} not found in default prompts`)
    }

    const promptRef = doc(db, PROMPTS_COLLECTION, promptId)
    const promptSnap = await getDoc(promptRef)

    if (!promptSnap.exists()) {
      // If the prompt doesn't exist in the database yet, create it
      await setDoc(promptRef, {
        name: defaultPrompt.name,
        description: defaultPrompt.description,
        content: defaultPrompt.content,
        defaultContent: defaultPrompt.content,
        updatedAt: serverTimestamp(),
      })
    } else {
      // Update the content to the default
      await setDoc(
        promptRef,
        {
          content: defaultPrompt.content,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }

    console.log(`Prompt ${promptId} reset to default successfully`)
  } catch (error) {
    console.error(`Error resetting prompt ${promptId}:`, error)
    throw error
  }
}
