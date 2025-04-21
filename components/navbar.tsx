"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, Menu, X, LogIn, LogOut, User, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isCurrentUserAdmin } from "@/lib/resume-service"

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const adminStatus = await isCurrentUserAdmin()
          setIsAdmin(adminStatus)
        } catch (error) {
          console.error("Error checking admin status:", error)
        }
      }
    }

    checkAdminStatus()
  }, [user])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="font-bold text-xl">Resume Scan</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Home
          </Link>
          <Link
            href="/resume-builder"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/resume-builder" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Resume Builder
          </Link>
          <Link
            href="/job-matcher"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/job-matcher" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Job Matcher
          </Link>

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-4">
                      <User className="h-4 w-4 mr-2" />
                      {user.email?.split("@")[0] || "Account"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/resume-builder">My Resumes</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile Settings</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="text-blue-600 dark:text-blue-400">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden container py-4 pb-6 border-b">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                pathname === "/" ? "bg-muted" : "",
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/resume-builder"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                pathname === "/resume-builder" ? "bg-muted" : "",
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Resume Builder
            </Link>
            <Link
              href="/job-matcher"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                pathname === "/job-matcher" ? "bg-muted" : "",
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Job Matcher
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <p className="px-2 text-sm font-medium">{user.email}</p>
                      <Link
                        href="/resume-builder"
                        className="text-sm font-medium transition-colors hover:text-primary p-2 rounded-md block mt-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Resumes
                      </Link>
                      <Link
                        href="/profile"
                        className="text-sm font-medium transition-colors hover:text-primary p-2 rounded-md block mt-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 p-2 rounded-md block mt-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4 inline-block mr-2" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 mt-2"
                        onClick={() => {
                          handleSignOut()
                          setIsMenuOpen(false)
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 p-2 rounded-md text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4 inline-block mr-2" />
                    Login
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
