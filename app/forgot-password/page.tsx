"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase"
import { sendPasswordResetEmail } from "firebase/auth"
import { Loader2, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setIsEmailSent(true)
      toast({
        title: "Email Sent",
        description: "Password reset email has been sent. Please check your inbox.",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        {isEmailSent ? (
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md text-center">
              <Mail className="mx-auto h-12 w-12 text-green-500 mb-2" />
              <h3 className="text-lg font-medium text-green-800 dark:text-green-300">Email Sent</h3>
              <p className="text-green-700 dark:text-green-400">
                We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
              </p>
            </div>
            <div className="text-center mt-4">
              <Link href="/login" className="text-primary hover:underline">
                Return to login
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
