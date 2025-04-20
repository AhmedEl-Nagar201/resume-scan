import type { ResumeData } from "@/components/resume-form"

// Define the OpenRouter API URL
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

// Define the interface for the match result
export interface MatchResult {
  overallMatch: number
  missingSkills: string[]
  relevantExperience: {
    has: string[]
    missing: string[]
  }
  improvementSuggestions: {
    section: string
    current: string
    improved: string
  }[]
}

export class OpenRouterAPI {
  /**
   * Make a request to the OpenRouter API
   */
  private static async makeRequest(apiKey: string, prompt: string, model = "shisa-ai/shisa-v2-llama3.3-70b:free") {
    if (!apiKey) {
      throw new Error("OpenRouter API key is not set")
    }

    try {
      console.log("Making request to OpenRouter API...")

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://resume-builder.vercel.app",
          "X-Title": "Resume Builder",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2, // Lower temperature for more consistent outputs
          max_tokens: 16000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("OpenRouter API error response:", errorText)

        let errorMessage = `OpenRouter API error: ${response.statusText}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = `OpenRouter API error: ${errorData.error?.message || response.statusText}`
        } catch (e) {
          // If we can't parse the error as JSON, just use the status text
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("OpenRouter API response:", JSON.stringify(data, null, 2))

      // Check if the response has the expected structure
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error("Unexpected API response structure:", data)
        throw new Error("Unexpected API response structure: choices array is empty or missing")
      }

      if (!data.choices[0].message || !data.choices[0].message.content) {
        console.error("Unexpected message structure in API response:", data.choices[0])
        throw new Error("Unexpected message structure in API response: message or content is missing")
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error("Error calling OpenRouter API:", error)
      throw error
    }
  }

  /**
   * Generate text using the OpenRouter API
   */
  static async generateText(apiKey: string, prompt: string): Promise<string> {
    return this.makeRequest(apiKey, prompt)
  }

  /**
   * Analyze how well a resume matches a job description
   */
  static async analyzeJobMatch(apiKey: string, resumeData: ResumeData, jobDescription: string): Promise<MatchResult> {
    try {
      // Prepare resume data for analysis
      const resumeText = this.prepareResumeText(resumeData)

      // Create the analysis prompt
      const analysisPrompt = `
        You are an expert resume analyst and career coach. You need to analyze how well a resume matches a job description.
        
        RESUME:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
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
      `

      // Call OpenRouter API to analyze the match
      let response
      try {
        response = await this.generateText(apiKey, analysisPrompt)
      } catch (error) {
        console.error("Error generating text from OpenRouter API:", error)
        throw new Error(`Failed to get analysis from OpenRouter: ${error.message}`)
      }

      if (!response) {
        throw new Error("Received empty response from OpenRouter API")
      }

      // Parse the JSON response
      try {
        // Trim any whitespace and try to find JSON content
        const trimmedResponse = response.trim()
        const jsonStartIndex = trimmedResponse.indexOf("{")
        const jsonEndIndex = trimmedResponse.lastIndexOf("}")

        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
          console.error("Could not find JSON in response:", trimmedResponse)
          throw new Error("Could not find valid JSON in the API response")
        }

        const jsonContent = trimmedResponse.substring(jsonStartIndex, jsonEndIndex + 1)
        const analysisResult = JSON.parse(jsonContent)

        // Validate the parsed result has the expected structure
        if (typeof analysisResult.overallMatch !== "number") {
          throw new Error("Invalid analysis result: missing or invalid overallMatch")
        }

        return analysisResult as MatchResult
      } catch (error) {
        console.error("Error parsing analysis result:", error)
        console.error("Raw response:", response)
        throw new Error(`Failed to parse analysis result: ${error.message}`)
      }
    } catch (error) {
      console.error("Error analyzing job match:", error)
      // Return a default error response
      return {
        overallMatch: 0,
        missingSkills: [`Error analyzing resume: ${error.message}`],
        relevantExperience: {
          has: [],
          missing: ["Error analyzing experience"],
        },
        improvementSuggestions: [
          {
            section: "Error",
            current: "An error occurred during analysis",
            improved: "Please try again later",
          },
        ],
      }
    }
  }

  /**
   * Improve a resume based on a job description and analysis results
   */
  static async improveResume(
    apiKey: string,
    resumeData: ResumeData,
    jobDescription: string,
    matchResult: MatchResult,
  ): Promise<ResumeData> {
    try {
      // First, analyze the sections that need improvement
      const sectionsToImprove = await this.identifySectionsToImprove(apiKey, resumeData, jobDescription, matchResult)

      // Create a copy of the resume data to modify
      const improvedResume = JSON.parse(JSON.stringify(resumeData)) as ResumeData

      // Process each section in parallel
      const improvementPromises = sectionsToImprove.map((section) =>
        this.improveSingleSection(apiKey, section, resumeData, jobDescription, matchResult),
      )

      const sectionImprovements = await Promise.all(improvementPromises)

      // Apply all improvements to the resume
      for (const improvement of sectionImprovements) {
        if (improvement.section === "summary") {
          improvedResume.personalInfo.summary = improvement.improved
        } else if (improvement.section === "skills") {
          // Add new skills
          const currentSkills = new Set(resumeData.skills.map((s) => s.skill.toLowerCase()))
          const newSkills = improvement.improved
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill && !currentSkills.has(skill.toLowerCase()))

          let maxId = Math.max(...resumeData.skills.map((s) => s.id), 0)
          for (const skill of newSkills) {
            improvedResume.skills.push({
              id: ++maxId,
              skill,
            })
          }
        } else if (improvement.section.startsWith("experience-")) {
          const expId = Number.parseInt(improvement.section.split("-")[1])
          const expIndex = improvedResume.experience.findIndex((e) => e.id === expId)
          if (expIndex >= 0) {
            improvedResume.experience[expIndex].description = improvement.improved
          }
        } else if (improvement.section.startsWith("education-")) {
          const eduId = Number.parseInt(improvement.section.split("-")[1])
          const eduIndex = improvedResume.education.findIndex((e) => e.id === eduId)
          if (eduIndex >= 0) {
            improvedResume.education[eduIndex].description = improvement.improved
          }
        }
      }

      return improvedResume
    } catch (error) {
      console.error("Error improving resume:", error)
      // Return the original resume if there's an error
      return resumeData
    }
  }

  /**
   * Identify which sections of the resume need improvement
   */
  private static async identifySectionsToImprove(
    apiKey: string,
    resumeData: ResumeData,
    jobDescription: string,
    matchResult: MatchResult,
  ): Promise<string[]> {
    try {
      const analysisPrompt = `
        You are an expert resume analyst. Based on the job description and match analysis, identify which sections of the resume need improvement.
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        MATCH ANALYSIS:
        ${JSON.stringify(matchResult, null, 2)}
        
        RESUME SECTIONS:
        - summary: The professional summary
        - skills: The skills section
        ${resumeData.experience.map((exp) => `- experience-${exp.id}: ${exp.position} at ${exp.company}`).join("\n")}
        ${resumeData.education.map((edu) => `- education-${edu.id}: ${edu.degree} from ${edu.institution}`).join("\n")}
        
        Return a JSON array of section identifiers that need improvement. For example:
        ["summary", "skills", "experience-1"]
        
        IMPORTANT: Your response must be valid JSON. Do not include any text before or after the JSON array.
      `

      let response
      try {
        response = await this.generateText(apiKey, analysisPrompt)
      } catch (error) {
        console.error("Error generating text for sections to improve:", error)
        // Default to improving summary and skills if there's an error
        return ["summary", "skills"]
      }

      if (!response) {
        console.error("Received empty response for sections to improve")
        return ["summary", "skills"]
      }

      try {
        // Trim any whitespace and try to find JSON content
        const trimmedResponse = response.trim()
        const jsonStartIndex = trimmedResponse.indexOf("[")
        const jsonEndIndex = trimmedResponse.lastIndexOf("]")

        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
          console.error("Could not find JSON array in response:", trimmedResponse)
          return ["summary", "skills"]
        }

        const jsonContent = trimmedResponse.substring(jsonStartIndex, jsonEndIndex + 1)
        const sectionsToImprove = JSON.parse(jsonContent)

        if (!Array.isArray(sectionsToImprove)) {
          console.error("Parsed result is not an array:", sectionsToImprove)
          return ["summary", "skills"]
        }

        return sectionsToImprove
      } catch (error) {
        console.error("Error parsing sections to improve:", error)
        // Default to improving summary and skills if parsing fails
        return ["summary", "skills"]
      }
    } catch (error) {
      console.error("Error identifying sections to improve:", error)
      // Default to improving summary and skills if there's an error
      return ["summary", "skills"]
    }
  }

  /**
   * Improve a single section of the resume
   */
  private static async improveSingleSection(
    apiKey: string,
    section: string,
    resumeData: ResumeData,
    jobDescription: string,
    matchResult: MatchResult,
  ): Promise<{ section: string; current: string; improved: string }> {
    try {
      let currentContent = ""
      let sectionType = ""

      if (section === "summary") {
        currentContent = resumeData.personalInfo.summary
        sectionType = "Professional Summary"
      } else if (section === "skills") {
        currentContent = resumeData.skills.map((s) => s.skill).join(", ")
        sectionType = "Skills List"
      } else if (section.startsWith("experience-")) {
        const expId = Number.parseInt(section.split("-")[1])
        const experience = resumeData.experience.find((e) => e.id === expId)
        if (experience) {
          currentContent = experience.description
          sectionType = `Experience Description for ${experience.position} at ${experience.company}`
        }
      } else if (section.startsWith("education-")) {
        const eduId = Number.parseInt(section.split("-")[1])
        const education = resumeData.education.find((e) => e.id === eduId)
        if (education) {
          currentContent = education.description
          sectionType = `Education Description for ${education.degree} from ${education.institution}`
        }
      }

      if (!currentContent) {
        return {
          section,
          current: "",
          improved: "",
        }
      }

      const improvementPrompt = `
        You are an expert resume writer with years of experience helping job seekers optimize their resumes for specific positions.
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        SECTION TO IMPROVE: ${sectionType}
        
        CURRENT CONTENT:
        ${currentContent}
        
        MATCH ANALYSIS:
        ${JSON.stringify(matchResult, null, 2)}
        
        Your task is to improve this section to better match the job description. Make the following improvements:
        1. Add relevant keywords from the job description
        2. Highlight relevant qualifications and experiences
        3. Use action verbs and quantifiable achievements
        4. Maintain a professional tone
        ${section === "skills" ? "5. Return a comma-separated list of skills" : ""}
        
        Return only the improved content without any additional text or explanation.
      `

      let response
      try {
        response = await this.generateText(apiKey, improvementPrompt)
      } catch (error) {
        console.error(`Error generating text for section ${section}:`, error)
        return {
          section,
          current: currentContent,
          improved: currentContent, // Return the original content if there's an error
        }
      }

      if (!response) {
        console.error(`Received empty response for section ${section}`)
        return {
          section,
          current: currentContent,
          improved: currentContent, // Return the original content if there's an empty response
        }
      }

      return {
        section,
        current: currentContent,
        improved: response.trim(),
      }
    } catch (error) {
      console.error(`Error improving section ${section}:`, error)
      return {
        section,
        current: "",
        improved: "",
      }
    }
  }

  /**
   * Convert resume data to text format for analysis
   */
  private static prepareResumeText(resumeData: ResumeData): string {
    const { personalInfo, education, experience, skills, languages, awards } = resumeData

    const resumeText = `
      # ${personalInfo.fullName}
      ${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.address}
      
      ## Summary
      ${personalInfo.summary}
      
      ## Skills
      ${skills
        .map((s) => s.skill)
        .filter(Boolean)
        .join(", ")}
      
      ## Experience
      ${experience
        .map(
          (exp) => `
      ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"})
      ${exp.description}
      `,
        )
        .join("\n")}
      
      ## Education
      ${education
        .map(
          (edu) => `
      ${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution} (${edu.startDate} - ${edu.endDate || "Present"})
      ${edu.description}
      `,
        )
        .join("\n")}
      
      ## Languages
      ${languages
        .map((lang) => `${lang.name}: ${lang.proficiency}`)
        .filter(Boolean)
        .join(", ")}
      
      ## Awards & Certifications
      ${awards
        .map(
          (award) => `
      ${award.title} from ${award.issuer} (${award.date})
      ${award.description}
      `,
        )
        .join("\n")}
    `

    return resumeText
  }
}
