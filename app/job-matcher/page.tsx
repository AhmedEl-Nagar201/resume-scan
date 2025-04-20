"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowRight, CheckCircle, XCircle, FileText, Sparkles, AlertTriangle } from "lucide-react"
import { analyzeJobMatch, improveResume } from "../actions"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import type { ResumeData } from "@/components/resume-form"

interface MatchResult {
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

export default function JobMatcher() {
  const router = useRouter()
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [improvedResume, setImprovedResume] = useState<ResumeData | null>(null)
  const [activeTab, setActiveTab] = useState("description")
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [improvementError, setImprovementError] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true)

  // Check if the API key is set
  useEffect(() => {
    async function checkApiKey() {
      try {
        const response = await fetch("/api/env")
        const data = await response.json()
        setHasApiKey(data.hasOpenRouterKey)
      } catch (error) {
        console.error("Error checking API key:", error)
        setHasApiKey(false)
      } finally {
        setIsCheckingApiKey(false)
      }
    }

    checkApiKey()
  }, [])

  const analyzeMatch = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description first.",
        variant: "destructive",
      })
      return
    }

    if (!hasApiKey) {
      toast({
        title: "API Key Missing",
        description: "The OpenRouter API key is not set. Please add it to your environment variables.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      // Get the resume data from localStorage
      const resumeData = localStorage.getItem("autoSavedResume")
      if (!resumeData) {
        toast({
          title: "No Resume Found",
          description: "Please create a resume first before analyzing job match.",
          variant: "destructive",
        })
        setIsAnalyzing(false)
        return
      }

      // Parse and validate the resume data
      let parsedResumeData
      try {
        parsedResumeData = JSON.parse(resumeData)

        // Ensure the parsed resume has all required properties
        if (!parsedResumeData.personalInfo) {
          parsedResumeData.personalInfo = {
            fullName: "",
            email: "",
            phone: "",
            address: "",
            summary: "",
            links: [],
          }
        }
      } catch (error) {
        console.error("Error parsing resume data:", error)
        toast({
          title: "Invalid Resume Data",
          description: "Your resume data appears to be corrupted. Please rebuild your resume.",
          variant: "destructive",
        })
        setIsAnalyzing(false)
        return
      }

      // Call the server action to analyze the job match
      const result = await analyzeJobMatch(parsedResumeData, jobDescription)

      // Check if the result indicates an error
      if (result.overallMatch === 0 && result.missingSkills.includes("Error analyzing resume")) {
        setAnalysisError("There was an error analyzing your resume. Please try again later.")
        toast({
          title: "Analysis Failed",
          description: "There was an error analyzing your resume. Please try again later.",
          variant: "destructive",
        })
      } else {
        setMatchResult(result)
        setActiveTab("analysis")
      }
    } catch (error) {
      console.error("Error analyzing job match:", error)
      setAnalysisError("There was an error analyzing your resume. Please try again later.")
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImproveResume = async () => {
    if (!matchResult) return

    if (!hasApiKey) {
      toast({
        title: "API Key Missing",
        description: "The OpenRouter API key is not set. Please add it to your environment variables.",
        variant: "destructive",
      })
      return
    }

    setIsImproving(true)
    setImprovementError(null)

    try {
      // Get the resume data from localStorage
      const resumeData = localStorage.getItem("autoSavedResume")
      if (!resumeData) {
        toast({
          title: "No Resume Found",
          description: "Please create a resume first before improving it.",
          variant: "destructive",
        })
        setIsImproving(false)
        return
      }

      // Parse and validate the resume data
      let parsedResumeData
      try {
        parsedResumeData = JSON.parse(resumeData)

        // Ensure the parsed resume has all required properties
        if (!parsedResumeData.personalInfo) {
          parsedResumeData.personalInfo = {
            fullName: "",
            email: "",
            phone: "",
            address: "",
            summary: "",
            links: [],
          }
        }
      } catch (error) {
        console.error("Error parsing resume data:", error)
        toast({
          title: "Invalid Resume Data",
          description: "Your resume data appears to be corrupted. Please rebuild your resume.",
          variant: "destructive",
        })
        setIsImproving(false)
        return
      }

      // Call the server action to improve the resume
      const result = await improveResume(parsedResumeData, jobDescription, matchResult)

      // Check if the result is valid
      if (!result || !result.personalInfo) {
        setImprovementError("There was an error improving your resume. Please try again later.")
        toast({
          title: "Improvement Failed",
          description: "There was an error improving your resume. Please try again later.",
          variant: "destructive",
        })
      } else {
        setImprovedResume(result)
        setActiveTab("improved")

        // Save the improved resume to localStorage
        localStorage.setItem("autoSavedResume", JSON.stringify(result))

        toast({
          title: "Resume Improved",
          description: "Your resume has been improved based on the job description.",
        })
      }
    } catch (error) {
      console.error("Error improving resume:", error)
      setImprovementError("There was an error improving your resume. Please try again later.")
      toast({
        title: "Improvement Failed",
        description: "There was an error improving your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsImproving(false)
    }
  }

  const getMatchColor = (match: number) => {
    if (match >= 80) return "text-green-600"
    if (match >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (isCheckingApiKey) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking API configuration...</p>
        </div>
      </div>
    )
  }

  if (hasApiKey === false) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Job Match Analyzer</h1>
          <Link href="/">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Back to Resume Builder
            </Button>
          </Link>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="mr-2 h-5 w-5" />
              API Key Missing
            </CardTitle>
            <CardDescription className="text-red-600">
              The OpenRouter API key is not set. This feature requires an API key to function.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              To use the Job Match Analyzer, you need to set up the OpenRouter API key in your environment variables.
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Sign up for an account at{" "}
                <a
                  href="https://openrouter.ai"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenRouter.ai
                </a>
              </li>
              <li>Create an API key in your OpenRouter dashboard</li>
              <li>Add the API key to your project's environment variables as OPENROUTER_API_KEY</li>
              <li>Restart your application</li>
            </ol>
          </CardContent>
          <CardFooter>
            <Link href="/">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Return to Resume Builder
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Job Match Analyzer</h1>
        <Link href="/">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Back to Resume Builder
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Job Description</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!matchResult}>
            Analysis
          </TabsTrigger>
          <TabsTrigger value="improved" disabled={!improvedResume}>
            Improved Resume
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle>Enter Job Description</CardTitle>
              <CardDescription>
                Paste the job description you're interested in, and we'll analyze how well your resume matches it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the full job description here..."
                className="min-h-[300px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={analyzeMatch} disabled={isAnalyzing} className="ml-auto">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Match
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {analysisError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <h3 className="text-lg font-semibold flex items-center">
                <XCircle className="mr-2 h-5 w-5" />
                Analysis Error
              </h3>
              <p className="mt-2">{analysisError}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis">
          {matchResult && (
            <Card>
              <CardHeader>
                <CardTitle>Resume Match Analysis</CardTitle>
                <CardDescription>
                  Here's how your resume matches the job description. We've analyzed your skills, experience, and
                  overall fit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="text-lg font-semibold">Overall Match</h3>
                    <p className="text-sm text-muted-foreground">How well your resume matches the job requirements</p>
                  </div>
                  <div className={`text-4xl font-bold ${getMatchColor(matchResult.overallMatch)}`}>
                    {matchResult.overallMatch}%
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Skills Analysis</h3>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.missingSkills.length > 0 ? (
                        matchResult.missingSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-red-50">
                            <XCircle className="mr-1 h-3 w-3 text-red-500" />
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-green-600">No missing skills detected!</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Experience Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Relevant Experience You Have</h4>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.relevantExperience.has.length > 0 ? (
                          matchResult.relevantExperience.has.map((exp, index) => (
                            <Badge key={index} variant="outline" className="bg-green-50">
                              <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                              {exp}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-red-600">No relevant experience detected.</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Missing Experience</h4>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.relevantExperience.missing.length > 0 ? (
                          matchResult.relevantExperience.missing.map((exp, index) => (
                            <Badge key={index} variant="outline" className="bg-red-50">
                              <XCircle className="mr-1 h-3 w-3 text-red-500" />
                              {exp}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-green-600">No missing experience detected!</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Improvement Suggestions</h3>
                  <div className="space-y-4">
                    {matchResult.improvementSuggestions.map((suggestion, index) => (
                      <Card key={index}>
                        <CardHeader className="py-3">
                          <CardTitle className="text-md">{suggestion.section}</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 space-y-2">
                          <div>
                            <h4 className="text-sm font-medium">Current</h4>
                            <p className="text-sm p-2 bg-gray-50 rounded">{suggestion.current}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Improved</h4>
                            <p className="text-sm p-2 bg-green-50 rounded">{suggestion.improved}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("description")}>
                  Edit Job Description
                </Button>
                <Button onClick={handleImproveResume} disabled={isImproving}>
                  {isImproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Improve My Resume
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {improvementError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <h3 className="text-lg font-semibold flex items-center">
                <XCircle className="mr-2 h-5 w-5" />
                Improvement Error
              </h3>
              <p className="mt-2">{improvementError}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="improved">
          {improvedResume && (
            <Card>
              <CardHeader>
                <CardTitle>Resume Improved</CardTitle>
                <CardDescription>
                  Your resume has been improved to better match the job description. The changes have been automatically
                  saved.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold flex items-center text-green-700">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Resume Updated Successfully
                  </h3>
                  <p className="mt-2">
                    Your resume has been optimized for this job position. The improvements include:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Enhanced skills section with relevant keywords</li>
                    <li>Improved work experience descriptions</li>
                    <li>Optimized summary to highlight relevant qualifications</li>
                    <li>Adjusted formatting and language for better ATS compatibility</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("analysis")}>
                  Back to Analysis
                </Button>
                <Link href="/">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    View Updated Resume
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
