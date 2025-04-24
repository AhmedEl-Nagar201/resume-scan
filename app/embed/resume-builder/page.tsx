"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ResumeForm from "@/components/resume-form"
import { Loader2 } from "lucide-react"

export default function EmbeddedResumeBuilder() {
  const searchParams = useSearchParams()
  const apiKey = searchParams.get("key")
  const theme = searchParams.get("theme") || "light"
  const [isLoading, setIsLoading] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Set theme based on parameter
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Validate the API key
    const validateKey = async () => {
      try {
        if (!apiKey) {
          setError("API key is required")
          setIsLoading(false)
          return
        }

        // Get the parent domain
        const parentDomain = window.location.ancestorOrigins?.[0]
          ? new URL(window.location.ancestorOrigins[0]).hostname
          : document.referrer
            ? new URL(document.referrer).hostname
            : "unknown"

        const response = await fetch("/api/embed/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiKey,
            domain: parentDomain,
            feature: "resume-builder",
          }),
        })

        const data = await response.json()

        if (data.valid) {
          setIsValid(true)
        } else {
          setError(data.error || "Invalid API key")
        }
      } catch (error) {
        console.error("Error validating API key:", error)
        setError("Error validating API key")
      } finally {
        setIsLoading(false)
      }
    }

    validateKey()
  }, [apiKey, theme])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !isValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-2">{error || "Invalid API key for this domain or feature"}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          If you are the website owner, please check your API key configuration.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Resume Builder</h1>
      <ResumeForm />
    </div>
  )
}
