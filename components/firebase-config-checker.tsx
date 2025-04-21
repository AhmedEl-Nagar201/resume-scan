"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function FirebaseConfigChecker() {
  const [configStatus, setConfigStatus] = useState<{
    isValid: boolean
    missingVars: string[]
    message: string
  }>({
    isValid: true,
    missingVars: [],
    message: "Checking Firebase configuration...",
  })

  useEffect(() => {
    // Check if all required Firebase environment variables are set
    const requiredVars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      setConfigStatus({
        isValid: false,
        missingVars,
        message: "Firebase configuration is incomplete. Missing environment variables:",
      })
    } else {
      setConfigStatus({
        isValid: true,
        missingVars: [],
        message: "Firebase configuration appears to be complete.",
      })
    }
  }, [])

  if (configStatus.isValid) {
    return null
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Firebase Configuration Issue
        </CardTitle>
        <CardDescription className="text-amber-600 dark:text-amber-400">{configStatus.message}</CardDescription>
      </CardHeader>
      <CardContent>
        {configStatus.missingVars.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Missing environment variables:</p>
            <ul className="list-disc list-inside text-sm text-amber-600 dark:text-amber-400">
              {configStatus.missingVars.map((varName) => (
                <li key={varName}>{varName}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 text-sm text-amber-700 dark:text-amber-400">
          <p>To fix this issue:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-amber-600 dark:text-amber-400">
            <li>Make sure you've created a Firebase project in the Firebase console</li>
            <li>Enable Authentication in your Firebase project</li>
            <li>Enable Email/Password sign-in method in Authentication settings</li>
            <li>Add all required environment variables to your project</li>
            <li>
              Refer to the{" "}
              <Link
                href="https://firebase.google.com/docs/web/setup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Firebase documentation
              </Link>{" "}
              for more help
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
