import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./print-styles.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Resume Scan | Build and Optimize Your Professional Resume",
    template: "%s | Resume Scan",
  },
  description:
    "Build, optimize, and analyze your professional resume with AI-powered tools. Match your resume to job descriptions and get personalized improvement suggestions.",
  keywords: [
    "resume builder",
    "resume scan",
    "job matcher",
    "resume analyzer",
    "resume optimization",
    "AI resume",
    "career tools",
    "job application",
    "professional resume",
  ],
  authors: [{ name: "Resume Scan Team" }],
  creator: "Resume Scan",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resume-scan.vercel.app",
    title: "Resume Scan | Build and Optimize Your Professional Resume",
    description:
      "Build, optimize, and analyze your professional resume with AI-powered tools. Match your resume to job descriptions and get personalized improvement suggestions.",
    siteName: "Resume Scan",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Scan | Build and Optimize Your Professional Resume",
    description:
      "Build, optimize, and analyze your professional resume with AI-powered tools. Match your resume to job descriptions and get personalized improvement suggestions.",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <ThemeToggle />
              <Toaster />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
