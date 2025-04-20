import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "Build and optimize your professional resume",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative pb-12`}>
        {children}
        <Toaster />
        
        {/* Fixed footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-gray-200 py-2 px-4 text-center text-sm text-gray-600">
          Made with ❤️ by{" "}
          <Link 
            href="https://wa.me/201067212579" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Ahmed El Nagar
          </Link>
        </footer>
      </body>
    </html>
  )
}
