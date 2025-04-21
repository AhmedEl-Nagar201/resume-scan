"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, Briefcase, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block text-xl">Resume Scan</span>
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
          <Link href="/job-matcher">
            <Button size="sm">
              <Briefcase className="mr-2 h-4 w-4" />
              Analyze Resume
            </Button>
          </Link>
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
            <Link href="/job-matcher" onClick={() => setIsMenuOpen(false)}>
              <Button size="sm" className="w-full">
                <Briefcase className="mr-2 h-4 w-4" />
                Analyze Resume
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
