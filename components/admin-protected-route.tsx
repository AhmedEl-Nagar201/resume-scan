"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { isCurrentUserAdmin } from "@/lib/resume-service"

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading && !user) {
        router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
        return
      }

      if (user) {
        try {
          setIsCheckingAdmin(true)
          const adminStatus = await isCurrentUserAdmin()
          setIsAdmin(adminStatus)

          if (!adminStatus) {
            router.push("/")
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          router.push("/")
        } finally {
          setIsCheckingAdmin(false)
        }
      }
    }

    checkAdminStatus()
  }, [user, loading, router])

  if (loading || isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
