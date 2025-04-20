"use server"

import { OpenRouterAPI, type MatchResult } from "@/lib/openrouter"
import type { ResumeData } from "@/components/resume-form"

/**
 * Analyze how well a resume matches a job description
 */
export async function analyzeJobMatch(resumeData: ResumeData, jobDescription: string): Promise<MatchResult> {
  try {
    // Validate inputs
    if (!resumeData || !jobDescription) {
      throw new Error("Missing required data for analysis")
    }

    // Get the API key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error("OpenRouter API key is not set in environment variables")
    }

    // Ensure resumeData has all required properties
    const validatedResumeData = validateResumeData(resumeData)

    // Call OpenRouter API to analyze the match
    const result = await OpenRouterAPI.analyzeJobMatch(apiKey, validatedResumeData, jobDescription)
    return result
  } catch (error) {
    console.error("Error in analyzeJobMatch server action:", error)
    // Return a default error response
    return {
      overallMatch: 0,
      missingSkills: [`Error analyzing resume: ${error.message || "Unknown error"}`],
      relevantExperience: {
        has: [],
        missing: ["Error analyzing experience"],
      },
      improvementSuggestions: [
        {
          section: "Error",
          current: "An error occurred during analysis",
          improved: `Please try again later. Error: ${error.message || "Unknown error"}`,
        },
      ],
    }
  }
}

/**
 * Improve a resume based on a job description and analysis results
 */
export async function improveResume(
  resumeData: ResumeData,
  jobDescription: string,
  matchResult: MatchResult,
): Promise<ResumeData> {
  try {
    // Validate inputs
    if (!resumeData || !jobDescription || !matchResult) {
      throw new Error("Missing required data for resume improvement")
    }

    // Get the API key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error("OpenRouter API key is not set in environment variables")
    }

    // Ensure resumeData has all required properties
    const validatedResumeData = validateResumeData(resumeData)

    // Call OpenRouter API to improve the resume
    const improvedResume = await OpenRouterAPI.improveResume(apiKey, validatedResumeData, jobDescription, matchResult)
    return improvedResume
  } catch (error) {
    console.error("Error in improveResume server action:", error)
    // Return the original resume if there's an error
    return resumeData
  }
}

/**
 * Validate and ensure the resume data has all required properties
 */
function validateResumeData(resumeData: ResumeData): ResumeData {
  // Create a deep copy of the resume data
  const validatedData = JSON.parse(JSON.stringify(resumeData)) as ResumeData

  // Ensure personalInfo exists and has all required properties
  if (!validatedData.personalInfo) {
    validatedData.personalInfo = {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      summary: "",
      links: [],
    }
  } else {
    // Ensure all personalInfo properties exist
    validatedData.personalInfo.fullName = validatedData.personalInfo.fullName || ""
    validatedData.personalInfo.email = validatedData.personalInfo.email || ""
    validatedData.personalInfo.phone = validatedData.personalInfo.phone || ""
    validatedData.personalInfo.address = validatedData.personalInfo.address || ""
    validatedData.personalInfo.summary = validatedData.personalInfo.summary || ""
    validatedData.personalInfo.links = validatedData.personalInfo.links || []
  }

  // Ensure other sections exist
  validatedData.education = validatedData.education || []
  validatedData.experience = validatedData.experience || []
  validatedData.skills = validatedData.skills || []
  validatedData.languages = validatedData.languages || []
  validatedData.awards = validatedData.awards || []

  return validatedData
}
